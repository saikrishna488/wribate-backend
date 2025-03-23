import catchAsync from "../utils/catchAsync.js"
import Categories from "../models/adminModel.js"
import { successMessage } from "../utils/commonResponse.js"


const addcategory = catchAsync(async (req, res, next) => {
 const body = req.body
 const categoryData = {
  categoryName: body.categoryName
 }
 await Categories.create(categoryData)
 successMessage(res, `New category added`)

})

export default { addcategory }