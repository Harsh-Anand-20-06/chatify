const express = require("express")
const { isLoggedIn } = require("../middlewares/user")
const { getAllContacts, getMsgByUser, sendMessage, getChatPartners } = require("../controllers/messageController")
const router = express.Router()

router.get("/test",(req,res)=>{
    res.send("message tested!")
})

router.get("/contacts",isLoggedIn,getAllContacts);
router.get("/chats",isLoggedIn,getChatPartners);
router.get("/:id",isLoggedIn,getMsgByUser);
router.post("/send/:id",isLoggedIn,sendMessage);

module.exports = router