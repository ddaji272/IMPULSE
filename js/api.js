// js/api.js

// --- CẤU HÌNH SERVER ---
// Link Backend trên Render
const BASE_URL = 'https://backend-impulse.onrender.com';

// Hàm gọi API chung (Helper)
async function request(endpoint, method, body = null) {
    const headers = { 'Content-Type': 'application/json' };
    const config = { method, headers };
    if (body) config.body = JSON.stringify(body);

    try {
        const res = await fetch(`${BASE_URL}${endpoint}`, config);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi kết nối");
        return data;
    } catch (err) {
        throw err; // Ném lỗi ra để UI xử lý hiển thị
    }
}

// --- CÁC CHỨC NĂNG CHÍNH ---

// 1. Đăng ký
export async function registerAPI(username, password) {
    return await request('/api/auth/signup', 'POST', { username, password });
}

// 2. Đăng nhập
export async function loginAPI(username, password) {
    return await request('/api/auth/login', 'POST', { username, password });
}

// 3. Lấy Bảng Xếp Hạng
export async function getLeaderboardAPI() {
    return await request('/api/leaderboard', 'GET');
}

// 4. Lưu kết quả chơi (Score & Vàng)
export async function saveGameResultAPI(username, score, gold) {
    return await request('/api/user/update-game', 'POST', { 
        username, 
        newScore: score, 
        earnedGold: gold 
    });
}

// 5. Trang bị Skin
export async function equipSkinAPI(username, skin, bullet) {
    return await request('/api/user/equip', 'POST', { username, skin, bullet });
}

// 6. Mua vật phẩm (MỚI THÊM VÀO ĐỂ KHỚP VỚI UI)
export async function buyItemAPI(username, itemType, itemId, price) {
    return await request('/api/user/buy', 'POST', { 
        username, 
        itemType, // "avatar" hoặc "bullet"
        itemId,   // ID món đồ (VD: "ava_tank_red")
        price     // Giá tiền
    });
}
