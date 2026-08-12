const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
   senderId : {
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : true,
   },
   receiverId :{
    type : mongoose.Schema.Types.ObjectId,
    ref : "user",
    required : true,
   },
   text : {
    type : String,
   },
   status : {
    type :  String,
    enum : ["sent","delivered","read"],
    default : "sent",
   },

},{
    timestamps: true,
});

const messageModel = mongoose.model("message",messageSchema);

module.exports = messageModel;