"use strict";

const mongoose = require("mongoose")
const util = require("../util");

// types: { teacher:1, ta:2, student:3 }
const inviteCodeSchema = new mongoose.Schema({
    classroom: { type: "ObjectId", index: true, ref: "Classroom" },
    code: { type: String,  lowercase: true, default: getCode, index: true },
    type: { type: Number }
}, {
    timestamps: true
})

class InviteCode {
    validCode(code){
        return code === this.code;
    }

    rotateCode() {
        this.code = getCode();
        return this.save();
    }
}

inviteCodeSchema.loadClass(InviteCode);

function getCode() {
    return util.getKey(6);
}

module.exports = mongoose.model("InviteCode", inviteCodeSchema);