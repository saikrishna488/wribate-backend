import mongoose from "mongoose";

const dataTypes = mongoose.SchemaTypes

const userSchema = new mongoose.Schema({
 name: {
  type: String,
  required: [true, ' A User Must Required A Name!'],
  trim: true,
 },
 email: {
  type: String,
  required: [true, ' A User Must Required A email!'],
  trim: true,
  unique: true,
 },
 password: {
  type: String,
  required: [true, ' A User Must Required A password!'],
  trim: true,
 },
 profilePhoto: dataTypes.String,

 otp: dataTypes.Number,

}, { timestamps: true })

const User = mongoose.model('User', userSchema);

const wribateSchema = new mongoose.Schema({
 title: {
  type: String,
  required: true
 },
 coverImage: {
  type: String, // URL or file path
  required: false
 },
 createdBy: {
  type: String, // URL or file path
  required: true
 },
 // Panel Setup
 leadFor: { type: String, required: true }, // Email
 leadAgainst: { type: String, required: true },
 supportingFor: { type: String },
 supportingAgainst: { type: String },


 // Judges
 judges: [
  {
   type: String, // Emails or names
   required: true
  }
 ],

 startDate: { type: Date, required: true },
 durationDays: { type: Number, required: true }, // Total duration
 rounds: [
  {
   roundNumber: { type: Number, required: true },
   startDateTime: { type: Date, required: true },
   durationDays: { type: Number, required: true }
  }
 ],

 // Individual fields for additional details
 category: {
  type: String,
  required: true
 },
 institution: {
  type: String,
  required: false
 },
 scope: {
  type: String,
  enum: ['Private', 'Open'],
  default: 'Private'
 },
 type: {
  type: String,
  enum: ['Sponsored', 'Free'],
  default: 'Free'
 },

 prizeAmount: {
  type: Number,
  required: false

 },
 // Linked Collections
 arguments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Argument" }],
 votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
 comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
 user: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const Wribate = mongoose.model('Wribate', wribateSchema);


const argumentSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  panelSide: { type: String, enum: ["For", "Against"], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
 },
 { timestamps: true }
);

const Argument = mongoose.model("Argument", argumentSchema);


const voteSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  vote: { type: String, enum: ["For", "Against"], required: true }
 },
 { timestamps: true }
);

const Vote = mongoose.model("Vote", voteSchema);

const commentSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
 },
 { timestamps: true }
);

const Comment = mongoose.model("Comment", commentSchema);


export default { User, Wribate, Argument, Vote, Comment }
