"use strict";

const router = require("express").Router();
const InviteCodes = require("../../../models/invite-codes");
const Classrooms = require("../../../models/classrooms");
const Users = require("../../../models/users");
const util = require("../../../util");

// returns a list of classrooms this user belongs to
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }


  // get all classrooms with current user
  // (prepoulated)
  // remove codes from non-teacher rooms
  // and cast to object

  return Classrooms.find({ $or: [
    { teachers: req.user._id },
    { teacherAssistants: req.user._id },
    { students: req.user._id }]
  }).then(classrooms => Promise.all(classrooms.map(room => room.sanitize(req.user))))
    .then(sanitizedClassrooms => res.json(sanitizedClassrooms))
    .catch( err => res.json({ status: false, message: err.message }));

});

// returns a specific classroom this user belongs to
router.get("/:classroomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  // get all classrooms with current user
  // (prepoulated)
  // then remove codes from non-teacher rooms
  // and cast to object
  return Classrooms.findOne({ 
    _id: req.params.classroomId,
    $or: [
      { teachers: req.user._id },
      { teacherAssistants: req.user._id },
      { students: req.user._id }
    ],
  }).then( classrooms => classrooms.sanitize(req.user))
    .then( sanitizedClassroom => res.json(sanitizedClassroom))
    .catch( err => res.json({ status: false, message: err }));
});

// creates a classroom and returns invite codes for teachers, TAs, and students
router.post("/", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    // create codes first
    // then create classroom with codes
    return Promise.all([
      InviteCodes.create({}),
      InviteCodes.create({}),
      InviteCodes.create({}),
    ])
    .then( codes => Classrooms.create({
      schoolId: req.body.schoolId,
      courseType: req.body.courseType,
      courseNumber: req.body.courseNumber,
      sectionNumber: req.body.sectionNumber,
      courseTitle: req.body.courseTitle,
      teachers: [req.user._id],
      teacherAssistants: [],
      students: [],
      teacherCode: codes[0].code,
      taCode: codes[1].code,
      studentCode: codes[2].code,
    }))
      .then( classroom => classroom.sanitize(req.user))
      .then( sanitizedRoom => res.json(sanitizedRoom))
      .catch( err => res.json({ status: false, message: err.message }));
});

// updates a classroom document by classroomId
router.put("/id/:classroomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

    // sanitize all the things we don't want changed by users
    var sanitizedClassroom = req.body;
    delete sanitizedClassroom._id;
    delete sanitizedClassroom.teacherCode;
    delete sanitizedClassroom.taCode;
    delete sanitizedClassroom.studentCode;
    delete sanitizedClassroom.teachers;
    delete sanitizedClassroom.teacherAssistants;
    delete sanitizedClassroom.students;

    return Classrooms.findOneAndUpdate(
      { _id: req.params.classroomId, teachers: req.user._id },
      { $set: sanitizedClassroom }
    )
    .then( (update) => {
      if (!update) {
        throw new Error("Cannot find/modify class" );
      }
      return Classrooms.findOne({ _id: req.params.classroomId, teachers: req.user._id })
    })
    .then( classroom => classroom.sanitize(req.user))
    .then( sanitizedRoom => res.json({
      status: true,
      message: "Class was successfully updated",
      classroom: sanitizedRoom,
    }))
    .catch( err => res.status(404).json({success: false, message: err.message}));      
});

// adds user to the listing for a classroom based on a given invite code
router.post("/join", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }
  const ret = await util.joinClassroomByInviteCode(req.body.inviteCode,req.user.id);
  const status = (ret.success) ? 200 : 500;
  return res.status(status).json(ret);
});

// rotate the invite code of $type for $classroomId
router.put("/:classroomId/code/:type(student|teacherAssistant|teacher)", async (req,res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    const classroom = await Classrooms.findOne({
      _id: req.params.classroomId,
      teachers: req.user._id
    });

    if (!classroom) {
      throw new Error("This code did not match a classroom you teach");
    }

    const codeModel = await InviteCodes.create({});
    const code = codeModel.code;

    if (req.params.type === "teacher") {
      classroom.set("teacherCode", code);
    } else if (req.params.type ==="teacherAssistant") {
      classroom.set("taCode", code);
    } else if (req.params.type ==="student") {
      classroom.set("studentCode", code);
    }

    await classroom.save();

    return res.json({
      success: true,
      code,
      type: req.params.type,
    });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

// remove a specified user from the classroom 
router.delete("/:classroomId/:type(student|teacherAssistant|teacher)/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }
  var queryObject = {
    _id: req.params.classroomId,
    teachers: req.user._id,
  }
  var updateObject = {}

  if(req.params.type === "student"){
    queryObject.students = req.params.userId
    updateObject.$pull = { students: req.params.userId }
  } else if(req.params.type === "teacherAssistant"){
    queryObject.teacherAssistants = req.params.userId
    updateObject.$pull = { teacherAssistants: req.params.userId }
  } else if(req.params.type === "teacher"){
    // cannot remove yourself from a classroom
    if(req.params.userId === String(req.user._id)){
      return res.json({success: false, message: "Sorry you cannot remove yourself from your own classroom"});
    }
    queryObject.teachers = req.params.userId
    // cannot remove the last teacher in a classroom
    queryObject.$nor = [
      {teachers: {$exists: false}},
      {teachers: {$size: 0}},
      {teachers: {$size: 1}}
    ];
    updateObject.$pull = { teachers: req.params.userId }
  }

  return Classrooms.findOneAndUpdate(queryObject, updateObject)
  .then( classroom => {
    if(!classroom){
      throw new Error("Could not perform that request")
    }
    return res.json({ 
      success: true, 
      message: "User is no longer a " + req.params.type + " of the classroom",
      userId: req.params.userId,
    });
  }).catch( (err) => res.json({ success: false, message: err.message }));
});

// removes the current user from the specified classroom
router.post("/:classroomId/leave", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const queryObject = {
    _id: req.params.classroomId,
  };
  const updateObject = {
    $pull: {
      teachers: req.user._id,
      teacherAssistants: req.user._id,
      students: req.user._id,
    }
  };

  return Classrooms.findOneAndUpdate(queryObject,updateObject)
  .then( (classroom) => {
    if(!classroom){
      return res.json({ success: false, message: "That is not a valid classroom ID" });
    }

    return res.json({ success: true, message: "You are no longer a member of that classroom" });
  })
});

// asks a question in the specified classroom
router.post("/:classroomId/questions", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const { status, body } = await util.askQuestion(
    req.user,
    req.params.classroomId,
    req.body.question,
    req.app.ee
  );

  return res.status(status).json(body);
});

// answers a specific question in a classroom
router.post("/:classroomId/questions/:questionId/answers", async (req, res) => {  
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const { status, body } = await util.answerQuestion(
    req.user,
    req.params.classroomId, 
    req.params.questionId,
    req.body.answer,
    req.app.ee
  );

  return res.status(status).json(body);
});

// votes yes/no for a specific question in a classroom
router.put("/:classroomId/questions/:questionId/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const { status, body } = await util.voteQuestion(
    req.user.id,
    req.params.classroomId,
    req.params.questionId,
    req.body.up,
    req.app.ee
  )

  return res.status(status).json(body);
});

// votes yes/no for a specific answer to a specific question in a classroom
router.put("/:classroomId/questions/:questionId/answers/:answerId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const { status, body } = await util.voteAnswer(
    req.user.id,
    req.params.classroomId,
    req.params.questionId,
    req.params.answerId,
    req.body.up,
    req.app.ee
  )

  return res.status(status).json(body);
});

router.get("/:classroomId/topics", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  return Classrooms.findOne({
    _id: req.params.classroomId,
    teachers: req.user.id,
  })
  .then(classroom => res.json({ success: true, topics: classroom.topics, index: classroom.currentTopic }))
  .catch( err => res.json({ success: false, message: err.message }));
});

router.get("/:classroomId/topics/current", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  return Classrooms.findOne({
    _id: req.params.classroomId,
    teachers: req.user.id,
  })
  .then(classroom => res.json({ success: true, topic: classroom.topics[classroom.currentTopic] }))
  .catch( err => res.json({ success: false, message: err.message }));
});

router.put("/:classroomId/topics/:direction(next|previous)", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  try {
    // confirm user is teacher of given classroom
    const classroom = await Classrooms.findOne({
      _id: req.params.classroomId,
      teachers: req.user.id,
    })

    if (!classroom) return;
    console.log(req.user.id, "is a teacher of", classroom.name);
    
    // get new index or return if invalid (false/false, for example)
    let newIndex = classroom.currentTopic;
    if(req.params.direction === "next" && newIndex < (classroom.topics.length-1)) newIndex += 1;
    else if(req.params.direction === "previous" && newIndex > 0) newIndex -= 1;
    else throw new Error("The index cannot be moved in that direction");

    classroom.currentTopic = newIndex;
    // any way to confirm this works or does it throw an error if it doesn't?
    await classroom.save();

    // update the classroom of the topic change via sockets
    req.app.ee.emit("topic_change", {
      classroom: classroom._id,
      topic: classroom.topics[newIndex],
      first: newIndex === 0,
      last: newIndex === (classroom.topics.length-1),
    });
    
    return res.status(200).json({ success: true, message: "Topic index moved successfully", topic: classroom.topics[newIndex] });
  } catch(err) {
    console.log(err.message);
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.post("/:classroomId/topics", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  try {
    // supports null/undefined as resetting array
    if(req.body.topics === null || req.body.topics === undefined) req.body.topics = [];
    // any other data types will end processing
    if (!Array.isArray(req.body.topics)) throw new Error("The data type of topics was not acceptable");
    const newTopics = req.body.topics || ["General"];
    const classroom = await Classrooms.findOneAndUpdate({
      teachers: req.user.id,
      _id: req.params.classroomId,
    }, {
      $set: { 
        topics: newTopics,
        currentTopic: 0,
      }
    })
    // confirm that it was successfully performed
    if (!classroom) throw new Error("No classroom could be updated");
    
    // update the classroom of the topics update via sockets!
    req.app.ee.emit("topic_change", {
      classroom: req.params.classroomId,
      topic: newTopics[0],
      first: true,
      last: newTopics.length === 1,
    });
    return res.status(200).json({ success: true, message: "Topics successfully updated" });
  } catch(err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

router.get("/:classroomId/users", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const searchedClassroom = await Classrooms.findOne({ _id: req.params.classroomId, teachers: req.user.id });
  if (!searchedClassroom) {
    return res.status(400).json({ success: false, message: "Could not confirm you as a teacher of that course" });
  }

  let allUsers = [];
  searchedClassroom.teachers.forEach((u) => {
    allUsers.push({
      role: 'teacher',
      info: u,
    })
  });
  searchedClassroom.teacherAssistants.forEach((u) => {
    allUsers.push({
      role: 'teacherAssistant',
      info: u,
    })
  });
  searchedClassroom.students.forEach((u) => {
    allUsers.push({
      role: 'student',
      info: u,
    })
  });

  const popUsers = await Users.populate(allUsers, { path: 'info'});
  return res.status(200).json({ success: true, users: popUsers });
})

module.exports = router;

