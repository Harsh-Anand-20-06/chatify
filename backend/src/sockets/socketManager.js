let activeUsers = new Map();
const jwt = require("jsonwebtoken");
const messageModel = require("../models/message");
const {WebSocket} = require("ws");
const {messageHandler} = require("./messageHandler");

const broadcastStatus = async function(id,status){
    try{
    //     const myChats = await messageModel.find({
    //     $or : [
    //         {
    //             senderId : id,
    //         },
    //         {
    //             receiverId : id,
    //         }
    //     ]
    // })

    // const myContactsIds = [...new Set(myChats.map((chats)=>{
    //     if(chats.senderId.toString()==id.toString()) return chats.receiverId.toString();
    //     else return chats.senderId.toString();
    // }))]

    const message = JSON.stringify({
        type : "USER_STATUS",
        senderId : id,
        status : status,
    })

    activeUsers.forEach((socket,userId)=>{
        if(userId!=id){
            const receiverSocket = socket;
        if(receiverSocket && receiverSocket.readyState===WebSocket.OPEN){
        receiverSocket.send(message);
        }
    }
    })}catch(error){
        console.log("error at broadcast status, ",error);
    }
}

const updateDelivered = async function(id){

    const messages = await messageModel.find({
        receiverId : id,
        status : "sent",
    })

    const messageIds = messages.map((msg)=>{return msg._id;});

      await messageModel.updateMany({
        _id : {$in : messageIds},
      },{
        status : "delivered",
      });

      messages.forEach((msg)=>{
        const senderId = msg.senderId;
        const senderSocket = activeUsers.get(senderId.toString());

        if(senderSocket && senderSocket.readyState===WebSocket.OPEN){
            senderSocket.send(JSON.stringify({
                type : "DELIVERED_MESSAGE",
                messageId : msg._id,
            }))
        }
      })
}

  const sendOnlineUsers = async function(id){    //tells current user also about the users who logged in previously than him that they are also online.
    // const messages = await messageModel.find({
    //     $or : [
    //         {senderId : id},
    //         {receiverId : id},
    //     ]
    // });

//    const chatIds = [...new Set(messages.map((msg)=>{
//     if(msg.senderId.toString()==id) return msg.receiverId.toString();
//     else return msg.senderId.toString();
//    }))]

   let onlineUsers = [];
   const mySocket = activeUsers.get(id);

//    chatIds.forEach((chatId)=>{
//     const receiverSocket = activeUsers.get(chatId);
//     if(receiverSocket && receiverSocket.readyState==WebSocket.OPEN){
//         onlineUsers.push(chatId);
//     }
//    })

activeUsers.forEach((socket,userId)=>{
    if(userId!=id) onlineUsers.push(userId);
})

console.log("here");
console.log(onlineUsers);

   mySocket.send(JSON.stringify({
    type : "ONLINE_USERS",
    onlineUsers,
   }))
  }

const setUpSocket =  function(wss){
   wss.on("connection",async (ws,req)=>{
    console.log("connected!")
      
    const requestURL = req.url;
    const params = requestURL.split("?")[1];
    const requestParams = new URLSearchParams(params);

    

    const accessToken = requestParams.get("accesstoken");
    if(!accessToken){
        ws.close(1008,"no access token");
        return;
    }

    try{
    const decoded = jwt.verify(accessToken,process.env.JWT_SECRET);
    const userId = decoded.id;

    ws.userId = userId;
    activeUsers.set(ws.userId,ws);
    ws.send(JSON.stringify({message : "you are verified and well connected to server!"}));
    ws.isAlive = true;

    await sendOnlineUsers(ws.userId);
    await broadcastStatus(ws.userId,"ONLINE");
    await updateDelivered(ws.userId);
    

   }catch(error){
    ws.close(1008,"user could not be verified!");
    return;
   }

    ws.on("pong",()=>{
    ws.isAlive = true;
    })

    ws.on("message",async (buffer)=>{
        try {
        const data = JSON.parse(buffer.toString());
        await messageHandler(req,ws, data, activeUsers);
    } catch (err) {
        console.error(err);
    }
    })

    ws.on("close", () => {
    if (activeUsers.get(ws.userId) === ws) {
        activeUsers.delete(ws.userId);
        broadcastStatus(ws.userId, "OFFLINE");
    }
});

      
      
   });

   const interval = setInterval(()=>{
    wss.clients.forEach((ws)=>{
       if(ws.isAlive==false){
        console.log("terminating user!");
        ws.terminate();
        return;
       }
       ws.isAlive = false;
       ws.ping();
    })
   },30000);

   wss.on("close",()=>{
    clearInterval(interval);
   })
};



module.exports = {setUpSocket,activeUsers};