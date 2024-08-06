const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

let games = [];
let timers = { red: 0, blue: 0 };

app.use(express.static('public')); // Statische Dateien aus dem Ordner 'public' bereitstellen

io.on('connection', (socket) => {
    console.log('A user connected');

    // Send initial state to the connected client
    socket.emit('update-games', games);
    socket.emit('update-timer', { team: 'red', time: timers.red });
    socket.emit('update-timer', { team: 'blue', time: timers.blue });

    // Handle game addition
    socket.on('add-game', (gameName) => {
        games.push(gameName);
        io.emit('update-games', games);
    });

    // Handle timer updates
    socket.on('update-timer', (data) => {
        timers[data.team] = data.time;
        io.emit('update-timer', data);
    });

    // Handle timer stop
    socket.on('stop-timer', (data) => {
        timers[data.team] = data.time;
    });

    // Handle checkbox updates
    socket.on('update-checkbox', (data) => {
        io.emit('update-checkbox', data);
    });

    // Handle game deletion
    socket.on('delete-game', (gameName) => {
        games = games.filter(game => game !== gameName);
        io.emit('update-games', games);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
