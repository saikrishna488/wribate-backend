import mongoose from "mongoose";

const dataTypes = mongoose.SchemaTypes

const userSchema = new mongoose.Schema({
 name: {
  type: String,
  required: [true, ' A User Must Required A Name!'],
  trim: true,
 },
 dob: {
  type: Date,
  required: [true, ' A User Must Required A dob!'],
 },

 country: {
  type: String,
  required: [true, ' A User Must Required A country!'],
  trim: true,
 },
 userName: {
  type: String,
  required: [true, ' A User Must Required A userName!'],
  trim: true,
  unique: true,
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

 status: {
    type :Number , // 1 active 2 inactive 3 delete
    default: 1
},

 userRole: {
  type: String,
  enum: ['user', 'admin', 'agent'],
  default: 'user'
 },

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
   startDate: { type: Date, required: true },
   endDate: { type: Date, required: true },
   duration: { type: String, required: true }
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
 userRole: {
  type: Number,
  required: false

 },
 students: [{ type: String, required: true }],
 // Linked Collections
 arguments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Argument" }],
 votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Vote" }],
 comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],

}, { timestamps: true });


const argumentSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  panelSide: { type: String, enum: ["For", "Against"], required: true },
  roundNumber: { type: Number, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
 },
 { timestamps: true }
);

const voteSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, },
  vote: { type: String, enum: ["For", "Against"], required: true }
 },
 { timestamps: true }
);

const commentSchema = new mongoose.Schema(
 {
  wribateId: { type: mongoose.Schema.Types.ObjectId, ref: "Wribate", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  type: {
   type: String,
   enum: ['For', 'Against'],
   default: 'For'
  },
 },
 { timestamps: true }
);

const studentSchema = new mongoose.Schema({
 studentName: { type: String },
 studentEmail: { type: String, },
 institution: { type: String }
}, { timestamps: true });


const tempUser = new mongoose.Schema({
 email: { type: String },
 otp: { type: Number, },
}, { timestamps: true });


const messageSchema = new mongoose.Schema({
 sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
 message: { type: String, required: true },
 wribateId:{type:String,required:false},
 wribateTitle:{type:String,required:false},
 timestamp: { type: Date, default: Date.now },
});

const razorPaytransactions = new mongoose.Schema({
    transactionId: { type: String, unique: true, required: true }, 
    userId: { type: String, },
    amount: { type: Number },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed','failed'],
        default: 'pending'
       },
    
   }, { timestamps: true });
   
   
const Message = mongoose.model("Message", messageSchema);
const TempUser = mongoose.model("TempUser", tempUser);
const Student = mongoose.model("Student", studentSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Vote = mongoose.model("Vote", voteSchema);
const Argument = mongoose.model("Argument", argumentSchema);
const Wribate = mongoose.model('Wribate', wribateSchema);
const User = mongoose.model('User', userSchema);
const Razorpay=mongoose.model('Razorpay',razorPaytransactions)


export default { User, Wribate, Argument, Vote, Comment, Student, TempUser, Message,Razorpay }
