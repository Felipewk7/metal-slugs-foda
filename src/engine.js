import { InputHandler } from './input.js';
import { Player, Enemy, Bullet, WeaponBox, SlugVehicle } from './entities.js';
import { assets } from './assets.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.input = new InputHandler();
        this.player = new Player();
        this.enemies = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.items = [];
        this.cameraX = 0;
        this.state = 'start'; // start, playing, gameover, victory
        this.levelWidth = 5000;

        this.initLevel();
    }

    initLevel() {
        this.enemies = [];
        // Spawn 15 soldiers
        for (let i = 0; i < 15; i++) {
            this.enemies.push(new Enemy(800 + i * 300, 400));
        }
        // Spawn 2 turrets
        this.enemies.push(new Enemy(1500, 300, 'turret'));
        this.enemies.push(new Enemy(3000, 300, 'turret'));

        // Spawn Slug Vehicle
        this.items.push(new SlugVehicle(1200, 400));

        // Spawn Weapon Boxes
        this.items.push(new WeaponBox(2000, 420, 'hmg'));
        this.items.push(new WeaponBox(3500, 420, 'flame'));

        // Tank Boss
        this.enemies.push(new Enemy(4500, 350, 'tank'));
        this.enemies[this.enemies.length - 1].width = 120;
        this.enemies[this.enemies.length - 1].height = 80;
    }

    update() {
        if (this.state !== 'playing') return;

        this.player.update(this.input, this.levelWidth);

        // Camera following player, but only moving right
        if (this.player.x > this.cameraX + 300) {
            this.cameraX = this.player.x - 300;
        }

        // Shooting
        if (this.input.shoot && Date.now() - this.player.lastShot > 150) {
            this.bullets.push(new Bullet(this.player.x + this.player.width, this.player.y + 20, this.player.facing, this.player.weapon));
            this.player.lastShot = Date.now();
        }

        // Update Bullets
        this.bullets.forEach((b, i) => {
            b.update();
            if (b.x > this.cameraX + 800 || b.x < this.cameraX) this.bullets.splice(i, 1);
        });

        this.enemyBullets.forEach((b, i) => {
            b.update();
            if (b.x > this.cameraX + 800 || b.x < this.cameraX) this.enemyBullets.splice(i, 1);
        });

        // Update Items & Vehicles
        this.items.forEach((it, i) => {
            if (it.x < this.player.x + this.player.width && it.x + it.width > this.player.x && it.y < this.player.y + this.player.height && it.y + it.height > this.player.y) {
                if (it instanceof WeaponBox) {
                    this.player.weapon = it.weaponType;
                    this.player.ammo = 200;
                    document.getElementById('weapon-val').innerText = it.weaponType.toUpperCase();
                    document.getElementById('ammo-val').innerText = '200';
                    this.items.splice(i, 1);
                } else if (it instanceof SlugVehicle && !this.player.inVehicle) {
                    this.player.inVehicle = true;
                    this.player.vehicle = it;
                    this.player.hp = Math.max(this.player.hp, it.hp);
                    this.items.splice(i, 1);
                }
            }
        });

        // Update Enemies
        this.enemies.forEach((en, i) => {
            if (Math.abs(en.x - this.player.x) < 800) {
                en.update(this.player.x);

                // Enemy Shooting
                if (Date.now() - en.lastShot > en.shootInterval) {
                    const dir = Math.sign(this.player.x - en.x);
                    this.enemyBullets.push(new Bullet(en.x, en.y + 20, dir, 'enemy'));
                    en.lastShot = Date.now();
                }
            }

            // Bullet - Enemy Collision
            this.bullets.forEach((b, bi) => {
                if (b.x < en.x + en.width && b.x + b.width > en.x && b.y < en.y + en.height && b.y + b.height > en.y) {
                    en.hp -= b.damage;
                    this.bullets.splice(bi, 1);
                    if (en.hp <= 0 && !en.dying) {
                        en.dying = true;
                        en.vx = 0; // Para de mover ao morrer
                        this.player.score += en.type === 'tank' ? 1000 : 100;
                    }
                }
            });
        });

        // Filtrar apenas quem realmente sumiu (dead = true após animação)
        this.enemies = this.enemies.filter(en => !en.dead);

        // Enemy Bullet - Player Collision
        this.enemyBullets.forEach((b, bi) => {
            if (b.x < this.player.x + this.player.width && b.x + b.width > this.player.x && b.y < this.player.y + this.player.height && b.y + b.height > this.player.y) {
                if (!this.player.dying) {
                    this.player.hp -= 10;
                    this.enemyBullets.splice(bi, 1);
                    if (this.player.hp <= 0) {
                        this.player.dying = true;
                        this.player.vx = 0;
                        setTimeout(() => {
                            this.state = 'gameover';
                            document.getElementById('game-over-screen').classList.remove('hidden');
                        }, 1000);
                    }
                }
            }
        });

        // Check Victory
        if (this.player.x >= 4800) {
            this.state = 'victory';
            document.getElementById('victory-screen').classList.remove('hidden');
        }

        // UI Updates
        document.getElementById('hp-val').innerText = this.player.hp;
        document.getElementById('score-val').innerText = this.player.score;
    }

    draw() {
        this.ctx.clearRect(0, 0, 800, 600);

        // Draw Background (paralllax-ish)
        if (assets.loaded) {
            const bg = assets.images.background;
            this.ctx.drawImage(bg, -(this.cameraX * 0.5) % 800, 0, 800, 600);
            this.ctx.drawImage(bg, (-(this.cameraX * 0.5) % 800) + 800, 0, 800, 600);
        }

        this.ctx.save();
        this.ctx.translate(-this.cameraX, 0);

        // Floor (debug line)
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(0, 514);
        this.ctx.lineTo(this.levelWidth, 514);
        this.ctx.stroke();

        this.items.forEach(it => it.draw(this.ctx));
        this.enemies.forEach(en => en.draw(this.ctx));
        this.bullets.forEach(b => b.draw(this.ctx));
        this.enemyBullets.forEach(b => b.draw(this.ctx));
        this.player.draw(this.ctx);

        this.ctx.restore();
    }

    start() {
        console.log("Game.start() called");
        this.state = 'playing';

        // Hide all screens
        const screens = ['start-screen', 'game-over-screen', 'victory-screen'];
        screens.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('hidden');
        });

        // Reset game state
        this.player = new Player();
        this.cameraX = 0;
        this.bullets = [];
        this.enemyBullets = [];
        this.items = [];
        this.initLevel();

        // Reset HUD
        document.getElementById('hp-val').innerText = this.player.hp;
        document.getElementById('weapon-val').innerText = 'PISTOL';
        document.getElementById('ammo-val').innerText = '∞';
        document.getElementById('score-val').innerText = '0';
    }
}
