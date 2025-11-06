// js/ui.js (Phiên bản HOÀN CHỈNH)

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
        if (!authMsg) return;
        authMsg.style.display = "block";
        authMsg.style.color = isError ? "#ff5c5c" : "#00ffcc";
        authMsg.textContent = msg;
        setTimeout(() => (authMsg.style.display = "none"), 3000);
    }

    // --- Gán sự kiện cho các nút ---

    // Nút "Bắt đầu chơi (Demo)"
    if (playBtn) {
        playBtn.addEventListener("click", () => {
            const name = displayName.value.trim() || "Guest";
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

    // Nút "VÀO GAME" (sau khi đăng nhập)
    if (menuPlayBtn) {
        menuPlayBtn.addEventListener("click", () => {
            const loggedUser = userDisplay.textContent || "Player";
            const confirmDemo = confirm("Chế độ LAN chưa triển khai. Chơi demo local?");
            if (!confirmDemo) return;
            menu.style.display = "none";
            canvas.style.display = "block";
            startGameCallback(loggedUser);
        });
    }

    // Đăng ký
    if (registerBtn) {
        registerBtn.addEventListener("click", () => {
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();
            if (!user || !pass) {
                showAuthMsg("Vui lòng nhập đầy đủ!", true); return;
            }
            if (localStorage.getItem("user_" + user)) {
                showAuthMsg("Tài khoản đã tồn tại!", true); return;
            }
            const meta = { 
                pass, gold: 1200, 
                ownedAvatars: ["default"], ownedBullets: ["default"],
                currentAvatar: "default", currentBullet: "default"
            };
            localStorage.setItem("user_" + user, JSON.stringify(meta));
            showAuthMsg(`${user} đã đăng ký tài khoản thành công!`);
        });
    }

    // Đăng nhập
    if (loginBtn) {
        loginBtn.addEventListener("click", () => {
            const user = usernameInput.value.trim();
            const pass = passwordInput.value.trim();
            if (!user || !pass) {
                showAuthMsg("Vui lòng nhập đầy đủ!", true); return;
            }
            const raw = localStorage.getItem("user_" + user);
            if (!raw) {
                showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return;
            }
            const meta = JSON.parse(raw);
            if (meta.pass !== pass) {
                showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return;
            }
            userDisplay.textContent = user;
            goldAmount.textContent = meta.gold || 0;
            home.style.display = "none";
            menu.style.display = "block";
        });
    }
    
    // Đăng xuất
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            menu.style.display = "none";
            home.style.display = "block";
            usernameInput.value = "";
            passwordInput.value = "";
        });
    }

    // Leaderboard & Guide
    function loadLeaderboard() {
        const fakeData = [ { name: "Player1", score: 1500 }, { name: "Player2", score: 1320 } ];
        if (leaderboardList) leaderboardList.innerHTML = fakeData.map(p => `<li>${p.name} — ${p.score} điểm</li>`).join("");
    }

    if (leaderboardBtn) leaderboardBtn.addEventListener("click", () => {
        loadLeaderboard();
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
    });
    if (leaderboardBtn2) leaderboardBtn2.addEventListener("click", () => {
        loadLeaderboard();
        if (leaderboardPopup) leaderboardPopup.classList.remove("hidden");
    });
    if (guideBtn) guideBtn.addEventListener("click", () => {
        if (guidePopup) guidePopup.classList.remove("hidden");
    });
    if (guideBtn2) guideBtn2.addEventListener("click", () => {
        if (guidePopup) guidePopup.classList.remove("hidden");
    });

    // ========== THÊM LẠI LOGIC NÚT ĐÓNG ==========
    closeBtns.forEach(btn =>
        btn.addEventListener("click", () => {
            if (guidePopup) guidePopup.classList.add("hidden");
            if (leaderboardPopup) leaderboardPopup.classList.add("hidden");
            if (shopPopup) shopPopup.classList.add("hidden");
        })
    );
    // ============================================

    // ========== SHOP ==========
    function openShop(type) {
        if (!shopPopup || !shopTitle || !ownedList || !shopList || !userDisplay || !goldAmount) {
            console.error("Thiếu element DOM cho Shop!");
            return;
        }

        shopTitle.textContent = type === "avatar" ? "Kho Skin Avatar" : "Kho Skin Đạn";
        const currentUser = userDisplay.textContent || null;
        
        const SKIN_DATA = (type === "avatar") ? AVATAR_SKINS : BULLET_SKINS;
        
        let ownedIds = ["default"], meta = { gold: 0 };
        let currentSkinId = "default";

        if (currentUser) {
            const metaRaw = localStorage.getItem("user_" + currentUser);
            if (metaRaw) {
                meta = JSON.parse(metaRaw);
                if (type === "avatar") {
                    ownedIds = meta.ownedAvatars || ["default"];
                    currentSkinId = meta.currentAvatar || "default";
                } else {
                    ownedIds = meta.ownedBullets || ["default"];
                    currentSkinId = meta.currentBullet || "default";
                }
                goldAmount.textContent = meta.gold || 0;
            }
        } else {
            ownedIds = ["default"];
            goldAmount.textContent = "0";
        }

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

        // Gán sự kiện cho các nút Mua
        shopPopup.querySelectorAll(".buyBtn").forEach(btn => {
            btn.addEventListener("click", e => {
                const id = e.currentTarget.dataset.id;
                const price = Number(e.currentTarget.dataset.price);
                
                if (!currentUser) { showAuthMsg("Bạn cần đăng nhập để mua!", true); return; }
                let metaToUpdate = JSON.parse(localStorage.getItem("user_" + currentUser));

                if (metaToUpdate.gold >= price) {
                    metaToUpdate.gold -= price;
                    if (type === "avatar") {
                        metaToUpdate.ownedAvatars.push(id);
                    } else {
                        metaToUpdate.ownedBullets.push(id);
                    }
                    localStorage.setItem("user_" + currentUser, JSON.stringify(metaToUpdate));
                    goldAmount.textContent = metaToUpdate.gold;
                    showAuthMsg("Mua thành công!", false);
                    openShop(type); 
                } else {
                    showAuthMsg("Không đủ tiền!", true);
                }
            });
        });

        // Gán sự kiện cho nút Dùng
        shopPopup.querySelectorAll(".useBtn").forEach(btn => {
            btn.addEventListener("click", e => {
                const id = e.currentTarget.dataset.id;
                if (!currentUser) { showAuthMsg("Bạn cần đăng nhập để trang bị!", true); return; }
                let metaToUpdate = JSON.parse(localStorage.getItem("user_" + currentUser));
                if (type === "avatar") {
                    metaToUpdate.currentAvatar = id;
                } else {
                    metaToUpdate.currentBullet = id;
                }
                localStorage.setItem("user_" + currentUser, JSON.stringify(metaToUpdate));
                showAuthMsg(`Đã trang bị: ${id}!`, false);
                openShop(type);
            });
        });
    } // --- Hết hàm openShop ---

    // ========== THÊM LẠI LOGIC NÚT AVATAR/BULLET ==========
    if (avatarBtn) {
        avatarBtn.addEventListener("click", () => openShop("avatar"));
    } else {
        console.error("Lỗi: Không tìm thấy element #avatarBtn");
    }
    
    if (bulletBtn) {
        bulletBtn.addEventListener("click", () => openShop("bullet"));
    } else {
        console.error("Lỗi: Không tìm thấy element #bulletBtn");
    }
    // ==================================================
}
