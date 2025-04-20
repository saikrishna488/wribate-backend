import catchAsync from "../utils/catchAsync.js";
import userModel from "../models/userModel.js"
import { v4 as uuidv4 } from 'uuid';
import { successMessage, ErrorResponse, successResponse } from "../utils/commonResponse.js"
import bcrypt from "bcryptjs"
import auth from "../controller/authController.js"
import sharp from "sharp";
import utils from "../controller/handleFactory.js"
import path from "path"
import { fileURLToPath } from 'url';
import fs from "fs"
import Categories from "../models/adminModel.js";
import xlsx from "xlsx"
import handleFactory from "../controller/handleFactory.js";
import mongoose from "mongoose";

const checkForUserName = catchAsync(async (req, res, next) => {
 const { body: { userName } } = req
 const isNameAvailable = await userModel.User.findOne({ userName: userName })
 console.log('isNameAvailable', isNameAvailable)
 if (isNameAvailable && Object.keys(isNameAvailable).length > 0) return res.status(400).json({ status: 1, message: "User name already taken" })
 res.status(200).json({ status: 1, message: "User name available" })
})

const getOTP = catchAsync(async (req, res, next) => {
 const { body: { email } } = req
 const otp = 1234
 if (!email) return ErrorResponse(res, `Please enter vaild email`)
 await utils.contactUs(email, otp)
 await userModel.TempUser.create({ email: email, otp: otp },  // Find user by email
  { $set: { otp: otp } })
 successMessage(res, `OTP sent sucessfully`)
})

const verifyOTP = catchAsync(async (req, res, next) => {
 const { body: { email, otp } } = req

 const user = await userModel.TempUser.findOne({ email: email })
 if (!user) return ErrorResponse(res, `Please select valid email`)

 if (user.otp !== otp * 1) return ErrorResponse(res, `Please enter valid OTP`)
 successMessage(res, `OTP verified sucessfully`)
})

const signUpUser = catchAsync(async (req, res, next) => {
 const body = req.body
 const salt = await bcrypt.genSalt(10)
 const crypted = await bcrypt.hash(body.password, salt)
 const userData = {
  name: body.name, email: body.email, password: crypted, userName: body.userName, dob: body.dob, country: body.country
 }
 await userModel.User.create(userData)
 successMessage(res, `sign up completed`)

})

const loginUser = catchAsync(async (req, res, next) => {
 const { body: { email, password } } = req
 if (!email || !password) return ErrorResponse(res, 'Please enter valid email or Password')
 const user = await userModel.User.findOne({ email: email })
 if (!user) return ErrorResponse(res, 'User does not exists')
 const dbpassword = user.password
 const decode = await bcrypt.compare(password, dbpassword)
 if (!decode) return ErrorResponse(res, `Please enter valid email or password`)
 const token = await auth.jwtToken(user._id)
 res.status(200).json({ status: 1, token: token, message: "login successfully" })
})

const getProfile = catchAsync(async (req, res, next) => {
 const { user } = req
 const userDetails = await userModel.User.findById(user._id)
 const data = await utils.appendUrls(userDetails)
 console.log('data', data)
 successMessage(res, data)
})

const fileUpload = catchAsync(async (req, res, next) => {
 const file = req.file;
 console.log('file', file)
 const allowedMimeTypes = ['image/jpeg', 'image/png'];
 if (!allowedMimeTypes.includes(file.mimetype)) {
  return res.status(400).json({
   status: 0,
   message: 'Invalid file type. Only .jpeg or .png files are allowed.',
  });
 }

 // Extract the image_type from the request (e.g., query, body, or params)
 const imageType = req.body.image_type || req.query.image_type || 'default';
 const allowedTypes = ['users', 'wribte'];

 if (!allowedTypes.includes(imageType)) {
  return res.status(400).json({
   status: 0,
   message: 'Invalid image type. Allowed types are categories, subcategories, products, banners, and menus.',
  });
 }

 const uniqueFileName = `${file.originalname}`;
 const __filename = fileURLToPath(import.meta.url);
 const __dirname = path.dirname(__filename);

 const uploadDir = path.join(__dirname, `uploads/${imageType}`);
 console.log('uploadDir', uploadDir)
 const uploadPath = path.join(uploadDir, uniqueFileName);

 if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
 }

 try {
  await sharp(file.buffer)
   .resize(800, 800, { fit: 'inside' })
   .toFormat('jpeg')
   .jpeg({ quality: 90 })
   .toFile(uploadPath);

  res.status(201).json({
   status: 1,
   message: 'File uploaded and processed successfully.',
   fileName: uniqueFileName,
  });
 } catch (sharpError) {
  return res.status(500).json({
   status: 0,
   message: 'Error processing image.',
   error: sharpError.message,
  });
 }
})

const updateProfile = catchAsync(async (req, res, next) => {
 const userId = req.params.id;
 const updateData = req.body; // Only update fields provided in the request

 if (Object.keys(updateData).length === 0) {
  return res.status(400).json({ message: 'No fields provided for update' });
 }

 const updatedUser = await userModel.User.findByIdAndUpdate(
  userId,
  { $set: updateData },
  { new: true, runValidators: true }
 );

 if (!updatedUser) return res.status(404).json({ message: 'User not found' });

 res.status(200).json({ message: 'User updated successfully', user: updatedUser });
})

const getCategories = catchAsync(async (req, res, next) => {
 const categories = await Categories.find()
 successResponse(res, categories)
})

const createWribate = catchAsync(async (req, res, next) => {
 const body = req.body
 const totalDuration = body.durationDays
 const startDate = body.startDate
 const { user: { _id } } = req

 const rounds = handleFactory.generateRounds(startDate, totalDuration)

 const wribateData = {
  title: body.title,
  coverImage: body.coverImage,
  startDate: startDate,
  durationDays: body.durationDays,
  leadFor: body.leadFor,
  leadAgainst: body.leadAgainst,
  supportingFor: body.supportingFor,
  supportingAgainst: body.supportingAgainst,
  judges: body.judges,
  category: body.category,
  institution: body.institution,
  scope: body.scope,
  type: body.type,
  prizeAmount: body.prizeAmount,
  rounds: rounds,
  createdBy: _id,
  wribateType: "single"
 }

 const newWribate = await userModel.Wribate.create(wribateData);
 console.log('newWribate', newWribate)
 successMessage(res, `New Wribate is created.`)
})

const getWribateByCategory = catchAsync(async (req, res) => {
 try {
  const { params: { category } } = req;

  // Fetch all wribates that match the given category
  const wribates = await userModel.Wribate.find({ category })
  if (wribates.length === 0) {
   return res.status(404).json({ status: "error", message: "No wribates found for this category" });
  }

  // Append baseURL to each coverImage
  const baseURL = process.env.WRIBATE
  const data = wribates.map(item => ({
   ...item._doc,
   coverImage: baseURL + item.coverImage
  }));
  const data1 = await handleFactory.categorizeWribates(data)
  res.status(200).json({ status: "success", data: data1 });
 } catch (error) {
  res.status(500).json({ status: "error", message: error.message });
 }
});

const getWribateByID = catchAsync(async (req, res) => {

 const { params: { id } } = req;

 const wribate = await userModel.Wribate.findById(id)
  .populate({
   path: "comments",
   populate: { path: "userId", select: "name email" } // Populate user details in comments
  })
  .populate({ path: "votes", populate: { path: "userId", select: "name email" } })
  .populate("arguments");

 console.log('wribate', wribate)

 if (Object.keys(wribate).length === 0) {
  return res.status(404).json({ status: "error", message: "No wribates found for this category" });
 }

 const now = new Date();
 const startDate = new Date(wribate.startDate);
 const endDate = new Date(startDate);
 endDate.setDate(startDate.getDate() + wribate.durationDays);

 // **Overall completion percentage**
 const totalDurationMs = endDate - startDate;
 const elapsedMs = now - startDate;
 const overallCompletion = Math.min((elapsedMs / totalDurationMs) * 100, 100);

 // **Find current round**
 let currentRound = null;
 let roundCompletion = 0;

 for (const round of wribate.rounds) {
  const roundStart = new Date(round.startDate);
  const roundEnd = new Date(roundStart);
  roundEnd.setDate(roundStart.getDate() + round.duration);

  if (now >= roundStart && now <= roundEnd) {
   currentRound = round.roundNumber;
   const roundElapsedMs = now - roundStart;
   const roundTotalMs = roundEnd - roundStart;
   roundCompletion = Math.min((roundElapsedMs / roundTotalMs) * 100, 100);
   break;
  }
 }

 const baseURL = process.env.WRIBATE
 wribate.coverImage = baseURL + wribate.coverImage

 res.status(200).json({
  status: "success", data: wribate,
  overallCompletion: overallCompletion.toFixed(2) + "%",
  currentRound: currentRound || "No active round",
  roundCompletion: currentRound ? roundCompletion.toFixed(2) + "%" : "N/A"
 });

});

const addArguments = catchAsync(async (req, res, next) => {
 const { params: { wribateId }, user, body: { text, roundNumber } } = req
 const userId = user._id

 console.log(user)
 // Fetch the wribate to check panel members
 const wribate = await userModel.Wribate.findById(wribateId);
 if (!wribate) {
  return res.status(404).json({ status: "error", message: "Wribate not found" });
 }

 console.log('wribate', wribate)

 //Check if the user is part of the panel
 const isPanelMember =
  wribate.leadFor === user.email ||
  wribate.leadAgainst === user.email ||
  wribate.supportingFor === user.email ||
  wribate.supportingAgainst === user.email;

 if (!isPanelMember) {
  return res.status(403).json({ status: "error", message: "Only panel members can add arguments" });
 }

 let panel = null;

 if (wribate.leadFor == user.email || wribate.supportingFor == user.email) {
  panel = "For";
 } else if (wribate.leadAgainst == user.email || wribate.supportingAgainst == user.email) {
  panel = "Against";
 }
 console.log('panel', panel)


 // Create and save the argument

 const existingArgument = await userModel.Argument.findOne({ wribateId, userId, roundNumber });

 if (existingArgument) {
  // Append the new text to the existing argument

  const updatedArgument = await userModel.Argument.findOneAndUpdate(
   { wribateId, userId, roundNumber }, // Find existing argument
   { $set: { text: text } }, // Replace text instead of appending
   { new: true, upsert: true } // Return updated doc, create if not exists
  );


 } else {
  // Create a new argument if not found
  const newArgument = new userModel.Argument({ wribateId, userId, roundNumber, panelSide: panel, text: text });
  await newArgument.save();
  console.log("New argument added successfully.");
  await userModel.Wribate.findByIdAndUpdate(wribateId, { $push: { arguments: newArgument._id } });
 }


 res.status(201).json({ status: "success", message: "Argument added", });


});

const addComment = catchAsync(async (req, res, next) => {

 const { body: { text, type }, params: { wribateId }, user: { _id } } = req;

 const newComment = new userModel.Comment({ type: type, wribateId: wribateId, userId: _id, text: text });
 await newComment.save();

 await userModel.Wribate.findByIdAndUpdate(wribateId, { $push: { comments: newComment._id } });

 res.status(201).json({ status: "success", message: "Comment added", data: newComment });

})

const addVotes = catchAsync(async (req, res, next) => {

 const { body: { vote }, user: { _id }, params: { wribateId } } = req; // "For" or "Against"

 const existingVote = await userModel.Vote.findOne({ wribateId, userId: _id });

 if (existingVote) {
  return res.status(400).json({ status: "error", message: "User has already voted" });
 }

 const newVote = new userModel.Vote({ wribateId, userId: _id, vote });
 await newVote.save();
 await userModel.Wribate.findByIdAndUpdate(wribateId, { $push: { votes: newVote._id } });
 res.status(201).json({ status: "success", message: "Vote recorded", data: newVote });

});

const getMyWribates = catchAsync(async (req, res, next) => {
 const { user: { _id, email } } = req

 const wribates = await userModel.Wribate.find({
  $or: [
   { createdBy: new mongoose.Types.ObjectId(_id) }, // Match by ObjectId
   { students: email } // Match email in students array
  ]
 });
 //const wribates = await userModel.Wribate.find({ createdBy: _id })
 if (wribates.length === 0) {
  return res.status(404).json({ status: "error", message: "No wribates found for this user" });
 }

 // Append baseURL to each coverImage
 const baseURL = process.env.WRIBATE
 const data = wribates.map(item => ({
  ...item._doc,
  coverImage: baseURL + item.coverImage
 }));

 const data1 = await handleFactory.categorizeWribates(data)
 res.status(200).json({ status: "success", data: data1 });
})

const createBatchWribate = catchAsync(async (req, res) => {
 const { user: { _id } } = req
 const body = req.body
 console.log('req.body', req.body, req.file)

 const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
 const sheetName = workbook.SheetNames[0];
 console.log('sheetName', sheetName)
 const jsonData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
 const students = jsonData

 console.log('students', students)

 const transformedData = students.map(student => ({
  studentName: student["Student Name"],
  studentEmail: student["Email"],
  institution: body.institution,
 }));

 const insertedStudents = await userModel.Student.insertMany(transformedData);
 const ids = insertedStudents.map(student => student.studentEmail)
 const reversed = [...students].reverse();

 console.log('ids', ids)

 for (let i = 0; i < students.length / 2; i++) {

  const totalDuration = students[i]["Duration in Days"]
  const startDate = students[i]["Start Date"]
  const rounds = handleFactory.generateRounds(startDate, totalDuration)
  //console.log('rounds', rounds)
  const wribateData = {
   title: students[i]["Wribate Topic"],
   coverImage: students[i]["Cover Image"],
   startDate: students[i]["Start Date"],
   durationDays: students[i]["Duration in Days"],
   leadFor: students[i]["Student Name"],
   leadAgainst: reversed[i]["Student Name"],
   students: ids,
   supportingFor: "NA",
   supportingAgainst: "NA",
   judges: body.judges,
   category: students[i]["Category"],
   institution: body.institution,
   scope: "Open",
   type: "Free",
   prizeAmount: 0,
   rounds: rounds,
   createdBy: _id,
   wribateType: "batch"
  }

  const newWribate = await userModel.Wribate.create(wribateData);
 }

 res.json({ message: "File uploaded and data saved successfully!", data: jsonData });

 students.forEach(async (student) => {
  const studentName = student["Student Name"]
  const studentEmail = student["Email"]
  await handleFactory.sendInvitationMail(studentName, studentEmail)
 })

});

const deleteWribate = catchAsync(async (req, res, next) => {
 const result = await userModel.Wribate.deleteMany({}); // Deletes all documents in the collection
 console.log(`${result.deletedCount} Wribates deleted successfully`);
 successMessage(res, `deleted successfully`)
})

const getVotes = catchAsync(async (req, res, next) => {
 const { params: { id } } = req
 const wribate = await userModel.Wribate.findById(id)
 console.log('wribate', wribate)
 const rounds = handleFactory.divideIntoParts(wribate.startDate, wribate.durationDays);
 const votes = await userModel.Vote.find({ wribateId: id }).lean();
 const roundVoteCounts = await handleFactory.countVotesByRound(rounds, votes);
 res.status(200).json({ status: 1, roundVoteCounts: roundVoteCounts })
})

const getUser = catchAsync(async (req, res, next) => {
 const users = await userModel.User.find()
 const data = await handleFactory.appendUserPic(users)
 res.status(200).json({ status: 1, users: data })
})

 const createOrder = catchAsync(async (req, res) => {
  try {
    const { userId, amount } = req.body;

    let transactionId;
    let unique = false;
    let maxTries = 10;

    while (!unique && maxTries > 0) {
      const newId = uuidv4();

      // Check if this ID already exists
      const existing = await userModel.Razorpay.findOne({ transactionId: newId });

      if (!existing) {
        transactionId = newId;
        unique = true;
      } else {
        maxTries--;
      }
    }

    if (!unique) {
      return res.status(500).json({status: 'error',message: 'Failed to generate a unique transaction ID. Try again.'});
    }

    const Amount = parseFloat(amount * 100);

  const orderPayment = {
    amount: Amount,
    currency: "INR",
    receipt: transactionId,
    //payment_capture: 1,
  };

  const razorpayinstance = await handleFactory.razorpayInstance();
  const razorpayOrder = await handleFactory.createorderpayment(orderPayment, razorpayinstance);

  console.log("razorpayOrder", razorpayOrder);
  const razorpayOrderId = razorpayOrder.id;

    // Save to DB
    const transaction = await userModel.Razorpay.create({transactionId,userId,Amount});
    
    res.status(201).json({razorpayOrderId:razorpayOrderId,transactionId:transactionId});

  } catch (error) {
    res.status(500).json({status: 'error',message: error.message });
  }
});




export default { signUpUser, loginUser, getProfile, getOTP, fileUpload, updateProfile, 
    getCategories, createWribate, addArguments, getUser, getWribateByCategory, getWribateByID, 
    addComment, addVotes, getMyWribates, createBatchWribate, verifyOTP, deleteWribate, 
    checkForUserName, getVotes ,createOrder}

