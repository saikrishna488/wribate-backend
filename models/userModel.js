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

 wribateType: {
  type: String,
  enum: ['single', 'batch'],
  default: 'single'
 },
 prizeAmount: {
  type: Number,
  required: false

 },
 // Linked Collections
 arguments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Argument" }],
 votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
 comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
 students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }]
}, { timestamps: true });



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


const voteSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  vote: { type: String, enum: ["For", "Against"], required: true }
 },
 { timestamps: true }
);


const commentSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
 },
 { timestamps: true }
);

const studentSchema = new mongoose.Schema({
 studentName: { type: String },
 studentEmail: { type: String, },
 institution: { type: String }
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Vote = mongoose.model("Vote", voteSchema);
const Argument = mongoose.model("Argument", argumentSchema);
const Wribate = mongoose.model('Wribate', wribateSchema);
const User = mongoose.model('User', userSchema);


export default { User, Wribate, Argument, Vote, Comment, Student }
