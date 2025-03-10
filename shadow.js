window.addEventListener('load', function () { 
    const canvas = document.getElementById('canvas1'); 
    const ctx = canvas.getContext('2d'); 
    canvas.width = 800; 
    canvas.height = 720; 
    let enemies = []; 
    let score = 0; 
    let gameOver = false; 
    let gameStarted = false; 
    let gameMode = 'easy'; // Default to easy mode 
    let coin = null; // Coin object for hard mode

    // Start screen elements
    const startScreen = document.createElement('div');
    startScreen.style.position = 'absolute';
    startScreen.style.top = '50%';
    startScreen.style.left = '50%';
    startScreen.style.transform = 'translate(-50%, -50%)';
    startScreen.style.textAlign = 'center';
    startScreen.style.fontSize = '30px';
    startScreen.style.fontFamily = 'Helvetica, sans-serif';
    startScreen.style.color = 'white';
    startScreen.innerHTML = `
        <h1>Shadow's Adventure</h1>
        <h3>All the enemies have an invisible aura</h3>
        <h3>that will end your game </h3>
        <h3> Use arrow keys to move </h3>
        <p>Press enter to start</p>
        <p>Press E for easy and H for hard</p>
        <p id="modeSelectionText">Selected Mode: Easy</p>
    `;
    document.body.appendChild(startScreen);

    // Update the mode display text
    function updateModeText() {
        const modeText = document.getElementById('modeSelectionText');
        modeText.textContent = `Selected Mode: ${gameMode.charAt(0).toUpperCase() + gameMode.slice(1)}`;
    }

    // Handle keypress for game start and mode selection
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !gameStarted) {
            gameStarted = true;
            document.body.removeChild(startScreen); // Remove the start screen
            animate(0); // Start the game animation
        }
        if (e.key === 'E' || e.key === 'e') {
            gameMode = 'easy'; // Set to easy mode
            updateModeText(); // Update the displayed mode
        }
        if (e.key === 'H' || e.key === 'h') {
            gameMode = 'hard'; // Set to hard mode
            updateModeText(); // Update the displayed mode
            generateCoin(); // Generate a coin in hard mode
        }
    });

    class InputHandler {
        constructor() {
            this.keys = [];
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') 
                    && this.keys.indexOf(e.key) === -1) {
                    this.keys.push(e.key);
                }
            });
            window.addEventListener('keyup', e => {
                if (e.key === 'ArrowDown' ||
                    e.key === 'ArrowUp' ||
                    e.key === 'ArrowLeft' ||
                    e.key === 'ArrowRight') {
                    this.keys.splice(this.keys.indexOf(e.key), 1);
                }
            });
        }
    }

    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 0;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('playerImage');
            this.frameX = 0;
            this.maxFrame = 8;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, this.frameY * this.height, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(input, deltaTime, enemies) {
            //collision detection with enemies
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < enemy.width / 2 + this.width / 2) {
                    gameOver = true;
                }
            })

            // Coin collision detection in hard mode
            if (gameMode === 'hard' && coin) {
                const dx = (coin.x + coin.width / 2) - (this.x + this.width / 2);
                const dy = (coin.y + coin.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 100) { // Coin is collected when within 100px radius
                    score += 2; // Add 2 points for collecting the coin
                    generateCoin(); // Generate a new coin in a different position

                }

            }

            //sprite animation
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // controls
            if (input.keys.indexOf('ArrowRight') > -1) {
                this.speed = 5;
            } else if (input.keys.indexOf('ArrowLeft') > -1) {
                this.speed = -5;
            } else if (input.keys.indexOf('ArrowUp') > -1 && this.onGround()) {
                this.vy -= 32;
            } else {
                this.speed = 0;
            }
            //horizontal movement
            this.x += this.speed;
            if (this.x < 0) this.x = 0;
            else if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width
            //vertical movement
            this.y += this.vy;
            if (!this.onGround()) {
                this.vy += this.weight;
                this.maxFrame = 5;
                this.frameY = 1;
            } else {
                this.vy = 0;
                this.maxFrame = 8;
                this.frameY = 0;
            }
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }

    class Background {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.image = document.getElementById('backgroundImage');
            this.x = 0;
            this.y = 0;
            this.width = 2400;
            this.height = 720;
            this.speed = 7;
        }
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
            context.drawImage(this.image, this.x + this.width - this.speed, this.y, this.width, this.height);
        }
        update() {
            this.x -= this.speed;
            if (this.x < 0 - this.width) this.x = 0
        }
    }

    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 160;
            this.height = 119;
            this.image = document.getElementById('enemyImage');
            this.x = this.gameWidth;
            this.y = this.gameHeight - this.height;
            this.frameX = 0;
            this.maxFrame = 5;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.speed = 8;
            this.markedforDeletion = false;
        }
        draw(context) {
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height);
        }
        update(deltaTime) {
            if (this.frameTimer > this.frameInterval) {
                if (this.frameX >= this.maxFrame) this.frameX = 0;
                else this.frameX++;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
            this.x -= this.speed;
            if (this.x < 0 - this.width) {
                this.markedforDeletion = true;
                score++;
            }

        }
    }

    // Global bat declaration
    let bat; 
    let lastBatTime = 0; // Timer for bat spawn

    // Generate Bat
    function generateBat() {
        const BatY = Math.random() * (canvas.height - 100); // Random height for bat
        bat = {
            x: canvas.width,
            y: BatY,
            width: 60,
            height: 60,
            emoji: '🐲', // bat emoji
            draw: function (context) {
                context.font = '60px Arial';
                context.fillText(this.emoji, this.x, this.y);
            },
            update: function () {
                this.x -= 9; // Move bat leftwards
                if (this.x < 0) {
                    this.x = canvas.width;
                    this.y = Math.random() * (canvas.height - 100); // Randomize the Y position
                }

                // Check if player collides with bat (within 100px radius)
                const dx = (player.x + player.width / 2) - (this.x + this.width / 2);
                const dy = (player.y + player.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 60) {
                    gameOver = true; // End the game if player is too close to bat
                }
            }
        };
    }

    // Handle Bat Timer and Spawn
    function handleBat(deltaTime) {
        const currentTime = Date.now();
        if (currentTime - lastBatTime > 10000) { // If 10 seconds have passed
            generateBat();
            lastBatTime = currentTime; // Reset the timer
        }
        if (bat && gameMode === 'hard') {
            bat.update();
            bat.draw(ctx);
        }
    }

    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height))
            enemyTimer = 0;
        } else {
            enemyTimer += deltaTime;
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
        enemies = enemies.filter(enemy => !enemy.markedforDeletion);
    }

    function displayStatusText(context) {
        context.font = '40px Helvetica';
        context.fillStyle = 'black';
        context.fillText('Score: ' + score, 20, 50)
        context.fillStyle = 'white';
        context.fillText('Score: ' + score, 22, 52)
        if (gameOver) {
            context.textAlign = 'center';
            context.fillStyle = 'black';
            context.fillText('Game Over, Ctrl + r To Try Again! ', canvas.width / 2, 200);
            context.fillStyle = 'white';
            context.fillText('Game Over, Ctrl + r To Try Again! ', canvas.width / 2 + 2, 202);
        }
    }

    const input = new InputHandler();
    const player = new Player(canvas.width, canvas.height);
    const background = new Background(canvas.width, canvas.height);

    let lastTime = 0;
    let enemyTimer = 0;
    let enemyInterval = 1000;
    let randomEnemyInterval = Math.random() * 2000;

    // Coin for hard mode
    function generateCoin() {
        coin = {
            x: Math.random() * canvas.width,
            y: Math.random() * (canvas.height - 50),
            width: 50,
            height: 50,
            emoji: '💰',
            draw: function (context) {
                context.font = '30px Arial';
                context.fillText(this.emoji, this.x, this.y);
            },
            update: function () {
                this.x -= 3; // Move coin leftward
                if (this.x < 0) {
                    this.x = canvas.width;
                    this.y = Math.random() * (canvas.height - 50);
                }
            }
        };
    }

    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        background.draw(ctx);
        background.update();
        player.draw(ctx);
        player.update(input, deltaTime, enemies);

        if (gameMode === 'hard' && coin) {
            coin.update();
            coin.draw(ctx);
        }

        // Handle Bat (spawn and collision)
        handleBat(deltaTime);

        handleEnemies(deltaTime);
        displayStatusText(ctx);

        if (!gameOver) requestAnimationFrame(animate);
    }
});
