"use strict";

const mongoose = require("mongoose")
const util = require("../util");

const inviteCodeSchema = new mongoose.Schema({
    code: { type: String,  default: getCode, required: true, unique:true },
}, {
  timestamps: true,
});

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

function getCode(n = 32) {
    return util.getKey(n);
}

module.exports = mongoose.model("InviteCode", inviteCodeSchema);
