"use strict";

const router = require("express").Router();
const InviteCodes = require("../../../models/invite-codes");
const Classrooms = require("../../../models/classrooms");
const util = require("../../../util");

router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        Classrooms.find({ $or: [ 
                { teachers: req.user._id },
                { teacherAssistants: req.user._id }
        ]}).then(classrooms => {
            Promise.all( classrooms.map( classroom => {
                return InviteCodes.find({ classroom: classroom._id });
            })).then( inviteCodeDocs => {
                res.json([].concat(...inviteCodeDocs));
            }).catch( err => {
                res.json({ success: false, message: err });
            });
        }).catch( err => {
            res.json({ status: false, message: err });
        });
    } else {
        res.status(401).send();
    }
});

router.put("/code/:code", (req,res) => {
    if (req.isAuthenticated()) {
        InviteCodes.find({ code: code })
        .then( inviteCode => {
            const classroom = await Classrooms.find({ $and: [
                { _id: inviteCode.classroom },
                { teachers: req.user._id }
            ]});
            if(classroom.length === 1){
                inviteCode.rotateCode();
                res.json({ 
                    success: true, 
                    inviteCode: inviteCode.code,
                    type: util.getInviteType(inviteCode.type);
                });
            } else {
                res.json({ 
                    success: false, 
                    message: "This code did not match a classroom you teach" 
                });
            }
        }).catch( err => res.json({ success: false, message: err }));
    } else {
        res.status(401).send();
    }
});

module.exports = router;