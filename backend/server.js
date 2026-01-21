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
const otpgenrator = require("./utils/otp");
const user = require("./models/user");
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
    if (existingUser) {
  
  if (!existingUser.isVerified) {
    const otp = generateOtp();
    existingUser.otp = otp;
    existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
    existingUser.lastOtpSentAt = new Date();
    await existingUser.save();
    await sendOtp(email, otp);

    return res.json({
      success: true,
      message: "OTP resent to email"
    });
  }

  //  user already verified
  return res.json({
    success: false,
    message: "User already exists. Please login."
  });
}

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp,5);
    const user = new User({
        userId:uuidv4(),
        name,
        email,
        password: hashedPassword,
        hashedOtp,
        otpExpiry:Date.now()+5*60*1000,
        lastOtpSentAt: new Date(),
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
    const existingUser = await User.findOne({email});
     if (!existingUser) {
    return res.json({
      success: false,
      message: "User not found. Please signup."
    });
  }
    const isMatch = await bcrypt.compare(password,existingUser.password);
    if(!isMatch){
        return res.json({
        success: false,
        message: "Invalid password"
    })
}
  user.otpPurpose="auth"; 
  user.otpAttempts = 0;
  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  existingUser.otp = hashedOtp;
  existingUser.otpExpiry = Date.now() + 5 * 60 * 1000;
  existingUser.lastOtpSentAt = new Date();
  await existingUser.save();
  if(await sendOtp(email, otp)){
    user.otpAttempts = user.otpAttempts+1;
  }else{
    return res.json({
    success: false,
    message: "Some Error Occure;"
  });
  }
  

  return res.json({
    success: true,
    message: "OTP sent to email"
  });


}));
app.post("/verify-otp",wrapAsync(async(req,res,next)=>{
    const {email,otp} = req.body;
    const user = await User.findOne({email});
    const hashedOtp = bcrypt.hash(otp,5);
    if(!user){
       return next (new ExpressError(404,"User Not Founded"));
    }

    if(!bcrypt.compare(user.otp,hashedOtp) || user.otpExpiry<Date.now()){
        return next(new ExpressError(404,"Invalid or Expired Otp"));
    }
    user.otpPurpose="auth";
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

app.post("/resend-otp", wrapAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ExpressError(404, "User Not Found"));
  }

  // ⏳ 30-second cooldown
  if (
    user.lastOtpSentAt &&
    Date.now() - user.lastOtpSentAt.getTime() < 30 * 1000
  ) {
    return res.json({
      success: false,
      message: "Please wait before requesting OTP again"
    });
  }

  const otp = generateOtp();
  const hashedOtp = await bcrypt.hash(otp,5);
  user.otp = hashedOtp;
  user.otpExpiry = Date.now() + 5 * 60 * 1000;
  user.lastOtpSentAt = new Date();

  await user.save();
  await sendOtp(email, otp);

  res.json({
    success: true,
    message: "OTP resent successfully"
  });
}));
app.post("/reset-password",async(req,res)=>{
  const {email,password,confirmPass} = req.body;
  const user = await User.findOne({email});
  if(!password || !confirmPass){
    return res.json({
      success:false,
      message:"Password and confirm password are required",
    })
  };
    if(password !== confirmPass){
      res.json({
        success:false,
        message:"Passwords are not same",
      });
      return;
    };
   if(!user){
    res.json({
      success:false,
      message:"The user is not Founded",
    });
    return;
   }
   const hashedPassword = await bcrypt.hash(password,10);
   user.password = hashedPassword;

   await user.save();
   return res.json({
    success:true,
    message:"Password changed successfully!",
   });
});
app.post("verify-reset-otp",wrapAsync(async(req,res)=>{
  const {email,otp} = req.body;
  const user = await User.findOne({email});
  if(!email){
    return res.json({
      success:false,
      message:"User Is Not Founded",
    });

  }
  const 
}))
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

