const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./lib/db")
const cookieParser = require("cookie-parser");
const crypto = require("crypto");

dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const authRouter = require("./routes/auth");
const msgRouter = require("./routes/message");
const userRouter = require("./routes/user");



app.get("/",(req,res)=>{
    res.send("kaisa ho?")
})

app.use("/api/auth",authRouter)
app.use("/api/msg",msgRouter)
app.use("/api/user",userRouter)

app.listen(process.env.PORT,()=>{
    console.log("server started!");
})