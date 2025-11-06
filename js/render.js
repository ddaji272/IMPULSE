// js/render.js

// 1. IMPORT cấu hình, trạng thái game, và logic vẽ map
import { 
    PLAYER_COLOR, BULLET_COLOR, PLAYER_RADIUS, BULLET_RADIUS, 
    CANVAS_BG_COLOR, REPLAY_BTN 
} from "./config.js";
import { player, bots,playerSkin, bullets, score, currentMap } from "./game.js";
import { drawMap } from "./maps.js";

let canvas = null;
let ctx = null;

// 2. EXPORT các nút để main.js có thể đọc vị trí click
export let replayButton = { x: 0, y: 0, w: REPLAY_BTN.w, h: REPLAY_BTN.h };
export let homeButton = { x: 0, y: 0, w: REPLAY_BTN.w, h: REPLAY_BTN.h };

// 3. EXPORT hàm khởi tạo canvas
export function initCanvas(canvasEl) {
    canvas = canvasEl;
    ctx = canvas.getContext("2d");
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas); // Tự động resize khi cửa sổ thay đổi
}

function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 4. EXPORT hàm vẽ chính (draw loop)
export function draw() {
    if (!ctx) return;
    
    // Xóa màn hình
    ctx.fillStyle = CANVAS_BG_COLOR; // Giả định CANVAS_BG_COLOR là màu đen
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vẽ Map (vẽ tường trước)
    if (currentMap) {
        drawMap(ctx, currentMap);
    }
    
    // Vẽ đạn
    bullets.forEach(drawBullet);
    
    // Vẽ Bot
    bots.forEach(drawPlayer); 

    // Vẽ người chơi
    if (player) {
        drawPlayer(player);
    }

    // Vẽ điểm số (Thêm hiệu ứng Neon cho text)
    // SỬA: Thay đổi font chữ và thêm text shadow
    ctx.font = "bold 24px 'Rajdhani', sans-serif"; // Dùng font Rajdhani
    ctx.textAlign = "left";
    ctx.fillStyle = "#00ffff"; // Màu Xanh Neon
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; // Hiệu ứng phát sáng
    ctx.fillText(`ĐIỂM: ${score}`, 20, 40);
    ctx.shadowBlur = 0; // Tắt shadow để không ảnh hưởng đến các đối tượng khác
}

// Hàm nội bộ để vẽ Player (hoặc Bot)
function drawPlayer(p) {
    if (!p.alive) return;
    
    // 1. Vẽ thân (Thêm hiệu ứng Glow)
    if (p.isLocal) {
        ctx.fillStyle = playerSkin.avatar; 
        ctx.shadowColor = playerSkin.avatar; // Tạo bóng màu của skin
    } else {
        ctx.fillStyle = "red"; // Bot màu đỏ
        ctx.shadowColor = "red";
    }
    
    ctx.shadowBlur = 15; // Glow mạnh hơn cho Player/Bot
    
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // 2. Vẽ hướng nhìn
    // Giữ nguyên màu trắng, nhưng thêm glow
    const dirLength = PLAYER_RADIUS + 5;
    const dirX = p.x + p.dirX * dirLength;
    const dirY = p.y + p.dirY * dirLength;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(dirX, dirY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
    
    ctx.shadowBlur = 0; // Tắt glow sau khi vẽ thân

    // 3. Vẽ tên
    // SỬA: Dùng font Rajdhani và màu neon
    ctx.font = "14px 'Rajdhani', sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff00ff"; // Màu Hồng Neon
    ctx.fillText(p.name, p.x, p.y - PLAYER_RADIUS - 5);
}

// Hàm nội bộ để vẽ đạn
function drawBullet(b) {
    let bulletColor = BULLET_COLOR;
    if (b.owner && b.owner.isLocal) {
        bulletColor = playerSkin.bullet; 
    } else if (b.owner && !b.owner.isLocal) {
        bulletColor = "orange"; 
    }
    
    ctx.fillStyle = bulletColor; 
    ctx.shadowColor = bulletColor;
    ctx.shadowBlur = 10; // Đạn phát sáng

    ctx.beginPath();
    ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.shadowBlur = 0; // Tắt glow
}

// 5. EXPORT hàm vẽ màn hình Game Over
export function drawGameOver() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Làm mờ nền (giữ nguyên)
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 1. Chữ Game Over (SỬA LỚN)
    ctx.font = "bold 96px 'Orbitron', sans-serif"; // Font mạnh mẽ
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff005c"; // Màu Đỏ Neon
    ctx.shadowColor = "#ff005c";
    ctx.shadowBlur = 20; // Glow mạnh
    ctx.fillText("GAME OVER", centerX, centerY - 80);
    ctx.shadowBlur = 0; // Tắt shadow

    // 2. Điểm số
    ctx.font = "32px 'Rajdhani', sans-serif";
    ctx.fillStyle = "#00ffff"; // Màu Xanh Neon
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; 
    ctx.fillText(`ĐIỂM SỐ: ${score}`, centerX, centerY - 20);
    ctx.shadowBlur = 0; 
    
    // 3. Nút Chơi lại (SỬA LỚN)
    replayButton.x = centerX - replayButton.w / 2;
    replayButton.y = centerY + 50;
    
    // Hiệu ứng và màu sắc nút Chơi Lại (Xanh)
    ctx.shadowColor = "#00ffff";
    ctx.shadowBlur = 10; 
    ctx.fillStyle = "rgba(0, 255, 255, 0.2)"; // Nền mờ
    ctx.fillRect(replayButton.x, replayButton.y, replayButton.w, replayButton.h);
    
    ctx.shadowBlur = 0; 
    ctx.strokeStyle = "#00ffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(replayButton.x, replayButton.y, replayButton.w, replayButton.h); // Viền Neon
    
    ctx.font = "bold 24px 'Rajdhani', sans-serif";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("CHƠI LẠI", centerX, replayButton.y + replayButton.h / 2 + 8);

    // 4. Nút Về Menu (SỬA LỚN)
    homeButton.x = centerX - homeButton.w / 2;
    homeButton.y = replayButton.y + replayButton.h + 20;
    
    // Hiệu ứng và màu sắc nút Về Menu (Tím/Hồng)
    ctx.shadowColor = "#ff00ff";
    ctx.shadowBlur = 10; 
    ctx.fillStyle = "rgba(255, 0, 255, 0.2)"; // Nền mờ
    ctx.fillRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h);
    
    ctx.shadowBlur = 0; 
    ctx.strokeStyle = "#ff00ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h); // Viền Neon
    
    ctx.fillStyle = "#ff00ff";
    ctx.fillText("VỀ MENU", centerX, homeButton.y + homeButton.h / 2 + 8);
}
