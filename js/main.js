// js/main.js

import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player, gameOverSoundPlayed } from "./game.js";
// === SỬA LỖI ÂM THANH: Import 'startMusic' nhưng không dùng trong 'startGame' ===
import { preloadAudio, startMusic, playSound, toggleMusic, toggleSfx } from "./audio.js";
import { preloadSkins } from "./skins.js";

const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");
const touchControlsEl = document.getElementById("touchControls");

let lastTime = 0;
let animationFrameId = null;

function gameLoop(now) {
    // === SỬA LỖI 2: Giới hạn Delta Time ===
    let delta = now - lastTime;
    lastTime = now;

    // Giới hạn delta tối đa (tương đương self.clock.tick(FPS) của Python)
    // 33.33ms = 30 FPS. Ngăn 'delta' quá lớn khi lag hoặc chuyển tab
    const MAX_DELTA_MS = 33.33; 
    if (delta > MAX_DELTA_MS) {
        // Nếu delta lớn (ví dụ quay lại tab), chỉ cập nhật 1 frame 30fps
        delta = MAX_DELTA_MS;
    }
    // ===================================

    updateGame(delta, keys);
    draw();

    if (gameOver) {
        drawGameOver(); 
        cancelAnimationFrame(animationFrameId); 
        animationFrameId = null; // Đặt lại ID
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// === HÀM KIỂM TRA MOBILE (Giữ nguyên) ===
function isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}
// ==================================

function startGame(playerName) {
    // === SỬA LỖI ÂM THANH: ĐÃ XÓA startMusic() KHỎI ĐÂY ===
    startMusic();
    // ===============================================
    
    homeEl.style.display = "none";
    menuEl.style.display = "none";
    canvasEl.style.display = "block";

    if (isMobile() && touchControlsEl) {
        touchControlsEl.classList.remove('hidden');
        setTimeout(() => touchControlsEl.classList.add('visible'), 50);
    }
    
    initGame(playerName, canvasEl);
    
    // === SỬA LỖI 2: Reset vòng lặp một cách an toàn ===
    lastTime = performance.now(); // LUÔN LUÔN đặt lại 'lastTime' khi bắt đầu
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); // Hủy vòng lặp cũ (nếu có)
    }
    // ============================================
    animationFrameId = requestAnimationFrame(gameLoop);
}

function goToMenu() {
    canvasEl.style.display = "none";

    if (touchControlsEl) {
        touchControlsEl.classList.remove('visible');
    }

    // === SỬA LỖI 2: Dừng game loop khi về menu ===
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
    // ==========================================
    
    const loggedUser = document.getElementById("userDisplay").textContent;
    if (loggedUser && loggedUser.trim() !== "") {
        menuEl.style.display = "block";
    } else {
        homeEl.style.display = "block";
    }
}

// --- KHỞI CHẠY KHI TẢI TRANG ---
document.addEventListener("DOMContentLoaded", async () => {
    
    // Setup giao diện ban đầu (Giữ nguyên)
    if (homeEl) homeEl.style.display = "block";
    if (menuEl) menuEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";

    // Tải tài nguyên (Giữ nguyên)
    try {
        await preloadAudio();
        await preloadSkins(); 
    } catch (error) {
        console.error("Lỗi khi tải tài nguyên:", error);
        return;
    }

    // Khởi tạo các module (Giữ nguyên)
    setupUI(startGame);
    setupInput();
    initCanvas(canvasEl);

    // Xử lý click trên canvas (Giữ nguyên)
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
    
    // Logic nút âm lượng (Giữ nguyên)
    const musicBtn = document.getElementById("musicToggleBtn");
    const sfxBtn = document.getElementById("sfxToggleBtn");
    if (musicBtn) {
        musicBtn.addEventListener("click", () => {
            const isMuted = toggleMusic();
            musicBtn.textContent = isMuted ? "🔇" : "🎵"; 
            musicBtn.title = isMuted ? "Bật nhạc nền" : "Tắt nhạc nền";
        });
    }
    if (sfxBtn) {
        sfxBtn.addEventListener("click", () => {
            const isMuted = toggleSfx();
            sfxBtn.textContent = isMuted ? "🔇" : "🔊"; 
            sfxBtn.title = isMuted ? "Bật hiệu ứng" : "Tắt hiệu ứng";
        });
    }

    // === SỬA LỖI 2: Thêm trình lắng nghe 'visibilitychange' ===
    // (Để xử lý khi người dùng chuyển tab hoặc thu nhỏ cửa sổ)
    window.addEventListener('visibilitychange', () => {
        
        if (document.visibilityState === 'hidden') {
            // KHI CHUYỂN TAB: Dừng game loop (nếu đang chạy)
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
                console.log("Game Tạm Dừng (chuyển tab)");
            }
        }
        
        if (document.visibilityState === 'visible') {
            // KHI QUAY LẠI TAB:
            // === SỬA LỖI LOGIC KHI BỊ HẠ LÚC CHUYỂN TAB ===
            // 1. Kiểm tra xem có đang ở màn hình game không
            if (canvasEl.style.display !== "block") return;
            
            // 2. Kiểm tra xem game đã kết thúc CHƯA
            if (!gameOver) {
                // Game vẫn đang chạy -> Khởi động lại vòng lặp
                if (!animationFrameId) { // Chỉ khởi động nếu nó đang tắt
                    console.log("Game Tiếp Tục (quay lại tab)");
                    lastTime = performance.now(); // Đặt lại 'lastTime' để ngăn 'delta' khổng lồ
                    animationFrameId = requestAnimationFrame(gameLoop);
                }
            } else {
                // Game ĐÃ kết thúc (ví dụ: bị hạ lúc đang thu nhỏ)
                // -> Chỉ vẽ màn hình Game Over, KHÔNG khởi động lại vòng lặp
                console.log("Vẽ lại màn hình Game Over (quay lại tab)");
                drawGameOver();
            }
            // ============================================
        }
    });
    // ====================================================
});

