// js/skins.js
// Đây là "nguồn chân lý duy nhất" cho tất cả skin.

import { PLAYER_COLOR, BULLET_COLOR } from "./config.js";

// Định nghĩa Avatar Skins
export const AVATAR_SKINS = {
    "default": {
        name: "Mặc định",
        price: 0,
        color: PLAYER_COLOR // Lấy màu từ config
    },
    "ava_blue": {
        name: "Avatar Xanh",
        price: 300,
        color: "#3498db" // Màu xanh dương
    },
    "ava_red": {
        name: "Avatar Đỏ",
        price: 300,
        color: "#e74c3c" // Màu đỏ
    }
    // Thêm skin avatar mới ở đây
};

// Định nghĩa Bullet Skins
export const BULLET_SKINS = {
    "default": {
        name: "Mặc định",
        price: 0,
        color: BULLET_COLOR // Lấy màu từ config
    },
    "bul_yellow": {
        name: "Đạn Vàng",
        price: 200,
        color: "#f1c40f" // Màu vàng
    },
    "bul_purple": {
        name: "Đạn Tím",
        price: 250,
        color: "#9b59b6" // Màu tím
    }
    // Thêm skin đạn mới ở đây
};