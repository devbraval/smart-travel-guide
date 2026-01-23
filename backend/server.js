const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const bcrypt = require("bcrypt");
const {v4:uuidv4} = require("uuid");
require("./db");
const wrapAsync = require("./utils/wrapAsync");
const ExpressError = require("./utils/ExpressError");
const User = require("./models/user");
const sendOtp = require("./utils/sendOtp");
const generateOtp = require("./utils/otp");
const { options } = require("./email");
const otpgenrator = require("./utils/otp");
const user = require("./models/user");
const port = 8080;
//middleware
app.use(cors());
app.use(express.json());

app.get("/",(req,res)=>{
    res.send("App is Live");
});
app.post("/signup",async(req,res)=>{
  const {name,email,password} = req.body;
  let user = await User.findOne({email});
  if(user && user.isVerified){
    return res.json({
      success:false,
      message:"User Already Exists",
    });
  }
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  if(!user){
    const hashedPassword = await bcrypt.hash(password,10);
    user = new User({
      userId:uuidv4(),
      name:name,
      email:email,
      password:hashedPassword,
    });
  }
  user.otp = hashedOtp;
  user.otpExpiry=Date.now()+5*60*1000;
  user.otpPurpose="auth",
  user.otpAttempts=0;
  user.lastOtpSentAt = new Date();

  await user.save();
  await sendOtp(email,otp);
  return res.json({
    success:true,
    message:"Otp Sent to Your Email",
  });

});
app.post("/login",async(req,res)=>{
  const {email,password} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.json({
      success:false,
      message:"User not Found",
    });
  }
  const isMatched = await bcrypt.compare(password,user.password);
  if(!isMatched){
    return res.json({
      success:false,
      message:"Wrong Password",
    });
  }
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  user.otp=hashedOtp;
  user.otpExpiry= Date.now()+5*60*1000;
  user.otpPurpose="auth",
  user.otpAttempts=0;
  user.lastOtpSentAt = new Date();
  await user.save();
  await sendOtp(email,otp);
  return res.json({
    success:true,
    message:"Otp Sent to Your Email",
  });
});
app.post("/verify-otp",async(req,res)=>{
    const {email,otp} = req.body;
    const user = await User.findOne({email});
    if(!user){
      return res.json({
        success:false,
        message:"User Not found",
      });
    }
    if(!user.otp){
      return res.json({
        success:false,
        message:"Invalid Otp",
      });
    }
    if(user.otpPurpose!=="auth"){
      return res.json({
        success:false,
        message:"OTP purpose mismatch",
      });
    }
    if(user.otpExpiry<Date.now()){
      return res.json({
        success:false,
        message:"Otp is Expired",
      });
    }
    if(user.otpAttempts>=5){
      return res.json({
        success:false,
        message:"Too Many Attempts",
      });
    }

    const isMatched = await bcrypt.compare(otp,user.otp);
    if(!isMatched){
      user.otpAttempts+=1;
      await user.save();
      return res.json({
        success:false,
        message:"Invalid Otp",
      });
    }
    user.otp = null;
    user.otpExpiry=null;
    user.otpAttempts=0;
    user.otpPurpose=null;
    user.isVerified = true;

    await user.save();
    return res.json({
        success:true,
        message:"Otp Verified",
      });
});

app.post("/resend-otp", async (req, res) => {
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.json({
        success:false,
        message:"User Not found",
      });
  }
  if(!user.otp || !user.otpPurpose){
    return res.json({
        success:false,
        message:"Otp Not found",
      });
  }
  if(user.otpAttempts >= 5){
    return res.json({
        success:false,
        message:"Too many attempts",
      });
  }
  if(user.lastOtpSentAt && Date.now()-user.lastOtpSentAt < 30*1000){
    return res.json({
        success:false,
        message:"Please wait before requesting OTP again",
      });
  }
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  user.otp = hashedOtp;
  user.otpExpiry = Date.now()+5*60*1000;
  user.otpAttempts = 0;
  user.lastOtpSentAt=new Date();

  await user.save();
  await sendOtp(email,otp);
  return res.json({
        success:true,
        message:"OTP resent successfully",
      });
}); 
app.post("/forgot-password",async(req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email});
  if(!user){
    return res.json({success:true});
  }
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  user.otp = hashedOtp;
  user.otpExpiry = Date.now()+5*60*1000;
  user.otpPurpose="reset";
  user.otpAttempts = 0;
  await user.save();
  await sendOtp(email,otp);
  return res.json({ success: true, message: "OTP sent" });
});

app.post("/verify-reset-otp",async(req,res)=>{
  const {email,otp} = req.body;
  const user = await User.findOne({email});
  if(!user ||user.otpPurpose !=="reset"){
    return res.json({
      success:false,
      message:"Invalid Otp",
    });
  }

  const isValid = await bcrypt.compare(otp,user.otp);
  if(!isValid || user.otpExpiry<Date.now()){
    return res.json({
      success:false,
      message:"Invalid Otp",
    });
  }
  user.resetToken=uuidv4();
  user.resetTokenExpiry = Date.now()+10*60*1000;

  user.otp = null;
  user.otpAttempts=0;
  user.otpExpiry=0;
  user.otpPurpose=null;
  await user.save();
  res.json({
    success:true,
    resetToken:user.resetToken,
  });
});
app.post("/reset-password",async(req,res)=>{
  const{email,resetToken,password} = req.body;
  const user = await User.findOne({email,resetToken});
  if(!user || user.resetTokenExpiry < Date.now()){
    return res.json({ success: false, message: "Invalid token" });
  }
  user.password = await bcrypt.hash(password,10);
  user.resetToken = null;
  user.resetTokenExpiry = null;

  await user.save();

  res.json({ success: true, message: "Password updated" });
});
app.listen(port,()=>{
    console.log(`App is Listing on port ${port}`);
});

app.use((err,req,res,next)=>{
    const message = err.message || "Somthing went wrong";
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({   
        error:{
            success:false,
            message,
        }
    });
});

