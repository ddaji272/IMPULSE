// js/skins.js

// SỬA: Bỏ import PLAYER_COLOR vì không còn skin avatar màu
import { BULLET_COLOR } from "./config.js";

// --- Biến để lưu trữ các ảnh đã tải ---
export const loadedSkins = {};

// --- Hàm tải trước tất cả skin ảnh ---
// (Hàm này giữ nguyên, nó đã đúng)
export async function preloadSkins() {
    console.log("Đang tải skin...");
    const skinPromises = []; 

    for (const skinId in AVATAR_SKINS) {
        const skin = AVATAR_SKINS[skinId];
        if (skin.type === "image") {
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    loadedSkins[skin.data] = img; 
                    console.log(`Tải thành công: ${skin.data}`);
                    resolve();
                };
                img.onerror = () => {
                    console.error(`Lỗi tải skin: ${skin.data}`);
                    reject();
                };
                img.src = skin.data; 
            });
            skinPromises.push(promise);
        }
    }

    await Promise.all(skinPromises);
    console.log("Tải skin hoàn tất!");
}

// --- SỬA: Định nghĩa Avatar Skins (Chỉ còn type "image") ---
export const AVATAR_SKINS = {
    // SỬA: Biến "default" thành skin xe tăng xanh
    "default": {
        name: "Xe tăng xanh",
        price: 0, // Skin mặc định nên giá 0
        type: "image",
        data: "assets/skin/bluetank.png" // Đường dẫn (giả sử bạn đã đổi sang .png)
    },

    // XÓA: Toàn bộ skin type "color"
    // "ava_blue" (Đã xóa)
    // "ava_red" (Đã xóa)
    // "ava_tank_blue" (Đã gộp vào "default")

    // --- CÁC SKIN XE TĂNG CÒN LẠI ---
    "ava_tank_black": {
        name: "Xe tăng đen",
        price: 500, 
        type: "image",
        data: "assets/skin/blacktank.png" // Bạn cũng nên đổi file này sang .png
    },
    "ava_tank_white":{
        name: "xe tăng trắng",
        price: 500,
        type:"image",
        data: "assets/skin/whitetank.png" // Bạn cũng nên đổi file này sang .png
    }
};

// --- Định nghĩa Bullet Skins (Giữ nguyên) ---
export const BULLET_SKINS = {
    "default": {
        name: "Đạn xanh",
        price: 0,
        type: "color",
        data: "#2012e7ff" 
    },
    "bul_yellow": {
        name: "Đạn Vàng",
        price: 200,
        type: "color",
        data: "#f1c40f"
    },
    "bul_purple": {
        name: "Đạn Tím",
        price: 250,
        type: "color",
        data: "#9b59b6" 
    }
};

