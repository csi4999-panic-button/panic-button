"use strict";

const router = require("express").Router();
const Classrooms = require("../../../models/classrooms");
const InviteCodes = require("../../../models/invite-codes");

// returns a list of classrooms this user belongs to
router.get("/", async (req, res) => {
  if (req.isAuthenticated()) {
    Classrooms.find({ $or: [
      { teachers: req.user._id },
      { teacherAssistants: req.user._id },
      { students: req.user._id }
    ]}).then(classrooms => {
      res.json(classrooms);
    }).catch( err => {
      res.json({ status: false, message: err });
    });
  } else {
    res.status(401).send();
  }
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
          InviteCodes.create({ classroom: classroom.id, type: n }))))
  .then(values => {
    const [teachers, teacherAssistants, students] = values.map(invite => invite.code);
    res.json({ teachers, teacherAssistants, students });
  })
  .catch(err => res.json({ status: false, message: err });
});

// updates a classroom document by classroomId
router.put("/id/:classroomId", async (req, res) => {
  if (req.isAuthenticated()) {
    Classrooms.findOneAndUpdate(
        { $and: [ { id: req.params.classroomId } , { teachers: req.user._id } ] },
        { $set: req.body }
        ).then( classroom => {
      console.log(classroom);
      if( classroom !== null ){
        res.json({status: true, message: "Class was successfully updated", classroom: classroom });
      } else {
        res.json({status: false, message: "Cannot find/modify class" });
      }
    }).catch( err => {
          res.json({ status: false, message: err });
        });
  } else {
    res.status(401).send();
  }
});

// adds user to the listing for a classroom based on a given invite code
router.post("/join", async (req, res) => {
  if (req.isAuthenticated()) {
    const qCode = req.body.inviteCode
      InviteCodes.findOne(
          { code: qCode }
          ).then( validCode => {
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
            res.json({ success: true, message: "You successfully belong to the classroom" });
          } else {
            res.json({ success: false, message: "You could not be added to that classroom" });
          }
        }).catch( err => {
              res.json({ success: false, message: err });
            });

      }).catch( err => {
        res.json({success: false, message: err });
      });
  } else {
    res.status(401).send();
  }
});

module.exports = router;

