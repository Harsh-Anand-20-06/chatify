const express = require ("express");
const { signin, login, logout, logoutAll, issueNewToken } = require("../controllers/authController");
const router = express.Router();
const {arcjetProtection} = require("../middlewares/arcjet");

router.get("/test",arcjetProtection,(req,res)=>{
    res.send("auth test")
})

// router.use(arcjetProtection)  un-comment after no postman use.

router.post("/signin",signin);
router.post("/login",login);
router.get("/logout",logout);
router.get("/logoutall",logoutAll);
router.get("/newtoken",issueNewToken);

module.exports = router