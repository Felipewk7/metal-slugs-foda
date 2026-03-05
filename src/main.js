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
const startMission = () => {
    console.log("Starting mission... Current state:", game.state);
    if (game.state === 'start' || game.state === 'gameover' || game.state === 'victory') {
        game.start();
    }
};

document.addEventListener('keydown', (e) => {
    if (e.code === 'KeyJ') {
        startMission();
    }
});

// Click on the entire screens container to start
document.getElementById('screens').addEventListener('click', (e) => {
    startMission();
});

document.getElementById('retry-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    startMission();
});

document.getElementById('next-btn').addEventListener('click', () => {
    location.reload();
});
