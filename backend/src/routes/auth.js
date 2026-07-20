const express = require ("express")
const router = express.Router();

router.get("/test",(req,res)=>{
    res.send("auth test")
})

module.exports = router