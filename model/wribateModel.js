import mongoose from "mongoose";

const proposeWribateSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    votes: {
        type: Number,
        default: 0
    },
    category: {
        type: String,
        required: true,
    },
    tag: {
        type: String
    },
    country: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    user_id: {
        type: String,
        required: true,
    },
})

const proposeVoteSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    propose_id:{
        type:String,
        required:true
    }
})

const proposeVoteModel = mongoose.model('proposeVote', proposeVoteSchema);

const proposeModel = mongoose.model('proposeWribate', proposeWribateSchema);

export {proposeModel, proposeVoteModel};