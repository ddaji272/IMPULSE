// js/main.js

// 1. IMPORT tất cả các module cần thiết
import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player } from "./game.js";

// 2. Lấy DOM elements chính
const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");

let lastTime = 0;
let animationFrameId = null; // Để dừng game loop khi Game Over

// 3. Vòng lặp game (Game Loop)
function gameLoop(now) {
    const delta = now - lastTime;
    lastTime = now;

    // Cập nhật logic game (truyền delta time và trạng thái phím)
    updateGame(delta, keys);

    // Vẽ mọi thứ
    draw();

    // Kiểm tra game over
    if (gameOver) {
        drawGameOver(); // Vẽ màn hình game over
        cancelAnimationFrame(animationFrameId); // Dừng vòng lặp
    } else {
        // Tiếp tục vòng lặp
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// 4. Hàm Bắt đầu game (sẽ được truyền vào ui.js)
function startGame(playerName) {
    // Ẩn menu, hiện canvas
    homeEl.style.display = "none";
    menuEl.style.display = "none";
    canvasEl.style.display = "block";
    
    // Khởi tạo tất cả trạng thái game
    initGame(playerName, canvasEl);
    
    // Bắt đầu vòng lặp game
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 5. Hàm quay về Menu (từ màn hình Game Over)
function goToMenu() {
    canvasEl.style.display = "none";
    
    // Kiểm tra xem đã đăng nhập hay chưa (dựa vào nội dung userDisplay)
    const loggedUser = document.getElementById("userDisplay").textContent;
    if (loggedUser && loggedUser.trim() !== "") {
        menuEl.style.display = "block"; // Hiện menu chính
    } else {
        homeEl.style.display = "block"; // Hiện màn hình đăng nhập
    }
}

// 6. --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener("DOMContentLoaded", () => {
    
    // --- SỬA LỖI HIỂN THỊ ---
    // Đảm bảo trạng thái ban đầu là chính xác
    // Bắt buộc ẨN menu chính và canvas, CHỈ HIỆN #home
    if (homeEl) homeEl.style.display = "block";
    if (menuEl) menuEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";
    // --- HẾT PHẦN SỬA ---

    // 1. Khởi tạo UI (truyền hàm startGame vào làm callback)
    setupUI(startGame);
    
    // 2. Khởi tạo Input (lắng nghe phím)
    setupInput();

    // 3. Khởi tạo Canvas (cho render.js biết)
    initCanvas(canvasEl);

    // 4. Xử lý click trên Canvas (cho nút Replay/Home khi Game Over)
    canvasEl.addEventListener("click", (e) => {
        if (!gameOver) return; // Chỉ chạy khi game over
        
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Click nút Chơi Lại
        if (mx >= replayButton.x && mx <= replayButton.x + replayButton.w &&
            my >= replayButton.y && my <= replayButton.y + replayButton.h) {
            
            startGame(player.name); // Chơi lại với tên cũ
        }

        // Click nút Về Menu
        if (mx >= homeButton.x && mx <= homeButton.x + homeButton.w &&
            my >= homeButton.y && my <= homeButton.y + homeButton.h) {
            
            goToMenu();
        }
    });
});