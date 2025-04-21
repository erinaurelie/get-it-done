import mongoose from "mongoose";
import { Category } from "../models/category.model.js";

const connectToDB = async () => {
    await mongoose.connect(process.env.URI);
    console.log('MONGODB CONNECTED SUCCESFULLY');
}


const seedCategories = async () => {
    const categories = ["All", "Work", "Personal"];
    await Category.deleteMany({ category: { $in: categories } }); // clear existing categories
    await Category.insertMany(categories.map(category => ({ category })));
    console.log("Default categories added!");
}

export { connectToDB, seedCategories };