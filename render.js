let canvas, ctx;
let replayButton = { x:0, y:0, w:REPLAY_BTN.w, h:REPLAY_BTN.h };
let homeButton = { x:0, y:0, w:REPLAY_BTN.w, h:REPLAY_BTN.h };

function initCanvas(c) {
  canvas = c;
  ctx = canvas.getContext("2d");
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);
}

function resizeCanvas(){
  if(!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function draw() {
  if(!ctx) return;
  ctx.fillStyle = CANVAS_BG_COLOR;
  ctx.fillRect(0,0,canvas.width, canvas.height);

  // draw bots
  bots.forEach(b => {
    ctx.fillStyle = "#ff7a7a";
    ctx.beginPath();
    ctx.arc(b.x, b.y, PLAYER_RADIUS,0,Math.PI*2);
    ctx.fill();

    ctx.font = "14px Poppins";
    ctx.fillStyle = "white";
    const w = ctx.measureText(b.name).width;
    ctx.fillText(b.name, b.x - w/2, b.y - PLAYER_RADIUS - 8);
  });

  // player
  if (player && player.alive) {
    ctx.fillStyle = PLAYER_COLOR;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS,0,Math.PI*2);
    ctx.fill();

    ctx.font = "16px Poppins";
    ctx.fillStyle = "white";
    const textWidth = ctx.measureText(player.name).width;
    ctx.fillText(player.name, player.x-textWidth/2, player.y-25);
  }

  // bullets
  ctx.fillStyle = BULLET_COLOR;
  bullets.forEach(b=>{
    ctx.beginPath();
    ctx.arc(b.x,b.y,BULLET_RADIUS,0,Math.PI*2);
    ctx.fill();
  });
}

function drawGameOver() {
  ctx.fillStyle = "rgba(0,0,0,0.7)";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  ctx.fillStyle="#ff4d4d";
  ctx.font="60px Poppins";
  ctx.textAlign="center";
  ctx.fillText("💀 GAME OVER 💀", canvas.width/2, canvas.height/2-40);

  ctx.fillStyle="white";
  ctx.font="30px Poppins";
  ctx.fillText(`Điểm của bạn: ${score}`, canvas.width/2, canvas.height/2+10);

  // nút replay
  replayButton.x = canvas.width/2 - REPLAY_BTN.w/2;
  replayButton.y = canvas.height/2 + 50;
  ctx.fillStyle="#00cc99";
  ctx.fillRect(replayButton.x, replayButton.y, REPLAY_BTN.w, REPLAY_BTN.h);
  ctx.fillStyle="black";
  ctx.font="26px Poppins";
  ctx.fillText("Chơi lại", canvas.width/2, replayButton.y+40);

  // nút về trang chủ (về menu đã đăng nhập)
  homeButton.x = canvas.width/2 - REPLAY_BTN.w/2;
  homeButton.y = replayButton.y + REPLAY_BTN.h + 20; // cách 20px bên dưới
  ctx.fillStyle="#3399ff";
  ctx.fillRect(homeButton.x, homeButton.y, homeButton.w, homeButton.h);
  ctx.fillStyle="white";
  ctx.fillText("Về Trang Chủ", canvas.width/2, homeButton.y + 40);
}
