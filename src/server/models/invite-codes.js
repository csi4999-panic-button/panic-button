"use strict";

const mongoose = require("mongoose")
const crypto = require("crypto");
const util = require("../util");

// types: { teacher:1, ta:2, student:3 }
const inviteCodeSchema = new mongoose.Schema({
    classroom: { type: String, required: true, lowercase: true, index: true },
    code: { type: String, required: true, lowercase: true, default: getCode, index: true },
    type: { type: Number, required: true }
}, {
    timestamps: true
})

class InviteCode {
    async validCode(code){
        return code === this.code;
    }

    async rotateCode() {
        this.code = getCode();
        return this.save();
    }
}

inviteCodeSchema.loadClass(InviteCode);

function getCode() {
    return util.getKey(6);
}

module.exports = mongoose.model("InviteCode", inviteCodeSchema);