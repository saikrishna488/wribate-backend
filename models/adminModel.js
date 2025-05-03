import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
 categoryName: {
  type: String,
  required: [true, 'Category Name Required'],
  trim: true,
 },
 createdAt: {
  type: Date,
  default: Date.now(),
  select: false,
 },
 updatedAt: {
  type: Date,
  default: Date.now(),
  select: false,
 },

})

const Categories = mongoose.model('categories', categorySchema);

export default Categories
