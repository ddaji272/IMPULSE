// ========== Logic game ==========

class Player {
  constructor(name, x, y, isLocal = true) {
    this.name = name;
    this.x = x;
    this.y = y;
    this.dirX = 0;
    this.dirY = -1;
    this.alive = true;
    this.isLocal = isLocal;
  }
}

class Bullet {
  constructor(x, y, vx, vy, owner = null) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.bounceCount = 0;
    this.remove = false;
    this.owner = owner; // optional reference
  }
}

class Bot extends Player {
  constructor(name, x, y) {
    super(name, x, y, false);
    this.vx = (Math.random() * 2 - 1) * 1.2;
    this.vy = (Math.random() * 2 - 1) * 1.2;
    this.shootTimer = 0;
  }

  update(delta, player) {
    // Move and bounce in canvas bounds
    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 30 || this.x > canvas.width - 30) this.vx *= -1;
    if (this.y < 30 || this.y > canvas.height - 30) this.vy *= -1;

    // occasionally change direction
    if (Math.random() < 0.01) {
      this.vx = (Math.random() * 2 - 1) * 1.5;
      this.vy = (Math.random() * 2 - 1) * 1.5;
    }

    // shoot at player occasionally
    this.shootTimer += delta;
    if (this.shootTimer > 900) { // bot shoots roughly every ~0.9s
      this.shootTimer = 0;
      // compute vector toward player
      const dx = player.x - this.x;
      const dy = player.y - this.y;
      const len = Math.hypot(dx, dy) || 1;
      const vx = dx / len;
      const vy = dy / len;
      bullets.push(new Bullet(this.x + vx*25, this.y + vy*25, vx, vy, this));
    }
  }
}

// Global game state
let player = null;
let bots = [];
let bullets = [];
let gameOver = false;
let score = 0;
let keys = {};
let canShoot = true;
let lastTime = 0;

// Update loop (called from main.js gameLoop)
function update(delta) {
  if (!player || !player.alive) return;

  // Player movement (local only)
  let dx = 0, dy = 0;
  if (keys["w"] || keys["arrowup"]) dy -= 1;
  if (keys["s"] || keys["arrowdown"]) dy += 1;
  if (keys["a"] || keys["arrowleft"]) dx -= 1;
  if (keys["d"] || keys["arrowright"]) dx += 1;

  if (dx || dy) {
    const len = Math.sqrt(dx*dx + dy*dy);
    dx /= len; dy /= len;
    player.x += dx * PLAYER_SPEED;
    player.y += dy * PLAYER_SPEED;
    player.dirX = dx; player.dirY = dy;
  }

  // shoot
  if (keys[" "]) shootBullet();

  // update bullets
  bullets.forEach(b => {
    b.x += b.vx * BULLET_SPEED;
    b.y += b.vy * BULLET_SPEED;

    let bounced = false;
    if (b.x <= 0 || b.x >= canvas.width) { b.vx *= -1; bounced = true; }
    if (b.y <= 0 || b.y >= canvas.height) { b.vy *= -1; bounced = true; }
    if (bounced) b.bounceCount++;
    if (b.bounceCount > MAX_BULLET_BOUNCE) b.remove = true;

    // collision vs local player
    if (player.alive) {
      const dist = Math.hypot(b.x - player.x, b.y - player.y);
      if (dist < PLAYER_RADIUS) {
        // ignore bullets just spawned by player himself shortly after spawn
        if (b.owner !== player) {
          player.alive = false;
          gameOver = true;
        }
      }
    }
  });

  // update bots
  bots.forEach(bot => bot.update(delta, player));

  // cleanup
  bullets = bullets.filter(b => !b.remove);
}

// shooting api
function shootBullet() {
  if (!canShoot || !player.alive) return;
  canShoot = false;
  setTimeout(()=> canShoot = true, SHOOT_COOLDOWN);

  const len = Math.sqrt(player.dirX*player.dirX + player.dirY*player.dirY);
  const vx = len === 0 ? 0 : player.dirX / len;
  const vy = len === 0 ? -1 : player.dirY / len;

  const bulletStartX = player.x + vx*25;
  const bulletStartY = player.y + vy*25;

  bullets.push(new Bullet(bulletStartX, bulletStartY, vx, vy, player));
}
