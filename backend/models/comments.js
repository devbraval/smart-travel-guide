import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  placeId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Listings",
    required:true,
  },
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true,
  },
  userName:{
    type:String,
    required:true,
  },
  comment:{
    type:String,
    required:true,
    trim:true,
  },
  rating:{
    type:Number,
    min:1,
    max:5,
    required:true,
  }
},{
  timestamps:true
});

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;