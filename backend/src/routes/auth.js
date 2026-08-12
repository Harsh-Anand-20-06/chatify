const express = require ("express");
const { signin, login, logout, logoutAll, issueNewToken } = require("../controllers/authController");
const router = express.Router();
const {arcjetProtection} = require("../middlewares/arcjet");
const { isLoggedIn } = require("../middlewares/user");

router.get("/test",arcjetProtection,(req,res)=>{
    res.send("auth test")
})

// router.use(arcjetProtection)  un-comment after no postman use.

router.post("/signin",signin);
router.post("/login",login);
router.get("/logout",logout);
router.get("/logoutall",logoutAll);
router.get("/newtoken",issueNewToken);

router.get("/check", isLoggedIn , (req, res) => res.status(200).json({
     "message" : "details successfully",
    "id": req.currentUser._id,
    "username": req.currentUser.username,
}));


module.exports = router