// Complete the server.js file to make user's add, delete and update the todos.
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import Task from './task.schema.js';

// create express app 
 const app = express();
 app.use(cors());

 // Create HTTP sever using express app
 export const server = http.createServer(app);

 // create Socket.io server using HTTP server
 const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ["GET", "POST"]
    }
});

// Define Socket.IO event handlers
io.on("connection", (socket) => {
    console.log("New client connected");

    // Handle 'addTask' event
    socket.on('addTask', async (data) => {
        try {
            // Create a new task
            const task = new Task({
                text: data.text
            });

            // Save the task to the database
            const savedTask = await task.save();

            // Broadcast the added task to all clients
            io.emit('addTask', savedTask);
        } catch (error) {
            console.error("Error adding task:", error);
        }
    });

    socket.on('deleteTask', async (taskId) => {
        try {
            // Delete the task from the database
            await Task.findByIdAndDelete(taskId);

            // Broadcast the deleted task ID to all clients
            io.emit('deleteTask', taskId);
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    });
    socket.on('disconnect', () => {
        console.log("Client disconnected");
    });
});

