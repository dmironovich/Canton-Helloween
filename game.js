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
let scrollOffset = 0;
let platformCounter = 0;

function startGame() {
  playerName = document.getElementById("player-name").value || "Anonymous";
  document.getElementById("start-screen").style.display = "none";
  document.getElementById("game-container").style.display = "block";
  document.getElementById("restart-button").style.display = "none";
  score = 0;
  scrollOffset = 0;
  platformCounter = 0;
  document.getElementById("score").textContent = `Pumpkins: 0`;
  init();
  gameRunning = true;
  requestAnimationFrame(gameLoop);
}

function restartGame() {
  startGame();
}

function init() {
  platforms = [];
  pumpkins = [];

  // Начальные платформы
  for (let i = 0; i < 12; i++) {
    addPlatform(i);
  }

  const firstPlatform = platforms[0];
  player = {
    x: firstPlatform.x + 20,
    y: firstPlatform.y - 32,
    width: 32,
    height: 32,
    vy: 0,
    img: loadImage("assets/canton.png")
  };

  window.addEventListener("keydown", e => keys[e.key] = true);
  window.addEventListener("keyup", e => keys[e.key] = false);
}

function addPlatform(index) {
  const stepY = 60;
  const y = canvas.height - 60 - index * stepY;
  const x = 80 + (index % 2 === 0 ? 0 : 120);
  platforms.push({
    x,
    y,
    width: 96,
    height: 24,
    img: loadImage("assets/platform.png"),
    id: platformCounter++
  });

  if (index === 2 || index % 4 === 0 || index % 7 === 0) {
    pumpkins.push({
      x: x + 30,
      y: y - 30,
      width: 24,
      height: 24,
      collected: false,
      img: loadImage("assets/pumpkin.png"),
      platformId: platformCounter - 1
    });
  }
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

  // Прокрутка вверх
  if (player.y < canvas.height / 2) {
    const delta = canvas.height / 2 - player.y;
    player.y = canvas.height / 2;
    scrollOffset += delta;
    platforms.forEach(p => p.y += delta);
    pumpkins.forEach(p => p.y += delta);
  }

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

  // Удаление нижних платформ
  platforms = platforms.filter(p => p.y < canvas.height + 100);
  pumpkins = pumpkins.filter(p => p.y < canvas.height + 100);

  // Добавление новых платформ
  const highestY = Math.min(...platforms.map(p => p.y));
  while (highestY > -60 * 2) {
    addPlatform(platforms.length);
  }

  // Game Over
  if (player.y > canvas.height) {
    saveScore();
    gameRunning = false;
    showRestart(score);
  }

  requestAnimationFrame(gameLoop);
}

function showRestart(finalScore) {
  const btn = document.getElementById("restart-button");
  btn.style.display = "inline-block";
  btn.style.position = "absolute";
  btn.style.left = "50%";
  btn.style.top = "50%";
  btn.style.transform = "translate(-50%, -50%)";
  btn.innerHTML = `Restart<br>🎃 Собрано: ${finalScore} тыкв`;
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

