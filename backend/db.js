const mongoose = require("mongoose");

mongoose.connect('mongodb://127.0.0.1:27017/smartTravelAuth')
.then(()=>console.log("Mongodb Connected"))
.catch((err)=>console.log(err));