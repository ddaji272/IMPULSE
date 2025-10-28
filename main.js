// ---- MAIN: DOMContentLoaded (replace your current one) ----
document.addEventListener("DOMContentLoaded", () => {
  // setup UI and input first
  setupUI();
  setupInput();

  // ensure home/menu/canvas initial visibility (always show home on load)
  const homeEl = document.getElementById("home");
  const menuEl = document.getElementById("menu");
  const canvasEl = document.getElementById("gameCanvas");

  if (homeEl) homeEl.style.display = "block";
  if (menuEl) menuEl.style.display = "none";
  if (canvasEl) canvasEl.style.display = "none";

  // init canvas after DOM loaded
  initCanvas(canvasEl);

  // start the rest of main (game loop etc)
  let last = performance.now();
  function gameLoop(now) {
    const delta = now - last;
    last = now;
    if (!gameOver) {
      update(delta);
      draw();
      requestAnimationFrame(gameLoop);
    } else {
      drawGameOver();
    }
  }

  window.startGame = function(playerName, opts = { mode: "local" }) {
    player = new Player(playerName, canvas.width/2, canvas.height/2, true);
    bots = [];
    bullets = [];
    keys = {};
    gameOver = false;
    score = 0;

    if (opts.mode === "local") {
      bots.push(new Bot("BOT-1", canvas.width/3, canvas.height/3));
    } else {
      bots.push(new Bot("BOT-1", canvas.width/3, canvas.height/3));
    }

    const randomMap = MAPS[Math.floor(Math.random()*MAPS.length)];
    ctx.font = "28px Poppins";
    ctx.fillStyle = "white";
    ctx.fillText(`Map ngẫu nhiên: ${randomMap}`, 50, 80);

    setTimeout(()=> {
      last = performance.now();
      requestAnimationFrame(gameLoop);
    }, 800);
  };

  // canvas click handler for Game Over buttons (unchanged logic)
  canvasEl.addEventListener("click", (e) => {
    if (!gameOver) return;
    const rect = canvasEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (mx >= replayButton.x && mx <= replayButton.x + replayButton.w &&
        my >= replayButton.y && my <= replayButton.y + replayButton.h) {
      const name = (player && player.name) ? player.name : "Guest";
      startGame(name, { mode: "local" });
      return;
    }

    if (mx >= homeButton.x && mx <= homeButton.x + homeButton.w &&
        my >= homeButton.y && my <= homeButton.y + homeButton.h) {
      // hide canvas
      canvasEl.style.display = "none";
      // if logged in => show menu, else show home
      const loggedUser = document.getElementById("userDisplay").textContent;
      if (loggedUser && loggedUser.trim() !== "") {
        document.getElementById("menu").style.display = "block";
      } else {
        document.getElementById("home").style.display = "block";
      }
    }
  });

}); // end DOMContentLoaded


// ---- NEW setupUI function (replace your existing setupUI) ----
function setupUI() {
  // cached elements
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

  // helper
  function showAuthMsg(msg, isError=false){
    if(!authMsg) return;
    authMsg.style.display="block";
    authMsg.style.color=isError?"#ff5c5c":"#00ffcc";
    authMsg.textContent=msg;
    setTimeout(()=>{ authMsg.style.display="none"; },3000);
  }

  // Ensure initial visibility: home shown, menu hidden
  if (home) home.style.display = "block";
  if (menu) menu.style.display = "none";
  const canvasEl = document.getElementById("gameCanvas");
  if (canvasEl) canvasEl.style.display = "none";

  // Register
  registerBtn && registerBtn.addEventListener("click", ()=>{
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    if(!user || !pass){ showAuthMsg("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", true); return; }
    if(localStorage.getItem("user_"+user)){ showAuthMsg("Tài khoản đã tồn tại!", true); return; }
    const meta = { pass, gold: 1200, ownedAvatars: ["default"], ownedBullets: ["default"] };
    localStorage.setItem("user_"+user, JSON.stringify(meta));
    showAuthMsg(`${user} đã đăng ký tài khoản thành công!`);
  });

  // Login -> hide home, show menu
  loginBtn && loginBtn.addEventListener("click", ()=>{
    const user = usernameInput.value.trim();
    const pass = passwordInput.value.trim();
    const raw = localStorage.getItem("user_"+user);
    if(!raw){ showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return; }
    const meta = JSON.parse(raw);
    if(meta.pass !== pass){ showAuthMsg("Tài khoản hoặc mật khẩu sai!", true); return; }

    // show menu, hide home
    userDisplay.textContent = user;
    goldAmount.textContent = meta.gold || 0;
    if (home) home.style.display = "none";
    if (menu) menu.style.display = "block";
  });

  // Guest demo play (hide home, show canvas)
  playBtn && playBtn.addEventListener("click", ()=>{
    const name = displayName.value.trim();
    if(!name){ errorMsg.style.display="block"; errorMsg.textContent="Tên hiển thị không được để trống!"; return; }
    errorMsg.style.display="none";
    if (home) home.style.display = "none";
    if (canvasEl) canvasEl.style.display = "block";
    startGame(name, { mode: "local" });
  });

  // Menu play (after login)
  menuPlayBtn && menuPlayBtn.addEventListener("click", ()=>{
    const loggedUser = userDisplay.textContent || null;
    if (!loggedUser) { alert("Bạn chưa đăng nhập!"); return; }
    const doOnline = confirm("Chế độ LAN chưa triển khai trong demo. Bắt đầu bản demo local thay thế?");
    if (menu) menu.style.display = "none";
    if (canvasEl) canvasEl.style.display = "block";
    if (doOnline) startGame(loggedUser, { mode: "local" });
    else {
      // if cancel, return to menu
      if (menu) menu.style.display = "block";
      if (canvasEl) canvasEl.style.display = "none";
    }
  });

  // Logout: hide menu, show home (use style.display consistently)
  logoutBtn && logoutBtn.addEventListener("click", ()=>{
    if (menu) menu.style.display = "none";
    if (home) home.style.display = "block";

    // reset fields & UI
    if (usernameInput) usernameInput.value = "";
    if (passwordInput) passwordInput.value = "";
    if (userDisplay) userDisplay.textContent = "";
    if (goldAmount) goldAmount.textContent = "0";

    // ensure canvas hidden
    if (canvasEl) canvasEl.style.display = "none";
  });

  // Leaderboard and Guide handlers (open popups)
  function loadLeaderboard(){
    const fakeData = [
      {name:"Player1",score:1500},
      {name:"Player2",score:1320},
      {name:"Player3",score:1200},
      {name:"Player4",score:800}
    ];
    leaderboardList.innerHTML = fakeData.map(p=>`<li>${p.name} — ${p.score} điểm</li>`).join("");
  }
  leaderboardBtn && leaderboardBtn.addEventListener("click", ()=>{ loadLeaderboard(); leaderboardPopup.classList.remove("hidden"); });
  leaderboardBtn2 && leaderboardBtn2.addEventListener("click", ()=>{ loadLeaderboard(); leaderboardPopup.classList.remove("hidden"); });
  guideBtn && guideBtn.addEventListener("click", ()=>{ guidePopup.classList.remove("hidden"); });
  guideBtn2 && guideBtn2.addEventListener("click", ()=>{ guidePopup.classList.remove("hidden"); });

  closeBtns.forEach(btn=> btn.addEventListener("click", ()=> {
    guidePopup.classList.add("hidden");
    leaderboardPopup.classList.add("hidden");
    shopPopup.classList.add("hidden");
  }));

  // Shop openers
  function openShop(type){
    // same implementation as before... (you can keep your existing openShop code here)
    // For brevity, call your previous openShop implementation if it exists globally
    if (typeof window._openShop === "function") {
      window._openShop(type);
      return;
    }
    // otherwise implement inline as you had earlier (or paste your previous openShop body)
    // ... (keep your earlier logic)
  }

  // wire shop buttons
  btnAvatar && btnAvatar.addEventListener("click", ()=> openShop("avatar"));
  btnBullet && btnBullet.addEventListener("click", ()=> openShop("bullet"));
}
