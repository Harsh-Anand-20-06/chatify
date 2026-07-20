const express = require("express");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

const authRouter = require("./routes/auth");
const msgRouter = require("./routes/message");

app.get("/",(req,res)=>{
    res.send("kaisa ho?")
})

app.use("/api/auth",authRouter)
app.use("/api/msg",msgRouter)

app.listen(process.env.PORT,()=>{
    console.log("server started!");
})