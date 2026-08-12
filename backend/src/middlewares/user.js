const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const userModel = require("../models/userModel")
const sessionModel = require("../models/sessionModel")

const isLoggedIn = async function(req,res,next){
  try{
    const accessToken = req.headers['authorization']?.split(' ')[1];
    if(!accessToken){
        return res.status(401).json({
            "message":"accessToken not found!"
        })
    }

    const accessTokenDecoded = jwt.verify(accessToken,process.env.JWT_SECRET);
    const user_id = accessTokenDecoded.id

    const user = await userModel.findById(user_id).select("-password");
    
    req.currentUser = user;

    next();} catch(error){
        res.status(401).json({
            "message":"internal server error at isLoggedIn!",
        })
    }

    
}

module.exports = {isLoggedIn}