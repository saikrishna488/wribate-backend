import express from "express";
const router = express.Router()

import admin from "../controller/adminController.js"

router.post('/addCategory', admin.addcategory)

export default router