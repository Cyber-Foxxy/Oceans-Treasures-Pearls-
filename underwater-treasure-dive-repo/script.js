const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const scoreDisplay = document.getElementById("score");
const itemsDisplay = document.getElementById("items");
const livesDisplay = document.getElementById("lives");
const statusDisplay = document.getElementById("status");

const startScreen = document.getElementById("startScreen");
const endScreen = document.getElementById("endScreen");
const endTitle = document.getElementById("endTitle");
const endMessage = document.getElementById("endMessage");
const startBtn = document.getElementById("startBtn");
const restartBtn = document.getElementById("restartBtn");

const GAME_STATE = {
  START: "start",
  PLAYING: "playing",
  GAME_OVER: "game_over"
};

let gameState = GAME_STATE.START;
let keys = {};
let score = 0;
let itemsCollected = 0;
let lives = 3;

let coralWalls = [];
let collectibleTemplates = [];
let collectibles = [];
let sharks = [];
let harpoons = [];

const images = {
  background: new Image(),
  title: new Image(),
  end: new Image()
};

images.background.src = "AdobeStock_587296092-scaled.jpeg";
images.title.src = "Blog_Cover_Image_1.webp";
images.end.src = "underwater-ocean-scene-sunlight-rays-illuminate-school-fish-swimming-deep-blue-sea_891417-3978.jpg";

function loadImages(imgMap) {
  const list = Object.values(imgMap);
  return Promise.all(
    list.map((img) => {
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    })
  );
}

function rectsCollide(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

class Player {
  constructor(x, y) {
    this.startX = x;
    this.startY = y;
    this.x = x;
    this.y = y;
    this.width = 44;
    this.height = 72;
    this.speed = 4;
    this.facing = "right";
    this.invincibleTimer = 0;
  }

  resetPosition() {
    this.x = this.startX;
    this.y = this.startY;
    this.facing = "right";
    this.invincibleTimer = 45;
  }

  update() {
    if (this.invincibleTimer > 0) {
      this.invincibleTimer--;
    }

    let moveX = 0;
    let moveY = 0;

    if (keys["ArrowUp"]) {
      moveY = -this.speed;
      this.facing = "up";
    }
    if (keys["ArrowDown"]) {
      moveY = this.speed;
      this.facing = "down";
    }
    if (keys["ArrowLeft"]) {
      moveX = -this.speed;
      this.facing = "left";
    }
    if (keys["ArrowRight"]) {
      moveX = this.speed;
      this.facing = "right";
    }

    this.moveX(moveX);
    this.moveY(moveY);

    this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
    this.y = Math.max(0, Math.min(canvas.height - this.height, this.y));
  }

  moveX(amount) {
    this.x += amount;
    for (const wall of coralWalls) {
      if (rectsCollide(this, wall)) {
        if (amount > 0) this.x = wall.x - this.width;
        if (amount < 0) this.x = wall.x + wall.width;
      }
    }
  }

  moveY(amount) {
    this.y += amount;
    for (const wall of coralWalls) {
      if (rectsCollide(this, wall)) {
        if (amount > 0) this.y = wall.y - this.height;
        if (amount < 0) this.y = wall.y + wall.height;
      }
    }
  }

  draw() {
    if (this.invincibleTimer > 0 && this.invincibleTimer % 8 < 4) {
      return;
    }

    ctx.save();

    ctx.fillStyle = "#b5c8d8";
    ctx.fillRect(this.x + 8, this.y + 12, 14, 32);

    ctx.fillStyle = "#17395c";
    ctx.fillRect(this.x + 18, this.y + 16, 18, 32);

    ctx.strokeStyle = "#d8c3a5";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(this.x + 20, this.y + 24);
    ctx.lineTo(this.x + 8, this.y + 38);
    ctx.moveTo(this.x + 34, this.y + 24);
    ctx.lineTo(this.x + 46, this.y + 38);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.x + 22, this.y + 48);
    ctx.lineTo(this.x + 16, this.y + 66);
    ctx.moveTo(this.x + 32, this.y + 48);
    ctx.lineTo(this.x + 38, this.y + 66);
    ctx.stroke();

    ctx.fillStyle = "#ffd447";
    ctx.fillRect(this.x + 10, this.y + 65, 10, 5);
    ctx.fillRect(this.x + 36, this.y + 65, 10, 5);

    ctx.beginPath();
    ctx.fillStyle = "#94d8ff";
    ctx.arc(this.x + 27, this.y + 10, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "#f0c7a4";
    ctx.arc(this.x + 27, this.y + 10, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

class CoralWall {
  constructor(data) {
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.color = data.color || "#ff8c6b";
  }

  draw() {
    ctx.save();

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y + this.height * 0.55, this.width, this.height * 0.45);

    for (let i = 0; i < Math.max(3, Math.floor(this.width / 30)); i++) {
      const bx = this.x + 10 + i * (this.width / Math.max(3, Math.floor(this.width / 30)));
      const topY = this.y + this.height * 0.55;

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(bx, this.y + this.height);
      ctx.lineTo(bx, topY - 18);
      ctx.lineTo(bx - 8, topY - 2);
      ctx.moveTo(bx, topY - 18);
      ctx.lineTo(bx + 8, topY - 6);
      ctx.stroke();
    }

    ctx.restore();
  }
}

class Shark {
  constructor(x, y, speed, minX, maxX) {
    this.x = x;
    this.y = y;
    this.width = 110;
    this.height = 46;
    this.speed = speed;
    this.direction = 1;
    this.minX = minX;
    this.maxX = maxX;
    this.alive = true;
    this.respawnTimer = 0;
    this.swimOffset = 0;
  }

  update() {
    if (!this.alive) {
      if (this.respawnTimer > 0) {
        this.respawnTimer--;
      } else {
        this.alive = true;
      }
      return;
    }

    this.x += this.speed * this.direction;
    this.swimOffset += 0.1;

    if (this.x <= this.minX || this.x + this.width >= this.maxX) {
      this.direction *= -1;
    }
  }

  getHitBox() {
    return {
      x: this.x + 6,
      y: this.y + 4,
      width: this.width - 12,
      height: this.height - 8
    };
  }

  draw() {
    if (!this.alive) return;

    const bob = Math.sin(this.swimOffset) * 4;
    const drawX = this.x;
    const drawY = this.y + bob;

    ctx.save();

    if (this.direction < 0) {
      ctx.translate(drawX + this.width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(drawX + this.width / 2), 0);
    }

    ctx.fillStyle = "#70879a";
    ctx.beginPath();
    ctx.ellipse(drawX + 55, drawY + 24, 45, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(drawX + 8, drawY + 24);
    ctx.lineTo(drawX - 18, drawY + 4);
    ctx.lineTo(drawX - 18, drawY + 44);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(drawX + 52, drawY + 2);
    ctx.lineTo(drawX + 42, drawY + 18);
    ctx.lineTo(drawX + 62, drawY + 18);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#dfe7ef";
    ctx.beginPath();
    ctx.ellipse(drawX + 68, drawY + 29, 24, 9, 0, 0, Math.PI);
    ctx.fill();

    ctx.fillStyle = "#111";
    ctx.beginPath();
    ctx.arc(drawX + 86, drawY + 16, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(drawX + 80, drawY + 31);
    ctx.lineTo(drawX + 98, drawY + 28);
    ctx.stroke();

    ctx.restore();
  }

  kill() {
    this.alive = false;
    this.respawnTimer = 240;
  }
}

class Collectible {
  constructor(data) {
    this.type = data.type;
    this.x = data.x;
    this.y = data.y;
    this.width = data.width;
    this.height = data.height;
    this.value = data.value;
    this.active = true;
  }

  getHitBox() {
    return this;
  }

  draw() {
    if (!this.active) return;

    if (this.type === "pearl") this.drawPearl();
    if (this.type === "starfish") this.drawStarfish();
    if (this.type === "treasure") this.drawTreasure();
    if (this.type === "turtle") this.drawTurtle();
  }

  drawPearl() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#f5ecff";
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d2c0e8";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.arc(this.x + 9, this.y + 9, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  drawStarfish() {
    ctx.save();
    ctx.fillStyle = "#ff9b60";
    ctx.beginPath();
    ctx.moveTo(this.x + 17, this.y);
    ctx.lineTo(this.x + 22, this.y + 12);
    ctx.lineTo(this.x + 34, this.y + 12);
    ctx.lineTo(this.x + 25, this.y + 20);
    ctx.lineTo(this.x + 29, this.y + 34);
    ctx.lineTo(this.x + 17, this.y + 26);
    ctx.lineTo(this.x + 5, this.y + 34);
    ctx.lineTo(this.x + 10, this.y + 20);
    ctx.lineTo(this.x, this.y + 12);
    ctx.lineTo(this.x + 13, this.y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  drawTreasure() {
    ctx.save();
    ctx.fillStyle = "#8a5827";
    ctx.fillRect(this.x, this.y + 12, this.width, this.height - 12);

    ctx.fillStyle = "#c78a32";
    ctx.beginPath();
    ctx.moveTo(this.x, this.y + 12);
    ctx.quadraticCurveTo(this.x + this.width / 2, this.y - 8, this.x + this.width, this.y + 12);
    ctx.fill();

    ctx.fillStyle = "#ffd447";
    ctx.fillRect(this.x + this.width / 2 - 4, this.y + 18, 8, 10);
    ctx.restore();
  }

  drawTurtle() {
    ctx.save();

    ctx.fillStyle = "#4f7f54";
    ctx.beginPath();
    ctx.ellipse(this.x + 26, this.y + 17, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#355b3b";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(this.x + 18, this.y + 10);
    ctx.lineTo(this.x + 34, this.y + 24);
    ctx.moveTo(this.x + 34, this.y + 10);
    ctx.lineTo(this.x + 18, this.y + 24);
    ctx.stroke();

    ctx.fillStyle = "#80d392";
    ctx.beginPath();
    ctx.arc(this.x + 46, this.y + 17, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#80d392";
    ctx.fillRect(this.x + 6, this.y + 6, 10, 5);
    ctx.fillRect(this.x + 6, this.y + 24, 10, 5);
    ctx.fillRect(this.x + 28, this.y + 6, 10, 5);
    ctx.fillRect(this.x + 28, this.y + 24, 10, 5);

    ctx.restore();
  }
}

class Harpoon {
  constructor(x, y, direction) {
    this.x = x;
    this.y = y;
    this.width = 18;
    this.height = 4;
    this.speed = 8;
    this.direction = direction;
    this.active = true;

    if (direction === "up" || direction === "down") {
      this.width = 4;
      this.height = 18;
    }
  }

  update() {
    if (this.direction === "right") this.x += this.speed;
    if (this.direction === "left") this.x -= this.speed;
    if (this.direction === "up") this.y -= this.speed;
    if (this.direction === "down") this.y += this.speed;

    if (
      this.x < -20 ||
      this.y < -20 ||
      this.x > canvas.width + 20 ||
      this.y > canvas.height + 20
    ) {
      this.active = false;
    }

    for (const wall of coralWalls) {
      if (rectsCollide(this, wall)) {
        this.active = false;
      }
    }

    for (const shark of sharks) {
      if (shark.alive && rectsCollide(this, shark.getHitBox())) {
        shark.kill();
        this.active = false;
      }
    }
  }

  draw() {
    if (!this.active) return;

    ctx.save();
    ctx.fillStyle = "#dddddd";
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.fillStyle = "#8899aa";

    if (this.direction === "right") {
      ctx.beginPath();
      ctx.moveTo(this.x + this.width, this.y + 2);
      ctx.lineTo(this.x + this.width + 7, this.y + this.height / 2);
      ctx.lineTo(this.x + this.width, this.y + this.height - 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.direction === "left") {
      ctx.beginPath();
      ctx.moveTo(this.x, this.y + 2);
      ctx.lineTo(this.x - 7, this.y + this.height / 2);
      ctx.lineTo(this.x, this.y + this.height - 2);
      ctx.closePath();
      ctx.fill();
    } else if (this.direction === "up") {
      ctx.beginPath();
      ctx.moveTo(this.x + 2, this.y);
      ctx.lineTo(this.x + this.width / 2, this.y - 7);
      ctx.lineTo(this.x + this.width - 2, this.y);
      ctx.closePath();
      ctx.fill();
    } else if (this.direction === "down") {
      ctx.beginPath();
      ctx.moveTo(this.x + 2, this.y + this.height);
      ctx.lineTo(this.x + this.width / 2, this.y + this.height + 7);
      ctx.lineTo(this.x + this.width - 2, this.y + this.height);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}

const player = new Player(40, 50);

function updateHud() {
  scoreDisplay.textContent = `Score: ${score}`;
  itemsDisplay.textContent = `Items: ${itemsCollected}`;
  livesDisplay.textContent = `Lives: ${lives}`;
}

function showStartScreen() {
  startScreen.classList.add("visible");
  endScreen.classList.remove("visible");
}

function hideStartScreen() {
  startScreen.classList.remove("visible");
}

function showEndScreen(title, message) {
  endTitle.textContent = title;
  endMessage.textContent = message;
  endScreen.classList.add("visible");
}

function hideEndScreen() {
  endScreen.classList.remove("visible");
}

function createSharks() {
  sharks = [
    new Shark(80, 90, 2.1, 40, 320),
    new Shark(500, 120, 1.7, 450, 820),
    new Shark(720, 350, 2.4, 670, 1050)
  ];
}

function findSafeSpawn(width, height) {
  let attempts = 0;

  while (attempts < 300) {
    attempts++;

    const test = {
      x: Math.floor(Math.random() * (canvas.width - width - 20)) + 10,
      y: Math.floor(Math.random() * (canvas.height - height - 20)) + 10,
      width,
      height
    };

    const hitsWall = coralWalls.some((wall) => rectsCollide(test, wall));
    const hitsPlayer = rectsCollide(test, player);
    const tooCloseToStart =
      Math.abs(test.x - player.startX) < 80 && Math.abs(test.y - player.startY) < 80;

    if (!hitsWall && !hitsPlayer && !tooCloseToStart) {
      return { x: test.x, y: test.y };
    }
  }

  return { x: 60, y: 80 };
}

function buildCollectiblesFromTemplates(randomize = false) {
  collectibles = collectibleTemplates.map((item) => {
    const c = new Collectible(item);

    if (randomize) {
      const spot = findSafeSpawn(c.width, c.height);
      c.x = spot.x;
      c.y = spot.y;
    }

    return c;
  });
}

function respawnCollectiblesRandomly() {
  buildCollectiblesFromTemplates(true);
  statusDisplay.textContent = "All collectibles respawned in new locations!";
}

function handleCollectibles() {
  for (const collectible of collectibles) {
    if (collectible.active && rectsCollide(player, collectible.getHitBox())) {
      collectible.active = false;
      score += collectible.value;
      itemsCollected += 1;
      updateHud();
    }
  }

  const remaining = collectibles.filter((c) => c.active);
  if (remaining.length === 0 && gameState === GAME_STATE.PLAYING) {
    respawnCollectiblesRandomly();
  }
}

function handleSharkHits() {
  if (player.invincibleTimer > 0) return;

  for (const shark of sharks) {
    if (shark.alive && rectsCollide(player, shark.getHitBox())) {
      loseLife();
      break;
    }
  }
}

function loseLife() {
  lives--;

  if (itemsCollected > 3) {
    itemsCollected = 3;
  } else {
    itemsCollected = 0;
  }

  if (score > 3) {
    score = 3;
  } else {
    score = 0;
  }

  updateHud();
  player.resetPosition();
  harpoons = [];

  statusDisplay.textContent = "A shark got you! Back to the start.";

  if (lives <= 0) {
    gameState = GAME_STATE.GAME_OVER;
    showEndScreen("Game Over", "You ran out of lives. Press restart to dive again.");
  }
}

function shootHarpoon() {
  if (gameState !== GAME_STATE.PLAYING) return;

  let hx = player.x + player.width / 2;
  let hy = player.y + player.height / 2;

  if (player.facing === "right") {
    hx = player.x + player.width;
    hy = player.y + 28;
  }
  if (player.facing === "left") {
    hx = player.x - 10;
    hy = player.y + 28;
  }
  if (player.facing === "up") {
    hx = player.x + 20;
    hy = player.y - 10;
  }
  if (player.facing === "down") {
    hx = player.x + 20;
    hy = player.y + player.height;
  }

  harpoons.push(new Harpoon(hx, hy, player.facing));
}

function drawWaterOverlay() {
  ctx.save();
  ctx.fillStyle = "rgba(80, 180, 255, 0.12)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 12; i++) {
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80 + i * 90, 0);
    ctx.lineTo(20 + i * 90, canvas.height);
    ctx.stroke();
  }

  for (let i = 0; i < 18; i++) {
    ctx.beginPath();
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.arc(
      (i * 61) % canvas.width,
      (i * 97) % canvas.height,
      3 + (i % 4),
      0,
      Math.PI * 2
    );
    ctx.stroke();
  }

  ctx.restore();
}

function drawBackground() {
  if (images.background.complete && images.background.naturalWidth > 0) {
    ctx.drawImage(images.background, 0, 0, canvas.width, canvas.height);
  } else {
    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, "#7ddfff");
    grad.addColorStop(0.45, "#187cac");
    grad.addColorStop(1, "#0a3d5e");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawWaterOverlay();
}

function drawOverlayImage() {
  if (gameState === GAME_STATE.START && images.title.complete && images.title.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.drawImage(images.title, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  if (gameState === GAME_STATE.GAME_OVER && images.end.complete && images.end.naturalWidth > 0) {
    ctx.save();
    ctx.globalAlpha = 0.2;
    ctx.drawImage(images.end, 0, 0, canvas.width, canvas.height);
    ctx.restore();
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();

  for (const wall of coralWalls) {
    wall.draw();
  }

  for (const collectible of collectibles) {
    collectible.draw();
  }

  for (const shark of sharks) {
    shark.draw();
  }

  for (const harpoon of harpoons) {
    harpoon.draw();
  }

  player.draw();
  drawOverlayImage();
}

function update() {
  if (gameState !== GAME_STATE.PLAYING) return;

  player.update();

  for (const shark of sharks) {
    shark.update();
  }

  for (const harpoon of harpoons) {
    harpoon.update();
  }

  harpoons = harpoons.filter((h) => h.active);

  handleCollectibles();
  handleSharkHits();
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

async function loadGameData() {
  const [obstacleResponse, collectibleResponse] = await Promise.all([
    fetch("obstacles.json"),
    fetch("collectibles.json")
  ]);

  const obstacleData = await obstacleResponse.json();
  collectibleTemplates = await collectibleResponse.json();

  coralWalls = obstacleData.map((data) => new CoralWall(data));
  buildCollectiblesFromTemplates(false);
  createSharks();
  updateHud();
}

function resetWholeGame() {
  score = 0;
  itemsCollected = 0;
  lives = 3;
  harpoons = [];
  player.resetPosition();
  createSharks();
  buildCollectiblesFromTemplates(false);
  updateHud();
  hideEndScreen();
  hideStartScreen();
  gameState = GAME_STATE.PLAYING;
  statusDisplay.textContent = "Collect everything, avoid sharks, and shoot harpoons with space.";
}

startBtn.addEventListener("click", () => {
  resetWholeGame();
});

restartBtn.addEventListener("click", () => {
  resetWholeGame();
});

window.addEventListener("keydown", (e) => {
  keys[e.key] = true;

  if (e.code === "Space") {
    e.preventDefault();
    shootHarpoon();
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

Promise.all([loadImages(images), loadGameData()]).then(() => {
  showStartScreen();
  loop();
});
