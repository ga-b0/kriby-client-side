const logutButton = document.querySelector("#logout__button_id");

if (!localStorage.getItem("user_name")) {
  logutButton.style.display = "none";
}

function closeSession() {
  window.location.href = "/index.html";
  localStorage.clear();
}

var welcomeMessageElement = document.getElementById("welcomeMessage");
var username = localStorage.getItem("user_name");

if (username) {
  welcomeMessageElement.textContent = `Welcome, ${username}!`;
} else {
  welcomeMessageElement.textContent = "";
}

var canvas = document.getElementById("myCanvas");
canvas.width = 432;
canvas.height = 720;
var ctx = canvas.getContext("2d");

var spritesheet = new Image();
spritesheet.src = "/resources/sprites.png";

var bg_spr = [0, 0, 432, 768];
var ground_spr = [438, 0, 462, 168];
var pipe_up_spr = [906, 0, 78, 405];
var pipe_down_spr = [990, 0, 78, 363];
var scoreboard_spr = [438, 174, 339, 174];
var tap = [516, 366, 114, 147];
var get_ready_spr = [438, 663, 261, 66];
var game_over_spr = [438, 597, 282, 57];
var flappy_title_spr = [438, 519, 288, 66];
var new_lbl_spr = [438, 735, 48, 21];

var bird_spr = [[792, 192, 51, 36]];

var num_spr = [
  [864, 300, 21, 30],
  [870, 354, 21, 30],
  [867, 402, 21, 30],
  [867, 450, 21, 30],
  [861, 519, 21, 30],
  [861, 555, 21, 30],
  [495, 735, 21, 30],
  [525, 735, 21, 30],
  [555, 735, 21, 30],
  [585, 735, 21, 30],
];

var small_nums_spr = [
  [861, 222, 18, 21],
  [868, 486, 18, 21],
  [612, 735, 18, 21],
  [636, 735, 18, 21],
  [660, 735, 18, 21],
  [684, 735, 18, 21],
  [852, 591, 18, 21],
  [876, 591, 18, 21],
  [852, 639, 18, 21],
  [876, 639, 18, 21],
];

var coins_spr = [
  [906, 411, 66, 66],
  [798, 687, 66, 66],
  [726, 687, 66, 66],
  [660, 432, 66, 66],
];

function drawSprite(sprite, x, y) {
  ctx.drawImage(
    spritesheet,
    sprite[0],
    sprite[1],
    sprite[2],
    sprite[3],
    x,
    y,
    sprite[2],
    sprite[3]
  );
}

async function updateMaxScore(score) {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Intentelo más tarde");
    return;
  }

  let maxScore = localStorage.getItem("max_score");

  maxScore = maxScore ? parseInt(maxScore) : 0;

  if (score > maxScore) {
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/auth/update-max-score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ max_score: score }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Error al actualizar la puntuación: ${response.statusText}`
        );
      }

      localStorage.setItem("max_score", score);
      console.log("Puntuación máxima actualizada en el servidor");
    } catch (error) {
      console.error("Error al realizar el fetch:", error);
    }
  }
}

var gameStates = {
  waiting: 0,
  playing: 1,
  gameOver: 2,
};

var currentState = gameStates.waiting;

var frames = 0;
var groundX = 0;
var scrollSpeed = 3; //Velocidad de movimiento horizontal

var bird = {
  frame: 0,
  x: 80,
  y: 300,
  vy: 0,
  jump: 8,
};

var gravity = 0.5;
var score = 0;
var bestScore; //Puntuación más alta
var pipes = [];
var canClick = true;

function createPipe() {
  var yPipe =
    canvas.height -
    ground_spr[3] -
    (Math.ceil(Math.random() * 6) * pipe_down_spr[3]) / 6;

  pipes.push([canvas.width, yPipe, false]);
}

function drawPipes() {
  for (var i = 0; i < pipes.length; i++) {
    var pipe = pipes[i];

    drawSprite(pipe_down_spr, pipe[0], pipe[1]);
    drawSprite(pipe_up_spr, pipe[0], pipe[1] - pipe_up_spr[3] - 134);
  }
}

function drawScore() {
  var scoreString = score.toString();
  var xi = canvas.width / 2 - (scoreString.length * num_spr[0][2]) / 2;
  for (var i = 0; i < scoreString.length; i++) {
    var num = parseInt(scoreString[i]);
    drawSprite(num_spr[num], xi + i * num_spr[i][2], 30);
  }
}

function gameOver() {
  currentState = gameStates.gameOver;
  updateMaxScore(score);

  if (score > bestScore) {
    localStorage.setItem("bestScore", score);
  }

  canClick = false;
  setTimeout(function () {
    canClick = true;
  }, 800);
}

function reset() {
  currentState = gameStates.waiting;
  score = 0;
  bird.y = 300;
  bird.vy = 0;
  pipes = [];
}
//Muestra la ventana de GameOver
function drawGameOver() {
  drawSprite(
    scoreboard_spr,
    canvas.width / 2 - scoreboard_spr[2] / 2,
    canvas.height / 2 - scoreboard_spr[3] / 2
  );

  drawSprite(
    game_over_spr,
    canvas.width / 2 - game_over_spr[2] / 2,
    canvas.height / 2 - game_over_spr[3] - scoreboard_spr[3] / 2 - 30
  );
  //Mostrar la medalla según la puntuación
  var coin = Math.min(3, Math.floor(score / 10));
  drawSprite(
    coins_spr[coin],
    canvas.width / 2 - 2 * coins_spr[coin][2],
    canvas.height / 2 - coins_spr[coin][3] / 2 + 10
  );

  var scoreString = score.toString();
  for (var i = 0; i < scoreString.length; i++) {
    var num = parseInt(scoreString[i]);
    drawSprite(
      small_nums_spr[num],
      canvas.width / 2 + scoreboard_spr[2] / 4 + small_nums_spr[i][2] * i,
      canvas.height / 2 - 35
    );
  }
  //Para guardar la mejor puntuación
  var scoreString = bestScore.toString();
  for (var i = 0; i < scoreString.length; i++) {
    var num = parseInt(scoreString[i]);
    drawSprite(
      small_nums_spr[num],
      canvas.width / 2 + scoreboard_spr[2] / 4 + small_nums_spr[i][2] * i,
      canvas.height / 2 + 30
    );
  }
}

window.addEventListener("click", function (e) {
  if (!canClick) return;
  if (currentState == gameStates.waiting) {
    currentState = gameStates.playing;
    bestScore = localStorage.getItem("bestScore");
    if (bestScore == null) {
      bestScore = 0;
      localStorage.setItem("bestScore", 0);
    }
    welcomeMessageElement.style.display = "none";
  } else if (currentState == gameStates.playing) {
    bird.vy = -bird.jump;
  } else {
    reset();
  }
});

function update() {
  if (currentState != gameStates.gameOver) {
    groundX -= scrollSpeed;
    if (groundX <= -21) groundX = 0;
  }

  if (frames % 12 == 0) {
    if (bird.frame == bird_spr.length - 1) bird.frame = 0;
    else bird.frame++;
  }

  if (currentState == gameStates.waiting) bird.y += Math.cos(frames / 10);

  if (currentState != gameStates.waiting) {
    bird.vy += gravity;
    bird.y += bird.vy;
  }

  if (currentState == gameStates.playing) {
    if (frames % 150 == 0) createPipe();

    for (var i = 0; i < pipes.length; i++) {
      var pipe = pipes[i];
      pipe[0] -= scrollSpeed;

      if (
        pipe[0] <= bird.x + bird_spr[0][2] &&
        pipe[0] + pipe_up_spr[2] >= bird.x
      ) {
        if (bird.y + bird_spr[0][3] >= pipe[1] || bird.y <= pipe[1] - 134)
          gameOver();
      } else if (bird.x >= pipe[0] + pipe_up_spr[2] && !pipe[2]) {
        score++;
        pipe[2] = true;
        console.log(score);
      }

      if (pipe[0] < -pipe_up_spr[2]) {
        pipes.splice(i, 1);
        i--;
      }
    }

    if (bird.y + bird_spr[0][3] >= canvas.height - ground_spr[3]) {
      gameOver();
    }
  }
}

//Crea los sprites en pantalla
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  drawSprite(bg_spr, 0, 0);
  drawPipes();

  drawSprite(ground_spr, groundX, canvas.height - ground_spr[3]);
  drawSprite(bird_spr[bird.frame], bird.x, bird.y);
  //Lógica de estado del juego
  if (currentState == gameStates.waiting)
    drawSprite(
      flappy_title_spr,
      canvas.width / 2 - flappy_title_spr[2] / 2,
      200
    );
  else if (currentState == gameStates.playing) {
    drawScore();
  } else {
    drawGameOver();
  }

  frames++;
}

function run() {
  update();
  draw();
  window.requestAnimationFrame(run);
}

run();
