// js/main.js

import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player, gameOverSoundPlayed } from "./game.js";
import { preloadAudio, startMusic, playSound, toggleMusic, toggleSfx } from "./audio.js";

// --- THÊM MỚI ---
import { preloadSkins } from "./skins.js";

const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");
// === THÊM MỚI: Lấy touch controls ===
const touchControlsEl = document.getElementById("touchControls");
// ===================================

let lastTime = 0;
let animationFrameId = null;

function gameLoop(now) {
    const delta = now - lastTime;
    lastTime = now;

    updateGame(delta, keys);
    draw();

    if (gameOver) {
        drawGameOver(); 
        cancelAnimationFrame(animationFrameId); 
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// === THÊM MỚI: Hàm kiểm tra có phải mobile không ===
// (Cách đơn giản, hoạt động trên hầu hết các trình duyệt)
function isMobile() {
    // 'ontouchstart' in window là cách kiểm tra cũ nhưng vẫn hiệu quả
    // navigator.maxTouchPoints > 0 là cách hiện đại hơn
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
// ===============================================

function startGame(playerName) {
    startMusic(); 
    homeEl.style.display = "none";
    menuEl.style.display = "none";
    canvasEl.style.display = "block";

    // === THÊM MỚI: Hiển thị controls nếu là mobile ===
    if (isMobile() && touchControlsEl) {
        // Xóa class 'hidden' (display: none)
        touchControlsEl.classList.remove('hidden');
        
        // Thêm class 'visible' (để kích hoạt opacity)
        // Dùng setTimeout 50ms để đảm bảo transition CSS được kích hoạt
        setTimeout(() => touchControlsEl.classList.add('visible'), 50);
    }
    // ==============================================
    
    initGame(playerName, canvasEl);
    
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function goToMenu() {
    canvasEl.style.display = "none";

    // === THÊM MỚI: Ẩn touch controls ===
    if (touchControlsEl) {
        touchControlsEl.classList.remove('visible');
    }
    // ==================================
    
    const loggedUser = document.getElementById("userDisplay").textContent;
    if (loggedUser && loggedUser.trim() !== "") {
        menuEl.style.display = "block";
    } else {
        homeEl.style.display = "block";
    }
}

// --- KHỞI CHẠY KHI TẢI TRANG ---
// --- SỬA: Thêm 'async' ---
document.addEventListener("DOMContentLoaded", async () => {
    
    if (homeEl) homeEl.style.display = "block";
    if (menuEl) menuEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";

    // 1. TẢI TRƯỚC ÂM THANH VÀ SKINS
    // --- SỬA: Thêm await và preloadSkins ---
    try {
        await preloadAudio();
        await preloadSkins(); // <-- CHỜ TẢI SKIN XONG
    } catch (error) {
        console.error("Lỗi khi tải tài nguyên:", error);
        return;
    }

    // 2. Khởi tạo UI (Nó sẽ gán sự kiện click cho các nút)
    setupUI(startGame);
    
    // 3. Khởi tạo Input (Giờ đây nó cũng gán cả sự kiện touch)
    setupInput();

    // 4. Khởi tạo Canvas
    initCanvas(canvasEl);

    // 5. Xử lý click trên Canvas
    canvasEl.addEventListener("click", (e) => {
        if (!gameOver) return; 
        
        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        if (mx >= replayButton.x && mx <= replayButton.x + replayButton.w &&
            my >= replayButton.y && my <= replayButton.y + replayButton.h) {
            
            playSound('button_click'); 
            startGame(player.name);
        }

        if (mx >= homeButton.x && mx <= homeButton.x + homeButton.w &&
            my >= homeButton.y && my <= homeButton.y + homeButton.h) {
            
            playSound('button_click'); 
            goToMenu();
        }
    });
    
    // === 7. LOGIC CHO NÚT ÂM LƯỢNG (Giữ nguyên) ===
    const musicBtn = document.getElementById("musicToggleBtn");
    const sfxBtn = document.getElementById("sfxToggleBtn");

    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            const isMuted = toggleMusic();
            if (isMuted) {
                musicBtn.textContent = "🔇"; 
                musicBtn.title = "Bật nhạc nền";
            } else {
                musicBtn.textContent = "🎵"; 
                musicBtn.title = "Tắt nhạc nền";
            }
        });
    }

    if (sfxBtn) {
        sfxBtn.addEventListener("click", () => {
            const isMuted = toggleSfx();
            if (isMuted) {
                sfxBtn.textContent = "🔇"; 
                sfxBtn.title = "Bật hiệu ứng";
            } else {
                sfxBtn.textContent = "🔊"; 
                sfxBtn.title = "Tắt hiệu ứng";
            }
        });
    }
});
