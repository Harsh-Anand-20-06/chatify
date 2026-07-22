const express = require("express");
const { getMyDetails } = require("../controllers/userController");
const { isLoggedIn } = require("../middlewares/user");
const router = express.Router();

router.get("/getmydetails",isLoggedIn,getMyDetails);

module.exports = router;