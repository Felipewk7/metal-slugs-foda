import playerImg from './player.png';
import enemyImg from './enemy.png';
import tankImg from './tank.png';
import backgroundImg from './background.png';

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
        const onFinish = () => {
            this.loadedCount++;
            console.log(`Loaded ${name}: ${this.loadedCount}/${this.toLoad}`);
            if (this.loadedCount === this.toLoad) {
                this.loaded = true;
                console.log('All assets processed');
            }
        };
        img.onload = onFinish;
        img.onerror = () => {
            console.error('Failed to load asset:', name, src);
            onFinish(); // Mark as finished even if failed to avoid blocking engine
        };
        this.images[name] = img;
    }

    init() {
        this.load('player', playerImg);
        this.load('enemy', enemyImg);
        this.load('tank', tankImg);
        this.load('background', backgroundImg);
    }
}

export const assets = new Assets();
assets.init();
