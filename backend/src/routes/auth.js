const express = require ("express");
const { signin, login, logout, logoutAll, issueNewToken } = require("../controllers/authController");
const router = express.Router();

router.get("/test",(req,res)=>{
    res.send("auth test")
})

router.post("/signin",signin);
router.post("/login",login);
router.get("/logout",logout);
router.get("/logoutall",logoutAll);
router.get("/newtoken",issueNewToken);

module.exports = router