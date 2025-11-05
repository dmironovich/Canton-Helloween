const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const startButton = document.getElementById('start-button');
const playerNameInput = document.getElementById('player-name');
const leaderboard = document.getElementById('scores');

let playerName = '';
let pumpkinsCollected = 0;
let platforms = [];
let pumpkins = [];
let player;
let gameOver = false;
let scrollOffset = 0;

const gravity = 0.5;
const jumpStrength = -10;
const platformSpacing = 100;
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
  startScreen.style.display = 'none';
  canvas.style.display = 'block';
  initGame();
};

function initGame() {
  player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    vy: 0
  };
  pumpkinsCollected = 0;
  platforms = [];
  pumpkins = [];
  scrollOffset = 0;
  gameOver = false;

  for (let i = 0; i < 10; i++) {
    createPlatform(i);
  }

  requestAnimationFrame(gameLoop);
}

function createPlatform(index) {
  const x = Math.random() * (canvas.width - 80);
  const y = canvas.height - index * platformSpacing;
  platforms.push({ x, y, width: 80, height: 20 });

  if (pumpkinPattern.includes(index % 10)) {
    pumpkins.push({ x: x + 30, y: y - 20, width: 20, height: 20, collected: false });
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
  while (platforms.length < 10) {
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
  ctx.font = '20px monospace';
  ctx.fillText(`🎃 Collected: ${pumpkinsCollected}`, 10, 30);

  if (player.y > canvas.height) {
    endGame();
    return;
  }

  requestAnimationFrame(gameLoop);
}

function endGame() {
  gameOver = true;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
  ctx.fillStyle = 'orange';
  ctx.font = '20px monospace';
  ctx.fillText(`🎃 Collected: ${pumpkinsCollected}`, canvas.width / 2 - 80, canvas.height / 2 - 10);
  ctx.fillText(`Click to Restart`, canvas.width / 2 - 70, canvas.height / 2 + 20);

  saveScore();
  canvas.onclick = () => {
    if (gameOver) {
      canvas.onclick = null;
      initGame();
    }
  };
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
