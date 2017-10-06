"use strict";

const router = require("express").Router();
const Classrooms = require("../../../models/classrooms");
const InviteCodes = require("../../../models/invite-codes");
const mongoose = require("mongoose");
var classCodes = [];

router.get("/", async (req, res) => {
    if (req.isAuthenticated()) {
      const classrooms = await Classrooms.find();
      res.json(classrooms);
    } else {
      res.status(401).send();
    }
  });
  
router.post("/join", async (req, res) => {
    if (req.isAuthenticated()) {
      res.json({username: req.user});
    } else {
      res.status(401).send();
    }
  });

router.post("/", async (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.user);
        classCodes = [];
        try {
            const userTypes = [1,2,3]

            const classroom = Classrooms.create({
                schoolName: req.body.schoolName,
                courseType: req.body.courseType,
                courseNumber: req.body.courseNumber,
                sectionNumber: req.body.sectionNumber,
                courseTitle: req.body.courseTitle,
                teachers: [req.user._id],
                teacherAssistants: [],
                students: []
            }).catch((err) => {
                console.log(err);
            });
            console.log(classroom);
            classroom.then( function(doc) {
                userTypes.forEach( function(n) {
                    const inviteCode = InviteCodes.create({
                        classroom: doc.id,
                        type: n
                    });
                    inviteCode.then( function(inv) {
                        console.log(inv.code);
                        classCodes.push(inv.code);
                        console.log(classCodes);
                    }).catch((err) => {
                        classCodes.push("error");
                    });
                });
            });
            console.log(classCodes);
            
            codePromise.then((v)=>{
                res.json({
                    teachers: classCodes[0],
                    teacherAssistants: classCodes[1],
                    students: classCodes[2]
                });
            });
            

        } catch(err) {
            console.log(err);
            errStatus(res,err);
        }
    } else {
        res.status(401).send();
    }
})

const addCode = function (code){
    classCodes.push(code);
}

const errStatus = function(res, err){
    res.json({success: False, message: err});
}

module.exports = router;

