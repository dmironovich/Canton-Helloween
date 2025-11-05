const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let playerName = "";
let score = 0;
let player;
let pumpkins = [];
let platforms = [];
let gravity = 0.5;
let keys = {};
let gameRunning = false;

function startGame() {
  playerName = document.getElementById("player-name").value || "Anonymous";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("restart-button").style.display = "none";
  score = 0;
  document.getElementById("score").textContent = `Pumpkins: 0`;
  init();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  startGame();
}

function init() {
  // Ступенчатое расположение платформ
  platforms = [];
  const stepY = 100;
  const baseY = canvas.height - 60;
  for (let i = 0; i < 5; i++) {
    platforms.push({
      x: 60 + (i % 2 === 0 ? 0 : 200),
      y: baseY - i * stepY,
      width: 96,
      height: 24,
      img: loadImage("assets/platform.png")
    });
  }

  // Игрок стартует на нижней платформе
  const firstPlatform = platforms[0];
  player = {
    x: firstPlatform.x + 20,
    y: firstPlatform.y - 32,
    width: 32,
    height: 32,
    vy: 0,
    img: loadImage("assets/2canton.png")
  };

  // Тыквы
  pumpkins = [];
  for (let i = 0; i < 5; i++) {
    pumpkins.push({
      x: platforms[i].x + 30,
      y: platforms[i].y - 30,
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
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Движение игрока
  if (keys["ArrowLeft"]) player.x -= 4;
  if (keys["ArrowRight"]) player.x += 4;
  player.vy += gravity;
  player.y += player.vy;

  // Коллизии с платформами
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

  // Сбор тыкв
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

  // Отрисовка игрока
  ctx.drawImage(player.img, player.x, player.y, player.width, player.height);

  // Game Over
  if (player.y > canvas.height) {
    saveScore();
    gameRunning = false;
    document.getElementById("restart-button").style.display = "inline-block";
    alert("Game Over!");
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

