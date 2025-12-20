require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('io', io);

const PORT = process.env.PORT || 5000;

connectDB();

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-vendor', (vendorId) => {
        if (vendorId) {
            socket.join(vendorId.toString());
            console.log(`Client ${socket.id} joined vendor room: ${vendorId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
