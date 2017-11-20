"use strict";

const Classrooms = require("./models/classrooms");
const Users = require("./models/users");
const util = require("./util");
const invalidBoolean = util.invalidBoolean;

const panicked = {};
const timers = {};
const votes = {};

module.exports = (app, io) => {
  io.on("connection", async (socket) => {
    console.log("New socket connection");
    socket.once("login", async (token) => {
      const user = await Users.findOne({ apiToken: token });
      if (!user) {
        socket.emit("login_success", false);
        socket.disconnect(true);
        console.log("Socket login failure");
        return;
      }

      socket.user = user;
      console.log("Socket login success", user.email);
      socket.emit("login_success", true);

      // join to all classrooms
      const classrooms = await Classrooms.find({
        students: socket.user.id,
      });
      classrooms.forEach((classroom) => {
        socket.join(classroom.id);
        socket.join(socket.user.id);
        console.log("Joining socket to classroom",classroom.id);
        console.log("Joining socket to user",socket.user.id);
      });

      socket.on("panic", async (event) => {
        // Android app sends strings, Web UI sends objects
        event = (typeof event === "string") ? JSON.parse(event) : event;

        // judicious logging
        console.log("socket panic event received");
        console.log("classroom:",event.classroom);
        console.log("students:",socket.user.id);
        console.log("event contains:", event);

        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          students: socket.user.id,
        });

        if (!classroom) return;
        console.log(socket.user.id, "belongs to", classroom.name);
        if (event.state === null || event.state === undefined) {
          event.state = true;
        }
        console.log("emitted state:", event.state);
        app.ee.emit("panic", { user: socket.user.id, classroom: event.classroom, state: event.state });
      });
      
      // handle events for voting questions up/down
      socket.on("question_vote", async (event) => {
        event = (typeof event === "string") ? JSON.parse(event) : event;
        console.log("question_vote event received:", event);

        await util.voteQuestion(
          socket.user, 
          event.classroom, 
          event.question, 
          event.up, 
          app.ee);
      });

      // handle events for voting answers up/down
      socket.on("answer_vote", async (event) => {
        event = (typeof event === "string") ? JSON.parse(event) : event;
        console.log("answer_vote event received:", event);

        await util.voteAnswer(
          socket.user,
          event.classroom,
          event.question,
          event.answer,
          event.up,
          app.ee
        )
      });

      socket.on("topic_change", async (event) => {
        event = (typeof event === "string") ? JSON.parse(event) : event;

        // judicious logging
        console.log("socket topic_change event received");
        console.log("classroom:",event.classroom);
        console.log("user:",socket.user.id);
        console.log("event contains:", event);

        // confirm user is teacher of given classroom
        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          teachers: socket.user.id,
        })

        if (!classroom) return;
        console.log(socket.user.id, "is a teacher of", classroom.name);

        // return if neither next/previous are defined
        if (invalidTypeOf("boolean", event.next) && invalidTypeOf("boolean", event.previous)) return;

        // get new index or return if invalid (false/false, for example)
        let newIndex = classroom.currentTopic;
        if(event.next && newIndex < (classroom.topics.length-1)) newIndex += 1;
        else if(event.previous && newIndex > 0) newIndex -= 1;
        else return;

        // set topic and emit to eventemitter with user/classroom/topic
        const newTopic = classroom.topics[newIndex];
        app.ee.emit("topic_change", { 
          user: socket.user.id, 
          classroom: event.classroom, 
          topic: newTopic,
          first: newIndex === 0,
          last: newIndex === classroom.topics.length-1,
        });
      });

      // join/leave classrooms after socket connection
      app.ee.on(`${socket.user.id}:join`, (classroom) => socket.join(classroom));
      app.ee.on(`${socket.user.id}:leave`, (classroom) => socket.leave(classroom));
    });
  });

  app.ee.on("panic", (event) => {
    console.log("app.ee panic event received");

    // ensure set of panicked students exists for classroom
    // default empty set
    if (!panicked[event.classroom]) {
      panicked[event.classroom] = new Set();
      console.log("Created new classroom panic session");
    }

    // clear timer. Will be reset if panic state is true
    if (timers[event.user] && timers[event.user][event.classroom]) {
      clearTimeout(timers[event.user][event.classroom]);
      console.log("Cleared",event.user,"due to timeout");
    }

    if (event.state) {
      // set user's panicked state true
      panicked[event.classroom].add(event.user);

      // ensure timers object exists for user
      timers[event.user] = timers[event.user] || {};

      // after 10 seconds, set panic to false for user in classroom
      timers[event.user][event.classroom] = setTimeout(() => {
        app.ee.emit("panic", { classroom: event.classroom, user: event.user, state: false });
      }, 1000 * 10);
    } else {
      // unpanick user
      panicked[event.classroom].delete(event.user);
      console.log("Removed user",event.user,"from panic state");
    }

    io.in(event.classroom).emit("panic", {
      classroom: event.classroom,
      panicNumber: panicked[event.classroom].size,
    })
      .in(event.user).emit("panic_state_change", {
        classroom: event.classroom,
        state: event.state,
      });
    console.log("panicNumber:", panicked[event.classroom].size)
  });

  app.ee.on("topic_change", (event) => {
    console.log("Changing topic to", event.topic);
    // update all users with current topic string
    io.in(event.classroom).emit("topic_change", {
      classroom: event.classroom,
      topic: event.topic,
      first: event.first,
      last: event.last,
    });
    // user is not used but maybe there's some use for it coming up
  });
  
  /* Receives:
    {
      classroom: string,
      questionId: string,
      questionStr: string,
      numberOfQuestions: number
    }
  */
  app.ee.on("new_question", (event) => {
    console.log("new_question event contains", event);

    // send new question to all users in classroom
    io.in(event.classroom).emit("new_question", {
      classroom: event.classroom,
      questionId: event.questionId,
      questionStr: event.questionStr,
      numberOfQuestions: event.numberOfQuestions,
    });
  });

  /* Receives
    {
      classroom: string,
      questionId: string,
      answerId: string,
      answerStr: string,
      numberOfAnswers: number
    }
  */
  app.ee.on("new_answer", (event) => {
    console.log("new_answer event contains", event);
    
    // send new answer to all users in classroom
    io.in(event.classroom).emit("new_answer", {
      classroom: event.classroom,
      questionId: event.questionId,
      answerId: event.answerId,
      answerStr: event.answerStr,
      numberOfAnswers: event.numberOfAnswers,
    });
  });
  
  /* Receives
    [{
      question: String,
      ts: Number,
      resolution: Number,
      answers: [{
        answer: String,
        ts: Number,
      }],
    }]
  */
  app.ee.on("refresh_questions", (event) => {
    console.log("refresh_questions event contains", event);
    
    // refresh given user of updated questions for classroom
    io.in(event.user).emit("refresh_questions", {
      classroom: event.classroom,
      questions: event.questions,
    });
  })
  
  /*
    {
      user: string,
      classroom: string,
      questionId: string,
      votes: number
    }
  */
  // general handling for voting a question up/down
  app.ee.on("question_vote", (event) => {
    console.log("question_vote event contains", event);

    // update users with current votes on question
    io.in(event.classroom).emit("question_vote", {
      classroom: event.classroom,
      questionId: event.question,
      votes: event.votes,
    }).in(event.user).emit("question_vote_change", {
      classroom: event.classroom,
      question: event.question,
      state: event.up,
    });
  })

  // general handling for voting an answer up/down
  app.ee.on("answer_vote", (event) => {
    console.log("answer_vote event contains", event);
    
    // update users with current votes on question
    io.in(event.classroom).emit("answer_vote", {
      classroom: event.classroom,
      questionId: event.question,
      answerId: event.answer,
      votes: event.votes,
    }).in(event.user).emit("question_vote_change", {
      classroom: event.classroom,
      question: event.question,
      answer: event.answer,
      state: event.up,
    });
  })

  return io;
};

