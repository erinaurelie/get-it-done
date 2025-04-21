import mongoose, { model, Schema } from 'mongoose';


const categorySchema = new Schema({
    category: { 
        type : String, 
        required : true ,
        trim: true,
        unique: true
    }
});

// checks if a mondel named Category already exist in the mongoose.models object else create it
export const Category = mongoose.models.Category || mongoose.model('Category', categorySchema)