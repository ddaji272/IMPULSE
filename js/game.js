// js/game.js

// 1. IMPORT
import {
    PLAYER_SPEED, BULLET_SPEED, SHOOT_COOLDOWN, PLAYER_RADIUS, 
    BULLET_RADIUS, MAX_BULLET_BOUNCE, PLAYER_COLOR, BULLET_COLOR
} from "./config.js";

import { getRandomMap, isBlocked, CELL_SIZE, getMapCellType } from "./maps.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";

// THÊM IMPORT ÂM THANH
import { playSound } from "./audio.js";


// 2. EXPORT các Lớp (Class)
export class Player {
    // ... (Không thay đổi) ...
    constructor(name, x, y, isLocal = true) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.dirX = 0;
        this.dirY = -1;
        this.alive = true;
        this.isLocal = isLocal;
    }
}

export class Bullet {
    // ... (Không thay đổi) ...
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
    constructor(name, x, y) {
        super(name, x, y, false); 
        this.vx = 0;
        this.vy = 0;
        this.shootTimer = 0;
        this.moveTimer = 0;
    }

    update(delta, player, bullets) {
        if (!this.alive) return;

        // ... (Logic di chuyển của Bot không thay đổi) ...
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
        }
        const nextX = this.x + this.vx * PLAYER_SPEED * 0.8 * speedModifier; 
        const nextY = this.y + this.vy * PLAYER_SPEED * 0.8 * speedModifier;
        const newBotX = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, nextX));
        if (!isBlocked(newBotX + (this.vx > 0 ? PLAYER_RADIUS : -PLAYER_RADIUS), this.y, currentMap)) {
            this.x = newBotX;
        } else {
            this.vx *= -1;
        }
        const newBotY = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, nextY));
        if (!isBlocked(this.x, newBotY + (this.vy > 0 ? PLAYER_RADIUS : -PLAYER_RADIUS), currentMap)) {
            this.y = newBotY;
        } else {
            this.vy *= -1;
        }

        // Logic bắn của Bot (THÊM ÂM THANH)
        this.shootTimer += delta;
        if (this.shootTimer > 900 && player && player.alive) { 
            this.shootTimer = 0;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const len = Math.hypot(dx, dy) || 1;
            const vx = dx / len;
            const vy = dy / len;
            
            playSound('shoot'); // <-- THÊM ÂM THANH BẮN (BOT)
            
            bullets.push(new Bullet(this.x + vx * 25, this.y + vy * 25, vx, vy, this));
        }
    }
}

// 3. EXPORT các biến trạng thái game
export let player = null;
export let bots = [];
export let bullets = [];
export let gameOver = false;
export let score = 0;
export let canShoot = true;
export let currentMap = null; 
export let playerSkin = { 
    avatar: PLAYER_COLOR, 
    bullet: BULLET_COLOR 
};
let canvas = null; 

// THÊM CỜ ĐỂ TRÁNH PHÁT ÂM THANH 'defeated' NHIỀU LẦN
export let gameOverSoundPlayed = false;

// 4. EXPORT hàm khởi tạo game
export function initGame(username, canvasEl) {
    canvas = canvasEl;
    gameOver = false;
    gameOverSoundPlayed = false; // <-- RESET CỜ ÂM THANH
    score = 0;
    bullets = [];
    bots = [];
    canShoot = true;

    // ... (Phần còn lại của initGame giữ nguyên) ...
    currentMap = getRandomMap(canvas.width, canvas.height);
    const metaRaw = localStorage.getItem("user_" + username);
    
    let avatarId = "default";
    let bulletId = "default";

    if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        avatarId = meta.currentAvatar || "default";
        bulletId = meta.currentBullet || "default";
    }
    
    const avatarSkinData = AVATAR_SKINS[avatarId] || AVATAR_SKINS.default;
    const bulletSkinData = BULLET_SKINS[bulletId] || BULLET_SKINS.default;

    playerSkin.avatar = avatarSkinData.color;
    playerSkin.bullet = bulletSkinData.color;
    
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
    
    player = new Player(username, playerStartX, playerStartY);
    bots.push(new Bot("Bot 1", botStartX, botStartY));
}

// 5. EXPORT hàm cập nhật (updateGame)
export function updateGame(delta, keys) {
    if (gameOver) return;
    if (!player || !player.alive) {
        // XỬ LÝ ÂM THANH KHI THUA (Chỉ 1 lần)
        if (!gameOverSoundPlayed) {
            playSound('defeated');
            gameOverSoundPlayed = true;
        }
        gameOver = true;
        return;
    }

    // ... (Logic di chuyển của Player không thay đổi) ...
    let speedModifier = 1; 
    const playerCellType = getMapCellType(player.x, player.y, currentMap);
    if (playerCellType === 3) {
        speedModifier = 0.5;
    }
    let dx = 0, dy = 0;
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;
    if (dx || dy) {
        const len = Math.hypot(dx, dy);
        dx /= len; dy /= len;
        player.dirX = dx;
        player.dirY = dy;
        
        const moveX = dx * PLAYER_SPEED * speedModifier;
        const moveY = dy * PLAYER_SPEED * speedModifier;
        
        const nextX = player.x + moveX;
        const nextY = player.y + moveY;

        const newPlayerX = Math.max(PLAYER_RADIUS, Math.min(canvas.width - PLAYER_RADIUS, nextX));
        if (!isBlocked(newPlayerX + (dx > 0 ? PLAYER_RADIUS : -PLAYER_RADIUS), player.y, currentMap)) {
             player.x = newPlayerX;
        }
        const newPlayerY = Math.max(PLAYER_RADIUS, Math.min(canvas.height - PLAYER_RADIUS, nextY));
        if (!isBlocked(player.x, newPlayerY + (dy > 0 ? PLAYER_RADIUS : -PLAYER_RADIUS), currentMap)) {
             player.y = newPlayerY;
        }
    }
    
    // --- 2. Cập nhật bắn đạn (Player) ---
    if (keys[" "]) { 
        if (canShoot) {
            canShoot = false;
            playSound('shoot'); // <-- THÊM ÂM THANH BẮN (PLAYER)
            
            setTimeout(() => canShoot = true, SHOOT_COOLDOWN);
            const vx = player.dirX;
            const vy = player.dirY;
            const bulletX = player.x + vx * PLAYER_RADIUS * 1.25;
            const bulletY = player.y + vy * PLAYER_RADIUS * 1.25;
            bullets.push(new Bullet(bulletX, bulletY, vx, vy, player));
        }
    }

    // --- 3. Cập nhật Bot ---
    bots.forEach(bot => bot.update(delta, player, bullets));

    // --- 4. Cập nhật đạn và va chạm ---
    bullets = bullets.filter(b => !b.remove);
    bullets.forEach(b => {
        b.x += b.vx * BULLET_SPEED;
        b.y += b.vy * BULLET_SPEED;
        let bounced = false;

        const c = Math.floor(b.x / CELL_SIZE);
        const r = Math.floor(b.y / CELL_SIZE);
        
        if (!currentMap.layout[r] || currentMap.layout[r][c] === undefined) {
             // Va chạm biên (sẽ được xử lý bên dưới)
        } else {
            const cellValue = currentMap.layout[r][c];
            
            if (cellValue === 1) { 
                // Tường cứng
                b.vx *= -1; 
                b.vy *= -1; 
                bounced = true; 
                playSound('bounced'); // <-- ÂM THANH DỘI TƯỜNG
            } else if (cellValue === 5 || cellValue === 4) { 
                // Tường vỡ
                playSound('wall_crack'); // <-- ÂM THANH TƯỜNG NỨT
                currentMap.layout[r][c] -= 1; 
                if (currentMap.layout[r][c] <= 0) {
                    currentMap.layout[r][c] = 0;
                }
                b.remove = true;
                bounced = false; 
            }
        }

        // Va chạm biên Canvas
        if (b.x <= 0 || b.x >= canvas.width) { 
            b.vx *= -1; 
            bounced = true; 
            playSound('bounced'); // <-- ÂM THANH DỘI BIÊN
        }
        if (b.y <= 0 || b.y >= canvas.height) { 
            b.vy *= -1; 
            bounced = true; 
            playSound('bounced'); // <-- ÂM THANH DỘI BIÊN
        }
        
        if (bounced) b.bounceCount++;
        if (b.bounceCount > MAX_BULLET_BOUNCE) b.remove = true;

        // Va chạm (Player)
        if (player.alive) { 
            const dist = Math.hypot(b.x - player.x, b.y - player.y);
            if (dist < PLAYER_RADIUS + BULLET_RADIUS) {
                playSound('hitted'); // <-- ÂM THANH TRÚNG ĐẠN
                player.alive = false;
                // 'gameOver' và âm thanh 'defeated' sẽ được xử lý ở đầu vòng lặp tiếp theo
                b.remove = true;
            }
        }
        
        // Va chạm (Bot)
        bots.forEach(bot => {
            if (bot.alive && b.owner !== bot) { 
                const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
                if (dist < PLAYER_RADIUS + BULLET_RADIUS) {
                    playSound('hitted'); // <-- ÂM THANH TRÚNG ĐẠN
                    bot.alive = false;
                    b.remove = true;
                    score++;
                    playSound('victory'); // <-- ÂM THANH KHI GIẾT ĐƯỢC BOT
                }
            }
        });
    });

    // --- 5. Dọn dẹp và tạo Bot mới ---
    bots = bots.filter(bot => bot.alive); 
    if (bots.length === 0 && !gameOver) {
        let botX, botY;
        do {
            botX = Math.floor(Math.random() * (currentMap.layout[0].length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
            botY = Math.floor(Math.random() * (currentMap.layout.length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
        } while (isBlocked(botX, botY, currentMap) || 
                     (player && Math.hypot(player.x - botX, player.y - botY) < CELL_SIZE * 5)); 

        bots.push(new Bot("Bot " + (score + 1), botX, botY));
    }
}
