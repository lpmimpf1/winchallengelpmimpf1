const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let games = [];
let timers = { red: 0, blue: 0 };
let timerIntervals = { red: null, blue: null };

app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.emit('update-games', games);
    socket.emit('update-timer', { team: 'red', time: timers.red });
    socket.emit('update-timer', { team: 'blue', time: timers.blue });

    socket.on('start-timer', (team) => {
        if (timerIntervals[team] === null) {
            const startTime = Date.now();
            timerIntervals[team] = setInterval(() => {
                timers[team] = Math.floor((Date.now() - startTime) / 1000);
                io.emit('update-timer', { team, time: timers[team] });
            }, 1000);
        }
    });

    socket.on('stop-timer', (team) => {
        clearInterval(timerIntervals[team]);
        timerIntervals[team] = null;
    });

    socket.on('add-game', (gameName) => {
        if (!games.includes(gameName)) {
            games.push(gameName);
            io.emit('update-games', games);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

server.listen(3000, () => {
    console.log('Server listening on port 3000');
});
