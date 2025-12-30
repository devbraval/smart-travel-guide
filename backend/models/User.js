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
    }
});

module.exports = mongoose.model("User",userSchema);