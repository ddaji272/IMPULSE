// js/game.js

// 1. IMPORT
import {
    PLAYER_SPEED, BULLET_SPEED, SHOOT_COOLDOWN, PLAYER_RADIUS,
    BULLET_RADIUS, MAX_BULLET_BOUNCE, 
    BULLET_COLOR, 
    PLAYER_ROTATION_SPEED
} from "./config.js";

import { getRandomMap, isBlocked, CELL_SIZE, getMapCellType } from "./maps.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";
import { playSound } from "./audio.js";
import { saveGameResultAPI } from "./api.js"; 

// Biến theo dõi độ khó
let currentBotDifficulty = 0; 

// 2. EXPORT CÁC LỚP
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
        // Thêm vận tốc thực tế để Bot tính toán bắn đón đầu
        this.actualVx = 0; 
        this.actualVy = 0;
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

// === CẢI TIẾN TRÍ TUỆ BOT ===
export class Bot extends Player {
    constructor(name, x, y, skinData, difficulty = 0) {
        super(name, x, y, skinData, false);
        this.vx = 0;
        this.vy = 0;
        this.shootTimer = 0;
        this.moveTimer = 0;
        
        this.difficulty = difficulty;

        // Giới hạn tốc độ: Max 100% tốc độ người chơi
        this.speedCap = Math.min(1.0, 0.5 + (this.difficulty * 0.1)); 

        // Các kỹ năng trí tuệ
        this.hasLineOfSight = this.difficulty >= 2; // Level 2+ biết nhìn
        this.canPredictAim = this.difficulty >= 4;  // Level 4+ biết bắn đón đầu
        this.reactionTime = Math.max(200, 1000 - (this.difficulty * 150)); 
    }

    // Kiểm tra tầm nhìn (Raycasting)
    checkLineOfSight(player) {
        if (!player || !player.alive) return false;
        const steps = 20; 
        const dx = (player.x - this.x) / steps;
        const dy = (player.y - this.y) / steps;

        for (let i = 1; i < steps; i++) {
            const checkX = this.x + dx * i;
            const checkY = this.y + dy * i;
            if (isBlocked(checkX, checkY, currentMap)) return false;
        }
        return true;
    }

    collideWithWalls(moveX, moveY) {
        const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
        this.x += moveX;
        
        if (moveX > 0) { 
            if (isBlocked(this.x + PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellX = Math.floor((this.x + PLAYER_BOX_HALF) / CELL_SIZE);
                this.x = (wallCellX * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
                this.vx *= -1; 
            }
        } else if (moveX < 0) { 
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x - PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellX = Math.floor((this.x - PLAYER_BOX_HALF) / CELL_SIZE);
                this.x = (wallCellX * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
                this.vx *= -1; 
            }
        }

        this.y += moveY;
        
        if (moveY > 0) { 
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y + PLAYER_BOX_HALF, currentMap)) {
                const wallCellY = Math.floor((this.y + PLAYER_BOX_HALF) / CELL_SIZE);
                this.y = (wallCellY * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
                this.vy *= -1;
            }
        } else if (moveY < 0) { 
            if (isBlocked(this.x - PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap) || 
                isBlocked(this.x + PLAYER_BOX_HALF, this.y - PLAYER_BOX_HALF, currentMap)) {
                const wallCellY = Math.floor((this.y - PLAYER_BOX_HALF) / CELL_SIZE);
                this.y = (wallCellY * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
                this.vy *= -1;
            }
        }

        this.x = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, this.x));
        this.y = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, this.y));
    }

    update(delta, player, bullets) {
        if (!this.alive) return;

        let mapSpeedMod = 1;
        if (getMapCellType(this.x, this.y, currentMap) === 3) mapSpeedMod = 0.5;

        // --- 1. LOGIC DI CHUYỂN & NHẮM BẮN ---
        this.moveTimer += delta;
        
        if (this.moveTimer > this.reactionTime) {
            this.moveTimer = 0;
            const canSee = this.checkLineOfSight(player);

            if (player && player.alive) {
                // A. DI CHUYỂN
                if (this.difficulty < 2 || !canSee) {
                     // Bot Đần hoặc không thấy -> Đi lung tung
                     const dx = player.x - this.x;
                     const dy = player.y - this.y;
                     const noise = (5 - this.difficulty) * 0.3; 
                     this.vx = (dx / (Math.abs(dx)+Math.abs(dy))) + (Math.random() - 0.5) * noise;
                     this.vy = (dy / (Math.abs(dx)+Math.abs(dy))) + (Math.random() - 0.5) * noise;
                } 
                else {
                    // Bot Khôn -> Truy đuổi
                    const dx = player.x - this.x;
                    const dy = player.y - this.y;
                    const dist = Math.hypot(dx, dy);
                    
                    if (dist < CELL_SIZE * 3 && this.difficulty >= 3) {
                         this.vx = -dx / dist; // Kiting (lùi lại)
                         this.vy = -dy / dist;
                    } else {
                         this.vx = dx / dist; // Lao tới
                         this.vy = dy / dist;
                    }
                }

                // B. NHẮM BẮN
                let targetX = player.x;
                let targetY = player.y;

                // Bắn đón đầu (Predictive Aiming)
                if (this.canPredictAim && player.actualVx !== undefined) {
                    const dist = Math.hypot(player.x - this.x, player.y - this.y);
                    const timeToHit = dist / BULLET_SPEED;
                    targetX = player.x + (player.actualVx || 0) * timeToHit * 10;
                    targetY = player.y + (player.actualVy || 0) * timeToHit * 10;
                }

                const aimDx = targetX - this.x;
                const aimDy = targetY - this.y;
                this.angle = Math.atan2(aimDy, aimDx);
                this.dirX = Math.cos(this.angle);
                this.dirY = Math.sin(this.angle);

            } else {
                this.vx = (Math.random() * 2 - 1);
                this.vy = (Math.random() * 2 - 1);
            }
        }

        const currentSpeedLen = Math.hypot(this.vx, this.vy) || 1;
        this.vx = (this.vx / currentSpeedLen);
        this.vy = (this.vy / currentSpeedLen);

        const finalSpeed = PLAYER_SPEED * this.speedCap * mapSpeedMod * (delta / 1000);
        const moveX = this.vx * finalSpeed;
        const moveY = this.vy * finalSpeed;

        this.collideWithWalls(moveX, moveY);

        // --- 2. LOGIC KHAI HỎA ---
        this.shootTimer += delta;
        const botShootCooldown = Math.max(800, 2000 - (this.difficulty * 250)); 

        if (this.shootTimer > botShootCooldown && player && player.alive) {
            // Chỉ bắn khi thấy (nếu khôn) hoặc bắn bừa (nếu đần)
            if (!this.hasLineOfSight || this.checkLineOfSight(player)) {
                this.shootTimer = 0;
                const vx = this.dirX;
                const vy = this.dirY;
                const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
                playSound('shoot');
                bullets.push(new Bullet(this.x + vx * (PLAYER_BOX_HALF + 1), this.y + vy * (PLAYER_BOX_HALF + 1), vx, vy, this));
            }
        }
    }
}


// 3. BIẾN TRẠNG THÁI GAME
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
export function initGame(username, canvasEl) {
    canvas = canvasEl;
    gameOver = false;
    gameOverSoundPlayed = false;
    score = 0;
    bullets = [];
    bots = [];
    canShoot = true;
    
    currentBotDifficulty = 0; 

    currentMap = getRandomMap(canvas.width, canvas.height);
    const metaRaw = localStorage.getItem("impulse_user"); 

    let avatarId = "default";
    let bulletId = "default";

    if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        avatarId = meta.skin || "default"; 
        bulletId = meta.bullet || "default";
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
    // Spawn bot đầu tiên: Lv.0
    bots.push(new Bot("Bot Lv.0", botStartX, botStartY, botSkinData, 0));
}


// 5. HÀM UPDATE GAME
export function updateGame(delta, keys) {
    if (gameOver) return;

    // --- KIỂM TRA PLAYER CHẾT ---
    if (!player || !player.alive) {
        if (!gameOverSoundPlayed) {
            playSound('defeated');
            gameOverSoundPlayed = true;

            const savedUser = localStorage.getItem('impulse_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                // Tạm thời 1 điểm = 1 vàng để dễ test
                const goldEarned = Math.floor(score * 10); 
                console.log(`📡 Đang lưu điểm: Score ${score}, Gold +${goldEarned}`);

                saveGameResultAPI(user.username, score, goldEarned)
                    .then(data => {
                        console.log("✅ Server đã lưu:", data);
                        // Cập nhật lại localStorage để đồng bộ ngay lập tức
                        if (data.currentData) {
                            localStorage.setItem('impulse_user', JSON.stringify(data.currentData));
                        }
                    })
                    .catch(err => console.error("❌ Lỗi lưu điểm:", err));
            }
        }
        gameOver = true;
        return;
    }

    // --- Cập nhật Player ---
    let rotation = 0;
    if (keys["KeyA"] || keys["ArrowLeft"]) rotation -= 1;
    if (keys["KeyD"] || keys["ArrowRight"]) rotation += 1;
    player.angle += rotation * PLAYER_ROTATION_SPEED * (delta / 1000);
    player.dirX = Math.cos(player.angle);
    player.dirY = Math.sin(player.angle);
    
    let speedModifier = 1;
    if (getMapCellType(player.x, player.y, currentMap) === 3) speedModifier = 0.5;
    
    let moveDirection = 0;
    if (keys["KeyW"] || keys["ArrowUp"]) moveDirection = 1;
    if (keys["KeyS"] || keys["ArrowDown"]) moveDirection = -1;
    
    let moveX = 0;
    let moveY = 0;
    if (moveDirection !== 0) {
        const totalSpeed = PLAYER_SPEED * speedModifier * moveDirection * (delta / 1000);
        moveX = player.dirX * totalSpeed;
        moveY = player.dirY * totalSpeed;
        
        // Lưu vận tốc để Bot tính toán
        player.actualVx = moveX / (delta / 1000);
        player.actualVy = moveY / (delta / 1000);
    } else {
        player.actualVx = 0;
        player.actualVy = 0;
    }

    // Va chạm Player
    const PLAYER_BOX_HALF = PLAYER_RADIUS * 1.25;
    player.x += moveX;
    if (moveX > 0) { 
        if (isBlocked(player.x + PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            const wallCellX = Math.floor((player.x + PLAYER_BOX_HALF) / CELL_SIZE);
            player.x = (wallCellX * CELL_SIZE) - PLAYER_BOX_HALF - 0.01; 
        }
    } else if (moveX < 0) { 
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x - PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            const wallCellX = Math.floor((player.x - PLAYER_BOX_HALF) / CELL_SIZE);
            player.x = (wallCellX * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
        }
    }

    player.y += moveY;
    if (moveY > 0) { 
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y + PLAYER_BOX_HALF, currentMap)) {
            const wallCellY = Math.floor((player.y + PLAYER_BOX_HALF) / CELL_SIZE);
            player.y = (wallCellY * CELL_SIZE) - PLAYER_BOX_HALF - 0.01;
        }
    } else if (moveY < 0) { 
        if (isBlocked(player.x - PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap) || 
            isBlocked(player.x + PLAYER_BOX_HALF, player.y - PLAYER_BOX_HALF, currentMap)) {
            const wallCellY = Math.floor((player.y - PLAYER_BOX_HALF) / CELL_SIZE);
            player.y = (wallCellY * CELL_SIZE) + CELL_SIZE + PLAYER_BOX_HALF + 0.01;
        }
    }

    player.x = Math.max(PLAYER_BOX_HALF, Math.min(canvas.width - PLAYER_BOX_HALF, player.x));
    player.y = Math.max(PLAYER_BOX_HALF, Math.min(canvas.height - PLAYER_BOX_HALF, player.y));

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

    // --- Update Bots & Bullets ---
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
        
        if (currentMap.layout[r] && currentMap.layout[r][c] !== undefined) {
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
                if (currentMap.layout[r][c] <= 0) currentMap.layout[r][c] = 0;
                b.remove = true;
                bounced = false;
            }
        }
        
        if (b.x <= 0 || b.x >= canvas.width) { b.vx *= -1; bounced = true; playSound('bounced'); }
        if (b.y <= 0 || b.y >= canvas.height) { b.vy *= -1; bounced = true; playSound('bounced'); }
        if (bounced) b.bounceCount++;
        if (b.bounceCount > MAX_BULLET_BOUNCE) b.remove = true;

        if (player.alive) {
            if (b.x > player.x - PLAYER_BOX_HALF && b.x < player.x + PLAYER_BOX_HALF &&
                b.y > player.y - PLAYER_BOX_HALF && b.y < player.y + PLAYER_BOX_HALF) {
                playSound('hitted');
                player.alive = false; 
                b.remove = true;
            }
        }

        if (!b.remove) {
            bots.forEach(bot => {
                if (bot.alive) {
                    if (b.owner !== bot || b.bounceCount > 0) {
                        if (b.x > bot.x - PLAYER_BOX_HALF && b.x < bot.x + PLAYER_BOX_HALF &&
                            b.y > bot.y - PLAYER_BOX_HALF && b.y < bot.y + PLAYER_BOX_HALF) {
                            playSound('hitted');
                            bot.alive = false;
                            b.remove = true;
                            score++;
                            playSound('victory');
                        }
                    }
                }
            });
        }
    });

    bots = bots.filter(bot => bot.alive);
    if (bots.length === 0 && !gameOver) {
        // Tăng độ khó khi Bot chết
        currentBotDifficulty++; 

        let botX, botY;
        do {
            botX = Math.floor(Math.random() * (currentMap.layout[0].length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
            botY = Math.floor(Math.random() * (currentMap.layout.length - 2) + 1) * CELL_SIZE + CELL_SIZE / 2;
        } while (isBlocked(botX, botY, currentMap) ||
            (player && Math.hypot(player.x - botX, player.y - botY) < CELL_SIZE * 5));
        
        bots.push(new Bot(`Bot Lv.${currentBotDifficulty}`, botX, botY, AVATAR_SKINS["ava_tank_red"] || AVATAR_SKINS["default"], currentBotDifficulty));
        console.log(`Spawn Bot Level ${currentBotDifficulty}`);
    }
}

