// js/game.js

// 1. IMPORT
import {
    PLAYER_SPEED, BULLET_SPEED, SHOOT_COOLDOWN, PLAYER_RADIUS,
    BULLET_RADIUS, MAX_BULLET_BOUNCE, 
    // === SỬA LẠI: Đã xóa PLAYER_COLOR khỏi import ===
    BULLET_COLOR, 
    PLAYER_ROTATION_SPEED
} from "./config.js";

import { getRandomMap, isBlocked, CELL_SIZE, getMapCellType } from "./maps.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";
import { playSound } from "./audio.js";


// 2. EXPORT CÁC LỚP
// ... (class Player, class Bullet, class Bot - không thay đổi) ...
export class Player {
    constructor(name, x, y, skinData, isLocal = true) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.skin = skinData;
        this.angle = -Math.PI / 2;
        this.dirX = Math.cos(this.angle);
        this.dirY = Math.sin(this.angle);
        this.alive = true;
        this.isLocal = isLocal;
    }
}
export class Bullet {
    constructor(x, y, vx, vy, owner = null) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.bounceCount = 0;
        this.remove = false;
        this.owner = owner;
    }
}
export class Bot extends Player {
    constructor(name, x, y, skinData) {
        super(name, x, y, skinData, false);
        this.vx = 0;
        this.vy = 0;
        this.shootTimer = 0;
        this.moveTimer = 0;
    }
    update(delta, player, bullets) {
        if (!this.alive) return;
        const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
        let speedModifier = 1;
        const botCellType = getMapCellType(this.x, this.y, currentMap);
        if (botCellType === 3) {
            speedModifier = 0.5;
        }
        this.moveTimer += delta;
        if (this.moveTimer > 500) {
            this.moveTimer = 0;
            if (player && player.alive) {
                const dx = player.x - this.x;
                const dy = player.y - this.y;
                const len = Math.hypot(dx, dy) || 1;
                this.vx = (dx / len) * 0.8 + (Math.random() - 0.5) * 0.4;
                this.vy = (dy / len) * 0.8 + (Math.random() - 0.5) * 0.4;
            } else {
                this.vx = (Math.random() * 2 - 1);
                this.vy = (Math.random() * 2 - 1);
            }
            const aimLen = Math.hypot(this.vx, this.vy);
            if (aimLen > 0) {
                this.dirX = this.vx / aimLen;
                this.dirY = this.vy / aimLen;
            }
        }
        
        // PHÉP TÍNH TỐC ĐỘ ĐÃ CHUẨN (KHÔNG CẦN * 60)
        const moveX = this.vx * PLAYER_SPEED * 0.8 * speedModifier * (delta / 1000);
        const moveY = this.vy * PLAYER_SPEED * 0.8 * speedModifier * (delta / 1000);

        let nextX = this.x + moveX;
        nextX = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, nextX));
        let collisionX = false;
        if (moveX > 0) {
            if (isBlocked(nextX + PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || isBlocked(nextX + PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                collisionX = true;
            }
        } else if (moveX < 0) {
            if (isBlocked(nextX - PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || isBlocked(nextX - PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                collisionX = true;
            }
        }
        if (!collisionX) {
            this.x = nextX;
        } else {
            this.vx *= -1;
        }
        let nextY = this.y + moveY;
        nextY = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, nextY));
        let collisionY = false;
        if (moveY > 0) {
            if (isBlocked(this.x - PLAYER_BOX_HALF, nextY + PLAYER_BOX_HALF, currentMap) || isBlocked(this.x + PLAYER_BOX_HALF, nextY + PLAYER_BOX_HALF, currentMap)) {
                collisionY = true;
            }
        } else if (moveY < 0) {
            if (isBlocked(this.x - PLAYER_BOX_HALF, nextY - PLAYER_BOX_HALF, currentMap) || isBlocked(this.x + PLAYER_BOX_HALF, nextY - PLAYER_BOX_HALF, currentMap)) {
                collisionY = true;
            }
        }
        if (!collisionY) {
            this.y = nextY;
        } else {
            this.vy *= -1;
        }
        this.shootTimer += delta;
        if (this.shootTimer > 900 && player && player.alive) {
            this.shootTimer = 0;
            const vx = this.dirX;
            const vy = this.dirY;
            playSound('shoot');
            bullets.push(new Bullet(this.x + vx * (PLAYER_BOX_HALF + 1), this.y + vy * (PLAYER_BOX_HALF + 1), vx, vy, this));
        }
    }
}


// 3. EXPORT CÁC BIẾN TRẠNG THÁI GAME
export let player = null;
export let bots = [];
export let bullets = [];
export let gameOver = false;
export let score = 0;
export let canShoot = true;
export let currentMap = null;
export let playerSkin = {
    // === SỬA LẠI: Thay PLAYER_COLOR thành null ===
    // (Vì nó không còn được dùng, skin được gán trong initGame)
    avatar: null, 
    bullet: BULLET_COLOR
};
let canvas = null;
export let gameOverSoundPlayed = false;

// 4. EXPORT HÀM INIT GAME
// ... (Hàm initGame không thay đổi) ...
export function initGame(username, canvasEl) {
    canvas = canvasEl;
    gameOver = false;
    gameOverSoundPlayed = false;
    score = 0;
    bullets = [];
    bots = [];
    canShoot = true;

    currentMap = getRandomMap(canvas.width, canvas.height);
    const metaRaw = localStorage.getItem("user_" + username);

    let avatarId = "default";
    let bulletId = "default";

    if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        avatarId = meta.currentAvatar || "default";
        bulletId = meta.currentBullet || "default";
    }

    const avatarSkinData = AVATAR_SKINS[avatarId] || AVATAR_SKINS["default"];
    const bulletSkinData = BULLET_SKINS[bulletId] || BULLET_SKINS["default"];

    playerSkin.bullet = bulletSkinData.data;

    let playerStartX, playerStartY, botStartX, botStartY;
    do {
        playerStartX = Math.floor(Math.random() * (currentMap.layout[0].length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
        playerStartY = Math.floor(Math.random() * (currentMap.layout.length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
    } while (isBlocked(playerStartX, playerStartY, currentMap));
    do {
        botStartX = Math.floor(Math.random() * (currentMap.layout[0].length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
        botStartY = Math.floor(Math.random() * (currentMap.layout.length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
    } while (isBlocked(botStartX, botStartY, currentMap) ||
        Math.hypot(playerStartX - botStartX, playerStartY - botStartY) < CELL_SIZE * 5);

    player = new Player(username, playerStartX, playerStartY, avatarSkinData);

    const botSkinData = AVATAR_SKINS["ava_tank_red"] || AVATAR_SKINS["default"];
    bots.push(new Bot("Bot 1", botStartX, botStartY, botSkinData));
}


// 5. EXPORT HÀM UPDATE GAME
// ... (Hàm updateGame không thay đổi, vẫn giữ logic delta chuẩn) ...
export function updateGame(delta, keys) {
    if (gameOver) return;
    if (!player || !player.alive) {
        if (!gameOverSoundPlayed) {
            playSound('defeated');
            gameOverSoundPlayed = true;
        }
        gameOver = true;
        return;
    }
    let rotation = 0;
    if (keys["KeyA"] || keys["ArrowLeft"]) rotation -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) rotation += 1;
    player.angle += rotation * PLAYER_ROTATION_SPEED * (delta / 1000);
    player.dirX = Math.cos(player.angle);
    player.dirY = Math.sin(player.angle);
    let speedModifier = 1;
    const playerCellType = getMapCellType(player.x, player.y, currentMap);
    if (playerCellType === 3) {
        speedModifier = 0.5;
    }
    let moveDirection = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) moveDirection = 1;
    if (keys["KeyS"] || keys["ArrowDown"]) moveDirection = -1;
    let moveX = 0;
    let moveY = 0;
    if (moveDirection !== 0) {
        // PHÉP TÍNH TỐC ĐỘ ĐÃ CHUẨN (KHÔNG CẦN * 60)
        const totalSpeed = PLAYER_SPEED * speedModifier * moveDirection * (delta / 1000);
        moveX = player.dirX * totalSpeed;
        moveY = player.dirY * totalSpeed;
    }
    const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
    let nextX = player.x + moveX;
    nextX = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, nextX));
    let collisionX = false;
    if (moveX > 0) {
        if (isBlocked(nextX + PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || isBlocked(nextX + PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            collisionX = true;
        }
    } else if (moveX < 0) {
        if (isBlocked(nextX - PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || isBlocked(nextX - PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            collisionX = true;
        }
    }
    if (!collisionX) {
        player.x = nextX;
    }
    let nextY = player.y + moveY;
    nextY = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, nextY));
    let collisionY = false;
    if (moveY > 0) {
        if (isBlocked(player.x - PLAYER_BOX_HALF, nextY + PLAYER_BOX_HALF, currentMap) || isBlocked(player.x + PLAYER_BOX_HALF, nextY + PLAYER_BOX_HALF, currentMap)) {
            collisionY = true;
        }
    } else if (moveY < 0) {
        if (isBlocked(player.x - PLAYER_BOX_HALF, nextY - PLAYER_BOX_HALF, currentMap) || isBlocked(player.x + PLAYER_BOX_HALF, nextY - PLAYER_BOX_HALF, currentMap)) {
            collisionY = true;
        }
    }
    if (!collisionY) {
        player.y = nextY;
    }
    if (keys["Space"]) {
        if (canShoot) {
            canShoot = false;
            playSound('shoot');
            setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
            const vx = player.dirX;
            const vy = player.dirY;
            const bulletX = player.x + vx * (PLAYER_BOX_HALF + 1);
            const bulletY = player.y + vy * (PLAYER_BOX_HALF + 1);
            bullets.push(new Bullet(bulletX, bulletY, vx, vy, player));
        }
    }
    bots.forEach(bot => bot.update(delta, player, bullets));
    bullets = bullets.filter(b => !b.remove);
    bullets.forEach(b => {
        // PHÉP TÍNH TỐC ĐỘ ĐÃ CHUẨN (KHÔNG CẦN * 60)
        const bulletMoveSpeed = BULLET_SPEED * (delta / 1000);
        
        const prevX = b.x;
        const prevY = b.y;
        
        b.x += b.vx * bulletMoveSpeed;
        b.y += b.vy * bulletMoveSpeed;
        let bounced = false;
        const c = Math.floor(b.x / CELL_SIZE);
        const r = Math.floor(b.y / CELL_SIZE);
        if (!currentMap.layout[r] || currentMap.layout[r][c] === undefined) {
        } else {
            const cellValue = currentMap.layout[r][c];
            if (cellValue === 1) {
                playSound('bounced');
                bounced = true;
                const prevC = Math.floor(prevX / CELL_SIZE);
                const prevR = Math.floor(prevY / CELL_SIZE);
                b.x = prevX;
                b.y = prevY;
                let hitVertical = false;
                let hitHorizontal = false;
                if (c !== prevC) hitVertical = true;
                if (r !== prevR) hitHorizontal = true;
                if (hitVertical) b.vx *= -1;
                if (hitHorizontal) b.vy *= -1;
                if (!hitVertical && !hitHorizontal) {
                    b.vx *= -1;
                    b.vy *= -1;
                }
            } else if (cellValue === 5 || cellValue === 4) {
                playSound('wall_crack');
                currentMap.layout[r][c] -= 1;
                if (currentMap.layout[r][c] <= 0) {
                    currentMap.layout[r][c] = 0;
                }
                b.remove = true;
                bounced = false;
            }
        }
        if (b.x <= 0 || b.x >= canvas.width) {
            b.vx *= -1;
            bounced = true;
            playSound('bounced');
        }
        if (b.y <= 0 || b.y >= canvas.height) {
            b.vy *= -1;
            bounced = true;
            playSound('bounced');
        }
        if (bounced) b.bounceCount++;
        if (b.bounceCount > MAX_BULLET_BOUNCE) b.remove = true;
        if (player.alive) {
            if (b.x > player.x - PLAYER_BOX_HALF &&
                b.x < player.x + PLAYER_BOX_HALF &&
                b.y > player.y - PLAYER_BOX_HALF &&
                b.y < player.y + PLAYER_BOX_HALF) {
                playSound('hitted');
                player.alive = false;
                b.remove = true;
            }
        }
        if (!b.remove) {
            bots.forEach(bot => {
                if (bot.alive && b.owner !== bot) {
                    if (b.x > bot.x - PLAYER_BOX_HALF &&
                        b.x < bot.x + PLAYER_BOX_HALF &&
                        b.y > bot.y - PLAYER_BOX_HALF &&
                        b.y < bot.y + PLAYER_BOX_HALF) {
                        playSound('hitted');
                        bot.alive = false;
                        b.remove = true;
                        score++;
                        playSound('victory');
                    }
                }
            });
        }
    });
    bots = bots.filter(bot => bot.alive);
    if (bots.length === 0 && !gameOver) {
        let botX, botY;
        do {
            botX = Math.floor(Math.random() * (currentMap.layout[0].length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
            botY = Math.floor(Math.random() * (currentMap.layout.length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
        } while (isBlocked(botX, botY, currentMap) ||
            (player && Math.hypot(player.x - botX, player.y - botY) < CELL_SIZE * 5));
        bots.push(new Bot("Bot " + (score + 1), botX, botY, AVATAR_SKINS["ava_tank_red"] || AVATAR_SKINS["default"]));
    }
}
