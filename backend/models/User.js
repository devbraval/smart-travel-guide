const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId:{
        type:String,
        unique:true,
        require:true,
    },
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase: true,
    },
    password:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
    },
    otpExpiry:{
        type:Date,
    },
    otpPurpose:{
        type:String,
        enum:["auth","reset"],
    },
    otpAttempts:{
        type:Number,
        default:0,
    },
    lastOtpSentAt:{
        type:Date,
        default:null,
    },
    resetToken:String,
    resetTokenExpiry:Date,
    isVerified:{
        type:Boolean,
        default:false,
    },
    
},{timestamps:true});

module.exports = mongoose.model("User",userSchema);