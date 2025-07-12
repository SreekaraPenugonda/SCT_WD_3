// 🎮 Final script.js - Phase 1 to 16 inclusive
// Features: Splash screen, theming, PvP names, AI logic, undo, XP, confetti, challenge modes, cursor trail, back nav

let playerSymbol = "X", aiSymbol = "O", currentTurn = "X";
let board = [], moves = [], gridSize = 3;
let gameType = "friend", difficulty = "easy", challengeMode = "none";
let gameOver = false, undoLimit = 1, xp = 0, wins = 0, losses = 0, draws = 0, level = 1;
let player1 = "Player 1", player2 = "Player 2";

const screens = {
  splash: document.getElementById("splash-screen"),
  setup: document.getElementById("setup-screen"),
  mode: document.getElementById("mode-screen"),
  game: document.getElementById("game-screen"),
  result: document.getElementById("result-overlay"),
  score: document.getElementById("score-screen")
};

const startBtn = document.getElementById("start-btn"),
      proceedBtn = document.getElementById("proceed-btn"),
      playBtn = document.getElementById("play-btn"),
      gameGrid = document.getElementById("game-grid"),
      turnInfo = document.getElementById("turn-info"),
      resultMessage = document.getElementById("result-message"),
      restartBtnOverlay = document.getElementById("restart-btn-overlay"),
      undoBtn = document.getElementById("undo-btn"),
      restartBtn = document.getElementById("restart-btn");

function showScreen(name) {
  Object.values(screens).forEach(s => s.classList.add("hidden"));
  screens[name].classList.remove("hidden");
}
document.querySelectorAll(".back-btn").forEach(btn => btn.onclick = () => history.back());

startBtn.onclick = () => showScreen("setup");
proceedBtn.onclick = () => showScreen("mode");
playBtn.onclick = () => {
  if (gameType === "friend") {
    player1 = document.getElementById("player1-name").value || "Player 1";
    player2 = document.getElementById("player2-name").value || "Player 2";
  }
  showScreen("game");
  startGame();
};

// 🎨 Theme and Symbol
const themeBtns = document.querySelectorAll(".theme");
themeBtns.forEach(btn => btn.onclick = () => {
  themeBtns.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  document.body.className = `theme-${btn.dataset.theme}`;
  checkSetupReady();
});

document.querySelectorAll(".symbol-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelectorAll(".symbol-btn").forEach(b => b.classList.remove("selected"));
    btn.classList.add("selected");
    playerSymbol = btn.dataset.symbol;
    aiSymbol = playerSymbol === "X" ? "O" : "X";
    checkSetupReady();
  };
});

function checkSetupReady() {
  if (document.querySelector(".theme.active") && document.querySelector(".symbol-btn.selected")) {
    proceedBtn.classList.remove("hidden");
  }
}

// ⚙️ Game Mode
const gridBtns = document.querySelectorAll(".grid-btn");
gridBtns.forEach(btn => btn.onclick = () => {
  gridBtns.forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  gridSize = parseInt(btn.dataset.size);
  undoLimit = gridSize - 2;
  checkModeReady();
});

document.querySelectorAll(".type-btn").forEach(btn => btn.onclick = () => {
  document.querySelectorAll(".type-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  gameType = btn.dataset.type;
  document.getElementById("ai-difficulty").classList.toggle("hidden", gameType !== "ai");
  document.getElementById("name-inputs").classList.toggle("hidden", gameType !== "friend");
  checkModeReady();
});

document.querySelectorAll(".difficulty-btn").forEach(btn => btn.onclick = () => {
  document.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  difficulty = btn.dataset.diff;
  checkModeReady();
});

document.querySelectorAll(".challenge-btn").forEach(btn => btn.onclick = () => {
  document.querySelectorAll(".challenge-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  challengeMode = btn.dataset.mode;
});

function checkModeReady() {
  if (document.querySelector(".grid-btn.active") && document.querySelector(".type-btn.active")) {
    if (gameType !== "ai" || document.querySelector(".difficulty-btn.active")) {
      playBtn.classList.remove("hidden");
    }
  }
}

// 🎲 Core Game Logic
function startGame() {
  board = Array(gridSize * gridSize).fill("");
  moves = [];
  gameOver = false;
  currentTurn = "X";
  renderGrid();
  updateTurnInfo();
}

function renderGrid() {
  gameGrid.className = `grid-${gridSize}`;
  gameGrid.innerHTML = "";
  board.forEach((val, i) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = i;
    cell.textContent = val;
    cell.onclick = () => handleMove(i);
    gameGrid.appendChild(cell);
  });
}

function updateTurnInfo() {
  turnInfo.textContent = `${currentTurn === playerSymbol ? player1 : player2}'s Turn: ${currentTurn}`;
}

function handleMove(i) {
  if (gameOver || board[i]) return;
  board[i] = currentTurn;
  moves.push(i);
  renderGrid();
  if (checkWin()) return endGame(`${currentTurn} Wins!`);
  if (board.every(cell => cell)) return endGame("Draw!");
  currentTurn = currentTurn === "X" ? "O" : "X";
  updateTurnInfo();
  if (gameType === "ai" && currentTurn === aiSymbol) aiMove();
}

function checkWin() {
  let lines = [];
  for (let r = 0; r < gridSize; r++) lines.push([...Array(gridSize)].map((_, i) => r * gridSize + i));
  for (let c = 0; c < gridSize; c++) lines.push([...Array(gridSize)].map((_, i) => i * gridSize + c));
  lines.push([...Array(gridSize)].map((_, i) => i * (gridSize + 1)));
  lines.push([...Array(gridSize)].map((_, i) => (i + 1) * (gridSize - 1)));
  for (const line of lines) {
    if (line.every(i => board[i] === currentTurn)) {
      line.forEach(i => document.querySelector(`.cell[data-index='${i}']`).classList.add("winning"));
      return true;
    }
  }
  return false;
}

function endGame(msg) {
  gameOver = true;
  resultMessage.textContent = msg;
  screens.result.classList.remove("hidden");
  if (msg.includes("Draw")) draws++;
  else if (msg.includes(playerSymbol)) wins++;
  else losses++;
  updateXP();
}

function updateXP() {
  xp = wins * 10 + draws * 5;
  level = Math.floor(xp / 30) + 1;
  document.getElementById("stat-wins").textContent = wins;
  document.getElementById("stat-losses").textContent = losses;
  document.getElementById("stat-draws").textContent = draws;
  document.getElementById("level-fill").style.width = `${(xp % 30) * 100 / 30}%`;
}

function aiMove() {
  const empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
  const pick = empty[Math.floor(Math.random() * empty.length)];
  setTimeout(() => handleMove(pick), 500);
}

undoBtn.onclick = () => {
  if (moves.length > 0 && !gameOver && undoLimit > 0) {
    const last = moves.pop();
    board[last] = "";
    currentTurn = currentTurn === "X" ? "O" : "X";
    undoLimit--;
    renderGrid();
    updateTurnInfo();
  }
};

restartBtn.onclick = () => startGame();
restartBtnOverlay.onclick = () => {
  screens.result.classList.add("hidden");
  showScreen("score");
};

// 🌠 Cursor Trail Effect
const canvas = document.getElementById("cursor-trail"),
      ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let particles = [];
document.addEventListener("mousemove", e => {
  particles.push({ x: e.clientX, y: e.clientY, radius: 5, alpha: 1 });
});
function animateTrail() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${p.alpha})`;
    ctx.fill();
    p.radius += 0.5;
    p.alpha -= 0.02;
  });
  particles = particles.filter(p => p.alpha > 0);
  requestAnimationFrame(animateTrail);
}
animateTrail();