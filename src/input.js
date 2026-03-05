export class InputHandler {
    constructor() {
        this.keys = new Set();
        window.addEventListener('keydown', (e) => {
            this.keys.add(e.code);
        });
        window.addEventListener('keyup', (e) => {
            this.keys.delete(e.code);
        });
    }

    isPressed(code) {
        return this.keys.has(code);
    }

    get horizontal() {
        if (this.isPressed('KeyD') || this.isPressed('ArrowRight')) return 1;
        if (this.isPressed('KeyA') || this.isPressed('ArrowLeft')) return -1;
        return 0;
    }

    get jump() {
        return this.isPressed('KeyW') || this.isPressed('Space') || this.isPressed('ArrowUp');
    }

    get shoot() {
        return this.isPressed('KeyJ');
    }

    get grenade() {
        return this.isPressed('KeyK');
    }
}
