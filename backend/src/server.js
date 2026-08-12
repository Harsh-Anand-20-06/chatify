const http = require("http");
const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./lib/db")
const cookieParser = require("cookie-parser");
const crypto = require("crypto");
const cors = require("cors");
const {WebSocketServer} = require("ws");
const {setUpSocket} = require("./sockets/socketManager");

dotenv.config();
connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({origin: process.env.FRONTEND_URL,credentials:true}));
app.use(cookieParser());

const server = http.createServer(app);
const wss = new WebSocketServer({server});

setUpSocket(wss);

const authRouter = require("./routes/auth");
const msgRouter = require("./routes/message");
const userRouter = require("./routes/user");



app.get("/",(req,res)=>{
    res.send("kaisa ho?")
})

app.use("/api/auth",authRouter)
app.use("/api/msg",msgRouter)
app.use("/api/user",userRouter)

const PORT = process.env.PORT || 5000;

server.listen(PORT,"0.0.0.0",()=>{
    console.log("server started!");
})