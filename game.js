const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
let playerName = "";
let score = 0;
let player, pumpkins = [], platforms = [], gravity = 0.5;
let keys = {};

function startGame() {
  playerName = document.getElementById("player-name").value || "Anonymous";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  init();
  requestAnimationFrame(gameLoop);
}

function init() {
  player = {
    x: 200,
    y: 500,
    width: 32,
    height: 32,
    vy: 0,
    img: loadImage("assets/canton.png")
  };

  for (let i = 0; i < 5; i++) {
    platforms.push({
      x: Math.random() * 400,
      y: i * 120 + 100,
      width: 80,
      height: 20,
      img: loadImage("assets/platform.png")
    });
  }

  for (let i = 0; i < 3; i++) {
    pumpkins.push({
      x: Math.random() * 400,
      y: Math.random() * 500,
      width: 24,
      height: 24,
      collected: false,
      img: loadImage("assets/pumpkin.png")
    });
  }

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);
}

function loadImage(src) {
  const img = new Image();
  img.src = src;
  return img;
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Move player
  if (keys["ArrowLeft"]) player.x -= 4;
  if (keys["ArrowRight"]) player.x += 4;
  player.vy += gravity;
  player.y += player.vy;

  // Collision with platforms
  platforms.forEach(p => {
    if (
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y + player.height < p.y + p.height &&
      player.y + player.height + player.vy >= p.y
    ) {
      player.vy = -10;
    }
    ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
  });

  // Collect pumpkins
  pumpkins.forEach(p => {
    if (!p.collected &&
      player.x < p.x + p.width &&
      player.x + player.width > p.x &&
      player.y < p.y + p.height &&
      player.y + player.height > p.y
    ) {
      p.collected = true;
      score++;
      document.getElementById("score").textContent = `Pumpkins: ${score}`;
    }
    if (!p.collected) ctx.drawImage(p.img, p.x, p.y, p.width, p.height);
  });

  // Draw player
  ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

  // Game over
  if (player.y > canvas.height) {
    saveScore();
    alert("Game Over!");
    location.reload();
  }

  requestAnimationFrame(gameLoop);
}

function saveScore() {
  let scores = JSON.parse(localStorage.getItem("cantonScores") || "[]");
  scores.push({ name: playerName, score });
  scores.sort((a, b) => b.score - a.score);
  scores = scores.slice(0, 5);
  localStorage.setItem("cantonScores", JSON.stringify(scores));
  updateLeaderboard(scores);
}

function updateLeaderboard(scores) {
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";
  scores.forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.name}: 🎃 ${s.score}`;
    list.appendChild(li);
  });
}

updateLeaderboard(JSON.parse(localStorage.getItem("cantonScores") || "[]"));
