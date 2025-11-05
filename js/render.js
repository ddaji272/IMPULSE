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
    ctx.fillStyle = CANVAS_BG_COLOR;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vẽ Map (vẽ tường trước)
    if (currentMap) {
        drawMap(ctx, currentMap);
    }
    
    // Vẽ đạn
    bullets.forEach(drawBullet);
    
    // Vẽ Bot
    bots.forEach(drawPlayer); // Dùng chung hàm drawPlayer cho cả Bot và Player

    // Vẽ người chơi
    if (player) {
        drawPlayer(player);
    }

    // Vẽ điểm số
    ctx.font = "24px Poppins";
    ctx.textAlign = "left";
    ctx.fillStyle = "white";
    ctx.fillText(`Điểm: ${score}`, 20, 40);
}

// Hàm nội bộ để vẽ Player (hoặc Bot)
function drawPlayer(p) {
    if (!p.alive) return;
    if (p.isLocal) {
        ctx.fillStyle = playerSkin.avatar; // <-- SỬ DỤNG SKIN
    } else {
        ctx.fillStyle = "red"; // Bot màu đỏ
    }
    // Vẽ thân
    ctx.beginPath();
    ctx.arc(p.x, p.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fill();

    // Vẽ hướng nhìn
    const dirLength = PLAYER_RADIUS + 5;
    const dirX = p.x + p.dirX * dirLength;
    const dirY = p.y + p.dirY * dirLength;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(dirX, dirY);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.stroke();

    // Vẽ tên
    ctx.font = "14px Poppins";
    ctx.textAlign = "center";
    ctx.fillStyle = "white";
    ctx.fillText(p.name, p.x, p.y - PLAYER_RADIUS - 5);
}

// Hàm nội bộ để vẽ đạn
function drawBullet(b) {
    if (b.owner && b.owner.isLocal) {
        ctx.fillStyle = playerSkin.bullet; // <-- SỬ DỤNG SKIN
    } else if (b.owner && !b.owner.isLocal) {
        ctx.fillStyle = "orange"; // Đạn của Bot
    } else {
        ctx.fillStyle = BULLET_COLOR; // Đạn linh tinh
    }
    ctx.beginPath();
    ctx.arc(b.x, b.y, BULLET_RADIUS, 0, Math.PI * 2);
    ctx.fill();
}

// 5. EXPORT hàm vẽ màn hình Game Over
export function drawGameOver() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // Làm mờ nền
    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Chữ Game Over
    ctx.font = "72px Impact, sans-serif";
    ctx.textAlign = "center";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", centerX, centerY - 50);

    // Điểm số
    ctx.font = "32px Poppins";
    ctx.fillStyle = "white";
    ctx.fillText(`Điểm số: ${score}`, centerX, centerY);

    // Nút Chơi lại
    replayButton.x = centerX - replayButton.w / 2;
    replayButton.y = centerY + 50;
    ctx.fillStyle = "#00bfa5";
    ctx.fillRect(replayButton.x, replayButton.y, replayButton.w, replayButton.h);
    ctx.font = "24px Poppins";
    ctx.fillStyle = "white";
    ctx.fillText("Chơi Lại", centerX, replayButton.y + replayButton.h / 2 + 8);

    // Nút Về Menu
    homeButton.x = centerX - homeButton.w / 2;
    homeButton.y = replayButton.y + replayButton.h + 20;
    ctx.fillStyle = "#3498db";
    ctx.fillRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h);
    ctx.fillStyle = "white";
    ctx.fillText("Về Menu", centerX, homeButton.y + homeButton.h / 2 + 8);
}