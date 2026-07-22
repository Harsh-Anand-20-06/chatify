import aj from "../lib/arcjet.js"
import { isSpoofedBot } from "@arcjet/inspect";

const arcjetProtection = async function(req,res,next){
    try{
      const decision = await aj.protect(req);

      if(decision.isDenied()){
         if(decision.reason.isRateLimit()){
            return res.status(429).json({
                "message":"rate limit exceeded!"
            })
         }
       else if(decision.reason.isBot()){
          return res.status(403).json({
            "message":"Bot Access Denied!"
          })
      }else{
          return res.status(403).json({
            "message":"access denied by security policy"
      })
      }
    }

    // check for spoofed bots

    if(decision.results.some(isSpoofedBot)){
        return res.status(403).json({
            "message":"spoofed bot detected!",
        })
    }

    next();


    } catch(error){
        console.log("arcjet protection error!")
        next();
    }
}

export { arcjetProtection };