var canvas = document.getElementById("Canvas");
var ctx = canvas.getContext("2d");

// default konstante
var GAME_WIDTH = canvas.width;
var GAME_HEIGHT = canvas.height;

//dimenzije cigli
var BRICK_ROWS = 5;
var BRICK_COLUMNS = 10;
var TOTAL_BRICKS = BRICK_ROWS * BRICK_COLUMNS;

var BRICK_WIDTH = 50;
var BRICK_HEIGHT = 20;
var BRICK_SPACE_H = 30;
var BRICK_SPACE_V = 15;
var BRICK_TOP_OFFSET = 60;
var BRICK_COLOR_ROW = [
    "rgb(153, 51, 0)",    
    "rgb(255, 0, 0)",     
    "rgb(255, 153, 204)", 
    "rgb(0, 255, 0)",     
    "rgb(255, 255, 153)"  
];


//dimenzije palice
var PADDLE_WIDTH = 120;
var PADDLE_HEIGHT = 15;
var PADDLE_SPEED = 7;


//dimenzije lopte
var BALL_SIZE = 16;
var INITIAL_BALL_SPEED = 3;


//inicijalizacija pomocnih varijabli
var bricks = [];

//koordinate palice
var paddleX;
var paddleY;

//koordinate loptice
var ballX;
var ballY;

//koordinate pomaka(brzine)
var ballVx;
var ballVy;
var ballSpeed;

var rightPress = false;
var leftPress = false;

var score = 0;
var highScore = 0;
var bricksRemaining = TOTAL_BRICKS;

var state = "start"; // start, playing, gameover, win

var HIGH_SCORE_KEY = "max_score";


//inicijalizacija cigli i njihvoih parametara, spremno za iscrtavanje
function initBricks() {
    bricks = [];
    var width = BRICK_COLUMNS * BRICK_WIDTH +
                  (BRICK_COLUMNS - 1) * BRICK_SPACE_H;
    //offset kako bi cigle bile centrirane u canvasu
    var offset = (GAME_WIDTH - width) / 2;

    for (var r = 0; r < BRICK_ROWS; r++) {
        bricks[r] = [];
        for (var c = 0; c < BRICK_COLUMNS; c++) {
            var brickX = offset + c * (BRICK_WIDTH + BRICK_SPACE_H);
            var brickY = BRICK_TOP_OFFSET + r * (BRICK_HEIGHT + BRICK_SPACE_V);
            bricks[r][c] = {
                x: brickX,
                y: brickY,
                width: BRICK_WIDTH,
                height: BRICK_HEIGHT,
                color: BRICK_COLOR_ROW[r],
                alive: true
            };
        }
    }
    bricksRemaining = TOTAL_BRICKS;
}

//resetiraj lopticu i palicu na pocetne pozicije
function resetPositions() {
    paddleX = (GAME_WIDTH - PADDLE_WIDTH) / 2;
    paddleY = GAME_HEIGHT - 50;

    ballX = paddleX + PADDLE_WIDTH / 2;
    ballY = paddleY - BALL_SIZE;
    ballSpeed = INITIAL_BALL_SPEED;

    initBallDirection();
}


//inicijaliziranje početnog smjera loptice(random)
function initBallDirection() {
    // random se bira smjer kretanja loptice (lijevo ili desno)
    var direction = Math.random() < 0.5 ? -1 : 1;

    //izracunavanje pomaka uz kut od 45 stupnjeva
    ballVx = direction * (ballSpeed / Math.sqrt(2));
    ballVy = -ballSpeed / Math.sqrt(2);
}

//dohvat najboljeg rezultata iz web storage api-a
function getHighScore() {
    var stored = localStorage.getItem(HIGH_SCORE_KEY);
    if (stored !== null) {
        highScore = parseInt(stored, 10);
        if (isNaN(highScore)) {
            highScore = 0;
        }
    } else {
        highScore = 0;
    }
}

//spremanje najboljeg rezultata
function saveHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem(HIGH_SCORE_KEY, highScore);
    }
}

//resetiranje canvasa
function clearBackground() {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
}

//crtanje cigli sa njihovim sjenama
function drawBricks() {
    for (var r = 0; r < BRICK_ROWS; r++) {
        for (var c = 0; c < BRICK_COLUMNS; c++) {

            brick = bricks[r][c];

            if (!brick.alive) {
                continue;
            }

            ctx.save();

            ctx.shadowColor = "#ffffff";
            ctx.shadowBlur = 1;
            //sjena se postavlja iznad i desno od svake cigle
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = -2;

            ctx.fillStyle = brick.color;
            ctx.fillRect(brick.x, brick.y, brick.width, brick.height);

            ctx.restore();
         }
    }
}

//crtanje palice sa sjenom
function drawPaddle() {

    ctx.save();

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = -2;

    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(paddleX, paddleY, PADDLE_WIDTH, PADDLE_HEIGHT);

    ctx.restore();
    
}



//crtanje loptice sa sjenom
function drawBall() {
    ctx.save();

    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = -2;

    ctx.fillStyle = "#aaaaaa";
    ctx.fillRect(
        ballX - BALL_SIZE / 2,
        ballY - BALL_SIZE / 2,
        BALL_SIZE,
        BALL_SIZE
    );

    ctx.restore();

}


//crtanje pozadine tijekom igre
function drawBackground() {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px Helvetica, Verdana, sans-serif";
    ctx.textBaseline = "top";

    ctx.textAlign = "left";
    ctx.fillText("Score: " + score, 20, 20);

    ctx.textAlign = "right";
    ctx.fillText("High Score: " + highScore, GAME_WIDTH - 100, 20);
}

//crtanje pocetnog ekrana
function drawStartScreen() {
    clearBackground();
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = "bold 36px Helvetica, Verdana, sans-serif";
    ctx.fillText("BREAKOUT", GAME_WIDTH / 2, GAME_HEIGHT / 2);

    ctx.font = "italic bold 18px Helvetica, Verdana, sans-serif";
    ctx.fillText(
        "Press SPACE to begin",
        GAME_WIDTH / 2,
        GAME_HEIGHT / 2 + 36 + 10
    );
}

//crtanje Game Over ekrana
function drawGameOver() {
    ctx.fillStyle = "#ffff00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px Helvetica, Verdana, sans-serif";
    ctx.fillText("GAME OVER", GAME_WIDTH / 2, GAME_HEIGHT / 2);
}

//crtanje win ekrana
function drawWinScreen() {
    ctx.fillStyle = "#ffff00";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 40px Helvetica, Verdana, sans-serif";
    ctx.fillText("YOU WIN!", GAME_WIDTH / 2, GAME_HEIGHT / 2);
}

//azuriranje koordinata palice nakon pritiska odgovarajuce tipke
function updatePaddleXY() {
    if (rightPress) {
        paddleX += PADDLE_SPEED;
    } else if (leftPress) {
        paddleX -= PADDLE_SPEED;
    }

    //provjera je li palica dosla do lijevog ili desnog kraja canvasa, ako jest promijeni koordinate
    if (paddleX < 0) {
        paddleX = 0;
    } else if (paddleX + PADDLE_WIDTH > GAME_WIDTH) {
        paddleX = GAME_WIDTH - PADDLE_WIDTH;
    }
}

//racunanje ubrzanja(pomaka)
function calculateVelocity() {
    var length = Math.sqrt(ballVx * ballVx + ballVy * ballVy);
    if (length === 0) {
        return;
    }
    var factor = ballSpeed / length;
    ballVx *= factor;
    ballVy *= factor;
}


//azuriranje koordinata loptice
function updateBallXY() {
    ballX += ballVx;
    ballY += ballVy;

    var half = BALL_SIZE / 2;

    // provjera sudara s liveim/desnim rubom canvasa
    if (ballX - half <= 0) {
        ballX = half;
        ballVx = -ballVx;
    } else if (ballX + half >= GAME_WIDTH) {
        ballX = GAME_WIDTH - half;
        ballVx = -ballVx;
    }

    // provjera sudara s gornjim rubom canvasa
    if (ballY - half <= 0) {
        ballY = half;
        ballVy = -ballVy;
    }

    // provjera s donjim rubom
    if (ballY - half > GAME_HEIGHT) {
        saveHighScore();
        state = "gameover";
    }

    // provjera sudara s palicom
    if (
        ballX + half > paddleX &&
        ballX - half < paddleX + PADDLE_WIDTH &&
        ballY + half >= paddleY &&
        ballY - half <= paddleY + PADDLE_HEIGHT &&
        ballVy > 0
    ) {
        //postavljanje visine tako da se loptica dodiruje s palicom
        ballY = paddleY - half;
        ballVy = -Math.abs(ballVy);

        //provjera s koje je strane pogodina palicu, desne ili lijeve
        var hit = (ballX - (paddleX + PADDLE_WIDTH / 2)) / (PADDLE_WIDTH / 2);
        if (hit < -1) {
            hit = -1;
        } else if (hit > 1) {
            hit = 1;
        }

        //izracun vertikalne i horizontalne brzine
        ballVx = hit * ballSpeed;
        var rest = ballSpeed * ballSpeed - ballVx * ballVx;
        if (rest < 0) {
            rest = 0;
        }
        ballVy = -Math.sqrt(rest);
        // spriječi horizontalnu zamku
        var MIN_DY = 1.2;
        if (Math.abs(ballVy) < MIN_DY) {
            ballVy = -MIN_DY;
        }

    }
}

//funkcija za provjeru sudara s ciglom
function detectCollision() {
    var half = BALL_SIZE / 2;
    var collided = false;

    for (var r = 0; r < BRICK_ROWS; r++) {
        for (var c = 0; c < BRICK_COLUMNS; c++) {
            var brick = bricks[r][c];
            if (!brick.alive) {
                continue;
            }

            if (
                ballX + half > brick.x &&
                ballX - half < brick.x + brick.width &&
                ballY + half > brick.y &&
                ballY - half < brick.y + brick.height
            ) {
                // izračun koji je rub najbliži (za smjer odskoka)
                var overlapLeft = (ballX + half) - brick.x;
                var overlapRight = (brick.x + brick.width) - (ballX - half);
                var overlapTop = (ballY + half) - brick.y;
                var overlapBottom = (brick.y + brick.height) - (ballY - half);

                var min = Math.min(
                    overlapLeft,
                    overlapRight,
                    overlapTop,
                    overlapBottom
                );

                var cornerHit = false;

                //postavljanje koordinata loptice ovisno o dijelu cigle o koji je udarila
                if (min === overlapLeft) {
                    ballX = brick.x - half;
                    ballVx = -Math.abs(ballVx);
                } else if (min === overlapRight) {
                    ballX = brick.x + brick.width + half;
                    ballVx = Math.abs(ballVx);
                }

                if (min === overlapTop) {
                    ballY = brick.y - half;
                    ballVy = -Math.abs(ballVy);
                } else if (min === overlapBottom) {
                    ballY = brick.y + brick.height + half;
                    ballVy = Math.abs(ballVy);
                }

                // ako je min blizu i po x i po y, pogodila je kut cigle
                var minHorizontal = Math.min(overlapLeft, overlapRight);
                var minVertical = Math.min(overlapTop, overlapBottom);
                var diff = Math.abs(minHorizontal - minVertical);
                if (diff < 4) {
                    cornerHit = true;
                }

                //povecanje brzine zbog pogotka u kut
                if (cornerHit) {
                    ballSpeed *= 1.05;
                    calculateVelocity();
                }

                brick.alive = false;
                score += 1;
                bricksRemaining -= 1;

                if (bricksRemaining <= 0) {
                    saveHighScore();
                    state = "win";
                }

                collided = true;
                break;
            }
        }
        if (collided) {
            break;
        }
    }
}

//pomocna funkcija za azuriranje koordinata
function updatePositions() {
    if (state !== "playing") {
        return;
    }
    updatePaddleXY();
    updateBallXY();
    detectCollision();
}


//pomocna funkcija za crtanje elemenata
function drawElements() {
    clearBackground();

    if (state === "start") {
        drawStartScreen();
        return;
    }

    drawBricks();
    drawPaddle();
    drawBall();
    drawBackground();

    if (state === "gameover") {
        drawGameOver();
    } else if (state === "win") {
        drawWinScreen();
    }
}


//glavna loop funkcija
function main_loop() {
    updatePositions();
    drawElements();
    requestAnimationFrame(main_loop);
}


//funckija za odgovor na pritisak tipki
function keyDown(e) {
    var key = e.key || e.code;

    if (key === "ArrowRight" || key === "Right") {
        rightPress = true;
    } else if (key === "ArrowLeft" || key === "Left") {
        leftPress = true;
    } else if (key === " " || key === "Space" || key === "Spacebar") {
        if (state === "start" || state === "gameover" || state === "win") {
            gameStart();
        }
    }
}


//funkcija za odgovor nakon otpustanja tipki
function keyUp(e) {
    var key = e.key || e.code;

    if (key === "ArrowRight" || key === "Right") {
        rightPress = false;
    } else if (key === "ArrowLeft" || key === "Left") {
        leftPress = false;
    }
}


//pokrece se nakon pritiska space, inicijalizira cigle i resetira pozicije loptice i palice
function gameStart() {
    score = 0;
    initBricks();
    resetPositions();
    state = "playing";
}


function gameInit() {
    getHighScore();
    drawStartScreen();
    document.addEventListener("keydown", keyDown, false);
    document.addEventListener("keyup", keyUp, false);
    requestAnimationFrame(main_loop);
}

gameInit();