// js/ui.js - ĐÃ SỬA LỖI HIỂN THỊ TÊN SKIN

import { startMusic, playSound } from "./audio.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";
import { registerAPI, loginAPI, getLeaderboardAPI, equipSkinAPI, buyItemAPI } from "./api.js";

export function setupUI(startGameCallback) {
    
    // --- Lấy DOM Elements ---
    const home = document.getElementById("home");
    const menu = document.getElementById("menu");
    const canvas = document.getElementById("gameCanvas");
    const authMsg = document.getElementById("authMsg");
    const registerBtn = document.getElementById("registerBtn");
    const loginBtn = document.getElementById("loginBtn");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    
    const userDisplay = document.getElementById("userDisplay");
    const goldAmount = document.getElementById("goldAmount"); 
    const logoutBtn = document.getElementById("btnLogout");
    const menuPlayBtn = document.getElementById("btnPlay"); 
    
    const playBtn = document.getElementById("playBtn"); 
    const displayName = document.getElementById("displayName");
    const errorMsg = document.getElementById("error");

    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const guideBtn = document.getElementById("guideBtn");
    const leaderboardBtn2 = document.getElementById("btnLeaderboard2");
    const guideBtn2 = document.getElementById("btnGuide2");
    
    const guidePopup = document.getElementById("guidePopup");
    const leaderboardPopup = document.getElementById("leaderboardPopup");
    const leaderboardList = document.getElementById("leaderboardList");
    const shopPopup = document.getElementById("shopPopup");
    const shopTitle = document.getElementById("shopTitle");
    const ownedList = document.getElementById("ownedList");
    const shopList = document.getElementById("shopList");
    const closeBtns = document.querySelectorAll(".closeBtn");

    const avatarBtn = document.getElementById("avatarBtn");
    const bulletBtn = document.getElementById("bulletBtn");

    function showAuthMsg(msg, isError = false) {
        if (!authMsg) return;
        authMsg.style.display = "block";
        authMsg.style.color = isError ? "#ff5c5c" : "#00ffcc"; 
        authMsg.textContent = msg;
        setTimeout(() => (authMsg.style.display = "none"), 3000);
    }

    // --- AUTH ---
    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            startMusic(); playSound('button_click');
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();
            if (!user || !pass) return showAuthMsg("Nhập đủ thông tin!", true);
            try {
                await registerAPI(user, pass);
                showAuthMsg("Đăng ký thành công! Hãy đăng nhập.", false);
            } catch (err) { showAuthMsg(err.message, true); }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            startMusic(); playSound('button_click');
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();
            if (!user || !pass) return showAuthMsg("Nhập đủ thông tin!", true);
            try {
                const data = await loginAPI(user, pass);
                localStorage.setItem('impulse_user', JSON.stringify(data.user));
                showAuthMsg("Đăng nhập thành công!", false);
                updateMenuUI(data.user);
                switchToMenu();
            } catch (err) { showAuthMsg(err.message, true); }
        });
    }

    function switchToMenu() {
        home.style.display = "none";
        menu.style.display = "block";
        canvas.style.display = "none";
    }

    function updateMenuUI(user) {
        if (userDisplay) userDisplay.textContent = user.username;
        if (goldAmount) goldAmount.textContent = user.gold || 0;
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            playSound('button_click');
            localStorage.removeItem('impulse_user');
            location.reload();
        });
    }

    if (playBtn) playBtn.addEventListener("click", () => {
        startMusic(); playSound('button_click');
        const name = displayName.value.trim();
        if (!name) return errorMsg.style.display = "block";
        home.style.display = "none"; canvas.style.display = "block";
        startGameCallback(name);
    });

    if (menuPlayBtn) menuPlayBtn.addEventListener("click", () => {
        playSound('button_click');
        const savedUser = localStorage.getItem('impulse_user');
        if (savedUser) {
            menu.style.display = "none"; canvas.style.display = "block";
            startGameCallback(JSON.parse(savedUser).username);
        }
    });

    // --- LEADERBOARD ---
    async function loadLeaderboard() {
        if (!leaderboardList) return;
        leaderboardList.innerHTML = "<li>Đang tải...</li>";
        try {
            const data = await getLeaderboardAPI();
            leaderboardList.innerHTML = data.length ? data.map((u, i) => 
                `<li><span style="color:yellow">#${i+1}</span> <strong>${u.username}</strong> - ${u.highScore}🏆 <small>(${u.skin})</small></li>`
            ).join("") : "<li>Chưa có dữ liệu</li>";
        } catch (err) { leaderboardList.innerHTML = "<li>Lỗi tải BXH</li>"; }
    }
    const openLeaderboard = () => {
        playSound('button_click');
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
        loadLeaderboard();
    };
    if (leaderboardBtn) leaderboardBtn.addEventListener("click", openLeaderboard);
    if (leaderboardBtn2) leaderboardBtn2.addEventListener("click", openLeaderboard);

    // --- GUIDE ---
    const openGuide = () => { playSound('button_click'); guidePopup.classList.remove("hidden"); };
    if (guideBtn) guideBtn.addEventListener("click", openGuide);
    if (guideBtn2) guideBtn2.addEventListener("click", openGuide);
    closeBtns.forEach(btn => btn.addEventListener("click", () => {
        playSound('button_click');
        document.querySelectorAll('.popup').forEach(p => p.classList.add('hidden'));
    }));

    // --- SHOP SYSTEM ---
    function openShop(type) {
        if (!shopPopup) return;
        shopTitle.textContent = type === "avatar" ? "Kho Skin Avatar" : "Kho Skin Đạn";
        
        const savedUser = localStorage.getItem('impulse_user');
        if (!savedUser) return showAuthMsg("Vui lòng đăng nhập lại!", true);
        let currentUser = JSON.parse(savedUser);
        
        if (goldAmount) goldAmount.textContent = currentUser.gold || 0;

        // Xác định loại dữ liệu skin cần dùng (Avatar hay Đạn)
        const SKIN_DATA = (type === "avatar") ? AVATAR_SKINS : BULLET_SKINS;
        
        // Xác định skin hiện tại đang dùng (để disable nút)
        let currentSkinId = (type === "avatar") ? (currentUser.skin || "default") : (currentUser.bullet || "default");
        
        let ownedIds = (type === "avatar") ? (currentUser.ownedAvatars || ["default"]) : (currentUser.ownedBullets || ["default"]);
        if (!ownedIds.includes("default")) ownedIds.push("default");

        let ownedHTML = "", shopHTML = "";

        for (const skinId in SKIN_DATA) {
            const skin = SKIN_DATA[skinId];
            
            if (ownedIds.includes(skinId)) {
                // Đã sở hữu -> Nút Dùng
                // Kiểm tra xem có đang dùng skin này không
                const isEquipped = (skinId === currentSkinId);
                ownedHTML += `
                    <li>
                        ${skin.name} 
                        <button data-id="${skinId}" class="useBtn" ${isEquipped ? 'disabled' : ''}>
                            ${isEquipped ? 'Đang dùng' : 'Dùng'}
                        </button>
                    </li>`;
            } else {
                // Chưa sở hữu -> Nút Mua
                shopHTML += `
                    <li>
                        ${skin.name} <strong>${skin.price}🪙</strong> 
                        <button data-id="${skinId}" data-price="${skin.price}" class="buyBtn">Mua</button>
                    </li>`;
            }
        }
        
        ownedList.innerHTML = ownedHTML;
        shopList.innerHTML = shopHTML;
        shopPopup.classList.remove("hidden");

        // --- XỬ LÝ MUA ---
        shopPopup.querySelectorAll(".buyBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.dataset.id;
                const price = Number(e.currentTarget.dataset.price);

                try {
                    const data = await buyItemAPI(currentUser.username, type, id, price);
                    playSound('buy');
                    showAuthMsg("Mua thành công!", false);

                    // Cập nhật lại user từ server trả về
                    currentUser = data.user;
                    localStorage.setItem('impulse_user', JSON.stringify(currentUser));
                    
                    openShop(type); // Refresh giao diện
                } catch (err) {
                    playSound('button_click');
                    showAuthMsg(err.message || "Không mua được!", true);
                }
            });
        });

        // --- XỬ LÝ TRANG BỊ (ĐÃ SỬA CHỖ NÀY) ---
        shopPopup.querySelectorAll(".useBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                playSound('button_click');
                const id = e.currentTarget.dataset.id;
                
                try {
                    // Gọi API lưu trang bị
                    const data = await equipSkinAPI(currentUser.username, 
                                     type === "avatar" ? id : null, 
                                     type === "bullet" ? id : null);
                    
                    // QUAN TRỌNG: Cập nhật lại localStorage từ dữ liệu Server trả về
                    if (data && data.user) {
                        currentUser = data.user;
                        localStorage.setItem('impulse_user', JSON.stringify(currentUser));
                    }
                    
                    // --- SỬA LỖI HIỂN THỊ TÊN ---
                    // Lấy tên từ biến SKIN_DATA (đã được chọn đúng loại ở đầu hàm)
                    const skinName = SKIN_DATA[id] ? SKIN_DATA[id].name : id;
                    showAuthMsg(`Đã trang bị: ${skinName}`, false);
                    
                    openShop(type); // Refresh để cập nhật nút "Đang dùng"
                } catch (err) {
                    showAuthMsg("Lỗi khi trang bị!", true);
                    console.error(err);
                }
            });
        });
    }

    if (avatarBtn) avatarBtn.addEventListener("click", () => { playSound('button_click'); openShop("avatar"); });
    if (bulletBtn) bulletBtn.addEventListener("click", () => { playSound('button_click'); openShop("bullet"); });

    const savedUser = localStorage.getItem('impulse_user');
    if (savedUser) {
        updateMenuUI(JSON.parse(savedUser));
        switchToMenu();
    }
}
