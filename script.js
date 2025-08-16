// --- Elementos del DOM ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const startScreen = document.getElementById('start-screen');
const museumScreen = document.getElementById('museum-screen');
const winScreen = document.getElementById('win-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const nextLevelButton = document.getElementById('next-level-button');
const restartButton = document.getElementById('restart-button');
const retryButton = document.getElementById('retry-button');

// --- Configuración del juego ---
const GRAVITY = 0.5;
const JUMP_STRENGTH = -12;
const PLAYER_SPEED = 5;
let currentLevel = 0;
let score = 0;
const gameWidth = 800;
const gameHeight = 600;

canvas.width = gameWidth;
canvas.height = gameHeight;

// --- Datos de los petroglifos (basado en la investigación del proyecto) ---
const petroglyphData = [
    {
        title: "Nivel 1: El Guerrero y las Flechas",
        image: "https://i.ibb.co/6P0S9pX/guerrero.png", // Imagen simulada del guerrero 
        description: "Este petroglifo representa a un guerrero. A pesar de su gran tamaño, está ubicado en un nivel inferior en la roca, lo que puede indicar una jerarquía social. Sus manos sostienen flechas, destacando su rol. El rostro tiene maquillaje facial que simboliza las grecas escalonadas." [cite: 3]
    },
    {
        title: "Nivel 2: El Sacerdote (Chamán)",
        image: "https://i.ibb.co/z5pLw7c/sacerdote.png", // Imagen simulada del sacerdote 
        description: "Podemos identificar a este personaje como un sacerdote o chamán por la complejidad de su tocado y su vestimenta. Las grecas en su tocado y las líneas ondulantes en su cuerpo simbolizan el movimiento de las serpientes, que estaban asociadas con la lluvia, la fertilidad y la renovación de la vida." [cite: 3]
    },
    {
        title: "Nivel 3: El Señor y el Cosmos",
        image: "https://i.ibb.co/D8d3w6j/senor.png", // Imagen simulada del señor 
        description: "Este petroglifo representa a un 'Señor', una figura de alto rango social. Su tocado tiene formas de rombos que simbolizan las ranas, aludiendo a los focos de agua. Los círculos y puntos en su cabeza y pendientes representan el espacio astral y su conexión con los astros." [cite: 3]
    }
];

// --- Clases del juego ---
class Player {
    constructor() {
        this.width = 30;
        this.height = 40;
        this.x = 50;
        this.y = 50;
        this.vx = 0;
        this.vy = 0;
        this.isGrounded = false;
        this.color = '#5b3c29'; // Color de un guardian
    }

    update() {
        this.vy += GRAVITY;
        this.x += this.vx;
        this.y += this.vy;

        // Borde inferior del canvas (simula caida)
        if (this.y + this.height > canvas.height) {
            endGame();
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.isGrounded) {
            this.vy = JUMP_STRENGTH;
            this.isGrounded = false;
        }
    }
}

class Platform {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = '#7a5a48';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        // Detalles de roca
        ctx.strokeStyle = '#6b4d3f';
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#6b4d3f';
        for (let i = 0; i < this.width; i += 10) {
            ctx.fillRect(this.x + i, this.y + this.height - 2, 5, 2);
        }
    }
}

class Fragment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.collected = false;
        this.color = '#e3c28c'; // Color de roca clara con grabado
    }

    draw() {
        if (!this.collected) {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y);
            ctx.lineTo(this.x + this.size, this.y + this.size / 2);
            ctx.lineTo(this.x + this.size / 2, this.y + this.size);
            ctx.closePath();
            ctx.fill();
        }
    }
}

// --- Variables del juego ---
let player;
let platforms = [];
let fragments = [];
let keys = {};
let gameLoopId;

// --- Niveles ---
const levels = [
    // Nivel 1: La Quebrada Chorunga
    {
        platforms: [
            new Platform(0, gameHeight - 50, 200, 50),
            new Platform(250, gameHeight - 120, 150, 50),
            new Platform(450, gameHeight - 200, 150, 50),
            new Platform(650, gameHeight - 280, 150, 50),
            new Platform(700, gameHeight - 400, 100, 50),
            new Platform(500, gameHeight - 480, 150, 50),
            new Platform(250, gameHeight - 550, 200, 50)
        ],
        fragments: [
            new Fragment(300, gameHeight - 170),
            new Fragment(500, gameHeight - 250),
            new Fragment(700, gameHeight - 350)
        ]
    },
    // Nivel 2: El Cerro Chillihuay
    {
        platforms: [
            new Platform(0, gameHeight - 50, 100, 50),
            new Platform(150, gameHeight - 100, 150, 50),
            new Platform(50, gameHeight - 200, 150, 50),
            new Platform(250, gameHeight - 280, 200, 50),
            new Platform(550, gameHeight - 350, 150, 50),
            new Platform(400, gameHeight - 450, 100, 50),
            new Platform(600, gameHeight - 550, 200, 50)
        ],
        fragments: [
            new Fragment(200, gameHeight - 250),
            new Fragment(500, gameHeight - 400),
            new Fragment(680, gameHeight - 500)
        ]
    },
    // Nivel 3: El Complejo Chillihuay
    {
        platforms: [
            new Platform(0, gameHeight - 50, 200, 50),
            new Platform(100, gameHeight - 150, 100, 50),
            new Platform(300, gameHeight - 250, 150, 50),
            new Platform(500, gameHeight - 350, 150, 50),
            new Platform(650, gameHeight - 450, 150, 50),
            new Platform(350, gameHeight - 550, 150, 50)
        ],
        fragments: [
            new Fragment(350, gameHeight - 300),
            new Fragment(550, gameHeight - 400),
            new Fragment(400, gameHeight - 600)
        ]
    }
];

// --- Funciones del juego ---
function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showScreen(winScreen);
        return;
    }
    
    player = new Player();
    platforms = levels[levelIndex].platforms;
    fragments = levels[levelIndex].fragments.map(f => new Fragment(f.x, f.y)); // Reiniciar fragmentos
    score = 0;
    
    // Configurar posición inicial del jugador
    player.x = platforms[0].x + 20;
    player.y = platforms[0].y - player.height;
    
    showScreen(null); // Ocultar todas las pantallas de UI
    if (gameLoopId) cancelAnimationFrame(gameLoopId);
    gameLoopId = requestAnimationFrame(gameLoop);
}

function checkCollisions() {
    // Colisión con plataformas
    player.isGrounded = false;
    platforms.forEach(platform => {
        if (
            player.y + player.height >= platform.y &&
            player.y + player.height <= platform.y + player.vy + GRAVITY &&
            player.x + player.width > platform.x &&
            player.x < platform.x + platform.width
        ) {
            player.vy = 0;
            player.isGrounded = true;
            player.y = platform.y - player.height;
        }
    });

    // Colisión con fragmentos
    fragments.forEach(fragment => {
        if (!fragment.collected) {
            const dx = player.x + player.width / 2 - (fragment.x + fragment.size / 2);
            const dy = player.y + player.height / 2 - (fragment.y + fragment.size / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < player.width / 2 + fragment.size / 2) {
                fragment.collected = true;
                score++;
                if (score === fragments.length) {
                    levelComplete();
                }
            }
        }
    });
}

function levelComplete() {
    const data = petroglyphData[currentLevel];
    document.getElementById('museum-title').textContent = data.title;
    document.getElementById('petroglyph-image').src = data.image;
    document.getElementById('petroglyph-text').textContent = data.description;
    
    showScreen(museumScreen);
    cancelAnimationFrame(gameLoopId);
}

function endGame() {
    showScreen(gameOverScreen);
    cancelAnimationFrame(gameLoopId);
}

function showScreen(screen) {
    [startScreen, museumScreen, winScreen, gameOverScreen].forEach(s => {
        s.classList.remove('active');
    });
    if (screen) {
        screen.classList.add('active');
    }
}

function gameLoop() {
    // Limpiar canvas
    ctx.clearRect(0, 0, gameWidth, gameHeight);

    // Movimiento del jugador
    if (keys['ArrowLeft']) player.vx = -PLAYER_SPEED;
    else if (keys['ArrowRight']) player.vx = PLAYER_SPEED;
    else player.vx = 0;
    
    player.update();
    checkCollisions();

    // Dibujar elementos
    platforms.forEach(platform => platform.draw());
    fragments.forEach(fragment => fragment.draw());
    player.draw();

    gameLoopId = requestAnimationFrame(gameLoop);
}

// --- Eventos de teclado ---
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'ArrowUp') {
        player.jump();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// --- Eventos de los botones ---
startButton.addEventListener('click', () => {
    currentLevel = 0;
    loadLevel(currentLevel);
});

nextLevelButton.addEventListener('click', () => {
    currentLevel++;
    loadLevel(currentLevel);
});

restartButton.addEventListener('click', () => {
    currentLevel = 0;
    loadLevel(currentLevel);
});

retryButton.addEventListener('click', () => {
    loadLevel(currentLevel);
});

// Iniciar el juego en la pantalla de inicio
showScreen(startScreen);