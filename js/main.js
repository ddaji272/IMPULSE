// js/main.js

import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player, gameOverSoundPlayed } from "./game.js";
// === SỬA: Thêm import cho hàm toggle ===
import { preloadAudio, startMusic, playSound, toggleMusic, toggleSfx } from "./audio.js";

const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");

let lastTime = 0;
let animationFrameId = null;
let isFirstClick = true; 

function gameLoop(now) {
    const delta = now - lastTime;
    lastTime = now;

    updateGame(delta, keys);
    draw();

    if (gameOver) {
        drawGameOver(); 
        cancelAnimationFrame(animationFrameId); 
        
        // (Logic âm thanh 'defeated' đã được chuyển vào game.js)
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

function startGame(playerName) {
    homeEl.style.display = "none";
    menuEl.style.display = "none";
    canvasEl.style.display = "block";
    
    initGame(playerName, canvasEl);
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function goToMenu() {
    canvasEl.style.display = "none";
    
    const loggedUser = document.getElementById("userDisplay").textContent;
    if (loggedUser && loggedUser.trim() !== "") {
        menuEl.style.display = "block";
    } else {
        homeEl.style.display = "block";
    }
}

// --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener("DOMContentLoaded", () => {
    
    if (homeEl) homeEl.style.display = "block";
    if (menuEl) menuEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";

    // 1. TẢI TRƯỚC ÂM THANH
    preloadAudio();

    // 2. Khởi tạo UI
    setupUI(startGame);
    
    // 3. Khởi tạo Input
    setupInput();

    // 4. Khởi tạo Canvas
    initCanvas(canvasEl);

    // 5. Xử lý click trên Canvas
    canvasEl.addEventListener("click", (e) => {
        if (isFirstClick) {
            startMusic();
            isFirstClick = false;
        }
        
        if (!gameOver) return; 
        
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (mx >= replayButton.x && mx <= replayButton.x + replayButton.w &&
            my >= replayButton.y && my <= replayButton.y + replayButton.h) {
            
            playSound('button_click'); // <-- Thêm âm thanh click
            startGame(player.name);
        }

        if (mx >= homeButton.x && mx <= homeButton.x + homeButton.w &&
            my >= homeButton.y && my <= homeButton.y + homeButton.h) {
            
            playSound('button_click'); // <-- Thêm âm thanh click
            goToMenu();
        }
    });
    
    // 6. SỰ KIỆN CLICK TOÀN CỤC ĐỂ BẮT ĐẦU NHẠC
    function handleFirstClick() {
        if (isFirstClick) {
            startMusic();
            isFirstClick = false;
            document.removeEventListener('click', handleFirstClick);
            document.removeEventListener('keydown', handleFirstClick);
        }
    }
    document.addEventListener('click', handleFirstClick);
    document.addEventListener('keydown', handleFirstClick);

    // === 7. THÊM LOGIC CHO NÚT ÂM LƯỢNG ===
    const musicBtn = document.getElementById("musicToggleBtn");
    const sfxBtn = document.getElementById("sfxToggleBtn");

    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            const isMuted = toggleMusic();
            if (isMuted) {
                musicBtn.textContent = "🔇"; // Biểu tượng Tắt nhạc
                musicBtn.title = "Bật nhạc nền";
            } else {
                musicBtn.textContent = "🎵"; // Biểu tượng Bật nhạc
                musicBtn.title = "Tắt nhạc nền";
            }
        });
    }

    if (sfxBtn) {
        sfxBtn.addEventListener("click", () => {
            const isMuted = toggleSfx();
            if (isMuted) {
                sfxBtn.textContent = "🔇"; // Biểu tượng Tắt hiệu ứng
                sfxBtn.title = "Bật hiệu ứng";
            } else {
                sfxBtn.textContent = "🔊"; // Biểu tượng Bật hiệu ứng
                sfxBtn.title = "Tắt hiệu ứng";
            }
        });
    }
});
