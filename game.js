const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
canvas.width = 400;
canvas.height = window.innerHeight;

const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const playerNameInput = document.getElementById('player-name');
const leaderboard = document.getElementById('scores');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');
const lobbyButton = document.getElementById('lobby-button');
const gameHeader = document.getElementById('game-header');

let playerName = '';
let pumpkinsCollected = 0;
let platforms = [];
let pumpkins = [];
let player;
let gameOver = false;
let scrollOffset = 0;

const gravity = 0.5;
const jumpStrength = -10;
const platformSpacing = canvas.height / 12;
const platformHeight = canvas.height / 10;
const platformWidth = canvas.width / 1.5;
const pumpkinPattern = [3, 4, 7];

const images = {};
const loadImage = (name, src) => {
  const img = new Image();
  img.src = src;
  images[name] = img;
};

loadImage('player', 'assets/player.png');
loadImage('platform', 'assets/platform.png');
loadImage('pumpkin', 'assets/pumpkin.png');

startButton.onclick = () => {
  playerName = playerNameInput.value || 'Player';
  startScreen.classList.remove('active');
  canvas.style.display = 'block';
  gameHeader.style.display = 'block';
  initGame();
};

restartButton.onclick = () => {
  gameOverScreen.classList.remove('active');
  initGame();
};

lobbyButton.onclick = () => {
  gameOverScreen.classList.remove('active');
  canvas.style.display = 'none';
  gameHeader.style.display = 'none';
  startScreen.classList.add('active');
};

function initGame() {
  platforms = [];
  pumpkins = [];
  scrollOffset = 0;
  gameOver = false;
  pumpkinsCollected = 0;

  for (let i = 0; i < 20; i++) {
    createPlatform(i);
  }

  const firstPlatform = platforms[0];
  player = {
    x: firstPlatform.x + firstPlatform.width / 2 - canvas.width / 20,
    y: firstPlatform.y - canvas.height / 15,
    width: canvas.width / 10,
    height: canvas.height / 15,
    vy: jumpStrength
  };

  requestAnimationFrame(gameLoop);
}

function createPlatform(index) {
  const x = Math.random() * (canvas.width - platformWidth);
  const y = canvas.height - index * platformSpacing;
  platforms.push({ x, y, width: platformWidth, height: platformHeight });

  if (pumpkinPattern.includes(index % 10)) {
    pumpkins.push({
      x: x + platformWidth / 2 - canvas.width / 40,
      y: y - canvas.height / 30,
      width: canvas.width / 20,
      height: canvas.height / 30,
      collected: false
    });
  }
}

function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  player.vy += gravity;
  player.y += player.vy;

  if (player.y < canvas.height / 2) {
    const dy = canvas.height / 2 - player.y;
    player.y = canvas.height / 2;
    scrollOffset += dy;
    platforms.forEach(p => p.y += dy);
    pumpkins.forEach(p => p.y += dy);
  }

  platforms = platforms.filter(p => p.y < canvas.height);
  while (platforms.length < 20) {
    createPlatform(platforms.length + scrollOffset / platformSpacing);
  }

  platforms.forEach(p => {
    ctx.drawImage(images.platform, p.x, p.y, p.width, p.height);
    if (
      player.vy > 0 &&
      player.x + player.width > p.x &&
      player.x < p.x + p.width &&
      player.y + player.height > p.y &&
      player.y + player.height < p.y + p.height + player.vy
    ) {
      player.vy = jumpStrength;
    }
  });

  pumpkins.forEach(p => {
    if (!p.collected) {
      ctx.drawImage(images.pumpkin, p.x, p.y, p.width, p.height);
      if (
        player.x < p.x + p.width &&
        player.x + player.width > p.x &&
        player.y < p.y + p.height &&
        player.y + player.height > p.y
      ) {
        p.collected = true;
        pumpkinsCollected++;
      }
    }
  });

  ctx.drawImage(images.player, player.x, player.y, player.width, player.height);
  ctx.fillStyle = 'orange';
  ctx.font = `${canvas.width / 25}px monospace`;
  ctx.fillText(`🎃 Collected: ${pumpkinsCollected}`, 10, 30);

  if (player.y > canvas.height) {
    endGame();
    return;
  }

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  canvas.onclick = null;
  finalScore.textContent = pumpkinsCollected;
  gameOverScreen.classList.add('active');
  saveScore();
}

function saveScore() {
  const scores = JSON.parse(localStorage.getItem('halloweenScores') || '[]');
  scores.push({ name: playerName, score: pumpkinsCollected });
  scores.sort((a, b) => b.score - a.score);
  localStorage.setItem('halloweenScores', JSON.stringify(scores.slice(0, 5)));
  updateLeaderboard();
}

function updateLeaderboard() {
  leaderboard.innerHTML = '';
  const scores = JSON.parse(localStorage.getItem('halloweenScores') || '[]');
  scores.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.name}: ${s.score} 🎃`;
    leaderboard.appendChild(li);
  });
}

// Управление с клавиатуры
document.addEventListener('keydown', (e) => {
  if (!player) return;
  if (e.key === 'ArrowLeft') player.x -= canvas.width /
