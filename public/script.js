const socket = io();

let timers = { red: 0, blue: 0 };
let startTimes = { red: null, blue: null };
let elapsedTimes = { red: 0, blue: 0 };
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
    elapsedTimes[data.team] = data.time;
});

const startTimer = (team) => {
    if (timerIntervals[team] === null) {
        startTimes[team] = Date.now() - elapsedTimes[team];
        timerIntervals[team] = setInterval(() => {
            const elapsed = Date.now() - startTimes[team];
            timers[team] = elapsed;
            socket.emit('update-timer', { team, time: elapsed });
            updateTimerDisplay(team, elapsed);
        }, 100); // Update every 100 milliseconds
    }
};

const stopTimer = (team) => {
    if (timerIntervals[team] !== null) {
        clearInterval(timerIntervals[team]);
        timerIntervals[team] = null;
        elapsedTimes[team] = timers[team];
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

// Synchronize game addition
socket.on('update-games', (games) => {
    const redGamesList = document.getElementById('red-games');
    const blueGamesList = document.getElementById('blue-games');
    redGamesList.innerHTML = '';
    blueGamesList.innerHTML = '';
    games.forEach(game => {
        const redGameDiv = document.createElement('div');
        const blueGameDiv = document.createElement('div');
        
        redGameDiv.innerHTML = `
            <input type="checkbox" id="red-${game}" />
            <label for="red-${game}">${game}</label>
            <button class="delete-button" onclick="deleteGame('${game}')">🗑️</button>
        `;
        
        blueGameDiv.innerHTML = `
            <input type="checkbox" id="blue-${game}" />
            <label for="blue-${game}">${game}</label>
            <button class="delete-button" onclick="deleteGame('${game}')">🗑️</button>
        `;
        
        redGamesList.appendChild(redGameDiv);
        blueGamesList.appendChild(blueGameDiv);
    });

    // Add event listeners to sync checkboxes
    games.forEach(game => {
        document.getElementById(`red-${game}`).addEventListener('change', () => {
            socket.emit('update-checkbox', { team: 'red', game, checked: document.getElementById(`red-${game}`).checked });
        });

        document.getElementById(`blue-${game}`).addEventListener('change', () => {
            socket.emit('update-checkbox', { team: 'blue', game, checked: document.getElementById(`blue-${game}`).checked });
        });
    });
});

// Synchronize checkbox changes
socket.on('update-checkbox', (data) => {
    document.getElementById(`${data.team}-${data.game}`).checked = data.checked;
});

// Delete game function
function deleteGame(gameName) {
    socket.emit('delete-game', gameName);
}
