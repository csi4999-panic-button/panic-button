"use strict";

const router = require("express").Router();
const Schools = require("../../../models/schools");

// returns a list of all schools
router.get("/", async (req, res) => {
    const schools = await Schools.find(req.query);
    return res.status(200).json(schools);
});

router.get("/:schoolId", async (req, res) => {
    const school = await Schools.findById(req.params.schoolId);
    if (!school) return res.status(404).json({success: false, message: 'No school found under that ID'});
    return res.status(200).json(school);
});

router.get("/search/:query", async (req, res) => {
    const caseInsQuery = new RegExp(`${req.params.query}`,"i");
    const schools = await Schools.find({ 
        $or: [
            { name: caseInsQuery },
            { city: caseInsQuery },
            { domain: caseInsQuery },
        ]
    });
    return res.status(200).json(schools);
});


// create a school
router.post("/", async (req, res) => {
    if(!req.isAuthenticated()){
        return res.status(401).send();
    }
    
    if (typeof req.body.zip === 'number') req.body.zip = `${req.body.zip}`;

    return Schools.create({
        name: req.body.name,
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        country: req.body.country,
        zip: req.body.zip,
        domain: req.body.domain
    })
    .then( school => res.json(school))
    .catch( err => res.json({ sucess: false, message: err }));
});

// update a school by schoolId
router.put("/:schoolId", (req, res) => {
    if(!req.isAuthenticated()){
        return res.status(401).send();
    }

    delete req.body._id;

    return Schools.update(
        { _id: req.params.schoolId },
        { $set: req.body }
    ).then( school => {
        console.log(school);
        res.json({ success: true, message: "School successfully updated" })
    }).catch( err => {
        res.json({ success: false, message: err });
    });
});

module.exports = router;

