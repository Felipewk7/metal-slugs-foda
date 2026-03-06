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
        const isGithub = window.location.hostname.includes('github.io');
        const basePath = isGithub ? '/metal-slugs-foda/src/' : './';
        img.src = basePath + filename;

        img.onload = () => {
            // Processar transparência se não for o fundo
            if (name !== 'background') {
                try {
                    const tempCanvas = document.createElement('canvas');
                    const tempCtx = tempCanvas.getContext('2d');
                    tempCanvas.width = img.width;
                    tempCanvas.height = img.height;
                    tempCtx.drawImage(img, 0, 0);

                    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
                    const data = imageData.data;
                    for (let i = 0; i < data.length; i += 4) {
                        // Chroma Key: Se for branco (RGB > 240), torna transparente
                        if (data[i] > 240 && data[i + 1] > 240 && data[i + 2] > 240) {
                            data[i + 3] = 0;
                        }
                    }
                    tempCtx.putImageData(imageData, 0, 0);
                    const processed = new Image();
                    processed.src = tempCanvas.toDataURL();
                    processed.onload = () => {
                        this.images[name] = processed;
                        this.finishLoad(name);
                    };
                } catch (e) {
                    console.error("Erro no processamento de transparência:", e);
                    this.images[name] = img;
                    this.finishLoad(name);
                }
            } else {
                this.images[name] = img;
                this.finishLoad(name);
            }
        };
        img.onerror = () => {
            console.error(`[ASSETS] FAILED to load ${name}`);
            this.finishLoad(name);
        };
    }

    finishLoad(name) {
        this.loadedCount++;
        console.log(`[ASSETS] ${name} ready (${this.loadedCount}/${this.toLoad})`);
        if (this.loadedCount === this.toLoad) {
            this.loaded = true;
        }
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
