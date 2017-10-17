"use strict";

const router = require("express").Router();
const InviteCodes = require("../../../models/invite-codes");
const Classrooms = require("../../../models/classrooms");
const util = require("../../../util");

router.get("/", (req, res) => {
    if (req.isAuthenticated()) {
        Classrooms.find({$or: [ 
                { teachers: req.user._id },
                { teacherAssistants: req.user._id }
        ]}).then(classrooms => {
            Promise.all( classrooms.map( classroom => {
                return InviteCodes.find({classroom: classroom._id });
            })).then( inviteCodeDocs => {
                res.json([].concat(...inviteCodeDocs));
            }).catch( err => {
                res.json({success: false, message: err });
            });
        }).catch( err => {
            res.json({status: false, message: err });
        });
    } else {
        res.status(401).send();
    }
});

router.put("/code/:code", (req,res) => {
    if (req.isAuthenticated()) {
        const code = req.params.code;
        InviteCodes.find({code: code })
        .then( inviteCode => {
            Classrooms.find({$and: [
                { _id: inviteCode.classroom },
                { teachers: req.user._id }
            ]}).then( classroom => classroom )
        }).then( classroom => {
            if(classroom.length === 1){
                inviteCode.rotateCode();
                res.json({
                    success: true, 
                    inviteCode: inviteCode.code,
                    type: util.getInviteType(inviteCode.type)
                });
            } else {
                res.json({
                    success: false, 
                    message: "This code did not match a classroom you teach" 
                });
            }
        }).catch( err => res.json({success: false, message: err }));
    } else {
        res.status(401).send();
    }
});

router.delete("/code/:code", (req, res) => {
    if(req.isAuthenticated()){
        InviteCodes.findOne({code: req.params.code })
        .then( inviteCode => {
            console.log("inviteCode: " + inviteCode);
            console.log("user._id: " + req.user._id);
            if(inviteCode === null){
                return res.json({
                    success: false, 
                    message: "This invite code does not exist" 
                });
            }
            Classrooms.findOne({$and: [
                { _id: inviteCode.classroom },
                { teachers: req.user._id }
            ]}).then( classroom => {
                console.log("Classroom: " + classroom);
                if( classroom == null ){
                    return res.json({success: false, message: "This invite code does not match a classroom you teach" });
                } else {
                    console.log("Removing: " + req.params.code);
                    InviteCodes.findByIdAndRemove({_id: inviteCode._id })
                    .then(removed => { 
                        console.log("Removed: " + removed)
                        return res.json({success: true, message: "This invite code was removed" });
                    });
                }
            });
        }).catch( err => res.json({success: false, message: err }));
    } else {
        res.status(401).send();
    }
});

module.exports = router;