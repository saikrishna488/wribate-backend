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

export default { addcategory, getUser, updateUserRoles, loginAdmin, getCategories }