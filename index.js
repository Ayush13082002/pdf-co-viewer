// index.js
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let currentPage = 1; // Default page number for all clients

// Serve static files from the 'public' folder
app.use(express.static('public'));

// Handle new WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Send the current page to a new user
    socket.emit('pageChanged', currentPage);

    // Listen for page change events from the admin
    socket.on('changePage', (page) => {
        currentPage = page;
        io.emit('pageChanged', page); // Update page for all clients
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
