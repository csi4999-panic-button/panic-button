"use strict";

const crypto = require("crypto");
const Classrooms = require("../models/classrooms");

module.exports.getKey = (size) => {
    const buffer = crypto.randomBytes(size);
    const key = buffer.toString('base64');
    return key;
};

module.exports.getKeyAsync = (size, cb) => {
  const p = new Promise((resolve, reject) => {
    crypto.randomBytes(size, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      return resolve(buffer);
    });
  })
  .then((buffer) => {
    const key = buffer.toString("base64");
    if (cb) {
      return cb(null, key);
    }
    return key;
  })
  .catch((err) => {
    if (cb) {
      return cb(err);
    }
    throw err;
  });

  if (!cb) return p;
  return null;
};

module.exports.getMongoURI = () => {
  let mongoURI;
  if(process.env.MONGODB_PORT_27017_TCP_ADDR && process.env.MONGODB_PORT_27017_TCP_PORT){
    var userPass = ''
    if(process.env.MONGODB_USER && process.env.MONGODB_PASS){
      userPass = process.env.MONGODB_USER + ":" + process.env.MONGODB_PASS + "@";
    }
    if(process.env.MONGODB_AUTH_SRC && userPass){
      userPass = userPass + "?authSource=" + process.env.MONGODB_AUTH_SRC;
    }
    mongoURI = "mongodb://" + userPass + process.env.MONGODB_PORT_27017_TCP_ADDR + ":" + process.env.MONGODB_PORT_27017_TCP_PORT + "/panic-button"
  } else {
    mongoURI = "mongodb://localhost/panic-button";
  }
  return mongoURI;
}

module.exports.joinClassroomByInviteCode = async (code, userId) => {
  try {

    console.log("Code",code);
    console.log("UserId",userId);
    const classroom = await Classrooms.findOne({
      $or: [
      { teacherCode: code },
      { taCode: code },
      { studentCode: code },
      ],
    });

    if (!code || !classroom) {
      throw new Error("Classroom not found");
    }


    if (classroom.teacherCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { teachers: userId } });
    } else if (classroom.taCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { teacherAssistants: userId } });
    } else if (classroom.studentCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { students: userId } });
    }

    return { success: true, message: "You successfully belong to the classroom" };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

module.exports.askQuestion = async (user, classId, question, ee) => {
  try {
    if (typeof question !== "string") {
      return { status: 404, body: {
        success: false,
        message: "Question must be a string",
      }};
    }

    const classroom = await Classrooms.findOneAndUpdate({
      _id: classId,
      $or: [
        { teachers: user._id },
        { teacherAssistants: user._id },
        { students: user._id }
      ],
    }, {
      $addToSet: {
        questions: {
          user: user._id,
          question,
          ts: Date.now(),
          resolution: -1,
          answers: [],
        },
      },
    });

    console.log("Classroom contains:", classroom);
    if (!classroom){
      return { status: 404, 
        body: { success: false, message: "You are not a member of that classroom" }};
    }

    // get users last question matching their question string
    const updatedClassroom = await Classrooms.findById(classId);
    const usersQuestions = updatedClassroom.questions.filter( q => 
      (q.user.toString() === user.id.toString()) 
      && (q.question === question)
    );
    const newQuestion = usersQuestions[usersQuestions.length-1];
    console.log("newQuestion:", newQuestion);

    ee.emit("new_question", {
      classroom: classId,
      questionId: newQuestion._id.toString(),
      questionStr: newQuestion.question,
      numberOfQuestions: updatedClassroom.questions.length,
    });

    return { status: 200, body: { success: true }};
  } catch (err) {
    return { status: 404, body: { success: false, message: err.message }};
  }
}

module.exports.answerQuestion = async (user, classId, questId, answer, ee) => {
  if (typeof answer !== "string") {
    return { status: 400, body: {
      success: false,
      message: "Answer must be a string",
    }};
  }

  if (typeof questId !== "string") {
    return { status: 400, body: {
      success: false,
      message: "question must be identified by questId",
    }};
  }

  const classroom = await Classrooms.findOne({
    _id: classId,
    $or: [
      { teachers: user._id },
      { teacherAssistants: user._id },
      { students: user._id }
    ],
  });

  if (!classroom) {
    return { status: 404, body: {
      success: false,
      message: "You are not a member of that classroom",
    }};
  }

  const question = classroom.questions.id(questId);

  if (!question) {
    return { status: 404, body: {
      success: false,
      message: `That classroom does not have a question with _id ${_id}`,
    }};
  }

  const answerDoc = {
    user: user._id,
    answer,
    ts: Date.now(),
  };

  await Classrooms.findOneAndUpdate({
    _id: classId,
    questions: {
      $elemMatch: { _id: question._id, },
    }, 
  }, {
    $addToSet: { 'questions.$.answers': answerDoc, }
  });
  
  // now get the answer info
  const updatedC = await Classrooms.findById(classId);
  const updatedQ = updatedC.questions.id(questId);
  if(updatedQ.answers.length < 1)
    return { status: 300, body: { success: false, message: "Answer definitely not created successfully" }};
  
  const myAnswers = updatedQ.answers.filter(a => a.user.toString() === user._id.toString() && a.answer === answer);
  if(myAnswers.length <1 )
    return { status: 300, body: { success: false, message: "Answer definitely not created successfully" }};
  
  const newAnswerDoc = myAnswers[myAnswers.length-1]; // assume last matching answer is ours
  

  // update users with new answer over sockets
  ee.emit("new_answer", {
    user: user._id.toString(),
    classroom: classId,
    questionId: updatedQ._id.toString(),
    answerId: newAnswerDoc._id.toString(),
    answer: answer,
    numberOfAnswers: updatedQ.answers.length,
  });

  return { status: 200, body: { success: true }};
}

module.exports.voteQuestion = async (user, classId, question, up, ee) => {
  try {
    // confirm that a classroom with that question exists
    const classroom = await Classrooms.findOne({
      _id: classId,
      students: user.id,
      questions: { _id: question, },
    });
    // else, stop now
    if (!classroom) return;

    console.log(`${user.id} belongs to ${classroom.name}`);

    // if 'up' not included, assume false
    if(up === undefined || up === null) up = false;
    // if 'up' was included but not a boolean, stop now
    if(typeof up !== "boolean") return;

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
    const updatedClass = await Classrooms.findById(event.classroom);
    const voteCount = updatedClass.questions.id(event.question).votes.size;

    // emit to EventEmitter for general handling
    ee.emit("question_vote", { 
      user: user.id, 
      classroom: classId, 
      question: question,
      votes: voteCount,
      up: up,
    });

    return { status: 200, body: { success: true, message: "Successfully voted for question" }};
  } catch (err) {
    console.log("Could not vote question");
    console.log("Error occurred:", err);
    return { status: 404, body: { success: false, message: err.message }};
  }
}

module.exports.voteAnswer = async (user, classId, question, answer, up, ee) => {
  try {
    // confirm that a classroom with that question and answer exists
    const classroom = await Classrooms.findOne({
      _id: classId,
      students: user.id,
      questions: { 
        _id: event.question, 
        answers: {
          _id: event.answer,
        }
      },
    });
    // else, stop now
    if (!classroom) return;

    console.log(`${user.id} belongs to ${classroom.name}`);

    // if 'up' not included in request, assume false
    if(up === undefined || up === null) up = false;
    // if 'up' was included but not a boolean, stop now
    if(typeof up !== "boolean") return;

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

    // emit to EventEmitter for general handling
    app.ee.emit("answer_vote", { 
      user: user.id, 
      classroom: classId, 
      question: event.question,
      answer: event.answer,
      votes: voteCount,
      up: up, 
    });

    return { status: 200, body: { success: true, message: "Successfully voted for answer" }};
  } catch(err) {
    console.log("Could not vote answer");
    console.log("Error occurred:", err);
    return { status: 404, body: { success: false, message: err.message }};
  }
}