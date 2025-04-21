import mongoose, { model, Schema } from 'mongoose';

// defining schema : if required not specified property is optional
const todoSchema = new Schema({
    taskName: { type : String, required: true },
    priority: { type: String, required: true },
    category: { type : String, required: true},
    description: { type: String },
    deadline: { type: String },
    completed: { type: Boolean, default: false } // Whether the todo is completed
});

// first check if the Todo exist before adding it in
export const Todo = mongoose.models.Todo || new model('Todo', todoSchema);


