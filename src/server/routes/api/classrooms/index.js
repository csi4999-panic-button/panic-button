"use strict";

const router = require("express").Router();
const InviteCodes = require("../../../models/invite-codes");
const Classrooms = require("../../../models/classrooms");
const util = require("../../../util");

// returns a list of classrooms this user belongs to
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
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
    return Classrooms.create({
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
    })
    .then( c => res.json(c.sanitize(req.user)))
      .catch(err => {
        res.json({ status: false, message: err });
      });
  } catch (err) {
    return res.json({ status: false, message: err });
  }
});

// updates a classroom document by classroomId
router.put("/id/:classroomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
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
  ).then( (classroom) => {
    if (!classroom) {
      throw new Error("Cannot find/modify class" );
    }
    
    // get updated document now that we've confirmed change
    return Classrooms.findOne({ _id: req.params.classroomId, teachers: req.user._id })
  }).then( classUpdate => res.json(
    { status: true, 
      message: "Class was successfully updated", 
      classroom: classUpdate 
    }
  )).catch( err => res.json({ status: false, message: err.message }));
});

// adds user to the listing for a classroom based on a given invite code
router.post("/join", async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send();
    }

    const code = req.body.inviteCode;

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
          { $addToSet: { teachers: req.user.id } });
    } else if (classroom.taCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { teacherAssistants: req.user.id } });
    } else if (classroom.studentCode === code) {
      await Classrooms.findByIdAndUpdate(classroom.id,
          { $addToSet: { students: req.user.id } });
    }

    return res.json({ success: true, message: "You successfully belong to the classroom" });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
    });
  }
});

// rotate the invite code of $type for $classroomId
router.put("/:classroomId/code/:type", async (req,res) => {
  try {
    if (!req.isAuthenticated()) {
      res.status(401).send();
    }

    const valid = util.validInviteType(parseInt(req.params.type));
    
    if (!valid) { throw new Error("The provided type was invalid"); }

    const classroom = await Classrooms.findOne({
      _id: req.params.classroomId,
      teachers: req.user._id
    });

    if (!classroom) {
      throw new Error("This code did not match a classroom you teach");
    }

    const codeModel = await InviteCodes.create({});
    const code = codeModel.code;

    if (req.params.type === "1") {
      classroom.set("teacherCode", code);
    } else if (req.params.type ==="2") {
      classroom.set("taCode", code);
    } else if (req.params.type ==="3") {
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

router.delete("/:classroomId/:type/:userId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
  }

  try {
    var queryDocument = {
      _id: req.params.classroomId,
      teachers: req.user._id,
    }
    var updateDocument = {}

    if(req.params.type === "student"){
      queryDocument.students = req.params.userId
      updateDocument.$pull = { students: req.params.userId }
    } else if(req.params.type === "teacherAssistant"){
      queryDocument.teacherAssistants = req.params.userId
      updateDocument.$pull = { teacherAssistants: req.params.userId }
    } else if(req.params.type === "teacher"){
      // cannot remove yourself from a classroom
      if(req.params.userId === String(req.user._id)){
        throw new Error("Sorry you cannot remove yourself from your own classroom")
      }
      queryDocument.teachers = req.params.userId
      
      // cannot remove the last teacher in a classroom
      queryDocument.$nor = [
        {teachers: {$exists: false}},
        {teachers: {$size: 0}},
        {teachers: {$size: 1}}
      ];

      updateDocument.$pull = { teachers: req.params.userId }
    } else {
      throw new Error("The given type is not valid");
    }
    console.log(queryDocument);
    console.log(updateDocument);

    return Classrooms.findOneAndUpdate(queryDocument, updateDocument)
    .then( classroom => {
      if(!classroom){
        throw new Error("Could not perform that request")
      }
      return res.json({ success: true, message: "Student now does not belong to the room" });
    }).catch( (err) => res.json({ success: false, message: err.message }));
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
})

module.exports = router;

