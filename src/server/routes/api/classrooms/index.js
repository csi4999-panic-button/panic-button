"use strict";

const router = require("express").Router();
const Classrooms = require("../../../models/classrooms");
const InviteCodes = require("../../../models/invite-codes");

// returns a list of classrooms this user belongs to
router.get("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
  }
  
  return Classrooms.find({ $or: [
    { teachers: req.user._id },
    { teacherAssistants: req.user._id },
    { students: req.user._id }
  ]}).populate({ 
      path: "teacherCode", select: "code",
      path: "taCode", select: "code",
      path: "studentCode", select: "code" 
  })
  .then( filledRooms => res.json(filledRooms))
  .catch( err => res.json({ status: false, message: err.message }));
});

// creates a classroom and returns invite codes for teachers, TAs, and students
router.post("/", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }

  return Classrooms.create({
    schoolId: req.body.schoolId,
    courseType: req.body.courseType,
    courseNumber: req.body.courseNumber,
    sectionNumber: req.body.sectionNumber,
    courseTitle: req.body.courseTitle,
    teachers: [req.user._id],
    teacherAssistants: [],
    students: []
  })
  .then(classroom =>
    Promise.all([1,2,3].map(n =>
          InviteCodes.create({ classroom: classroom.id, type: n })))
    .then(values => {
      const [teachers, teacherAssistants, students] = values.map(invite => invite.code);
      return classroom.update({
        teacherCode: teachers,
        taCode: teacherAssistants,
        studentCode: students
      })
      .then( c => res.json({ teachers, teacherAssistants, students }))
    }))
  .catch(err => res.json({ status: false, message: err }));
});

// updates a classroom document by classroomId
router.put("/id/:classroomId", async (req, res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
  }

  return Classrooms.findOneAndUpdate(
    { id: req.params.classroomId, teachers: req.user._id },
    { $set: req.body } // THIS NEEDS TO BE SANITIZED (perhaps with a function in util?)
  ).then( (classroom) => {
    if( classroom !== null ){
      return res.json({status: true, message: "Class was successfully updated", classroom: classroom });
    }
    
    return res.json({status: false, message: "Cannot find/modify class" });
  }).catch( err => res.json({ status: false, message: err.message }))
});

// adds user to the listing for a classroom based on a given invite code
router.post("/join", async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send();
  }
  
  const qCode = req.body.inviteCode
  InviteCodes.findOne({ code: qCode })
  .then( validCode => {
    if(validCode.length === 0){
      throw new Error("That invite code could not be found");
    }

    var listUpdate = {};
    switch(validCode.type) {
      case 1:
        listUpdate = { teachers: req.user._id }
        break;
      case 2:
        listUpdate = { teacherAssistants: req.user._id }
        break;
      case 3:
        listUpdate = { students: req.user._id }
        break;
      default:
        throw Error("No matching code type for " + validCode);
    }

    Classrooms.update(
      { _id: validCode.classroom },
      { $addToSet: listUpdate },
      { upsert: false }
    ).then( classUpdate => {
      console.log(classUpdate);
      if(classUpdate.ok === 1){
        return res.json({ success: true, message: "You successfully belong to the classroom" });
      }

      return res.json({ success: false, message: "You could not be added to that classroom" });

    }).catch( err => res.json({success: false, message: err.message }));
  }).catch( err => res.json({success: false, message: err.message }));
});

// rotate the invite code of $type for $classroomId
router.put("/:classroomId/code/:type", (req,res) => {
  if (!req.isAuthenticated()) {
    res.status(401).send();
  }

  return Classrooms.find({
      _id: req.params.classroomId,
      teachers: req.user._id
  }).then( (classroom) => {
    if(classroom.length !== 1){
      throw new Error("This code did not match a classroom you teach");
    }

    return InviteCodes.findOne({ 
      classroom: req.params.classroomId,
      type: req.params.type
    });
  }).then( (inviteCode) => {
    if(inviteCode === null){
      return new Error("There was no invite code of that type for that classroom");  
    }

    inviteCode.rotateCode();
    return res.json({
        success: true, 
        inviteCode: inviteCode.code,
        type: util.getInviteType(inviteCode.type)
    });
  }).catch( err => res.json({success: false, message: err.message }));
});

router.delete("/:classroomId/code/:code", (req, res) => {
  if(!req.isAuthenticated()){
    return res.status(401).send();
  }

  return Classrooms.findOne({ 
    _id: req.params.classroomId ,
    teachers: req.user._id 
  }).then( classroom => {
    if( classroom == null ){
      throw new Error("This invite code does not match a classroom you teach");
    }
    
    return InviteCodes.findOneAndRemove({code: req.params.code })
  }).then( inviteCode => {
    console.log(inviteCode);
    if( inviteCode == null){
      return res.json({ success: false, message: "This invite code does not exist" });
    }

    return res.json({ success: true, message: "This invite code was removed" });
  }).catch( err => res.json({success: false, message: err.message }));
});


module.exports = router;

