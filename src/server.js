import express from 'express';
import dotenv from "dotenv";
import { connectToDB, seedCategories } from '../database/db.js';
import { Todo } from "../models/todo.model.js";
import { Category } from "../models/category.model.js";
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.port || 4000;

// middleware to parse JSON data
app.use(express.json());

connectToDB();
seedCategories();

// allows any frontend or client to make requests to your backend.
app.use(cors()); 

// declaring an API: so that the API receives request and responses.
// the first parameter is the endpoint
// this will return the array of todo as response
app.get('/todos', async (req, res) => {
    try {
        const result = await Todo.find(); // fetches all the todos from the database an array
        res.status(200).send({
            success: true,
            message: "Todo List Retrieve successfully",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Failed To Retrieve the Todo List'
        })
    }
});

app.post('/create-todo', async (req, res) => {
    const todoDetails = req.body; // client will provide
    try {
        const result = await Todo.create(todoDetails); // creates a new todo in the database using data in the request body
        // Create and save the new resource
        res.status(201).send({
            success: true,
            message: 'Todo is created successfully',
            data: result
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Failed to create Todo',
            error: error.message
        });
    }
});

// to update a todo we need to collect the id of the todo
app.patch("/update/:todoId", async (req, res) => {
    const { todoId } = req.params;
    const updatedTodo = req.body;

    try {
        /* updates todo with specified _id  */
        const result = await Todo.findByIdAndUpdate(todoId, updatedTodo, {
            new: true, // option ensures that the updated document is returned.
        });

        res.status(200).send({
            success: true,
            message: 'Todo updated successfully',
            data: result
        });
    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Failed to update Todo',
            error: error.message
        });
    }
});

app.delete('/delete/:todoId', async (req, res) => {
    try {
        await Todo.findByIdAndDelete(req.params.todoId); // deletes todo by id in url.
        res.status(204).send(); // No Content
    } catch (error) {
        res.status(400).send({
            success: false,
            message: 'Failed to delete Todo',
            error: error.message
        });
    }
});

// request: processes the new category addition
// response sends back the updated list
app.post("/addCategory", async (req, res) => {
    const newCategory = req.body

    try {
        await Category.create(newCategory);
        res.status(204).send();
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).send({
                success: false,
                message: 'Failed to add new category',
                error: error.message
            });
        } else if (error.code === 11000) {
            // Handle duplicate key error (e.g., duplicate category name)
            res.status(409).send({ // 409 Conflict
                success: false,
                message: 'Category already exists',
                error: error.message
            });
        } else {
            res.status(500).send({ // 500 Internal Server Error
                success: false,
                message: 'Failed to add new category',
                error: error.message
            });
        }
    }
});

app.get('/categories', async (req, res) => {
    try {
        const result = await Category.find(); // fetches all the todos from the database an array
        res.status(200).send({
            success: true,
            message: "Categories Retrieved successfully",
            data: result
        });
    } catch (error) {
        res.status(500).send({
            success: false,
            message: 'Failed To Retrieve the Categories'
        });
    }
});


// Update the completion status of a todo
app.put('/todos/:todoId', async (req, res) => {
    try {
      const { todoId } = req.params;
      const { completed } = req.body;
  
      const updatedTodo = await Todo.findByIdAndUpdate(todoId, { completed }, { new: true });
      if (!updatedTodo) {
        return res.status(404).json({ error: 'Todo not found' });
      }
  
      res.json(updatedTodo);
    } catch (err) {
      res.status(500).json({ error: 'An error occurred' });
    }
});

  
app.listen(port, () => {
    console.log(`SERVER IS RUNNING ON PORT ${port}`);
});