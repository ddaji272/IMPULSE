// js/input.js

// Biến lưu trữ trạng thái phím
export const keys = {};

/**
 * Xử lý khi nhấn phím (keydown)
 */
function handleKeyDown(event) {
    const key = event.key.toLowerCase();
    
    // Ngăn chặn hành vi mặc định của trình duyệt với phím cách và phím mũi tên
    if (key === ' ' || key.includes("arrow")) {
        event.preventDefault(); 
    }
    
    // Đánh dấu phím này là đang được nhấn
    keys[key] = true;
}

/**
 * Xử lý khi nhả phím (keyup)
 */
function handleKeyUp(event) {
    const key = event.key.toLowerCase();
    
    // Đánh dấu phím này là đã được nhả ra
    keys[key] = false;
}

/**
 * Thiết lập các Event Listener
 * (Sẽ được gọi 1 lần duy nhất bởi main.js)
 */
export function setupInput() {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
}
