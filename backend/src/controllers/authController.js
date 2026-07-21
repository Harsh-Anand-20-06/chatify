const sessionModel = require("../models/sessionModel");
const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const crypto = require("crypto")

const signin = async function(req,res){
    const {username,email,password} = req.body;

    const user = await userModel.findOne({username:username});

    if(user){
        return res.status(409).json({
            "message" : "user already exists",
        })
    }

    const hashedPassword = await bcrypt.hash(password,12);

    const new_user = await userModel.create({
        username : username,
        email : email,
        password : hashedPassword,
    })

    const refreshToken = jwt.sign({
        id : new_user._id,
    },process.env.JWT_SECRET,{
        expiresIn : "7d"
    })

    const refreshTokenHash = await crypto.createHash("sha256").update(refreshToken).digest("hex");

    const new_session = await sessionModel.create({
        user_id : new_user._id,
        refreshTokenHash : refreshTokenHash,
        ip : req.ip,
    })

    const accessToken = jwt.sign({
        id : new_user._id,
        session_id : new_session._id,
    },process.env.JWT_SECRET,{
        expiresIn : "15m"
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : true,
        maxAge : 7*24*60*60*1000,
    })

    res.status(200).json({
        "message":"user signed in!",
        accessToken,
    })
}


const login = async function(req,res){
    const {username,password} = req.body;

    const user = await userModel.findOne({username:username});
    if(!user){
        return res.status(404).json({
            "message":"either username or password in incorrect",
        })
    }

    const isValid = await bcrypt.compare(password,user.password);
    if(!isValid){
        return res.status(404).json({
            "message":"either username or password in incorrect",
        })
    }

    const refreshToken = jwt.sign({
        id : user._id,
    },process.env.JWT_SECRET,{
        expiresIn:"7d",
    })

    const refreshTokenHash = await crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.create({
        user_id : user._id,
        refreshTokenHash: refreshTokenHash,
        ip : req.ip,
    });

    const accessToken = jwt.sign({
        id : user._id,
        session_id : session._id,
    },process.env.JWT_SECRET,{
        expiresIn : '15m',
    })

    res.cookie("refreshToken",refreshToken,{
        httpOnly : true,
        secure : true,
        maxAge : 7*24*60*60*1000,
    })

    res.status(200).json({
        "message" : "loggedIn successfully",
        accessToken,
    })


}

const logout = async function(req,res){
    const refreshToken = req.cookies.refreshToken;
    
    if(!refreshToken){
        return res.status(404).json({
            "message":"no refreshtoken found in your cookies",
        })
    }

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({refreshTokenHash:refreshTokenHash,revoked:false});
    if(!session){
        return res.status(404).json({
            "message":"no session found in db",
        })        
    }

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken",{
        httpOnly:true,
        secure : true,
    })

    res.status(200).json({
        "message" : "user logged out",
    })

    
}

const logoutAll = async function(req,res){
    try{
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken){
        return res.status(404).json({
            "message":"refreshToken not found!",
        })
    }

    const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET);
    const user_id = decoded.id;

    await sessionModel.updateMany({
        user_id : user_id
    },{
        revoked : true,
    });

        res.clearCookie("refreshToken",{
        httpOnly:true,
        secure : true,
    })

    res.status(200).json({
        "message":"logged out from all devices", 
    })
} catch(error){
    return res.status(401).json({
        "message":"Invalid or Expired token!"
    })
}
}

const issueNewToken = async function(req,res){
    const refreshToken = req.cookies.refreshToken;

    if(!refreshToken){
        return res.status(404).json({
            "message":"refresh token not found!",
        })
    }

    const decoded = jwt.verify(refreshToken,process.env.JWT_SECRET);

    const refreshTokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");

    const session = await sessionModel.findOne({refreshTokenHash:refreshTokenHash});

    if(session.revoked){
        return res.status(404).json({
            "message":"this token's session is revoked!"
        })
    }
    

    session.revoked = true;
    await session.save();

    res.clearCookie("refreshToken",{
        httpOnly : true,
        secure : true,
    });

    const nayaRefreshToken = jwt.sign({
        id : decoded.id,
    },process.env.JWT_SECRET,{
        expiresIn:"7d",
    });

    const nayaRefreshTokenHash = crypto.createHash("sha256").update(nayaRefreshToken).digest("hex");

    const nayasession = await sessionModel.create({
        user_id : decoded.id,
        refreshTokenHash : nayaRefreshTokenHash,
        ip : req.ip,
    })

    const nayaAccessToken = jwt.sign({
        id : decoded.id,
        session_id : nayasession._id,
    },process.env.JWT_SECRET,{
        expiresIn:"15m",
    })

    res.cookie("refreshToken",nayaRefreshToken,{
        httpOnly : true,
        secure : true,
        maxAge : 7*24*60*60*1000,
    })

    res.status(200).json({
        "message" : "new access token generated!",
        nayaAccessToken,
    })



}



module.exports = {signin,login,logout,logoutAll,issueNewToken};