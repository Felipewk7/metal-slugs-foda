import { assets } from './assets.js';

export class Entity {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.vx = 0;
        this.vy = 0;
        this.dead = false;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
    }

    draw(ctx) {
        // Placeholder or sprite
    }
}

export class WeaponBox extends Entity {
    constructor(x, y, weaponType) {
        super(x, y, 32, 32);
        this.weaponType = weaponType;
        this.color = weaponType === 'hmg' ? '#ffcc00' : '#ff4400';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = 'white';
        ctx.font = '10px Arial';
        ctx.fillText(this.weaponType.toUpperCase(), this.x + 2, this.y + 20);
    }
}

export class SlugVehicle extends Entity {
    constructor(x, y) {
        super(x, y, 100, 60);
        this.hp = 300;
        this.active = true;
    }

    draw(ctx) {
        ctx.fillStyle = '#4a5d4e';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#222';
        ctx.fillRect(this.x + 10, this.y + this.height - 10, 20, 10);
        ctx.fillRect(this.x + 70, this.y + this.height - 10, 20, 10);
        ctx.strokeStyle = '#666';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
}

export class Bullet extends Entity {
    constructor(x, y, direction, type = 'standard') {
        super(x, y, 10, 4);
        this.vx = direction * 10;
        this.type = type;
        this.damage = type === 'hmg' ? 15 : 10;
        this.color = type === 'flame' ? '#ff6600' : '#ffff00';
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Glow effect
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

export class Player extends Entity {
    constructor() {
        super(100, 400, 48, 64);
        this.hp = 100;
        this.maxHp = 100;
        this.grounded = false;
        this.weapon = 'pistol';
        this.ammo = Infinity;
        this.score = 0;
        this.facing = 1; // 1 for right, -1 for left
        this.inVehicle = false;
        this.vehicle = null;
        this.lastShot = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(input, levelWidth) {
        // Physics
        const gravity = 0.5;
        this.vy += gravity;

        if (input.horizontal !== 0) {
            this.vx = input.horizontal * 4;
            this.facing = input.horizontal;
        } else {
            this.vx *= 0.8;
        }

        if (input.jump && this.grounded) {
            this.vy = -12;
            this.grounded = false;
        }

        super.update();

        // Floor collision (simple)
        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            this.grounded = true;
        }

        // Screen constraints (no backtracking)
        if (this.x < 0) this.x = 0;

        // Animation
        this.animationTimer++;
        if (this.animationTimer > 10) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    draw(ctx) {
        if (!assets.loaded) {
            ctx.fillStyle = 'blue';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        const img = assets.images.player;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.facing === -1) ctx.scale(-1, 1);

        // Grid Slicing (Assume 4x4 ou similar)
        const cols = 4;
        const rows = 4;
        const frameW = img.width / cols;
        const frameH = img.height / rows;

        // Selecionar linha baseado no estado (0: Idle, 1: Run, 2: Shoot, etc)
        let row = 0;
        if (Math.abs(this.vx) > 0.1) row = 1;

        ctx.drawImage(
            img,
            this.animationFrame * frameW, row * frameH, frameW, frameH, // Source
            -this.width / 2, -this.height / 2, this.width, this.height // Destination
        );

        ctx.restore();
    }
}

export class Enemy extends Entity {
    constructor(x, y, type = 'soldier') {
        super(x, y, 48, 64);
        this.type = type;
        this.hp = type === 'tank' ? 500 : 20;
        this.vx = 0; // Initialize vx
        this.lastShot = 0;
        this.shootInterval = type === 'tank' ? 2000 : 1500;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(playerX) {
        if (this.type === 'soldier') {
            const dist = playerX - this.x;
            if (Math.abs(dist) > 200) {
                this.vx = Math.sign(dist) * 2;
            } else {
                this.vx = 0;
            }
        }
        super.update();

        // Animation
        this.animationTimer++;
        if (this.animationTimer > 12) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        // Gravity
        if (this.type !== 'turret') {
            this.vy += 0.5;
            if (this.y > 450) {
                this.y = 450;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (!assets.loaded) {
            ctx.fillStyle = this.type === 'tank' ? 'red' : 'green';
            ctx.fillRect(this.x, this.y, this.width, this.height);
            return;
        }
        const img = this.type === 'tank' ? assets.images.tank : assets.images.enemy;

        if (this.type === 'tank') {
            ctx.drawImage(img, 0, 0, img.width, img.height, this.x, this.y, this.width, this.height);
        } else {
            // Slicing para inimigo soldado
            const frameW = img.width / 4;
            const frameH = img.height / 4;
            let row = Math.abs(this.vx) > 0.1 ? 1 : 0;

            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (this.vx > 0) ctx.scale(-1, 1); // Flip se mover pra direita

            ctx.drawImage(
                img,
                this.animationFrame * frameW, row * frameH, frameW, frameH,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
            ctx.restore();
        }
    }
}
