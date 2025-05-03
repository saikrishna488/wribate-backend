import express from "express";
const router = express.Router()
import multer from "multer";
const storage = multer.memoryStorage()
const upload = multer({ storage })

import user from "../controller/userController.js"
import auth from "../controller/authController.js"

router.post('/signUp', user.signUpUser)

router.post('/sendOTP', user.getOTP)

router.post('/verifyOTP', user.verifyOTP)

router.post('/login', user.loginUser)

router.get('/jwt',user.jwtFunc)

router.get('/logout', user.logout)

router.get("/getWribateByCategory/:category", user.getWribateByCategory)

router.get("/getWribateById/:id", user.getWribateByID)

router.get('/getCategories', user.getCategories)

router.post("/checkAvailableUserName", user.checkForUserName)

// router.use(auth.authenticateUser)

router.get('/getProfile', user.getProfile)

router.post('/uploadImage', upload.single('image'), user.fileUpload)

router.patch('/updateProfile/:id', user.updateProfile)

router.post('/createWribate', user.createWribate)

router.post("/arguments/:wribateId", user.addArguments)

router.post("/comment/:wribateId", user.addComment)

router.post("/vote/:wribateId", user.addVotes)

router.post("/myWribates", user.getMyWribates)

router.delete("/deleteWribate", user.deleteWribate)

router.post("/createBatchWribate", upload.single("file"), user.createBatchWribate)

router.get("/getVotes/:id", user.getVotes)

router.get('/getUsers', user.getUser)

router.post('/createOrder', user.createOrder)

router.post('/favouriteCategories', user.favouriteCategories)

export default router