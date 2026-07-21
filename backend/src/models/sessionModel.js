const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
    user_id : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true,
    },
    refreshTokenHash : {
        type : String,
        required : true,
        unique : true,
    },
    ip : {
        type : String,
        required : true,
    },
    revoked : {
        type : Boolean,
        default : false,
    },
},{
    timestamps: true,
});

const sessionModel = mongoose.model("session",sessionSchema)
module.exports = sessionModel;