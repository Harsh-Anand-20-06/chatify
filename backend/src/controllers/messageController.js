const messageModel = require("../models/message");
const userModel = require("../models/userModel");
const { activeUsers } = require("../sockets/socketManager");

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

      const unreadMessages = await messageModel.find({
        senderId : id,
        receiverId : user._id,
        status : {$ne : "read"},
      })

      const senderSocket = activeUsers.get(id);
      let messageIds = unreadMessages.map((msg)=>{return msg._id;});

      await messageModel.updateMany({
        _id : {$in : messageIds}
      },{
        status : "read",
      })

      if(senderSocket && senderSocket.readyState===WebSocket.OPEN){
      senderSocket.send(JSON.stringify({
        type : "MESSAGE_READS",
        messageIds,
      }))
    }

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

    const receiverSocket = activeUsers.get(chatterId);
    let status = "sent";
    // if(receiverSocket && receiverSocket.readyState === WebSocket.OPEN){  //ideally receiver shoul send websocket msg to server about being delivered, for now it's fine!
    //   status = "delivered";
    // }

    const message = await messageModel.create({
        senderId : user._id,
        receiverId : chatterId,
        text : text,
        status : status,
    })


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

    // console.log("cha : ",chatPartners);

    res.status(200).json({
        message : "successfull",
        chatPartners,
    })
} catch (error){
      res.status(500).json({
        "message":"error in fetching chatPartners."
      })
    }
}

const getUnreadsById = async function(req,res){
    // console.log(req.currentUser);
    try{
        const id = req.currentUser._id;

    const messages = await messageModel.find({
        receiverId : id,
        status : {$ne : "read"},
    });

    const unreadsDoc = new Map();
    messages.forEach((msg)=>{
        if(unreadsDoc.has(msg.senderId.toString())){unreadsDoc.set(msg.senderId.toString(),unreadsDoc.get(msg.senderId.toString())+1);}
        else {unreadsDoc.set(msg.senderId.toString(),1);}
    })

    res.status(200).json({
        message : "successfully fetched unreads!",
       // unreadsDoc, -> don't return map in json, map does not serialize to json as expected
       unreadsDoc : [...unreadsDoc.entries()],
    })}catch(error){
        res.status(500).json({
            message : "error at fetching unreads",
            error,
        })
    }
}

module.exports = {getAllContacts,getMsgByUser,sendMessage,getChatPartners,getUnreadsById};