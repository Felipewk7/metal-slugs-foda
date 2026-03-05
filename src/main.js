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
    console.log(`[MAIN] startMission triggered by ${source}. Current state: ${game.state}`);
    // Forçar o start mesmo que o estado esteja estranho
    game.start();
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyJ') {
        startMission('Keyboard J');
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
