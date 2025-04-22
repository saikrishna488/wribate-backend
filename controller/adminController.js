import catchAsync from "../utils/catchAsync.js"
import Categories from "../models/adminModel.js"
import userModel from "../models/userModel.js"
import { successMessage, ErrorResponse } from "../utils/commonResponse.js"
import handleFactory from "./handleFactory.js"
import bcrypt from "bcrypt"
import auth from "./authController.js"



const loginAdmin = catchAsync(async (req, res, next) => {
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

const addcategory = catchAsync(async (req, res, next) => {
 const body = req.body
 const categoryData = {
  categoryName: body.categoryName
 }
 await Categories.create(categoryData)
 successMessage(res, `New category added`)

})

const getUser = catchAsync(async (req, res, next) => {
 const users = await userModel.User.find()
 const data = await handleFactory.appendUserPic(users)
 res.status(200).json({ status: 1, users: data })
})

const updateUserRoles = catchAsync(async (req, res, next) => {
 const { body: { userName, userRole } } = req

 await userModel.User.findOneAndUpdate(
  { userName: userName }, // Find user by username
  { $set: { userRole: userRole } }, // Update the field
  { new: true, runValidators: true } // Return updated document
 );
 res.status(200).json({ status: 1, message: `userRole for ${userRole} updated` })

})

const getCategories = catchAsync(async (req, res, next) => {
 const catgories = await Categories.find()
 res.status(200).json({ status: 0, catgories: catgories })
})

const updateCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const body = req.body;
  
    const updatedCategory = await Categories.findByIdAndUpdate(
      id,
      { categoryName: body.categoryName },
      { new: true, runValidators: true }
    );
  
    if (!updatedCategory) {
      return next(new Error("Category not found"));
    }
  
    successMessage(res, "Category updated successfully");
  });

  const deleteCategory = catchAsync(async (req, res, next) => {
    const { id } = req.params;
  
    const deletedCategory = await Categories.findByIdAndDelete(id);
  
    if (!deletedCategory) {
      return next(new Error("Category not found"));
    }
  
    successMessage(res, "Category deleted successfully");
  });

  const updateUserStatus = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { status } = req.body; // 1 - active, 2 - inactive, 3 - deleted
let message
    if(status==1){
        message=  "active"
    }else if(status==2){
         message=  "inactive"
    }else{
        message="deleted"
    }
  
    const user = await userModel.User.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
  
    if (!user) {
      return next(new Error("User not found"));
    }
  
    successMessage(res, `User status updated to ${message}`);
  });
  
  const getWribateByCategory = catchAsync(async (req, res) => {
    try {
     const { params: { category } } = req;
   
     // Fetch all wribates that match the given category
     const wribates = await userModel.Wribate.find({ category })
     if (wribates.length === 0) {
      return res.status(404).json({ status: "error", message: "No wribates found for this category" });
     }
   
     // Append baseURL to each coverImage
     // const baseURL = process.env.WRIBATE
     // const data = wribates.map(item => ({
     //  ...item._doc,
     //  coverImage: baseURL + item.coverImage
     // }));
     const data1 = await handleFactory.categorizeWribates(wribates)
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
   
   //  const baseURL = process.env.WRIBATE
   //  wribate.coverImage = baseURL + wribate.coverImage
   
    res.status(200).json({
     status: "success", data: wribate,
     overallCompletion: overallCompletion.toFixed(2) + "%",
     currentRound: currentRound || "No active round",
     roundCompletion: currentRound ? roundCompletion.toFixed(2) + "%" : "N/A"
    });
   
   });
  

export default { addcategory, getUser, updateUserRoles, loginAdmin,getWribateByCategory,
   getCategories,updateCategory ,deleteCategory,updateUserStatus,
   updateUserStatus,getWribateByID
  }