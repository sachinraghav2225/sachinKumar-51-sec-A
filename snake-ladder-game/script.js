const SNAKES  = { 16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78 };
const LADDERS = { 1: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };

const boardEl = document.getElementById("board");
const overlay = document.getElementById("overlay");
const tokensEl = document.getElementById("tokens");
const diceEl = document.getElementById("dice");
const rollBtn = document.getElementById("rollBtn");
const msgEl = document.getElementById("msg");
const turnEl = document.getElementById("turn");

let players, turn, busy, over;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Centre of square n in a 100x100 board (square 1 is bottom-left, zig-zag upward)
function coords(n) {
  if (n < 1) n = 1;
  const row = Math.floor((n - 1) / 10);
  const pos = (n - 1) % 10;
  const col = row % 2 === 0 ? pos : 9 - pos;
  return { x: col * 10 + 5, y: (9 - row) * 10 + 5 };
}

function buildBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const row = 9 - r;
      const n = row % 2 === 0 ? row * 10 + c + 1 : row * 10 + (10 - c);
      const cell = document.createElement("div");
      cell.className = "cell " + ((r + c) % 2 ? "a" : "b");
      cell.textContent = n;
      boardEl.appendChild(cell);
    }
  }
}

function drawOverlay() {
  let svg = "";
  for (const [from, to] of Object.entries(LADDERS)) {
    const a = coords(+from), b = coords(to);
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    const nx = (-dy / len) * 1.2, ny = (dx / len) * 1.2;
    svg += `<line x1="${a.x + nx}" y1="${a.y + ny}" x2="${b.x + nx}" y2="${b.y + ny}" stroke="#7a4a1d" stroke-width="0.9"/>`;
    svg += `<line x1="${a.x - nx}" y1="${a.y - ny}" x2="${b.x - nx}" y2="${b.y - ny}" stroke="#7a4a1d" stroke-width="0.9"/>`;
    const rungs = Math.floor(len / 4);
    for (let i = 1; i < rungs; i++) {
      const t = i / rungs, px = a.x + dx * t, py = a.y + dy * t;
      svg += `<line x1="${px + nx}" y1="${py + ny}" x2="${px - nx}" y2="${py - ny}" stroke="#7a4a1d" stroke-width="0.7"/>`;
    }
  }
  for (const [from, to] of Object.entries(SNAKES)) {
    const a = coords(+from), b = coords(to);
    const mx = (a.x + b.x) / 2 + (b.y - a.y) * 0.18;
    const my = (a.y + b.y) / 2 - (b.x - a.x) * 0.18;
    svg += `<path d="M${a.x} ${a.y} Q${mx} ${my} ${b.x} ${b.y}" fill="none" stroke="#c0392b" stroke-width="1.8" stroke-linecap="round" opacity=".85"/>`;
    svg += `<circle cx="${a.x}" cy="${a.y}" r="1.8" fill="#8e1b10"/>`;
  }
  overlay.innerHTML = svg;
}

function placeTokens() {
  players.forEach((p, i) => {
    const { x, y } = coords(p.pos);
    p.el.style.left = x + (i === 0 ? -1.8 : 1.8) + "%";
    p.el.style.top = y + "%";
  });
}

function updateTurn() {
  const p = players[turn];
  turnEl.textContent = p.name + "'s turn";
  turnEl.style.color = p.color;
}

function newGame() {
  players = [
    { name: "Player 1", color: "#e63946", pos: 0 },
    { name: "Player 2", color: "#1d4ed8", pos: 0 },
  ];
  tokensEl.innerHTML = "";
  players.forEach((p) => {
    p.el = document.createElement("div");
    p.el.className = "token";
    p.el.style.background = p.color;
    tokensEl.appendChild(p.el);
  });
  turn = 0; busy = false; over = false;
  diceEl.innerHTML = "&#9856;";
  msgEl.textContent = "Player 1 starts. Roll the dice!";
  rollBtn.disabled = false;
  placeTokens();
  updateTurn();
}

async function rollDice() {
  if (busy || over) return;
  busy = true;
  rollBtn.disabled = true;
  const d = 1 + Math.floor(Math.random() * 6);
  diceEl.classList.add("rolling");
  await sleep(400);
  diceEl.classList.remove("rolling");
  diceEl.innerHTML = "&#" + (9855 + d) + ";";

  const p = players[turn];
  if (p.pos + d > 100) {
    msgEl.textContent = `${p.name} rolled ${d}. Need an exact roll to reach 100.`;
  } else {
    msgEl.textContent = `${p.name} rolled ${d}.`;
    for (let i = 0; i < d; i++) {
      p.pos++;
      placeTokens();
      await sleep(250);
    }
    const dest = LADDERS[p.pos] || SNAKES[p.pos];
    if (dest) {
      msgEl.textContent = LADDERS[p.pos]
        ? `${p.name} climbed a ladder to ${dest}!`
        : `${p.name} got bitten by a snake and slid to ${dest}.`;
      await sleep(500);
      p.pos = dest;
      placeTokens();
      await sleep(400);
    }
    if (p.pos === 100) {
      over = true;
      msgEl.textContent = `${p.name} wins the game!`;
      turnEl.textContent = p.name + " wins!";
      busy = false;
      return;
    }
  }
  if (d !== 6) turn = (turn + 1) % players.length;
  else msgEl.textContent += " Rolled a 6, roll again!";
  updateTurn();
  busy = false;
  rollBtn.disabled = false;
}

rollBtn.addEventListener("click", rollDice);
document.getElementById("resetBtn").addEventListener("click", newGame);
buildBoard();
drawOverlay();
newGame();
