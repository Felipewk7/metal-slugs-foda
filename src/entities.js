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
        this.dying = false;
        this.deathTimer = 0;
    }

    update() {
        if (this.dying) {
            this.deathTimer++;
            if (this.deathTimer > 60) this.dead = true;
            return;
        }
        this.x += this.vx;
        this.y += this.vy;
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
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
    }
}

export class Player extends Entity {
    constructor() {
        super(100, 400, 64, 64);
        this.hp = 100;
        this.maxHp = 100;
        this.grounded = false;
        this.weapon = 'pistol';
        this.ammo = Infinity;
        this.score = 0;
        this.facing = 1;
        this.inVehicle = false;
        this.vehicle = null;
        this.lastShot = 0;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(input, levelWidth) {
        if (this.dying) {
            super.update();
            return;
        }

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

        if (this.y > 450) {
            this.y = 450;
            this.vy = 0;
            this.grounded = true;
        }

        if (this.x < 0) this.x = 0;

        this.animationTimer++;
        const animSpeed = Math.abs(this.vx) > 0.1 ? 6 : 12;
        if (this.animationTimer > animSpeed) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }
    }

    draw(ctx) {
        if (!assets.loaded) return;
        const img = assets.images.player;

        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        if (this.facing === -1) ctx.scale(-1, 1);

        const frameW = img.width / 4;
        const frameH = img.height / 4;

        let row = 0;
        if (this.dying) row = 3; // Morte
        else if (!this.grounded) row = 3; // Pulo (usando a mesma linha de morte/pulo conforme sugerido pelo prompt da IA)
        else if (Date.now() - this.lastShot < 200) row = 2; // Atirando
        else if (Math.abs(this.vx) > 0.1) row = 1; // Correndo

        ctx.drawImage(
            img,
            this.animationFrame * frameW, row * frameH, frameW, frameH,
            -this.width / 2, -this.height / 2, this.width, this.height
        );

        ctx.restore();
    }
}

export class Enemy extends Entity {
    constructor(x, y, type = 'soldier') {
        super(x, y, 64, 64);
        this.type = type;
        this.hp = type === 'tank' ? 500 : 20;
        this.vx = 0;
        this.lastShot = 0;
        this.shootInterval = type === 'tank' ? 2000 : 1500;
        this.animationFrame = 0;
        this.animationTimer = 0;
    }

    update(playerX) {
        if (this.dying) {
            super.update();
            return;
        }

        if (this.type === 'soldier') {
            const dist = playerX - this.x;
            if (Math.abs(dist) > 200) {
                this.vx = Math.sign(dist) * 2;
            } else {
                this.vx = 0;
            }
        }
        super.update();

        this.animationTimer++;
        if (this.animationTimer > 12) {
            this.animationFrame = (this.animationFrame + 1) % 4;
            this.animationTimer = 0;
        }

        if (this.type !== 'turret') {
            this.vy += 0.5;
            if (this.y > 450) {
                this.y = 450;
                this.vy = 0;
            }
        }
    }

    draw(ctx) {
        if (!assets.loaded) return;
        const img = this.type === 'tank' ? assets.images.tank : assets.images.enemy;

        if (this.type === 'tank') {
            ctx.drawImage(img, 0, 0, img.width, img.height, this.x, this.y, this.width, this.height);
        } else {
            const frameW = img.width / 4;
            const frameH = img.height / 4;

            let row = 0;
            if (this.dying) row = 3;
            else if (Date.now() - this.lastShot < 300) row = 2;
            else if (Math.abs(this.vx) > 0.1) row = 1;

            ctx.save();
            ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
            if (this.vx > 0) ctx.scale(-1, 1);

            ctx.drawImage(
                img,
                this.animationFrame * frameW, row * frameH, frameW, frameH,
                -this.width / 2, -this.height / 2, this.width, this.height
            );
            ctx.restore();
        }
    }
}
