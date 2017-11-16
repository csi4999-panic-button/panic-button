"use strict";

const Classrooms = require("./models/classrooms");
const Users = require("./models/users");

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
        console.log("_id:",event.classroom);
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

        // confirm that a classroom with that question exists
        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          students: socket.user.id,
          questions: { _id: event.question, },
        });
        // else, stop now
        if (!classroom) return;

        console.log(`${socket.user.id} belongs to ${classroom.name}`);

        // if 'up' not included, assume false
        if(event.up === undefined || event.up === null) event.up = false;
        // if 'up' was included but not a boolean, stop now
        if(typeof event.up !== "boolean") return;

        console.log("emitted upvote:", event.up);

        // emit to EventEmitter for general handling
        app.ee.emit("question_vote", { 
          user: socket.user.id, 
          classroom: event.classroom, 
          question: event.question,
          up: event.up,
        });
      });

      // handle events for voting answers up/down
      socket.on("answer_vote", async (event) => {
        event = (typeof event === "string") ? JSON.parse(event) : event;
        console.log("answer_vote event received:", event);

        // confirm that a classroom with that question and answer exists
        const classroom = await Classrooms.findOne({
          _id: event.classroom,
          students: socket.user.id,
          questions: { 
            _id: event.question, 
            answers: {
              _id: event.answer,
            }
          },
        });
        // else, stop now
        if (!classroom) return;

        console.log(`${socket.user.id} belongs to ${classroom.name}`);

        // if 'up' not included in request, assume false
        if(event.up === undefined || event.up === null) event.up = false;
        // if 'up' was included but not a boolean, stop now
        if(typeof event.up !== "boolean") return;

        console.log("emitted upvote:", event.up);
        
        // emit to EventEmitter for general handling
        app.ee.emit("answer_vote", { 
          user: socket.user.id, 
          classroom: event.classroom, 
          question: event.question,
          answer: event.answer,
          up: event.up, 
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

  /* Receives:
    {
      classroom: string,
      question: {
        _id: string,
        question: string,
      },
      numberOfQuestions: number
    }
  */
  app.ee.on("new_question", (event) => {
    console.log("new_question event contains", event);

    // send new question to all users in classroom
    io.in(event.classroom).emit("new_question", {
      classroom: event.classroom,
      questionId: event.question._id,
      questionStr: event.question.question,
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
    io.in(event.classroom).emit("new_question", {
      classroom: event.classroom,
      questionId: event.questionId,
      answerId: event.answerId,
      answerStr: event.answerStr,
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
  
  // general handling for voting a question up/down
  app.ee.on("question_vote", async (event) => {
    console.log("question_vote event contains");

    // Use Mongo for user votes Set logic
    let voteSetDoc = {};
    
    // Set update document based on queries $elemMatch
    if(event.up)
      voteSetDoc = { $addToSet: { 'questions.$.votes': event.user }};
    else
      voteSetDoc = { $pull: { 'questions.$.votes': event.user }};

    // query and perform operation on questions array in one command
    await Classrooms.findOneAndUpdate({
      _id: event.classroom,
      questions: {
        $elemMatch: { _id: event.question },
      }, 
    }, voteSetDoc);

    // query latest classroom info and get voteCount
    const classroom = await Classrooms.findById(event.classroom);
    const voteCount = classroom.questions.id(event.question).votes.size;

    // update users with current votes on question
    io.in(event.classroom).emit("question_vote", {
      classroom: event.classroom,
      questionId: event.questionId,
      votes: voteCount,
    });
  })

  // general handling for voting an answer up/down
  app.ee.on("answer_vote", async (event) => {
    console.log("answer_vote event contains");

    // Use Mongo for user votes Set logic
    let voteSetDoc = {};

    // nested $elemMatch doesn't seem possible so we have to modify this in the server and save()
    const answerClass = await Classrooms.findOne({
      _id: event.classroom,
      questions: {
          _id: event.question, 
          answers: { _id: event.answer, }
      }, 
    });
    if(event.up)
      answerClass.questions.id(event.question).answers.id(event.answer).votes.add(event.user);
    else
      answerClass.questions.id(event.question).answers.id(event.answer).votes.delete(event.user);
    
    answerClass.save();
    const voteCount = answerClass.questions.id(event.question).answers.id(event.answer).votes.size;
    
    // update users with current votes on question
    io.in(event.classroom).emit("answer_vote", {
      classroom: event.classroom,
      questionId: event.question,
      answerId: event.answer,
      votes: voteCount,
    });
  })

  return io;
};

