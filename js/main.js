// js/main.js

// 1. IMPORT tất cả các module cần thiết
import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player } from "./game.js";
// THÊM IMPORT CHO AUDIO
import { preloadAudio, startMusic, playSound } from "./audio.js";

// 2. Lấy DOM elements chính
const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");

let lastTime = 0;
let animationFrameId = null;
let isFirstClick = true; // Biến kiểm tra click đầu tiên

// 3. Vòng lặp game (Game Loop)
function gameLoop(now) {
    // ... code gameLoop của bạn giữ nguyên ...
    updateGame(delta, keys);
    draw();

    // SỬA: Thêm âm thanh khi game over
    if (gameOver) {
        drawGameOver(); // Vẽ màn hình game over
        cancelAnimationFrame(animationFrameId); // Dừng vòng lặp
        
        // Phát âm thanh thất bại (chỉ 1 lần)
        if (!game.gameOverSoundPlayed) {
             playSound('defeated');
             game.gameOverSoundPlayed = true; // Thêm cờ này vào game.js
        }
    } else {
        // Tiếp tục vòng lặp
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// 4. Hàm Bắt đầu game (sẽ được truyền vào ui.js)
function startGame(playerName) {
    // ... code startGame của bạn giữ nguyên ...
    // SỬA: Reset cờ âm thanh khi bắt đầu game mới
    if (game) game.gameOverSoundPlayed = false;
    initGame(playerName, canvasEl);
    // ...
}

// 5. Hàm quay về Menu (từ màn hình Game Over)
function goToMenu() {
    // ... code goToMenu của bạn giữ nguyên ...
}

// 6. --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener("DOMContentLoaded", () => {
    
    // --- SỬA LỖI HIỂN THỊ ---
    // ... (Giữ nguyên code sửa lỗi hiển thị của bạn) ...

    // 1. TẢI TRƯỚC ÂM THANH
    preloadAudio();

    // 2. Khởi tạo UI (truyền hàm startGame vào làm callback)
    setupUI(startGame);
    
    // 3. Khởi tạo Input (lắng nghe phím)
    setupInput();

    // 4. Khởi tạo Canvas (cho render.js biết)
    initCanvas(canvasEl);

    // 5. Xử lý click trên Canvas (cho nút Replay/Home khi Game Over)
    canvasEl.addEventListener("click", (e) => {
        // THÊM ÂM THANH CLICK VÀO CANVAS
        if (isFirstClick) {
            startMusic();
            isFirstClick = false;
        }
        playSound('button_click'); // Thêm âm thanh click

        if (!gameOver) return; // Chỉ chạy khi game over
        
        // ... (Giữ nguyên code xử lý click nút Replay/Home) ...
    });
    
    // 6. SỰ KIỆN CLICK TOÀN CỤC ĐỂ BẮT ĐẦU NHẠC
    // (Đây là cách để bắt đầu nhạc nền khi click lần đầu)
    function handleFirstClick() {
        if (isFirstClick) {
            startMusic();
            isFirstClick = false;
            // Xóa listener này đi sau khi chạy lần đầu
            document.removeEventListener('click', handleFirstClick);
            document.removeEventListener('keydown', handleFirstClick);
        }
    }
    document.addEventListener('click', handleFirstClick);
    document.addEventListener('keydown', handleFirstClick);
});
