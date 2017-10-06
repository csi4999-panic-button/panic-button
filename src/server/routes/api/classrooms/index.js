"use strict";

const router = require("express").Router();
const Classrooms = require("../../../models/classrooms");
const InviteCodes = require("../../../models/invite-codes");
const mongoose = require("mongoose");
var classCodes = [];

router.get("/", async (req, res) => {
    if (req.isAuthenticated()) {
        const classrooms = await Classrooms.find(
            { $or: [ 
                {teachers: req.user._id },
                {teacherAssistants: req.user._id },
                {students: req.user._id }
            ]}
        );
        res.json(classrooms);
    } else {
        res.status(401).send();
    }
  });

router.put("/id/:classroomId", async (req, res) => {
    if (req.isAuthenticated()) {
        console.log("req.params.classroomId: " + req.params.id);
        console.log("req.user._id: " + req.user._id);
        Classrooms.findOneAndUpdate(
            { $and: [ { id: req.params.classroomId } , { teachers: mongoose.Types.ObjectId(req.user._id) } ] },
            { $set: req.body }
        ).then( classroom => {
            console.log(classroom);
            if( classroom !== null ){
                res.json({status: true, message: "Class was successfully updated" });
            } else {
                res.json({status: false, message: "Cannot find/modify class" });
            }
        }).catch( err => {
            res.json({ status: false, message: err });
        });
    } else {
        res.status(401).send();
    }
})
  
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
            Classrooms.update (
                { id: validCode.classroom },
                {$push: listUpdate},
                { upsert: true },
                function(err, data){}
            );
            res.json({success: true, message: "Successfully added you to the classroom" });
        }).catch( err => {
            res.json({success: false, message: err });
        });
    } else {
        res.status(401).send();
    }
  });

router.post("/", async (req, res) => {
    if (req.isAuthenticated()) {
        try {
            const userTypes = [1,2,3];
            Classrooms.create({
                schoolName: req.body.schoolName,
                courseType: req.body.courseType,
                courseNumber: req.body.courseNumber,
                sectionNumber: req.body.sectionNumber,
                courseTitle: req.body.courseTitle,
                teachers: [req.user._id],
                teacherAssistants: [],
                students: []
            }).catch((err) => {
                res.json({success: false, message: err});
            }).then( classroom => {
                Promise.all(userTypes.map( n => {
                    return InviteCodes.create({
                        classroom: classroom.id,
                        type: n
                    }) 
                })).then( values => {
                    var inviteCodes = values.map( invite => {
                        return invite.code;
                    });
                    res.json({
                        teachers: inviteCodes[0],
                        teacherAssistants: inviteCodes[1],
                        students: inviteCodes[2]
                    });
                }).catch( err => {
                    res.json({ success: false, message: err });
                });
            });

        } catch(err) {
            res.json({success: false, message: err});
        }
    } else {
        res.status(401).send();
    }
});

module.exports = router;

