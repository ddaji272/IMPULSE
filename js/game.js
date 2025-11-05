// js/game.js

// 1. IMPORT các hằng số và logic map
import {
    PLAYER_SPEED,
    BULLET_SPEED,
    SHOOT_COOLDOWN,
    PLAYER_RADIUS,
    BULLET_RADIUS,
    MAX_BULLET_BOUNCE,
    PLAYER_COLOR,
    BULLET_COLOR
} from "./config.js";

// THÊM "getMapCellType" vào import
import { getRandomMap, isBlocked, CELL_SIZE, getMapCellType } from "./maps.js";

// 2. EXPORT các Lớp (Class)
export class Player {
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

        // === LOGIC TỐC ĐỘ CỦA BOT ===
        let speedModifier = 1; 
        const botCellType = getMapCellType(this.x, this.y, currentMap);
        if (botCellType === 3) {
            speedModifier = 0.5; // Giảm 50% tốc độ
        }
        // =========================

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

        // Áp dụng tốc độ đã điều chỉnh
        const nextX = this.x + this.vx * PLAYER_SPEED * 0.8 * speedModifier; 
        const nextY = this.y + this.vy * PLAYER_SPEED * 0.8 * speedModifier;

        // Va chạm (giữ nguyên)
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

        // Logic bắn (giữ nguyên)
        this.shootTimer += delta;
        if (this.shootTimer > 900 && player && player.alive) { 
            this.shootTimer = 0;
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            const len = Math.hypot(dx, dy) || 1;
            const vx = dx / len;
            const vy = dy / len;
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

// 4. EXPORT hàm khởi tạo game (Giữ nguyên)
export function initGame(username, canvasEl) {
    canvas = canvasEl;
    gameOver = false;
    score = 0;
    bullets = [];
    bots = [];
    canShoot = true;

    currentMap = getRandomMap(canvas.width, canvas.height);
    const metaRaw = localStorage.getItem("user_" + username);
    let currentAvatar = PLAYER_COLOR;
    let currentBullet = BULLET_COLOR;
    if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        if (meta.currentAvatar === "ava_blue") {
            currentAvatar = "blue";
        } else if (meta.currentAvatar === "ava_red") {
            currentAvatar = "red";
        } else {
            currentAvatar = PLAYER_COLOR;
        }
        if (meta.currentBullet === "bul_yellow") {
            currentBullet = "yellow";
        } else if (meta.currentBullet === "bul_purple") {
            currentBullet = "purple";
        } else {
            currentBullet = BULLET_COLOR;
        }
    } else {
        currentAvatar = PLAYER_COLOR;
        currentBullet = BULLET_COLOR;
    }
    playerSkin.avatar = currentAvatar;
    playerSkin.bullet = currentBullet;

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

// 5. EXPORT hàm cập nhật
export function updateGame(delta, keys) {
    if (gameOver) return;
    if (!player || !player.alive) {
        gameOver = true;
        return;
    }

    // === LOGIC TỐC ĐỘ CỦA PLAYER ===
    let speedModifier = 1; 
    const playerCellType = getMapCellType(player.x, player.y, currentMap);
    if (playerCellType === 3) {
        speedModifier = 0.5; // Giảm 50% tốc độ
    }
    // =============================

    // --- 1. Cập nhật di chuyển người chơi ---
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
        
        // Áp dụng tốc độ đã điều chỉnh
        const moveX = dx * PLAYER_SPEED * speedModifier;
        const moveY = dy * PLAYER_SPEED * speedModifier;
        
        const nextX = player.x + moveX;
        const nextY = player.y + moveY;

        // Va chạm biên Player
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

        // === LOGIC VA CHẠM TƯỜNG CỦA ĐẠN (Đã sửa) ===
        const c = Math.floor(b.x / CELL_SIZE);
        const r = Math.floor(b.y / CELL_SIZE);
        
        // Cần kiểm tra r và c có hợp lệ không
        if (!currentMap.layout[r] || currentMap.layout[r][c] === undefined) {
             // Va chạm biên (logic cũ sẽ xử lý)
        } else {
             const cellValue = currentMap.layout[r][c];
            
             if (cellValue === 1) { 
                // Tường CỨNG (1): Đạn nảy
                b.vx *= -1; 
                b.vy *= -1; 
                bounced = true; 
             } else if (cellValue === 5 || cellValue === 4) { // **ĐÃ SỬA: Kiểm tra 5 (HP=2) hoặc 4 (HP=1)**
                // Tường PHÁ HỦY (5 hoặc 4): Giảm độ bền
                currentMap.layout[r][c] -= 1; // Giảm độ bền đi 1
                
                if (currentMap.layout[r][c] <= 0) {
                    // Bị phá hủy hoàn toàn
                    currentMap.layout[r][c] = 0; // Biến ô thành không gian trống
                }
                
                b.remove = true; // Xóa viên đạn (luôn bị xóa sau khi bắn tường)
                bounced = false; 
             }
        }
        // ===========================================

        // Va chạm biên Canvas (giữ nguyên)
        if (b.x <= 0 || b.x >= canvas.width) { b.vx *= -1; bounced = true; }
        if (b.y <= 0 || b.y >= canvas.height) { b.vy *= -1; bounced = true; }
        
        if (bounced) b.bounceCount++;
        if (b.bounceCount > MAX_BULLET_BOUNCE) b.remove = true;

        // Va chạm Đạn với Player (Tự sát)
        if (player.alive) { 
            const dist = Math.hypot(b.x - player.x, b.y - player.y);
            if (dist < PLAYER_RADIUS + BULLET_RADIUS) {
                player.alive = false;
                gameOver = true;
                b.remove = true;
            }
        }
        
        // Va chạm Đạn với Bot
        bots.forEach(bot => {
            if (bot.alive && b.owner !== bot) { 
                const dist = Math.hypot(b.x - bot.x, b.y - bot.y);
                if (dist < PLAYER_RADIUS + BULLET_RADIUS) {
                    bot.alive = false;
                    b.remove = true;
                    score++;
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