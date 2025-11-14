// js/render.js

// 1. IMPORT
import { 
    PLAYER_COLOR, BULLET_COLOR, PLAYER_RADIUS, BULLET_RADIUS, 
    CANVAS_BG_COLOR, REPLAY_BTN 
} from "./config.js";
// --- SỬA: Import 'BULLET_SKINS' ---
import { player, bots, playerSkin, bullets, score, currentMap } from "./game.js";
import { BULLET_SKINS } from "./skins.js"; 
import { drawMap } from "./maps.js";

// --- THÊM MỚI: Import ảnh đã tải ---
import { loadedSkins, AVATAR_SKINS } from "./skins.js";

let canvas = null;
let ctx = null;

export let replayButton = { x: 0, y: 0, w: REPLAY_BTN.w, h: REPLAY_BTN.h };
export let homeButton = { x: 0, y: 0, w: REPLAY_BTN.w, h: REPLAY_BTN.h };

export function initCanvas(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas); 
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

export function draw() {
    if (!ctx) return;
    
    ctx.fillStyle = CANVAS_BG_COLOR; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (currentMap) {
        drawMap(ctx, currentMap);
    }
    
    bullets.forEach(drawBullet);
    bots.forEach(drawPlayer); 

    if (player) {
        drawPlayer(player);
    }

    ctx.font = "bold 24px 'Rajdhani', sans-serif"; 
    ctx.textAlign = "left";
    ctx.fillStyle = "#00ffff"; 
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; 
    ctx.fillText(`ĐIỂM: ${score}`, 20, 40);
    ctx.shadowBlur = 0; 
}

// --- SỬA LỚN: Hàm drawPlayer ---
function drawPlayer(p) {
    if (!p.alive) return;
    
    // --- BẮT ĐẦU VẼ ---
    // Kiểm tra xem skin có phải là ảnh không
    if (p.skin && p.skin.type === "image") {
        // 1. LẤY ẢNH ĐÃ TẢI
        const img = loadedSkins[p.skin.data];
        
        if (!img) {
            drawPlayerAsCircle(p); // Vẽ tạm hình tròn
            return;
        }
        
        // 2. TÍNH TOÁN KÍCH THƯỚC
        const w = PLAYER_RADIUS * 2.5;
        const h = PLAYER_RADIUS * 2.5;
        
        // 3. LOGIC XOAY ẢNH
        ctx.save(); 
        ctx.translate(p.x, p.y);
        
        // Quan trọng: Giả định ảnh xe tăng HƯỚNG LÊN TRÊN.
        // Xoay thêm 90 độ (Math.PI / 2)
        ctx.rotate(p.angle - Math.PI / 2); 
        
        ctx.shadowColor = p.isLocal ? (AVATAR_SKINS["ava_tank_blue"] ? AVATAR_SKINS["ava_tank_blue"].data : "#00ffff") : (AVATAR_SKINS["ava_tank_red"] ? AVATAR_SKINS["ava_tank_red"].data : "red");
        ctx.shadowBlur = 15;
        
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
        
        ctx.restore(); 
        ctx.shadowBlur = 0; 

    } else {
        // --- VẼ HÌNH TRÒN (Logic cũ) ---
        drawPlayerAsCircle(p);
    }

    // 4. VẼ TÊN (Đẩy tên lên cao hơn)
    ctx.font = "14px 'Rajdhani', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff00ff"; 
    ctx.fillText(p.name, p.x, p.y - PLAYER_RADIUS - 15); // <-- Sửa y
}

// --- THÊM MỚI: Tách logic vẽ hình tròn ra hàm riêng ---
function drawPlayerAsCircle(p) {
    // 1. Vẽ thân
    // Lấy màu từ 'p.skin.data' nếu là skin màu
    if (p.skin && p.skin.type === "color") {
        ctx.fillStyle = p.skin.data; 
        ctx.shadowColor = p.skin.data;
    } else {
        // Failsafe
        ctx.fillStyle = p.isLocal ? PLAYER_COLOR : "red"; 
        ctx.shadowColor = p.isLocal ? PLAYER_COLOR : "red";
    }
    
    ctx.shadowBlur = 15; 
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 2. Vẽ hướng nhìn
    const dirLength = PLAYER_RADIUS + 5;
    const dirX = p.x + p.dirX * dirLength;
    const dirY = p.y + p.dirY * dirLength;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(dirX, dirY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    
    ctx.shadowBlur = 0; 
}


// --- SỬA: Hàm vẽ đạn để dùng .data ---
function drawBullet(b) {
    let bulletColor = BULLET_SKINS["default"].data; // Mặc định

    if (b.owner && b.owner.isLocal) {
        bulletColor = playerSkin.bullet; // Biến này đã được gán đúng trong game.js
    } else if (b.owner && !b.owner.isLocal) {
        bulletColor = "orange"; 
    }
    
    ctx.fillStyle = bulletColor; 
    ctx.shadowColor = bulletColor;
    ctx.shadowBlur = 10; 

    ctx.beginPath();
    ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; 
}

// 5. EXPORT hàm vẽ màn hình Game Over (Giữ nguyên)
export function drawGameOver() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "bold 96px 'Orbitron', sans-serif"; 
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff005c"; 
    ctx.shadowColor = "#ff005c";
    ctx.shadowBlur = 20; 
    ctx.fillText("GAME OVER", centerX, centerY - 80);
    ctx.shadowBlur = 0; 

    ctx.font = "32px 'Rajdhani', sans-serif";
    ctx.fillStyle = "#00ffff"; 
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; 
    ctx.fillText(`ĐIỂM SỐ: ${score}`, centerX, centerY - 20);
    ctx.shadowBlur = 0; 
    
    replayButton.x = centerX - replayButton.w / 2;
    replayButton.y = centerY + 50;
    
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; 
    ctx.fillStyle = "rgba(0, 255, 255, 0.2)"; 
    ctx.fillRect(replayButton.x, replayButton.y, replayButton.w, replayButton.h);
    
    ctx.shadowBlur = 0; 
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(replayButton.x, replayButton.y, replayButton.w, replayButton.h); 
    
    ctx.font = "bold 24px 'Rajdhani', sans-serif";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("CHƠI LẠI", centerX, replayButton.y + replayButton.h / 2 + 8);

    homeButton.x = centerX - homeButton.w / 2;
    homeButton.y = replayButton.y + replayButton.h + 20;
    
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 10; 
    ctx.fillStyle = "rgba(255, 0, 255, 0.2)"; 
    ctx.fillRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h);
    
    ctx.shadowBlur = 0; 
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h); 
    
    ctx.fillStyle = "#ff00ff";
    ctx.fillText("VỀ MENU", centerX, homeButton.y + homeButton.h / 2 + 8);
}
