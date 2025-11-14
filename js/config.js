// js/config.js

// ========== Cấu hình game ==========

// Tốc độ di chuyển của người chơi
export const PLAYER_SPEED = 300;

// === DÒNG MỚI THÊM VÀO ===
// Tốc độ xoay của người chơi (số radian xoay mỗi giây)
// (3.5 là khoảng 200 độ/giây. Bạn có thể tăng/giảm số này)
export const PLAYER_ROTATION_SPEED = 3.5;
// ==========================

// Tốc độ bay của đạn
export const BULLET_SPEED = 600;

// Thời gian hồi chiêu giữa các lần bắn (ms)
export const SHOOT_COOLDOWN = 1000;

// Màu nền canvas
export const CANVAS_BG_COLOR = "#0d1117";

// Màu đạn
export const BULLET_COLOR = "yellow";

// Bán kính người chơi (px)
export const PLAYER_RADIUS = 20;

// Bán kính đạn (px)
export const BULLET_RADIUS = 5;

// Số lần đạn có thể nảy tối đa
export const MAX_BULLET_BOUNCE = 10;

// Kích thước nút Replay
export const REPLAY_BTN = { w: 200, h: 60 };
