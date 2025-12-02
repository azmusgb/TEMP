// js/honey-hunt.js
// Simple honey catch mini-game tuned to your HTML (canvas #honey-game, HUD IDs)

(function () {
  "use strict";

  const canvas = document.getElementById("honey-game");
  if (!canvas) return; // no game on this page

  const ctx = canvas.getContext("2d");

  const scoreEl = document.getElementById("score");
  const timerEl = document.getElementById("timer");
  const livesEl = document.getElementById("lives");
  const bestEl = document.getElementById("best");

  const startBtn = document.getElementById("startGame");
  const pauseBtn = document.getElementById("pauseGame");
  const resetBtn = document.getElementById("resetGame");

  const state = {
    running: false,
    paused: false,
    score: 0,
    lives: 3,
    timer: 45,
    best: 0,
    lastTime: 0,
    width: 400,
    height: 300,
    player: null,
    drops: [],
    leaves: [],
    keys: {
      left: false,
      right: false
    }
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function resizeCanvas() {
    const wrapper = canvas.parentElement;
    if (!wrapper) return;

    const rect = wrapper.getBoundingClientRect();
    const displayWidth = Math.max(rect.width, 220);
    const displayHeight = displayWidth * 0.75;

    canvas.width = displayWidth * 2; // hi-dpi
    canvas.height = displayHeight * 2;
    canvas.style.height = displayHeight + "px";

    state.width = canvas.width;
    state.height = canvas.height;

    if (state.player) {
      state.player.y = state.height - state.player.height - 28;
    }
  }

  function createPlayer() {
    const w = state.width * 0.14;
    const h = state.height * 0.16;
    state.player = {
      x: state.width / 2 - w / 2,
      y: state.height - h - 28,
      width: w,
      height: h,
      speed: state.width * 0.4
    };
  }

  function resetGameValues() {
    state.score = 0;
    state.lives = 3;
    state.timer = 45;
    state.drops = [];
    state.leaves = [];
    state.paused = false;
    state.lastTime = 0;
    updateHUD();
  }

  function loadBest() {
    try {
      const stored = localStorage.getItem("honeyGameBest");
      state.best = stored ? parseInt(stored, 10) || 0 : 0;
    } catch {
      state.best = 0;
    }
    if (bestEl) bestEl.textContent = state.best.toString();
  }

  function saveBest() {
    if (state.score > state.best) {
      state.best = state.score;
      if (bestEl) bestEl.textContent = state.best.toString();
      try {
        localStorage.setItem("honeyGameBest", String(state.best));
      } catch {
        // ignore
      }
    }
  }

  function updateHUD() {
    if (scoreEl) scoreEl.textContent = state.score.toString();
    if (livesEl) livesEl.textContent = state.lives.toString();
    if (timerEl) timerEl.textContent = Math.max(0, Math.floor(state.timer)) + "s";
  }

  function spawnDrop() {
    const s = state.height * 0.05;
    state.drops.push({
      x: Math.random() * (state.width - s * 2) + s,
      y: -s,
      r: s,
      vy: state.height * (0.25 + Math.random() * 0.15)
    });
  }

  function spawnLeaf() {
    const w = state.width * 0.11;
    const h = state.height * 0.055;
    state.leaves.push({
      x: Math.random() * (state.width - w * 2) + w,
      y: -h,
      w,
      h,
      vy: state.height * (0.22 + Math.random() * 0.2),
      rot: Math.random() * Math.PI * 2
    });
  }

  function movePlayer(dt) {
    if (!state.player) return;
    let dir = 0;
    if (state.keys.left) dir -= 1;
    if (state.keys.right) dir += 1;
    if (!dir) return;

    state.player.x += dir * state.player.speed * dt;
    const margin = state.player.width * 0.4;
    state.player.x = clamp(
      state.player.x,
      margin,
      state.width - margin - state.player.width
    );
  }

  function updateObjects(dt) {
    // spawn
    if (Math.random() < 1.2 * dt) spawnDrop();
    if (Math.random() < 0.4 * dt) spawnLeaf();

    state.drops.forEach((d) => {
      d.y += d.vy * dt;
    });
    state.leaves.forEach((l) => {
      l.y += l.vy * dt;
      l.rot += dt * 0.8;
    });

    state.drops = state.drops.filter((d) => d.y < state.height + d.r * 2);
    state.leaves = state.leaves.filter((l) => l.y < state.height + l.h * 2);
  }

  function checkCollisions() {
    if (!state.player) return;
    const p = state.player;
    const px = p.x + p.width / 2;
    const py = p.y + p.height / 2;

    // Honey drops: circle vs box
    for (let i = state.drops.length - 1; i >= 0; i--) {
      const d = state.drops[i];
      const dx = (d.x - px) / (p.width * 0.55);
      const dy = (d.y - py) / (p.height * 0.55);
      if (dx * dx + dy * dy < 1) {
        state.drops.splice(i, 1);
        state.score += 10;
        updateHUD();
      }
    }

    // Leaves: simple AABB
    for (let i = state.leaves.length - 1; i >= 0; i--) {
      const l = state.leaves[i];
      const lx1 = l.x - l.w / 2;
      const lx2 = l.x + l.w / 2;
      const ly1 = l.y - l.h / 2;
      const ly2 = l.y + l.h / 2;

      const px1 = p.x + p.width * 0.15;
      const px2 = p.x + p.width * 0.85;
      const py1 = p.y + p.height * 0.3;
      const py2 = p.y + p.height;

      if (lx1 < px2 && lx2 > px1 && ly1 < py2 && ly2 > py1) {
        state.leaves.splice(i, 1);
        state.lives -= 1;
        updateHUD();
        if (state.lives <= 0) {
          endGame();
          return;
        }
      }
    }
  }

  function updateTimer(dt) {
    state.timer -= dt;
    if (state.timer <= 0) {
      state.timer = 0;
      endGame();
    }
  }

  /* ========= DRAWING ========= */
  function drawBackground() {
    const w = state.width;
    const h = state.height;
    ctx.clearRect(0, 0, w, h);

    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#fffef6");
    g.addColorStop(0.4, "#ffeec4");
    g.addColorStop(1, "#f6d9b0");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // clouds
    ctx.fillStyle = "rgba(255,255,255,0.9)";
    const clouds = [
      { x: w * 0.2, y: h * 0.16, r: 32 },
      { x: w * 0.3, y: h * 0.12, r: 26 },
      { x: w * 0.75, y: h * 0.18, r: 30 }
    ];
    clouds.forEach((c) => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.arc(c.x + c.r * 0.8, c.y + c.r * 0.1, c.r * 0.85, 0, Math.PI * 2);
      ctx.arc(c.x - c.r * 0.7, c.y + c.r * 0.18, c.r * 0.7, 0, Math.PI * 2);
      ctx.fill();
    });

    // ground
    ctx.fillStyle = "#d1e0c0";
    ctx.fillRect(0, h * 0.8, w, h * 0.2);
  }

  function drawPlayer() {
    const p = state.player;
    if (!p) return;

    const x = p.x;
    const y = p.y;
    const w = p.width;
    const h = p.height;

    // body
    ctx.fillStyle = "#f3c562";
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(x, y + h * 0.2, w, h * 0.7, h * 0.18);
    } else {
      ctx.rect(x, y + h * 0.2, w, h * 0.7);
    }
    ctx.fill();

    // head
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.28, h * 0.22, 0, Math.PI * 2);
    ctx.fill();

    // ears
    ctx.beginPath();
    ctx.arc(x + w * 0.3, y + h * 0.15, h * 0.09, 0, Math.PI * 2);
    ctx.arc(x + w * 0.7, y + h * 0.15, h * 0.09, 0, Math.PI * 2);
    ctx.fill();

    // shirt
    ctx.fillStyle = "#d62e2e";
    ctx.fillRect(x, y + h * 0.47, w, h * 0.26);

    // muzzle
    ctx.fillStyle = "#f8d58f";
    ctx.beginPath();
    ctx.ellipse(x + w * 0.5, y + h * 0.32, h * 0.12, h * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();

    // nose
    ctx.fillStyle = "#5c3812";
    ctx.beginPath();
    ctx.arc(x + w * 0.5, y + h * 0.29, h * 0.03, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    ctx.beginPath();
    ctx.arc(x + w * 0.43, y + h * 0.24, h * 0.02, 0, Math.PI * 2);
    ctx.arc(x + w * 0.57, y + h * 0.24, h * 0.02, 0, Math.PI * 2);
    ctx.fill();

    // honey pot
    ctx.fillStyle = "#9a6a3b";
    const jarW = w * 0.32;
    const jarH = h * 0.25;
    const jx = x + w * 0.34;
    const jy = y + h * 0.6;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(jx, jy, jarW, jarH, jarW * 0.26);
    } else {
      ctx.rect(jx, jy, jarW, jarH);
    }
    ctx.fill();

    ctx.fillStyle = "#f0c96e";
    ctx.fillRect(jx, jy, jarW, jarH * 0.26);
  }

  function drawDrops() {
    ctx.fillStyle = "#f4c048";
    state.drops.forEach((d) => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y - d.r * 0.6);
      ctx.quadraticCurveTo(d.x - d.r, d.y, d.x, d.y + d.r);
      ctx.quadraticCurveTo(d.x + d.r, d.y, d.x, d.y - d.r * 0.6);
      ctx.fill();
    });
  }

  function drawLeaves() {
    ctx.fillStyle = "#9cad90";
    state.leaves.forEach((l) => {
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(l.rot);
      ctx.beginPath();
      ctx.moveTo(-l.w / 2, 0);
      ctx.quadraticCurveTo(0, -l.h / 2, l.w / 2, 0);
      ctx.quadraticCurveTo(0, l.h / 2, -l.w / 2, 0);
      ctx.fill();
      ctx.restore();
    });
  }

  function draw() {
    drawBackground();
    drawDrops();
    drawLeaves();
    drawPlayer();
  }

  /* ========= LOOP ========= */
  let frameId = null;

  function gameLoop(timestamp) {
    if (!state.running) return;

    const dt = state.lastTime ? (timestamp - state.lastTime) / 1000 : 0;
    state.lastTime = timestamp;

    if (!state.paused) {
      movePlayer(dt);
      updateObjects(dt);
      checkCollisions();
      updateTimer(dt);
      updateHUD();
    }

    draw();

    if (state.running) {
      frameId = requestAnimationFrame(gameLoop);
    }
  }

  function startGame() {
    if (!state.player) createPlayer();
    resetGameValues();
    state.running = true;
    state.paused = false;
    if (frameId) cancelAnimationFrame(frameId);
    state.lastTime = 0;
    frameId = requestAnimationFrame(gameLoop);
  }

  function pauseGame() {
    if (!state.running) return;
    state.paused = !state.paused;
  }

  function resetGame() {
    state.running = false;
    state.paused = false;
    if (frameId) cancelAnimationFrame(frameId);
    resetGameValues();
    createPlayer();
    draw();
  }

  function endGame() {
    state.running = false;
    state.paused = false;
    saveBest();
    if (frameId) cancelAnimationFrame(frameId);
    draw(); // final state
  }

  /* ========= INPUT ========= */
  function onKeyDown(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      state.keys.left = true;
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      state.keys.right = true;
    } else if (e.key === " " || e.code === "Space") {
      e.preventDefault();
      if (!state.running) {
        startGame();
      } else {
        pauseGame();
      }
    }
  }

  function onKeyUp(e) {
    if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
      state.keys.left = false;
    } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
      state.keys.right = false;
    }
  }

  function onCanvasClick(evt) {
    // Simple mobile-friendly: tap left/right half to move
    const rect = canvas.getBoundingClientRect();
    const x = evt.clientX - rect.left;
    const mid = rect.width / 2;
    if (x < mid) {
      state.keys.left = true;
      state.keys.right = false;
      setTimeout(() => (state.keys.left = false), 120);
    } else {
      state.keys.right = true;
      state.keys.left = false;
      setTimeout(() => (state.keys.right = false), 120);
    }
  }

  /* ========= INIT ========= */
  function init() {
    resizeCanvas();
    createPlayer();
    loadBest();
    updateHUD();
    draw();

    window.addEventListener("resize", () => {
      resizeCanvas();
      if (!state.running) draw();
    });

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", onCanvasClick);

    if (startBtn) startBtn.addEventListener("click", startGame);
    if (pauseBtn) pauseBtn.addEventListener("click", pauseGame);
    if (resetBtn) resetBtn.addEventListener("click", resetGame);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
