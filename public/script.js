const socket = io();

let timers = { red: 0, blue: 0 };
let startTimes = { red: null, blue: null };
let timerIntervals = { red: null, blue: null };

// Helper function to format time
const formatTime = (milliseconds) => {
    if (milliseconds === null || isNaN(milliseconds)) return '00:00:000';
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const millis = milliseconds % 1000;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(millis).padStart(3, '0')}`;
};

// Update timer display
const updateTimerDisplay = (team, time) => {
    document.getElementById(`${team}-timer-display`).textContent = formatTime(time);
};

// Timer update from server
socket.on('update-timer', (data) => {
    updateTimerDisplay(data.team, data.time);
});

const startTimer = (team) => {
    if (timerIntervals[team] === null) {
        startTimes[team] = Date.now();
        timerIntervals[team] = setInterval(() => {
            const elapsed = Date.now() - startTimes[team];
            timers[team] = elapsed;
            socket.emit('update-timer', { team, time: elapsed });
            updateTimerDisplay(team, elapsed);
        }, 10); // Update every 10 milliseconds
    }
};

const stopTimer = (team) => {
    if (timerIntervals[team] !== null) {
        clearInterval(timerIntervals[team]);
        timerIntervals[team] = null;
        socket.emit('stop-timer', { team });
    }
};

document.getElementById('red-timer-start').addEventListener('click', () => startTimer('red'));
document.getElementById('red-timer-stop').addEventListener('click', () => stopTimer('red'));

document.getElementById('blue-timer-start').addEventListener('click', () => startTimer('blue'));
document.getElementById('blue-timer-stop').addEventListener('click', () => stopTimer('blue'));

document.getElementById('add-game').addEventListener('click', () => {
    const gameName = document.getElementById('new-game-name').value;
    if (gameName) {
        socket.emit('add-game', gameName);
        document.getElementById('new-game-name').value = '';
    }
});

socket.on('update-games', (games) => {
    const redGamesList = document.getElementById('red-games');
    const blueGamesList = document.getElementById('blue-games');
    redGamesList.innerHTML = '';
    blueGamesList.innerHTML = '';
    games.forEach(game => {
        redGamesList.innerHTML += `<div><input type="checkbox" id="red-${game}" /><label for="red-${game}">${game}</label></div>`;
        blueGamesList.innerHTML += `<div><input type="checkbox" id="blue-${game}" /><label for="blue-${game}">${game}</label></div>`;
    });
});
