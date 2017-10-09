"use strict";

const router = require("express").Router();
const Schools = require("../../../models/schools");

// returns a list of all schools
router.get("/", async (req, res) => {
    const schools = await Schools.find(req.query);
    res.json(schools);
});

// create a school
router.post("/", async (req, res) => {
    if(req.isAuthenticated()){
        Schools.create({
            name: req.body.name,
            address: req.body.address,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zip: req.body.zip,
            domain: req.body.domain
        }).then( school => {
            res.json(school);
        }).catch( err => {
            res.json({ sucess: false, message: err });
        });
    } else {
        res.status(401).send();
    }
});

// update a school by schoolId
router.put("/id/:schoolId", (req, res) => {
    if(req.isAuthenticated()){
        Schools.update(
            { _id: req.params.schoolId },
            { $set: req.body }
        ).then( school => {
            console.log(school);
            res.json({ success: true, message: "School successfully updated" })
        }).catch( err => {
            res.json({ success: false, message: err });
        })
    } else {
        res.status(401).send();
    }
});

module.exports = router;

