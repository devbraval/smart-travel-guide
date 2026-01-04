const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcryptjs");
const {v4:uuidv4} = require("uuid");
require("./db");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const sendOtp = require("./utils/sendOtp");
const generateOtp = require("./utils/otp");
const { options } = require("./email");
const port = 8080;
//middleware
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("App is Live");
});
app.post("/signup",wrapAsync(async(req,res,next)=>{
    const {name,email,password} = req.body;
    const existingUser = await User.findOne({email});
    if(existingUser){
        next(new ExpressError(404,"User Already Exists! "));
    }
    const hasedPassword = await bcrypt.hash(password,10);
    const otp = generateOtp();
    const user = new User({
        userId:uuidv4(),
        name,
        email,
        hasedPassword,
        otp,
        otpExpiry:Date.now()+5*60*1000,
    });
    await user.save();
    await sendOtp(email,otp);

    res.json({
        success:true,
        message:"Opt Sent to email",
    });
}));
app.post("/login",wrapAsync(async(req,res,next)=>{
    const {email,password} = req.body;
    const existingUser = User.findOne({email});
    if(!existingUser){
        next(new ExpressError(404,"User Not Founded")); 
    }
    const otp = generateOtp();
    const isMatch = await bcrypt.compare(password,existingUser.password);
    if(!isMatch){
        next(new ExpressError(404,"Invalid PassWord"));
    }
    existingUser.otp = otp;
    existingUser.otpExpiry = Date.now()+5*60*1000;
    await existingUser.save();
    await sendOtp(email,otp);
    res.json({
    success: true,
    message: "OTP sent to email"
  });
    
}));
app.post("/verify-otp",wrapAsync(async(req,res,next)=>{
    const {email,otp} = req.body;
    const user = await User.findOne({email});
    if(!user){
        next (new ExpressError(404,"User Not Founded"));
    }
    if(user.otp!==otp || user.otpExpiry<Date.now()){
        next(new ExpressError(404,"Invalid or Expired Otp"));
    }
    user.otp=null;
    user.otpExpiry=null;
    user.isVerified=true;
    await user.save();
    res.json({
        success:true,
        message:"OTP Verified",
        userID:user.userId,
    });
    
}));
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

