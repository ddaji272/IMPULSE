// js/game.js

// 1. IMPORT
import {
    PLAYER_SPEED, BULLET_SPEED, SHOOT_COOLDOWN, PLAYER_RADIUS,
    BULLET_RADIUS, MAX_BULLET_BOUNCE, 
    BULLET_COLOR, 
    PLAYER_ROTATION_SPEED
} from "./config.js";

// === SỬA LỖI: Đã xóa 'getCellRect' khỏi dòng import dưới đây ===
import { getRandomMap, isBlocked, CELL_SIZE, getMapCellType } from "./maps.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";
import { playSound } from "./audio.js";


// 2. EXPORT CÁC LỚP
// (class Player, Bullet không đổi)
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

// === SỬA LẠI LOGIC DI CHUYỂN CỦA BOT ===
export class Bot extends Player {
    constructor(name, x, y, skinData) {
        super(name, x, y, skinData, false);
        this.vx = 0;
        this.vy = 0;
        this.shootTimer = 0;
        this.moveTimer = 0;
    }

    // Hàm va chạm (học từ Python)
    collideWithWalls(moveX, moveY) {
        const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;

        // 1. Di chuyển trục X
        this.x += moveX;

        // 2. Kiểm tra và "Snap" (kéo) trục X
        if (moveX > 0) { // Đang đi sang phải
            if (isBlocked(this.x + PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellX = Math.floor((this.x + PLAYER_BOX_HALF) / CELL_SIZE);
                this.x = (wallCellX * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
                this.vx *= -1; // Đảo hướng ngẫu nhiên
            }
        } else if (moveX < 0) { // Đang đi sang trái
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x - PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellX = Math.floor((this.x - PLAYER_BOX_HALF) / CELL_SIZE);
                this.x = (wallCellX * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
                this.vx *= -1; // Đảo hướng ngẫu nhiên
            }
        }

        // 3. Di chuyển trục Y
        this.y += moveY;

        // 4. Kiểm tra và "Snap" (kéo) trục Y
        if (moveY > 0) { // Đang đi xuống
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellY = Math.floor((this.y + PLAYER_BOX_HALF) / CELL_SIZE);
                this.y = (wallCellY * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
                this.vy *= -1;
            }
        } else if (moveY < 0) { // Đang đi lên
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap)) {
                const wallCellY = Math.floor((this.y - PLAYER_BOX_HALF) / CELL_SIZE);
                this.y = (wallCellY * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
                this.vy *= -1;
            }
        }

        // Giữ bot trong màn hình (failsafe)
        this.x = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, this.x));
        this.y = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, this.y));
    }

    update(delta, player, bullets) {
        if (!this.alive) return;
        
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
        
        const moveX = this.vx * PLAYER_SPEED * 0.8 * speedModifier * (delta / 1000);
        const moveY = this.vy * PLAYER_SPEED * 0.8 * speedModifier * (delta / 1000);

        // Gọi hàm va chạm mới
        this.collideWithWalls(moveX, moveY);

        // Logic bắn (giữ nguyên)
        this.shootTimer += delta;
        if (this.shootTimer > 900 && player && player.alive) {
            this.shootTimer = 0;
            const vx = this.dirX;
            const vy = this.dirY;
            const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
            playSound('shoot');
            bullets.push(new Bullet(this.x + vx * (PLAYER_BOX_HALF + 1), this.y + vy * (PLAYER_BOX_HALF + 1), vx, vy, this));
        }
    }
}


// 3. BIẾN TRẠNG THÁI GAME
// (Không thay đổi)
export let player = null;
export let bots = [];
export let bullets = [];
export let gameOver = false;
export let score = 0;
export let canShoot = true;
export let currentMap = null;
export let playerSkin = {
    avatar: null, 
    bullet: BULLET_COLOR
};
let canvas = null;
export let gameOverSoundPlayed = false;

// 4. HÀM INIT GAME
// (Không thay đổi)
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


// 5. HÀM UPDATE GAME (Nơi sửa lỗi chính)
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

    // --- Logic xoay (Giữ nguyên) ---
    let rotation = 0;
    if (keys["KeyA"] || keys["ArrowLeft"]) rotation -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) rotation += 1;
    player.angle += rotation * PLAYER_ROTATION_SPEED * (delta / 1000);
    player.dirX = Math.cos(player.angle);
    player.dirY = Math.sin(player.angle);
    
    // --- Logic tính tốc độ (Giữ nguyên) ---
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
        const totalSpeed = PLAYER_SPEED * speedModifier * moveDirection * (delta / 1000);
        moveX = player.dirX * totalSpeed;
        moveY = player.dirY * totalSpeed;
    }

    // ==========================================================
    // === SỬA LẠI LOGIC VA CHẠM (Theo code Python "chuẩn") ===
    // ==========================================================
    
    const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;

    // 1. CỨ DI CHUYỂN TRỤC X
    player.x += moveX;

    // 2. KIỂM TRA VÀ "SNAP" (KÉO) TRỤC X
    if (moveX > 0) { // Đang đi sang phải
        // Kiểm tra 2 góc phải của hitbox
        if (isBlocked(player.x + PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            
            // Tìm ô (cell) bị va chạm
            const wallCellX = Math.floor((player.x + PLAYER_BOX_HALF) / CELL_SIZE);
            // Kéo player về mép trái của ô đó
            player.x = (wallCellX * CELL_SIZE) - PLAYER_BOX_HALF - 0.01; // (trừ 0.01 để đảm bảo không bị kẹt)
        }
    } else if (moveX < 0) { // Đang đi sang trái
        // Kiểm tra 2 góc trái của hitbox
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x - PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            
            const wallCellX = Math.floor((player.x - PLAYER_BOX_HALF) / CELL_SIZE);
            // Kéo player về mép phải của ô đó
            player.x = (wallCellX * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
        }
    }

    // 3. CỨ DI CHUYỂN TRỤC Y
    player.y += moveY;

    // 4. KIỂM TRA VÀ "SNAP" (KÉO) TRỤC Y
    if (moveY > 0) { // Đang đi xuống
        // Kiểm tra 2 góc dưới
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {

            const wallCellY = Math.floor((player.y + PLAYER_BOX_HALF) / CELL_SIZE);
            // Kéo về mép trên của ô
            player.y = (wallCellY * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
        }
    } else if (moveY < 0) { // Đang đi lên
        // Kiểm tra 2 góc trên
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap)) {
            
            const wallCellY = Math.floor((player.y - PLAYER_BOX_HALF) / CELL_SIZE);
            // Kéo về mép dưới của ô
            player.y = (wallCellY * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
        }
    }

    // Giữ player trong màn hình (failsafe, giữ nguyên)
    player.x = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, player.x));
    player.y = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, player.y));

    // ==========================================================
    // === HẾT PHẦN SỬA VA CHẠM ===
    // ==========================================================

    // --- Logic bắn (Giữ nguyên) ---
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

    // --- Logic Bot, Đạn, v.v... (Giữ nguyên) ---
    bots.forEach(bot => bot.update(delta, player, bullets));
    bullets = bullets.filter(b => !b.remove);
    bullets.forEach(b => {
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
