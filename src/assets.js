export class Assets {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.toLoad = 0;
        this.loadedCount = 0;
    }

    load(name, src) {
        this.toLoad++;
        const img = new Image();
        img.src = src;
        img.onload = () => {
            this.loadedCount++;
            if (this.loadedCount === this.toLoad) {
                this.loaded = true;
            }
        };
        this.images[name] = img;
    }

    init() {
        // Using relative paths from src/
        this.load('player', './player.png');
        this.load('enemy', './enemy.png');
        this.load('tank', './tank.png');
        this.load('background', './background.png');
    }
}

export const assets = new Assets();
assets.init();
