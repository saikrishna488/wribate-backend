import express from "express";
const router = express.Router()

import admin from "../controller/adminController.js"

router.post('/login', admin.loginAdmin)

router.get('/getUsers', admin.getUser)

router.post('/addCategory', admin.addcategory)

router.get('/getCategories', admin.getCategories)

router.patch('/updateCategories/:id', admin.updateCategory)

router.delete('/deleteCategories/:id', admin.deleteCategory)

router.post('/updateUserRole', admin.updateUserRoles)

router.patch('/updateUserStatus/:id', admin.updateUserStatus)

export default router