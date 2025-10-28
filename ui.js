function setupUI() {
  // elements
  const home = document.getElementById("home");
  const menu = document.getElementById("menu");
  const authMsg = document.getElementById("authMsg");
  const registerBtn = document.getElementById("registerBtn");
  const loginBtn = document.getElementById("loginBtn");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
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
  const userDisplay = document.getElementById("userDisplay");
  const goldAmount = document.getElementById("goldAmount");
  const menuPlayBtn = document.getElementById("btnPlay");
  const logoutBtn = document.getElementById("btnLogout");
  const btnAvatar = document.getElementById("btnAvatar");
  const btnBullet = document.getElementById("btnBullet");

  // helper: show auth message
  function showAuthMsg(msg, isError=false){
    authMsg.style.display="block";
    authMsg.style.color=isError?"#ff5c5c":"#00ffcc";
    authMsg.textContent=msg;
    setTimeout(()=>authMsg.style.display="none",3000);
  }

  // register
  registerBtn.addEventListener("click", ()=>{
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if(!user || !pass){ showAuthMsg("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", true); return; }
    if(localStorage.getItem("user_"+user)){ showAuthMsg("Tài khoản đã tồn tại!", true); return; }
    // default gold and owned skins
    const meta = { pass, gold: 1200, ownedAvatars: ["default"], ownedBullets: ["default"] };
    localStorage.setItem("user_"+user, JSON.stringify(meta));
    showAuthMsg(`${user} đã đăng ký tài khoản thành công!`);
  });

  // login (show menu)
  loginBtn.addEventListener("click", ()=>{
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const raw = localStorage.getItem("user_"+user);
    if(!raw){ showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return; }
    const meta = JSON.parse(raw);
    if(meta.pass !== pass){ showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return; }

    // logged in -> show menu
    userDisplay.textContent = user;
    goldAmount.textContent = meta.gold || 0;
    home.classList.add("hidden");
    menu.classList.remove("hidden");
  });

  // guest demo play (1 player + bot)
  playBtn.addEventListener("click", ()=>{
    const name = displayName.value.trim();
    if(!name){ errorMsg.style.display="block"; errorMsg.textContent="Tên hiển thị không được để trống!"; return; }
    errorMsg.style.display="none";
    // hide home and show canvas game
    document.getElementById("home").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    // start local demo
    startGame(name, { mode: "local" });
  });

  // menu play (after login) - intended to be online LAN; fallback to demo local
  menuPlayBtn.addEventListener("click", ()=>{
    const loggedUser = userDisplay.textContent || null;
    if (!loggedUser) { alert("Bạn chưa đăng nhập!"); return; }
    // placeholder for LAN matchmaking
    const doOnline = confirm("Chế độ LAN chưa triển khai trong demo. Bắt đầu bản demo local thay thế?");
    document.getElementById("menu").style.display = "none";
    document.getElementById("gameCanvas").style.display = "block";
    if (doOnline) {
      startGame(loggedUser, { mode: "local" }); // fallback
    } else {
      // or cancel: return to menu
      document.getElementById("menu").style.display = "block";
      document.getElementById("gameCanvas").style.display = "none";
    }
  });

  // logout
  logoutBtn.addEventListener("click", ()=>{
    menu.classList.add("hidden");
    home.classList.remove("hidden");
    usernameInput.value = "";
    passwordInput.value = "";
  });

  // leaderboards & guide openers (both on home and menu)
  function loadLeaderboard(){
    // demo data
    const fakeData = [
      {name:"Player1",score:1500},
      {name:"Player2",score:1320},
      {name:"Player3",score:1200},
      {name:"Player4",score:800}
    ];
    leaderboardList.innerHTML = fakeData.map(p=>`<li>${p.name} — ${p.score} điểm</li>`).join("");
  }
  leaderboardBtn.addEventListener("click", ()=>{ loadLeaderboard(); leaderboardPopup.classList.remove("hidden"); });
  leaderboardBtn2.addEventListener("click", ()=>{ loadLeaderboard(); leaderboardPopup.classList.remove("hidden"); });
  guideBtn.addEventListener("click", ()=>{ guidePopup.classList.remove("hidden"); });
  guideBtn2.addEventListener("click", ()=>{ guidePopup.classList.remove("hidden"); });

  // close buttons
  closeBtns.forEach(btn=> btn.addEventListener("click", ()=> {
    guidePopup.classList.add("hidden");
    leaderboardPopup.classList.add("hidden");
    shopPopup.classList.add("hidden");
  }));

  // Shop: Avatar and Bullet buttons open shop popup
  function openShop(type){
    shopTitle.textContent = (type === "avatar") ? "Kho Skin Avatar" : "Kho Skin Đạn";
    // load user data if logged in else show empty with default
    const currentUser = userDisplay.textContent || null;
    let owned = ["default"], shop = [];
    // sample shop items
    if (type === "avatar") {
      shop = [
        {id:"ava_blue", name:"Avatar Xanh", price:300},
        {id:"ava_red", name:"Avatar Đỏ", price:300}
      ];
    } else {
      shop = [
        {id:"bul_yellow", name:"Đạn Vàng", price:200},
        {id:"bul_purple", name:"Đạn Tím", price:250}
      ];
    }
    if (currentUser) {
      const metaRaw = localStorage.getItem("user_"+currentUser);
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        owned = (type === "avatar") ? (meta.ownedAvatars || ["default"]) : (meta.ownedBullets || ["default"]);
        goldAmount.textContent = meta.gold || 0;
      }
    } else {
      // guest: only default
      owned = ["default"];
    }

    // render lists
    ownedList.innerHTML = owned.map(it => `<li>${it} <button data-id="${it}" class="useBtn">Dùng</button></li>`).join("");
    shopList.innerHTML = shop.map(it => `<li>${it.name} <strong>${it.price}🪙</strong> <button data-id="${it.id}" data-price="${it.price}" class="buyBtn">Mua</button></li>`).join("");

    // attach handlers
    shopPopup.classList.remove("hidden");

    // buy handlers
    shopPopup.querySelectorAll(".buyBtn").forEach(b=>{
      b.addEventListener("click", e=>{
        const id = e.currentTarget.dataset.id;
        const price = Number(e.currentTarget.dataset.price);
        const curr = userDisplay.textContent || null;
        if (!curr) { alert("Bạn cần đăng nhập để mua vật phẩm."); return; }
        const meta = JSON.parse(localStorage.getItem("user_"+curr));
        if (meta.gold >= price) {
          meta.gold -= price;
          if (type==="avatar") meta.ownedAvatars = meta.ownedAvatars || ["default"], meta.ownedAvatars.push(id);
          else meta.ownedBullets = meta.ownedBullets || ["default"], meta.ownedBullets.push(id);
          localStorage.setItem("user_"+curr, JSON.stringify(meta));
          goldAmount.textContent = meta.gold;
          alert("Mua thành công!");
          openShop(type); // refresh
        } else {
          alert("Không đủ tiền.");
        }
      });
    });

    // use handlers
    shopPopup.querySelectorAll(".useBtn").forEach(b=>{
      b.addEventListener("click", e=>{
        const id = e.currentTarget.dataset.id;
        alert(`Đang sử dụng: ${id} (demo).`);
      });
    });
  }

  btnAvatar.addEventListener("click", ()=> openShop("avatar"));
  btnBullet.addEventListener("click", ()=> openShop("bullet"));

  // Also wire top-home's avatar/bullet if present in home (IDs might differ)
  const topAvatar = document.getElementById("btnAvatar");
  const topBullet = document.getElementById("btnBullet");
  if (topAvatar) topAvatar.addEventListener("click", ()=> openShop("avatar"));
  if (topBullet) topBullet.addEventListener("click", ()=> openShop("bullet"));
}
