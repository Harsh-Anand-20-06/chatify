const {WebSocket} = require("ws");
const messageModel = require("../models/message");
const userModel = require("../models/userModel");

const messageHandler = async function(req,ws,data,activeUsers){
    if(data.type==="PRIVATE_MESSAGE"){               //client->server
        try{const {messageId,receiverId,text,createdAt} = data.payload;
        const receiverSocket = activeUsers.get(receiverId.toString());

        // console.log([...activeUsers.keys()]);

        if(receiverSocket && receiverSocket.readyState===WebSocket.OPEN){
            // console.log("at recei: ",receiverSocket);
            await messageModel.updateOne({
                _id : messageId,
                senderId : ws.userId,
            },{
                status : "delivered",
            });

            const sender = await userModel.findById(ws.userId);
            // console.log(sender);

            try{receiverSocket.send(JSON.stringify({
                type : "NEW_MESSAGE",
                senderId : ws.userId,
                text : text,
                messageId : messageId,
                createdAt : createdAt,
                sender : sender,
            }))}catch(error){
                console.log("error at sending! ",error);
            }
        }}catch(error){
            console.log("error at sending msg!",error);
        }
    }

    else if(data.type==="READ_MESSAGE"){  //client->server
        const {messageId} = data.payload;
        try{

        await messageModel.updateOne({
            _id : messageId,
            receiverId : ws.userId,
        },{
            status : "read",
        })}catch(error){
            console.log("error at updating status", error);
        }

        const message =  await messageModel.findById(messageId);
        if(!message) return;
        const senderSocket = activeUsers.get(message.senderId.toString());

        if(senderSocket && senderSocket.readyState==WebSocket.OPEN){
            senderSocket.send(JSON.stringify({   //server->client
                type : "MESSAGE_READ",
                messageId,
            }));
        }
    }

    else if(data.type=="TYPING_START"){
        let {receiverId} = data;

        const receiverSocket = activeUsers.get(receiverId.toString());
        if(receiverSocket && receiverSocket.readyState==WebSocket.OPEN){
            receiverSocket.send(JSON.stringify({
                type : "TYPING_STARTED",
                senderId : ws.userId,
            }))
        }
    }

    else if(data.type=="TYPING_STOP"){
        let {receiverId} = data;

        const receiverSocket = activeUsers.get(receiverId.toString());
        if(receiverSocket && receiverSocket.readyState==WebSocket.OPEN){
            receiverSocket.send(JSON.stringify({
                type : "TYPING_STOPPED",
                senderId : ws.userId,
            }))
        }
    }

    else if(data.type=="MESSAGE_DELIVERED"){
        let {messageId} = data.payload;
        const receiverId = ws.userId;

        await messageModel.updateOne({
            _id : messageId,
            receiverId : receiverId,
        },{
            status : "delivered",
        })

        const message = await messageModel.findById(messageId);
        if(!message) return;

        const senderId = message.senderId;
        const senderSocket = activeUsers.get(senderId.toString());

        if(senderSocket && senderSocket.readyState==WebSocket.OPEN){
            senderSocket.send(JSON.stringify({
                type : "DELIVERED_MESSAGE",
                messageId,
            }))
        }
    }
}

module.exports = {messageHandler};