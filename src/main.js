import { Game } from './engine.js';

const canvas = document.getElementById('gameCanvas');
canvas.width = 800;
canvas.height = 600;

const game = new Game(canvas);

function loop() {
    game.update();
    game.draw();
    requestAnimationFrame(loop);
}

// Start loop
loop();

// Event listeners for Start
const startMission = (source) => {
    console.log(`[MAIN] startMission attempt by ${source}. Current state: ${game.state}`);
    if (game.state !== 'playing') {
        game.start();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        startMission('Keyboard Enter');
    }
});

// Click on the entire screens container to start
const screensEl = document.getElementById('screens');
if (screensEl) {
    screensEl.style.cursor = 'pointer'; // Feedback visual
    screensEl.addEventListener('click', (e) => {
        startMission('Mouse Click');
    });
}

document.getElementById('retry-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    startMission();
});

document.getElementById('next-btn').addEventListener('click', () => {
    location.reload();
});
