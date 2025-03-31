import express from "express";
const router = express.Router()

import admin from "../controller/adminController.js"

router.post('/login', admin.loginAdmin)

router.get('/getUsers', admin.getUser)

router.post('/addCategory', admin.addcategory)

router.get('/getCategories', admin.getCategories)

router.post('/updateUserRole', admin.updateUserRoles)

export default router