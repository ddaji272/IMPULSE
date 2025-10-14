const playBtn = document.getElementById("playBtn");
const nameInput = document.getElementById("displayName");
const errorMsg = document.getElementById("error");
const authMsg = document.getElementById("authMsg");
const canvas = document.getElementById("gameCanvas");
const menu = document.getElementById("menu");

const guidePopup = document.getElementById("guidePopup");
const leaderboardPopup = document.getElementById("leaderboardPopup");
const leaderboardList = document.getElementById("leaderboardList");

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("registerBtn");
const loginBtn = document.getElementById("loginBtn");

let loggedInUser = null;
let ctx, player, bullets = [];
let keys = {};
let canShoot = true;
const shootCooldown = 500;
const playerSpeed = 5;
const bulletSpeed = 10;
let gameOver = false;
let score = 0;

// ================== AUTH SECTION ==================
registerBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();
  if (user === "" || pass === "") {
    showAuthMsg("Vui lòng nhập đầy đủ tài khoản và mật khẩu!", true);
    return;
  }

  if (localStorage.getItem(user)) {
    showAuthMsg("Tài khoản đã tồn tại!", true);
    return;
  }

  localStorage.setItem(user, pass);
  showAuthMsg(`${user} đã đăng ký tài khoản thành công!`);
});

loginBtn.addEventListener("click", () => {
  const user = usernameInput.value.trim();
  const pass = passwordInput.value.trim();

  if (user === "" || pass === "") {
    showAuthMsg("Vui lòng nhập tài khoản và mật khẩu!", true);
    return;
  }

  const savedPass = localStorage.getItem(user);
  if (savedPass && savedPass === pass) {
    loggedInUser = user;
    showAuthMsg(`Chào mừng ${user} đã trở lại!`);
  } else {
    showAuthMsg("Tài khoản hoặc mật khẩu sai!", true);
  }
});

function showAuthMsg(msg, isError = false) {
  authMsg.style.display = "block";
  authMsg.style.color = isError ? "#ff5c5c" : "#00ffcc";
  authMsg.textContent = msg;
  setTimeout(() => (authMsg.style.display = "none"), 3000);
}

// ================== PLAY ==================
playBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  if (name === "") {
    errorMsg.style.display = "block";
    errorMsg.textContent = "Tên hiển thị không được để trống!";
    return;
  }

  errorMsg.style.display = "none";
  menu.style.display = "none";
  canvas.style.display = "block";

  startGame(name);
});

// ================== START GAME ==================
function startGame(playerName) {
  ctx = canvas.getContext("2d");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const maps = ["Maze 1", "Maze 2", "Maze 3"];
  const randomMap = maps[Math.floor(Math.random() * maps.length)];

  player = {
    name: playerName,
    x: canvas.width / 2,
    y: canvas.height / 2,
    dirX: 0,
    dirY: -1,
    alive: true,
  };

  bullets = [];
  keys = {};
  gameOver = false;
  score = 0;

  window.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
  window.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

  ctx.font = "30px Poppins";
  ctx.fillStyle = "white";
  ctx.fillText(`Map ngẫu nhiên: ${randomMap}`, 50, 80);

  setTimeout(gameLoop, 1000);
}

// ================== GAME LOOP ==================
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    drawGameOver();
  }
}

// ================== UPDATE ==================
function update() {
  if (!player.alive) return;

  let dx = 0, dy = 0;
  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.sqrt(dx * dx + dy * dy);
    dx /= len;
    dy /= len;
    player.x += dx * playerSpeed;
    player.y += dy * playerSpeed;
    player.dirX = dx;
    player.dirY = dy;
  }

  if (keys[" "]) shootBullet();

  bullets.forEach(b => {
    b.x += b.vx * bulletSpeed;
    b.y += b.vy * bulletSpeed;

    let bounced = false;
    if (b.x <= 0 || b.x >= canvas.width) {
      b.vx *= -1;
      bounced = true;
    }
    if (b.y <= 0 || b.y >= canvas.height) {
      b.vy *= -1;
      bounced = true;
    }

    if (bounced) b.bounceCount++;
    if (b.bounceCount > 3) b.remove = true;

    // ====== Kiểm tra va chạm giữa đạn và người chơi ======
    const dist = Math.hypot(b.x - player.x, b.y - player.y);
    if (dist < 15) {
      player.alive = false;
      gameOver = true;
    }
  });

  bullets = bullets.filter(b => !b.remove);
}

// ================== SHOOT ==================
function shootBullet() {
  if (!canShoot || !player.alive) return;
  canShoot = false;
  setTimeout(() => canShoot = true, shootCooldown);

  const len = Math.sqrt(player.dirX * player.dirX + player.dirY * player.dirY);
  const vx = len === 0 ? 0 : player.dirX / len;
  const vy = len === 0 ? -1 : player.dirY / len;

  // Tạo viên đạn xuất hiện lệch ra 25px trước mặt người chơi
  const bulletStartX = player.x + vx * 25;
  const bulletStartY = player.y + vy * 25;

  const bullet = {
    x: bulletStartX,
    y: bulletStartY,
    vx: vx,
    vy: vy,
    bounceCount: 0,
    remove: false,
  };
  bullets.push(bullet);
}

// ================== DRAW ==================
function draw() {
  ctx.fillStyle = "#0d1117";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Vẽ người chơi
  if (player.alive) {
    ctx.fillStyle = "cyan";
    ctx.beginPath();
    ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = "16px Poppins";
    ctx.fillStyle = "white";
    const textWidth = ctx.measureText(player.name).width;
    ctx.fillText(player.name, player.x - textWidth / 2, player.y - 25);
  }

  // Vẽ đạn
  ctx.fillStyle = "yellow";
  bullets.forEach(b => {
    ctx.beginPath();
    ctx.arc(b.x, b.y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ================== GAME OVER ==================
function drawGameOver() {
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "#ff4d4d";
  ctx.font = "60px Poppins";
  ctx.textAlign = "center";
  ctx.fillText("💀 GAME OVER 💀", canvas.width / 2, canvas.height / 2 - 20);

  ctx.fillStyle = "white";
  ctx.font = "30px Poppins";
  ctx.fillText(`Điểm của bạn: ${score}`, canvas.width / 2, canvas.height / 2 + 40);

  ctx.font = "20px Poppins";
  ctx.fillText("Nhấn F5 để chơi lại", canvas.width / 2, canvas.height / 2 + 100);
}

// ================== POPUPS ==================
document.getElementById("guideBtn").addEventListener("click", () => {
  guidePopup.classList.remove("hidden");
});
document.getElementById("leaderboardBtn").addEventListener("click", () => {
  loadLeaderboard();
  leaderboardPopup.classList.remove("hidden");
});
document.querySelectorAll(".closeBtn").forEach(btn => {
  btn.addEventListener("click", () => {
    guidePopup.classList.add("hidden");
    leaderboardPopup.classList.add("hidden");
  });
});

// ================== FAKE LEADERBOARD ==================
function loadLeaderboard() {
  const fakeData = [
    { name: "Player1", score: 1500 },
    { name: "Player2", score: 1320 },
    { name: "Player3", score: 1200 },
    { name: "Player4", score: 800 },
  ];
  leaderboardList.innerHTML = fakeData
    .map(p => `<li>${p.name} — ${p.score} điểm</li>`)
    .join("");
}


