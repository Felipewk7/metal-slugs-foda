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
        img.onload = () => {
            this.loadedCount++;
            if (this.loadedCount === this.toLoad) {
                this.loaded = true;
                console.log('All assets loaded');
            }
        };
        img.onerror = () => {
            console.error('Failed to load asset:', name, src);
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
