import { startMusic, playSound } from "./audio.js";
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";
// === THAY ĐỔI 1: Thêm equipSkinAPI vào import ===
import { registerAPI, loginAPI, getLeaderboardAPI, equipSkinAPI } from "./api.js";

// === THAY ĐỔI 2: ĐÃ XÓA hàm equipSkinAPI viết tay (bị hardcode localhost) ở đây ===

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
    
    // UI sau khi đăng nhập
    const userDisplay = document.getElementById("userDisplay");
    const goldAmount = document.getElementById("goldAmount"); 
    const logoutBtn = document.getElementById("btnLogout");
    const menuPlayBtn = document.getElementById("btnPlay"); 
    
    // UI Demo (Khách)
    const playBtn = document.getElementById("playBtn"); 
    const displayName = document.getElementById("displayName");
    const errorMsg = document.getElementById("error");

    // Các nút chức năng
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const guideBtn = document.getElementById("guideBtn");
    const leaderboardBtn2 = document.getElementById("btnLeaderboard2");
    const guideBtn2 = document.getElementById("btnGuide2");
    
    // Popups
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

    // --- Helper Hiển thị thông báo ---
    function showAuthMsg(msg, isError = false) {
        if (!authMsg) return;
        authMsg.style.display = "block";
        authMsg.style.color = isError ? "#ff5c5c" : "#00ffcc"; 
        authMsg.textContent = msg;
        setTimeout(() => (authMsg.style.display = "none"), 3000);
    }

    // ============================================================
    // 1. XỬ LÝ ĐĂNG KÝ & ĐĂNG NHẬP
    // ============================================================

    if (registerBtn) {
        registerBtn.addEventListener("click", async () => {
            startMusic(); 
            playSound('button_click');
            
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();

            if (!user || !pass) {
                showAuthMsg("Vui lòng nhập đầy đủ!", true);
                return;
            }

            try {
                await registerAPI(user, pass);
                showAuthMsg("Đăng ký thành công! Hãy đăng nhập.", false);
            } catch (err) {
                showAuthMsg(err.message || "Lỗi đăng ký", true);
            }
        });
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", async () => {
            startMusic();
            playSound('button_click');

            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();

            if (!user || !pass) {
                showAuthMsg("Vui lòng nhập đầy đủ!", true);
                return;
            }

            try {
                const data = await loginAPI(user, pass);
                
                const currentUser = data.user;
                localStorage.setItem('impulse_user', JSON.stringify(currentUser));

                showAuthMsg("Đăng nhập thành công!", false);
                updateMenuUI(currentUser);
                switchToMenu();

            } catch (err) {
                showAuthMsg(err.message || "Sai tài khoản/mật khẩu", true);
            }
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

    // ============================================================
    // 2. CÁC NÚT CHƠI GAME
    // ============================================================

    if (playBtn) {
        playBtn.addEventListener("click", () => {
            startMusic();
            playSound('button_click');
            const name = displayName.value.trim();

            if (!name) {
                errorMsg.style.display = "block";
                errorMsg.textContent = "Tên hiển thị không được để trống!";
                return;
            }
            errorMsg.style.display = "none";

            home.style.display = "none";
            canvas.style.display = "block";
            startGameCallback(name);
        });
    }

    if (menuPlayBtn) {
        menuPlayBtn.addEventListener("click", () => {
            playSound('button_click');
            const savedUser = localStorage.getItem('impulse_user');
            if (savedUser) {
                const user = JSON.parse(savedUser);
                menu.style.display = "none";
                canvas.style.display = "block";
                startGameCallback(user.username);
            }
        });
    }

    // ============================================================
    // 3. LEADERBOARD
    // ============================================================

    async function loadLeaderboard() {
        if (!leaderboardList) return;
        leaderboardList.innerHTML = "<li>Đang tải...</li>";

        try {
            const data = await getLeaderboardAPI();
            leaderboardList.innerHTML = "";
            
            if (data.length === 0) {
                leaderboardList.innerHTML = "<li>Chưa có dữ liệu</li>";
                return;
            }

            leaderboardList.innerHTML = data.map((u, i) => `
                <li>
                    <span style="color: yellow">#${i + 1}</span> 
                    <strong>${u.username}</strong> 
                    - <span>${u.highScore} 🏆</span>
                    - <small>(${u.skin || 'default'})</small>
                </li>
            `).join("");

        } catch (err) {
            leaderboardList.innerHTML = `<li style="color:red">Lỗi kết nối Server</li>`;
        }
    }

    const openLeaderboard = () => {
        playSound('button_click');
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
        loadLeaderboard();
    };

    if (leaderboardBtn) leaderboardBtn.addEventListener("click", openLeaderboard);
    if (leaderboardBtn2) leaderboardBtn2.addEventListener("click", openLeaderboard);

    // ============================================================
    // 4. HƯỚNG DẪN & ĐÓNG POPUP
    // ============================================================
    
    const openGuide = () => {
        playSound('button_click');
        if (guidePopup) guidePopup.classList.remove("hidden");
    };
    if (guideBtn) guideBtn.addEventListener("click", openGuide);
    if (guideBtn2) guideBtn2.addEventListener("click", openGuide);

    closeBtns.forEach(btn => btn.addEventListener("click", () => {
        playSound('button_click');
        if (guidePopup) guidePopup.classList.add("hidden");
        if (leaderboardPopup) leaderboardPopup.classList.add("hidden");
        if (shopPopup) shopPopup.classList.add("hidden");
    }));

    // ============================================================
    // 5. SHOP SYSTEM
    // ============================================================

    function openShop(type) {
        if (!shopPopup) return;

        shopTitle.textContent = type === "avatar" ? "Kho Skin Avatar" : "Kho Skin Đạn";
        
        const savedUser = localStorage.getItem('impulse_user');
        if (!savedUser) {
            showAuthMsg("Vui lòng đăng nhập lại!", true);
            return;
        }
        let currentUser = JSON.parse(savedUser);
        
        if (goldAmount) goldAmount.textContent = currentUser.gold || 0;

        const SKIN_DATA = (type === "avatar") ? AVATAR_SKINS : BULLET_SKINS;
        
        let currentSkinId = (type === "avatar") ? (currentUser.skin || "default") : (currentUser.bullet || "default");
        
        let ownedIds = currentUser.ownedAvatars || ["default"];
        if (!ownedIds.includes(currentSkinId)) ownedIds.push(currentSkinId);

        let ownedHTML = "";
        let shopHTML = "";

        for (const skinId in SKIN_DATA) {
            const skin = SKIN_DATA[skinId];
            if (skinId === "default") continue;

            if (ownedIds.includes(skinId)) {
                ownedHTML += `
                    <li>
                        ${skin.name} 
                        <button data-id="${skinId}" class="useBtn" ${skinId === currentSkinId ? 'disabled' : ''}>
                            ${skinId === currentSkinId ? 'Đang dùng' : 'Dùng'}
                        </button>
                    </li>`;
            } else {
                shopHTML += `
                    <li>
                        ${skin.name} <strong>${skin.price}🪙</strong> 
                        <button data-id="${skinId}" data-price="${skin.price}" class="buyBtn">Mua</button>
                    </li>`;
            }
        }

        const defaultSkinName = (type === "avatar") ? AVATAR_SKINS.default.name : BULLET_SKINS.default.name;
        ownedList.innerHTML = `
            <li>
                ${defaultSkinName}
                <button data-id="default" class="useBtn" ${"default" === currentSkinId ? 'disabled' : ''}>
                    ${"default" === currentSkinId ? 'Đang dùng' : 'Dùng'}
                </button>
            </li>` + ownedHTML;
            
        shopList.innerHTML = shopHTML;
        shopPopup.classList.remove("hidden");

        shopPopup.querySelectorAll(".buyBtn").forEach(btn => {
            btn.addEventListener("click", e => {
                playSound('button_click');
                const id = e.currentTarget.dataset.id;
                const price = Number(e.currentTarget.dataset.price);

                if (currentUser.gold >= price) {
                    playSound('buy');
                    currentUser.gold -= price;
                    
                    if (!currentUser.ownedAvatars) currentUser.ownedAvatars = ["default"];
                    currentUser.ownedAvatars.push(id);
                    
                    localStorage.setItem('impulse_user', JSON.stringify(currentUser));
                    
                    showAuthMsg("Mua thành công (Local)!", false);
                    openShop(type);
                } else {
                    showAuthMsg("Không đủ tiền!", true);
                }
            });
        });

        // --- XỬ LÝ TRANG BỊ (GỌI API SERVER) ---
        shopPopup.querySelectorAll(".useBtn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                playSound('button_click');
                const id = e.currentTarget.dataset.id;
                
                if (type === "avatar") currentUser.skin = id;
                else currentUser.bullet = id;

                // === THAY ĐỔI 3: Gọi hàm equipSkinAPI đã import (nó sẽ dùng link Render) ===
                await equipSkinAPI(currentUser.username, 
                                 type === "avatar" ? id : null, 
                                 type === "bullet" ? id : null);

                localStorage.setItem('impulse_user', JSON.stringify(currentUser));
                
                showAuthMsg(`Đã trang bị: ${id}`, false);
                openShop(type);
            });
        });
    }

    if (avatarBtn) avatarBtn.addEventListener("click", () => { playSound('button_click'); openShop("avatar"); });
    if (bulletBtn) bulletBtn.addEventListener("click", () => { playSound('button_click'); openShop("bullet"); });

    const savedUser = localStorage.getItem('impulse_user');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        updateMenuUI(user);
        switchToMenu();
    }
}
