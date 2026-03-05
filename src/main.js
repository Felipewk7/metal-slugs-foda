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

// Event listeners
document.addEventListener('keydown', (e) => {
    if (game.state === 'start' && e.code === 'KeyJ') {
        game.start();
    }
});

document.body.addEventListener('click', () => {
    if (game.state === 'start') {
        game.start();
    }
});

document.getElementById('retry-btn').addEventListener('click', () => {
    game.start();
});

document.getElementById('next-btn').addEventListener('click', () => {
    location.reload();
});
