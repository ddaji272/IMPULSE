import { setupInput, keys } from "./input.js";
import { setupUI } from "./ui.js";
import { initCanvas, draw, drawGameOver, replayButton, homeButton } from "./render.js";
import { initGame, updateGame, gameOver, player } from "./game.js";
import { preloadAudio, startMusic, playSound, toggleMusic, toggleSfx } from "./audio.js";
import { preloadSkins } from "./skins.js";

// --- DOM ELEMENTS ---
const canvasEl = document.getElementById("gameCanvas");
const homeEl = document.getElementById("home");
const menuEl = document.getElementById("menu");
const touchControlsEl = document.getElementById("touchControls");

// --- GAME STATE VARIABLES ---
let lastTime = 0;
let animationFrameId = null;
const MAX_DELTA_MS = 33.33; // Giới hạn delta time (tương đương 30 FPS) để tránh lỗi xuyên tường khi lag

// --- GAME LOOP ---
function gameLoop(now) {
    // Tính toán thời gian giữa 2 frame (Delta Time)
    let delta = now - lastTime;
    lastTime = now;

    // Giới hạn delta nếu máy bị lag hoặc vừa chuyển tab
    if (delta > MAX_DELTA_MS) {
        delta = MAX_DELTA_MS;
    }

    // Cập nhật logic game
    updateGame(delta, keys);

    // Vẽ hình ảnh
    draw();

    // Kiểm tra trạng thái game
    if (gameOver) {
        drawGameOver();
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    } else {
        animationFrameId = requestAnimationFrame(gameLoop);
    }
}

// --- HELPER FUNCTIONS ---

// Kiểm tra thiết bị di động
function isMobile() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

// Bắt đầu game mới
function startGame(playerName) {
    // Bật nhạc nền
    startMusic();

    // Chuyển đổi giao diện
    homeEl.style.display = "none";
    menuEl.style.display = "none";
    canvasEl.style.display = "block";

    // Hiển thị nút điều khiển ảo nếu là mobile
    if (isMobile() && touchControlsEl) {
        touchControlsEl.classList.remove('hidden');
        setTimeout(() => touchControlsEl.classList.add('visible'), 50);
    }

    // Khởi tạo dữ liệu game
    initGame(playerName, canvasEl);

    // Reset vòng lặp game an toàn
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// Quay về menu chính
function goToMenu() {
    canvasEl.style.display = "none";

    // Ẩn nút điều khiển ảo
    if (touchControlsEl) {
        touchControlsEl.classList.remove('visible');
    }

    // Dừng vòng lặp game
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    // Điều hướng về Home hoặc Menu tùy trạng thái đăng nhập
    const loggedUser = document.getElementById("userDisplay")?.textContent;
    if (loggedUser && loggedUser.trim() !== "" && loggedUser !== "User") {
        menuEl.style.display = "block";
    } else {
        homeEl.style.display = "block";
    }
}

// --- KHỞI TẠO ỨNG DỤNG ---
document.addEventListener("DOMContentLoaded", async () => {
    // Setup hiển thị ban đầu
    if (homeEl) homeEl.style.display = "block";
    if (menuEl) menuEl.style.display = "none";
    if (canvasEl) canvasEl.style.display = "none";

    // Tải tài nguyên (Audio & Skins)
    try {
        await Promise.all([preloadAudio(), preloadSkins()]);
        console.log("Tài nguyên đã tải xong.");
    } catch (error) {
        console.error("Lỗi tải tài nguyên:", error);
    }

    // Khởi tạo các module
    setupUI(startGame);
    setupInput();
    initCanvas(canvasEl);

    // Xử lý click trên Canvas (Cho màn hình Game Over)
    canvasEl.addEventListener("click", (e) => {
        if (!gameOver) return;

        const rect = canvasEl.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Nút Replay
        if (mx >= replayButton.x && mx <= replayButton.x + replayButton.w &&
            my >= replayButton.y && my <= replayButton.y + replayButton.h) {
            playSound('button_click');
            startGame(player.name);
        }

        // Nút Home
        if (mx >= homeButton.x && mx <= homeButton.x + homeButton.w &&
            my >= homeButton.y && my <= homeButton.y + homeButton.h) {
            playSound('button_click');
            goToMenu();
        }
    });

    // Xử lý nút bật/tắt âm thanh
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

    // Xử lý khi người dùng chuyển tab (Visibility API)
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') {
            // Tạm dừng vòng lặp khi ẩn tab
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
        } else if (document.visibilityState === 'visible') {
            // Chỉ tiếp tục nếu đang ở màn hình game
            if (canvasEl.style.display === "block") {
                if (!gameOver) {
                    // Game chưa xong -> Chạy tiếp
                    if (!animationFrameId) {
                        lastTime = performance.now(); // Reset time để tránh nhảy cóc
                        animationFrameId = requestAnimationFrame(gameLoop);
                    }
                } else {
                    // Game đã xong -> Chỉ vẽ lại màn hình kết thúc
                    drawGameOver();
                }
            }
        }
    });
});
