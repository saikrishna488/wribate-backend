import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    image:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    },
    author_name:{
        type:String,
        required:true
    },
    author_id:{
        type:String,
        required:true
    },
    views:{
        type:Number,
        default:0
    },
    created_at:{
        type:Date,
        default: Date.now
    }
}, { timestamps: true });

const blogModel = mongoose.model('blog',blogSchema);

export default blogModel;