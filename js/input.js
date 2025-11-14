// js/input.js

// Biến lưu trữ trạng thái phím (dùng event.code)
export const keys = {};

/**
 * Xử lý khi nhấn phím (keydown)
 */
function handleKeyDown(event) {
    const code = event.code; // <-- Dùng event.code (ví dụ: "KeyW", "Space")
    keys[code] = true;

    // Ngăn chặn hành vi mặc định (cuộn trang)
    // Đây là phần sửa lỗi "dừng game"
    if (code === 'Space' || code.includes('Arrow')) {
        event.preventDefault();
    }
}

/**
 * Xử lý khi nhả phím (keyup)
 */
function handleKeyUp(event) {
    const code = event.code;
    keys[code] = false;
}

/**
 * Xử lý khi cửa sổ bị mất focus (click ra ngoài)
 * Đây là phần sửa lỗi "dính phím"
 */
function handleBlur() {
    // Reset tất cả các phím về 'false'
    Object.keys(keys).forEach(code => {
        keys[code] = false;
    });
}

/**
 * Thiết lập các Event Listener
 */
export function setupInput() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    // Thêm listener cho "blur"
    window.addEventListener("blur", handleBlur);

    // === THÊM MỚI: LOGIC CẢM ỨNG ===
    // Hàm helper để gán sự kiện cho 1 nút
    function setupTouchButton(elementId, keyCode) {
        const button = document.getElementById(elementId);
        if (!button) return;

        // Khi chạm vào (tương đương keydown)
        button.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Ngăn zoom hoặc cuộn
            keys[keyCode] = true;
        }, { passive: false }); // {passive: false} là cần thiết cho preventDefault

        // Khi nhả tay ra (tương đương keyup)
        button.addEventListener('touchend', (e) => {
            e.preventDefault();
            keys[keyCode] = false;
        });

        // Xử lý trường hợp người dùng lướt tay ra khỏi nút
        button.addEventListener('touchcancel', (e) => {
            keys[keyCode] = false;
        });
    }

    // Gán sự kiện cho các nút D-Pad
    setupTouchButton('touchUp', 'KeyW');
    setupTouchButton('touchDown', 'KeyS');
    setupTouchButton('touchLeft', 'KeyA');
    setupTouchButton('touchRight', 'KeyD');

    // Gán sự kiện cho nút Bắn
    setupTouchButton('touchShoot', 'Space');
    // =================================
}
