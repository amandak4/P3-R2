const playBoard = document.querySelector(".play-board");
const scoreElement = document.querySelector(".score");
const highScoreElement = document.querySelector(".high-score");
const controls = document.querySelectorAll(".controls i");
const gameOverScreen = document.createElement("div");
gameOverScreen.classList.add("game-over");
document.body.appendChild(gameOverScreen);

let gameOver = false;
let foodX, foodY;
let snakeX = 5, snakeY = 5;
let velocityX = 0, velocityY = 0;
let snakeBody = [];
let setIntervalId;
let score = 0;

// Getting high score from the local storage
let highScore = localStorage.getItem("high-score") || 0;
highScoreElement.innerText = `High Score: ${highScore}`;

const updateFoodPosition = () => {
  foodX = Math.floor(Math.random() * 30) + 1;
  foodY = Math.floor(Math.random() * 30) + 1;
};

const handleGameOver = () => {
  clearInterval(setIntervalId);
  gameOverScreen.innerHTML = `
    <h1>Game Over</h1>
    <p>Your Score: ${score}</p>
    <p>High Score: ${highScore}</p>
    <button onclick="location.reload()">Play Again</button>
  `;
  gameOverScreen.classList.add("visible");
};

const changeDirection = (e) => {
  if (e.key === "ArrowUp" && velocityY != 1) {
    velocityX = 0;
    velocityY = -1;
  } else if (e.key === "ArrowDown" && velocityY != -1) {
    velocityX = 0;
    velocityY = 1;
  } else if (e.key === "ArrowLeft" && velocityX != 1) {
    velocityX = -1;
    velocityY = 0;
  } else if (e.key === "ArrowRight" && velocityX != -1) {
    velocityX = 1;
    velocityY = 0;
  }
};

controls.forEach((button) =>
  button.addEventListener("click", () =>
    changeDirection({ key: button.dataset.key })
  )
);

const initGame = () => {
  if (gameOver) return handleGameOver();

  let html = `<div class="food" style="grid-area: ${foodY} / ${foodX}"></div>`;

  // Check collision with obstacles
  for (let i = 0; i < obstacles.length; i++) {
    if (snakeX === obstacles[i].x && snakeY === obstacles[i].y) {
      gameOver = true;
      return handleGameOver();
    }
  }

  // Check if snake eats food
  if (snakeX === foodX && snakeY === foodY) {
    updateFoodPosition();
    snakeBody.push([foodY, foodX]); // Add new segment to snake
    score++;
    highScore = score >= highScore ? score : highScore;
    localStorage.setItem("high-score", highScore);
    scoreElement.innerText = `Score: ${score}`;
    highScoreElement.innerText = `High Score: ${highScore}`;
  }

  snakeX += velocityX;
  snakeY += velocityY;

  // Update snake body
  for (let i = snakeBody.length - 1; i > 0; i--) {
    snakeBody[i] = snakeBody[i - 1];
  }
  snakeBody[0] = [snakeX, snakeY];

  // Check for wall collision
  if (snakeX <= 0 || snakeX > 30 || snakeY <= 0 || snakeY > 30) {
    gameOver = true;
  }

  // Check for self-collision
  for (let i = 0; i < snakeBody.length; i++) {
    html += `<div class="head" style="grid-area: ${snakeBody[i][1]} / ${snakeBody[i][0]}"></div>`;
    if (
      i !== 0 &&
      snakeBody[0][1] === snakeBody[i][1] &&
      snakeBody[0][0] === snakeBody[i][0]
    ) {
      gameOver = true;
    }
  }

  playBoard.innerHTML = html;

  // Render obstacles
  obstacles.forEach(obs => {
    const obstacleElement = document.createElement("div");
    obstacleElement.classList.add("obstacle");
    obstacleElement.style.gridArea = `${obs.y} / ${obs.x}`;
    playBoard.appendChild(obstacleElement);
  });
};

updateFoodPosition();
setIntervalId = setInterval(initGame, 100);
document.addEventListener("keyup", changeDirection);

const difficulties = {
  easy: {
    interval: 100,
    setup: () => {
      playBoard.style.background = "url('39f1ee105d3c2347fee07f6cb078c2f0.png')"; // Background for easy
      obstacles = []; // No obstacles for easy
    },
    update: () => {} // No extra behavior
  },
  medium: {
    interval: 90,
    setup: () => {
      playBoard.style.background= "url('backgroundmediumdiff.png')"; // Background for medium
      addObstacles();
    },
    update: () => {} // No extra behavior
  },
  hard: {
    interval: 80,
    setup: () => {
      playBoard.style.background = "url('backgroundharddiff.png')";
      addObstacles(15);
    },
    update: () => {} // Moves food each frame
  }
};

const addObstacles = (count = 5) => {
  obstacles = Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 30) + 1,
    y: Math.floor(Math.random() * 30) + 1,
    dx: Math.random() > 0.5 ? 1 : -1, // Random movement direction on x-axis
    dy: Math.random() > 0.5 ? 1 : -1, // Random movement direction on y-axis
  }));
};
const moveFood = () => {
  foodX = (foodX + 1) % 30 || 1; // Moves the food to the right
  foodY = (foodY + 1) % 30 || 1; // Moves the food downward
};

const startGame = (difficulty = 'easy') => {
  const { interval, setup, update } = difficulties[difficulty];

  // Remove obstacles and reset previous game state
  playBoard.innerHTML = ''; // Clear the board
  obstacles = []; // Reset obstacles
  updateFoodPosition(); // Reset food position
  score = 0; // Reset score
  scoreElement.innerText = `Score: ${score}`; // Display the score

  setup(); // Apply difficulty-specific settings

  clearInterval(setIntervalId); // Stop previous game loop
  setIntervalId = setInterval(() => {
    initGame();
    update();
  }, interval);
};

// Call this function to start the game with a difficulty
startGame('easy'); // Default: Easy

// Example: Change difficulty via UI buttons
document.getElementById("easy-btn").addEventListener("click", () => startGame("easy"));
document.getElementById("medium-btn").addEventListener("click", () => startGame("medium"));
document.getElementById("hard-btn").addEventListener("click", () => startGame("hard"));
