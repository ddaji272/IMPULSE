import { playSound } from "./audio.js";
// === SỬA LỖI ÂM THANH: Đảm bảo 'startMusic' được import ===
import { startMusic } from "./audio.js";
// IMPORT skins.js
import { AVATAR_SKINS, BULLET_SKINS } from "./skins.js";

export function setupUI(startGameCallback) {
    
    // --- Lấy tất cả các element DOM ---
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
    const playBtn = document.getElementById("playBtn"); 
    const displayName = document.getElementById("displayName");
    const errorMsg = document.getElementById("error");
    const menuPlayBtn = document.getElementById("btnPlay"); 
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
    const avatarBtn = document.getElementById("avatarBtn");
    const bulletBtn = document.getElementById("bulletBtn");
    const closeBtns = document.querySelectorAll(".closeBtn"); // Lấy tất cả nút đóng

    // --- Helper ---
    function showAuthMsg(msg, isError = false) {
// ... (Hàm này giữ nguyên) ...
// ... existing code ...
        if (!authMsg) return;
        authMsg.style.display = "block";
// ... existing code ...
        authMsg.style.color = isError ? "#ff5c5c" : "#00ffcc";
        authMsg.textContent = msg;
// ... existing code ...
        setTimeout(() => (authMsg.style.display = "none"), 3000);
    }

    // --- Gán sự kiện cho các nút ---

    // Nút "Bắt đầu chơi (Demo)"
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            // === SỬA LỖI ÂM THANH: Thêm 'startMusic' ===
            startMusic(); 
            playSound('button_click');
            const name = displayName.value.trim() || "Guest";
// ... (Logic còn lại giữ nguyên) ...
// ... existing code ...
            if (!name) {
                errorMsg.style.display = "block";
// ... existing code ...
                errorMsg.textContent = "Tên hiển thị không được để trống!";
                return;
// ... existing code ...
            }
            errorMsg.style.display = "none";
// ... existing code ...
            home.style.display = "none";
            canvas.style.display = "block";
// ... existing code ...
            startGameCallback(name);
        });
    }

    // Nút "VÀO GAME" (sau khi đăng nhập)
    if (menuPlayBtn) {
        menuPlayBtn.addEventListener("click", () => {
            // (Không cần thêm startMusic() ở đây,
            // vì người dùng đã click "Đăng nhập" trước đó rồi)
// ... (Logic còn lại giữ nguyên) ...
// ... existing code ...
            playSound('button_click');
            const loggedUser = userDisplay.textContent || "Player";
// ... existing code ...
            const confirmDemo = confirm("Chế độ LAN chưa triển khai. Chơi demo local?");
            if (!confirmDemo) return;
// ... existing code ...
            menu.style.display = "none";
            canvas.style.display = "block";
// ... existing code ...
            startGameCallback(loggedUser);
        });
    }

    // Đăng ký
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            // === SỬA LỖI ÂM THANH: Thêm 'startMusic' ===
            startMusic(); 
            playSound('button_click');
            const user = usernameInput.value.trim();
// ... (Logic còn lại giữ nguyên) ...
// ... existing code ...
            const pass = passwordInput.value.trim();
            if (!user || !pass) {
// ... existing code ...
                showAuthMsg("Vui lòng nhập đầy đủ!", true); return;
            }
// ... existing code ...
            if (localStorage.getItem("user_" + user)) {
                showAuthMsg("Tài khoản đã tồn tại!", true); return;
// ... existing code ...
            }
            const meta = { 
// ... existing code ...
                pass, gold: 1200, 
                ownedAvatars: ["default"], ownedBullets: ["default"],
// ... existing code ...
                currentAvatar: "default", currentBullet: "default"
            };
// ... existing code ...
            localStorage.setItem("user_" + user, JSON.stringify(meta));
            showAuthMsg(`${user} đã đăng ký tài khoản thành công!`);
// ... existing code ...
        });
    }

    // Đăng nhập
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            // === SỬA LỖI ÂM THANH: Thêm 'startMusic' ===
            startMusic(); 
            playSound('button_click');
            const user = usernameInput.value.trim();
// ... (Logic còn lại giữ nguyên) ...
// ... existing code ...
            const pass = passwordInput.value.trim();
            if (!user || !pass) {
// ... existing code ...
                showAuthMsg("Vui lòng nhập đầy đủ!", true); return;
            }
// ... existing code ...
            const raw = localStorage.getItem("user_" + user);
            if (!raw) {
// ... existing code ...
                showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return;
            }
// ... existing code ...
            const meta = JSON.parse(raw);
            if (meta.pass !== pass) {
// ... existing code ...
                showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return;
            }
// ... existing code ...
            userDisplay.textContent = user;
            goldAmount.textContent = meta.gold || 0;
// ... existing code ...
            home.style.display = "none";
            menu.style.display = "block";
// ... existing code ...
        });
    }
    
    // Đăng xuất
// ... (Hàm này giữ nguyên) ...
// ... existing code ...
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
// ... existing code ...
            playSound('button_click');
            menu.style.display = "none";
// ... existing code ...
            home.style.display = "block";
            usernameInput.value = "";
// ... existing code ...
            passwordInput.value = "";
        });
    }

    // Leaderboard & Guide
// ... (Các hàm này giữ nguyên) ...
// ... existing code ...
    function loadLeaderboard() {
        const fakeData = [ { name: "Player1", score: 1500 }, { name: "Player2", score: 1320 } ];
// ... existing code ...
        if (leaderboardList) leaderboardList.innerHTML = fakeData.map(p => `<li>${p.name} — ${p.score} điểm</li>`).join("");
    }

    if (leaderboardBtn) leaderboardBtn.addEventListener("click", () => {
// ... existing code ...
        playSound('button_click');
        loadLeaderboard();
// ... existing code ...
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
    });
    if (leaderboardBtn2) leaderboardBtn2.addEventListener("click", () => {
// ... existing code ...
        playSound('button_click');
        loadLeaderboard();
// ... existing code ...
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
    });
    if (guideBtn) guideBtn.addEventListener("click", () => {
// ... existing code ...
        playSound('button_click');
        if (guidePopup) guidePopup.classList.remove("hidden");
// ... existing code ...
    });
    if (guideBtn2) guideBtn2.addEventListener("click", () => {
// ... existing code ...
        playSound('button_click');
        if (guidePopup) guidePopup.classList.remove("hidden");
// ... existing code ...
    });

    // ========== NÚT ĐÓNG POPUP ==========
// ... (Hàm này giữ nguyên) ...
// ... existing code ...
    closeBtns.forEach(btn =>
        btn.addEventListener("click", () => {
// ... existing code ...
            playSound('button_click');
            if (guidePopup) guidePopup.classList.add("hidden");
// ... existing code ...
            if (leaderboardPopup) leaderboardPopup.classList.add("hidden");
            if (shopPopup) shopPopup.classList.add("hidden");
// ... existing code ...
        })
    );
// ... existing code ...
    // ===================================

    // ========== SHOP ==========
// ... (Toàn bộ logic Shop giữ nguyên) ...
// ... existing code ...
    function openShop(type) {
        if (!shopPopup || !shopTitle || !ownedList || !shopList || !userDisplay || !goldAmount) {
// ... existing code ...
            console.error("Thiếu element DOM cho Shop!");
            return;
// ... existing code ...
        }

        shopTitle.textContent = type === "avatar" ? "Kho Skin Avatar" : "Kho Skin Đạn";
// ... existing code ...
        const currentUser = userDisplay.textContent || null;
        
        const SKIN_DATA = (type === "avatar") ? AVATAR_SKINS : BULLET_SKINS;
// ... existing code ...
        
        let ownedIds = ["default"], meta = { gold: 0 };
// ... existing code ...
        let currentSkinId = "default";

        if (currentUser) {
// ... existing code ...
            const metaRaw = localStorage.getItem("user_" + currentUser);
            if (metaRaw) {
// ... existing code ...
                meta = JSON.parse(metaRaw);
                if (type === "avatar") {
// ... existing code ...
                    ownedIds = meta.ownedAvatars || ["default"];
                    currentSkinId = meta.currentAvatar || "default";
// ... existing code ...
                } else {
                    ownedIds = meta.ownedBullets || ["default"];
// ... existing code ...
                    currentSkinId = meta.currentBullet || "default";
                }
// ... existing code ...
                goldAmount.textContent = meta.gold || 0;
            }
// ... existing code ...
        } else {
            ownedIds = ["default"];
// ... existing code ...
            goldAmount.textContent = "0";
        }
// ... existing code ...

        let ownedHTML = "";
// ... existing code ...
        let shopHTML = "";

        for (const skinId in SKIN_DATA) {
// ... existing code ...
            const skin = SKIN_DATA[skinId];
            if (skinId === "default") continue; 
// ... existing code ...

            if (ownedIds.includes(skinId)) {
// ... existing code ...
                ownedHTML += `
                    <li>
                        ${skin.name} 
                        <button data-id="${skinId}" class="useBtn" ${skinId === currentSkinId ? 'disabled' : ''}>
                            ${skinId === currentSkinId ? 'Đang dùng' : 'Dùng'}
                        </button>
                    </li>`;
            } else {
// ... existing code ...
                shopHTML += `
                    <li>
                        ${skin.name} <strong>${skin.price}🪙</strong> 
                        <button data-id="${skinId}" data-price="${skin.price}" class="buyBtn">Mua</button>
                    </li>`;
// ... existing code ...
            }
        }
// ... existing code ...
        
        const defaultSkinName = (type === "avatar") ? AVATAR_SKINS.default.name : BULLET_SKINS.default.name;
// ... existing code ...
        ownedList.innerHTML = `
            <li>
                ${defaultSkinName}
                <button data-id="default" class="useBtn" ${"default" === currentSkinId ? 'disabled' : ''}>
                    ${"default" === currentSkinId ? 'Đang dùng' : 'Dùng'}
                </button>
            </li>` + ownedHTML;
// ... existing code ...
            
        shopList.innerHTML = shopHTML;
// ... existing code ...
        
        shopPopup.classList.remove("hidden"); 

        // Gán sự kiện cho các nút Mua
// ... existing code ...
        shopPopup.querySelectorAll(".buyBtn").forEach(btn => {
            btn.addEventListener("click", e => {
// ... existing code ...
                playSound('button_click'); // <-- Click trước
                const id = e.currentTarget.dataset.id;
// ... existing code ...
                const price = Number(e.currentTarget.dataset.price);
                
                if (!currentUser) { showAuthMsg("Bạn cần đăng nhập để mua!", true); return; }
// ... existing code ...
                let metaToUpdate = JSON.parse(localStorage.getItem("user_" + currentUser));

                if (metaToUpdate.gold >= price) {
// ... existing code ...
                    playSound('buy'); // <-- THÊM ÂM THANH MUA THÀNH CÔNG
                    metaToUpdate.gold -= price;
// ... existing code ...
                    if (type === "avatar") {
                        metaToUpdate.ownedAvatars.push(id);
// ... existing code ...
                    } else {
                        metaToUpdate.ownedBullets.push(id);
// ... existing code ...
                    }
                    localStorage.setItem("user_" + currentUser, JSON.stringify(metaToUpdate));
// ... existing code ...
                    goldAmount.textContent = metaToUpdate.gold;
                    showAuthMsg("Mua thành công!", false);
// ... existing code ...
                    openShop(type); 
                } else {
// ... existing code ...
                    showAuthMsg("Không đủ tiền!", true);
                }
// ... existing code ...
            });
        });

        // Gán sự kiện cho nút Dùng
// ... existing code ...
        shopPopup.querySelectorAll(".useBtn").forEach(btn => {
            btn.addEventListener("click", e => {
// ... existing code ...
                playSound('button_click');
                const id = e.currentTarget.dataset.id;
// ... existing code ...
                if (!currentUser) { showAuthMsg("Bạn cần đăng nhập để trang bị!", true); return; }
                let metaToUpdate = JSON.parse(localStorage.getItem("user_" + currentUser));
// ... existing code ...
                if (type === "avatar") {
                    metaToUpdate.currentAvatar = id;
// ... existing code ...
                } else {
                    metaToUpdate.currentBullet = id;
// ... existing code ...
                }
                localStorage.setItem("user_" + currentUser, JSON.stringify(metaToUpdate));
// ... existing code ...
                showAuthMsg(`Đã trang bị: ${id}!`, false);
                openShop(type);
// ... existing code ...
            });
        });
    } // --- Hết hàm openShop ---

    // ========== SỬA LỖI AVATAR/BULLET ==========
// ... (Hàm này giữ nguyên) ...
// ... existing code ...
    if (avatarBtn) {
        avatarBtn.addEventListener("click", () => { // <-- SỬA
// ... existing code ...
            playSound('button_click'); // <-- SỬA
            openShop("avatar");
// ... existing code ...
        });
    } else {
// ... existing code ...
        console.error("Lỗi: Không tìm thấy element #avatarBtn");
    }
// ... existing code ...
    
    if (bulletBtn) {
// ... existing code ...
        bulletBtn.addEventListener("click", () => { // <-- SỬA
            playSound('button_click'); // <-- SỬA
// ... existing code ...
            openShop("bullet");
        });
// ... existing code ...
    } else {
        console.error("Lỗi: Không tìm thấy element #bulletBtn");
// ... existing code ...
    }
    // ==========================================
}
