const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const {v4:uuidv4} = require("uuid");
require("./db");
const User = require("./models/user");
const port = 8080;
//middleware
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("App is Live");
});
app.post("/signup",async(req,res)=>{
    const {name,email,password} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){

    }
})
app.post("/login",(req,res)=>{
    const {email,password} = req.body;

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    res.json({
        success:true,
        message:"Login api works",
    });
});
app.listen(port,()=>{
    console.log(`App is Listing on port ${port}`);
});

app.use((err,req,res,next)=>{
    const {statusCode=500,message="Something went worng"}= err;
    res.status({
        error:{
            message,
            statusCode,
        }
    });
});

