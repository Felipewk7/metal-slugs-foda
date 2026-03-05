export class Assets {
    constructor() {
        this.images = {};
        this.loaded = false;
        this.toLoad = 0;
        this.loadedCount = 0;
    }

    load(name, filename) {
        this.toLoad++;
        const img = new Image();

        // Determinar path correto (Vite dev vs GitHub Pages)
        const isGithub = window.location.hostname.includes('github.io');
        const basePath = isGithub ? '/metal-slugs-foda/src/' : './';

        img.src = basePath + filename;

        const onFinish = () => {
            this.loadedCount++;
            console.log(`[ASSETS] ${name} loaded (${this.loadedCount}/${this.toLoad})`);
            if (this.loadedCount === this.toLoad) {
                this.loaded = true;
                console.log('[ASSETS] Ready.');
            }
        };

        img.onload = onFinish;
        img.onerror = () => {
            console.error(`[ASSETS] FAILED to load ${name} at ${img.src}`);
            onFinish();
        };
        this.images[name] = img;
    }

    init() {
        console.log('[ASSETS] Initializing...');
        this.load('player', 'player.png');
        this.load('enemy', 'enemy.png');
        this.load('tank', 'tank.png');
        this.load('background', 'background.png');
    }
}

export const assets = new Assets();
assets.init();
