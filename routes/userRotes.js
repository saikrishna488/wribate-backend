import express from "express";
const router = express.Router()
import multer from "multer";
const storage = multer.memoryStorage()
const upload = multer({ storage })

import user from "../controller/userController.js"
import auth from "../controller/authController.js"

router.post('/signUp', user.signUpUser)

router.post('/sendOTP', user.getOTP)

router.post('/vertfyOTP', user.verifyOTP)

router.post('/login', user.loginUser)

router.get("/getWribateByCategory/:category", user.getWribateByCategory)

router.use(auth.authenticateUser)

router.get('/getProfile', user.getProfile)

router.post('/uploadImage', upload.single('image'), user.fileUpload)

router.patch('/updateProfile/:id', user.updateProfile)

router.get('/getCategories', user.getCategories)

router.post('/createWribate', user.createWribate)

router.post("/arguments/:wribateId", user.addArguments)

router.get("/getWribateById/:id", user.getWribateByID)

router.post("/comment/:wribateId", user.addComment)

router.post("/vote/:wribateId", user.addVotes)

router.get("/myWribates", user.getMyWribates)

router.delete("/deleteWribate", user.deleteWribate)

router.post("/createBatchWribate", upload.single("file"), user.createBatchWribate)

router.post("/checkAvailableUserName", user.checkForUserName)

export default router