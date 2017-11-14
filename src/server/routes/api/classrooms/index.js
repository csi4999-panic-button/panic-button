"use strict";

const router = require("express").Router();
const InviteCodes = require("../../../models/invite-codes");
const Classrooms = require("../../../models/classrooms");
const util = require("../../../util");

// returns a list of classrooms this user belongs to
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  try {
    // get all classrooms with current user
    // (prepoulated)
    const classrooms = await Classrooms.find({ $or: [
      { teachers: req.user._id },
      { teacherAssistants: req.user._id },
      { students: req.user._id }
    ]});

    // remove codes from non-teacher rooms
    // and cast to object
    const sanitizedClassrooms = classrooms.map(room => room.sanitize(req.user));

    // send to user
    return res.json(sanitizedClassrooms);
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
});

// creates a classroom and returns invite codes for teachers, TAs, and students
router.post("/", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    // create codes first
    const codes = await Promise.all([
        InviteCodes.create({}),
        InviteCodes.create({}),
        InviteCodes.create({}),
    ]);

    // create classroom with codes
    const classroom = await Classrooms.create({
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
    });

    return res.json(classroom.sanitize(req.user));
  } catch (err) {
    return res.json({ status: false, message: err });
  }
});

// updates a classroom document by classroomId
router.put("/id/:classroomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  try {
    // sanitize all the things we don't want changed by users
    var sanitizedClassroom = req.body;
    delete sanitizedClassroom._id;
    delete sanitizedClassroom.teacherCode;
    delete sanitizedClassroom.taCode;
    delete sanitizedClassroom.studentCode;
    delete sanitizedClassroom.teachers;
    delete sanitizedClassroom.teacherAssistants;
    delete sanitizedClassroom.students;

    const update = await Classrooms.findOneAndUpdate(
      { _id: req.params.classroomId, teachers: req.user._id },
      { $set: sanitizedClassroom }
    );

    if (!update) {
      throw new Error("Cannot find/modify class" );
    }

      // get updated document now that we've confirmed change
    const classroom = await Classrooms.findOne({ _id: req.params.classroomId, teachers: req.user._id });

    return res.json({
      status: true,
      message: "Class was successfully updated",
      classroom: classroom.sanitize(req.user),
    });
  } catch (err) {
    return res.json({ status: false, message: err.message });
  }
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

router.delete("/:classroomId/:type(student|teacherAssistant|teacher)(student|teacherAssistant|teacher)/:userId", async (req, res) => {
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
    return res.json({ success: true, message: "User is not a " + req.params.type + " of the classroom" });
  }).catch( (err) => res.json({ success: false, message: err.message }));
});

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

router.post("/:classroomId/ask", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const question = req.body.question;
  const user = req.user;

  if (typeof question !== "string") {
    return res.status(400).json({
      success: false,
      message: "question must be a string",
    });
  }

  const classroom = await Classrooms.findOneAndUpdate({
    _id: req.params.classroomId,
    $or: [
      { teachers: req.user._id },
      { teacherAssistants: req.user._id },
      { students: req.user._id }
    ],
  }, {
    $push: {
      questions: {
        user: req.user._id,
        question,
        ts: Date.now(),
        resolution: -1,
        answers: [],
      },
    },
  });

  if (!classroom) {
    return res.json({ success: false, message: "You are not a member of that classroom" });
  }

  return res.json({ success: true });
});

router.post("/:classroomId/answer", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  const answer = req.body.answer;
  const _id = req.body._id;
  const user = req.user;

  if (typeof answer !== "string") {
    return res.status(400).json({
      success: false,
      message: "answer must be a string",
    });
  }

  if (typeof _id !== "string") {
    return res.status(400).json({
      success: false,
      message: "question must be identified by _id",
    });
  }

  const classroom = await Classrooms.findOne({
    _id: req.params.classroomId,
    $or: [
      { teachers: req.user._id },
      { teacherAssistants: req.user._id },
      { students: req.user._id }
    ],
  });

  if (!classroom) {
    return res.status(404).json({
      success: false,
      message: "You are not a member of that classroom",
    });
  }

  const question = classroom.questions.filter(q => q._id.toString() === _id)[0];

  if (!question) {
    return res.status(404).json({
      success: false,
      message: `that classroom does not have a question with _id ${_id}`,
    });
  }

  question.answers.push({
    user: req.user._id,
    answer,
    ts: Date.now(),
  });

  await Classrooms.findByIdAndUpdate(req.params.classroomId, {
    questions: classroom.questions,
  });

  return res.json({ success: true });
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

router.put("/:classroomId/topic/:direction(next|previous)", async (req, res) => {
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
    const classroom = await Classrooms.findOneAndUpdate({
      teachers: req.user.id,
      _id: req.params.classroomId,
    }, {
      $set: { topics: req.body.topics.concat(["General"]) }
    })
    // confirm that it was successfully performed
    if (!classroom) throw new Error("No classroom could be updated");
    return res.status(200).json({ success: true, message: "Topics successfully updated" });
  } catch(err) {
    return res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;

