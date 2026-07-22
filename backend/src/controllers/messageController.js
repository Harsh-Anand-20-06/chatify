const messageModel = require("../models/message");
const userModel = require("../models/userModel");

const getAllContacts = async function(req,res){
    try{
        const user = req.currentUser._id;

        const restUsers = await userModel.find({_id : {$ne : user._id}}).select("-password");

        res.status(200).json({
            "message" : "users fetched!",
            restUsers
        })
    } catch(err){
        res.status(400).json({
            "message" :  "error while fetching contacts!"
        })
    }
}

const getMsgByUser = async function(req,res){
    try{
      const user = req.currentUser;
      const id = req.params.id;

      const messages = await messageModel.find({
        $or : [
            {senderId : user._id,receiverId : id},
            {receiverId : user._id,senderId : id}
        ]
      })

      res.status(200).json({
        "message":"fetched!",
        messages
      });

    }catch(error){
        res.status(400).json({
            "message":"error while fetching message in getMsgByUser"
        })
    }
}

const sendMessage = async function(req,res){
    try {const user = req.currentUser;
    const chatterId = req.params.id;
    const text = req.body.text;
    // console.log(text);

    const message = await messageModel.create({
        senderId : user._id,
        receiverId : chatterId,
        text : text,
    })

    //todo -> implement real time sending msg to sender using socket.io

    res.status(200).json({
        "message":"message saved!",
        message
    });
} catch(error){
    res.status(500).json({
        "message":"error at sendMessage func, maybe check accesstoken in headers!",
    })
}
}

const getChatPartners = async function(req,res){
    try {const user = req.currentUser;

    // getting all messages where reciever is this user or sender is this user

    const messages = await messageModel.find({
        $or : [
            {senderId : user._id},
            {receiverId : user._id},
        ]
    })

    const chatPartnerIds = [...new Set(messages.map((msg)=>{         //set to remove duplicates
        if(msg.senderId.toString()==user._id.toString()) return msg.receiverId.toString()
        else return msg.senderId.toString()
    }))];

    const chatPartners = await userModel.find({_id : {
        $in :  chatPartnerIds
    }}).select("-password");

    res.status(200).json(chatPartners)
} catch (error){
      res.status(500).json({
        "message":"error in fetching chatPartners."
      })
    }
}

module.exports = {getAllContacts,getMsgByUser,sendMessage,getChatPartners};