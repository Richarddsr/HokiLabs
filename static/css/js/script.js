const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreElement = document.getElementById("score");

let isJumping = false;
let gravity = 0.9;
let position = 0;
let score = 0;
let gameIsOver = false;
let gameSpeed = 7; // Increased initial speed from 5 to 7
let spawnInterval = 1800; // Reduced initial spawn interval from 2000 to 1800
const levelElement = document.createElement("div");
levelElement.className = "level";
game.parentNode.insertBefore(levelElement, game.nextSibling);

// Função para gerar um número aleatório entre min e max
function getRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Função para atualizar a dificuldade
function updateDifficulty() {
    if (gameIsOver) return;
    
    // Aumenta a velocidade e diminui o intervalo a cada 10 pontos
    gameSpeed = 7 + Math.floor(score / 20); // Increased base speed and made progression faster
    
    // New spawn interval calculation for higher levels
    const level = Math.floor(score / 12) + 1;
    if (level >= 10) {
        spawnInterval = Math.max(800, 1400 - (score * 15)); // More aggressive decrease for high levels
    } else if (level >= 5) {
        spawnInterval = Math.max(1000, 1600 - (score * 20)); // Moderate decrease for mid levels
    } else {
        spawnInterval = Math.max(1200, 1800 - (score * 25)); // Original decrease for low levels
    }
    
    // Atualiza o nível
    levelElement.textContent = `Nível ${level}`;

    // Muda o fundo no nível 5 ou superior
    if (level >= 5) {
        game.style.backgroundColor = '#2c3e50'; // Cor mais escura
        game.style.transition = 'background-color 1s';
        document.body.style.backgroundColor = '#1a2634'; // Muda também o fundo do body
        document.body.style.transition = 'background-color 1s';
        levelElement.style.color = '#e74c3c'; // Muda a cor do nível para vermelho
        scoreElement.style.color = '#e74c3c'; // Muda a cor do score para vermelho
    } else {
        game.style.backgroundColor = '#fff';
        document.body.style.backgroundColor = '#073047';
        levelElement.style.color = '#4a90e2';
        scoreElement.style.color = '#4a90e2';
    }

      // Muda o fundo no nível 10 ou superior
      if (level >= 10) {
        game.style.backgroundColor = '#8e44ad'; // New background color
        game.style.transition = 'background-color 1s';
        document.body.style.backgroundColor = '#5e3370'; // New body background color
        document.body.style.transition = 'background-color 1s';
        levelElement.style.color = '#f39c12'; // New color for level text
        scoreElement.style.color = '#f39c12'; // New color for score text

        // Increase difficulty for level 10
        gameSpeed += 2; // Increase speed
        spawnInterval = Math.max(800, spawnInterval - 100); // Decrease spawn interval
    } else if (level >= 5) {
        game.style.backgroundColor = '#2c3e50'; // Existing level 5 color
        game.style.transition = 'background-color 1s';
        document.body.style.backgroundColor = '#1a2634'; // Existing level 5 body color
        document.body.style.transition = 'background-color 1s';
        levelElement.style.color = '#e74c3c'; // Existing level 5 color
        scoreElement.style.color = '#e74c3c'; // Existing level 5 color
    } else {
        game.style.backgroundColor = '#fff';
        document.body.style.backgroundColor = '#073047';
        levelElement.style.color = '#4a90e2';
        scoreElement.style.color = '#4a90e2';
    }
}

// Controle do pulo
function control(e) {
    if (e.keyCode === 32) {
        if (!isJumping) {
            jump();
        }
    }
}

function jump() {
    if (gameIsOver) return;
    
    isJumping = true;
    let jumpForce = 15; // Reduced from 20 to 15 for lower jump height
    let jumpVelocity = jumpForce;
    
    function applyGravity() {
        if (!isJumping) return;
        
        // Aplica a gravidade
        position += jumpVelocity;
        jumpVelocity -= gravity;
        
        // Verifica se chegou ao chão
        if (position <= 0) {
            position = 0;
            jumpVelocity = 0;
            isJumping = false;
            clearInterval(jumpTimer);
        }
        
        // Atualiza a posição do personagem
        dino.style.bottom = position + 'px';
    }
    
    let jumpTimer = setInterval(applyGravity, 20);
}

// Gerar cactos
function generateCactus() {
    if (gameIsOver) return;
    
    const cactus = document.createElement("div");
    cactus.classList.add("cactus");
    cactus.passed = false;
    game.appendChild(cactus);
    
    let cactusPosition = -30;
    cactus.style.right = cactusPosition + "px";

    // Tamanho aleatório do cacto
    const randomHeight = getRandomNumber(30, 100);
    const randomWidth = getRandomNumber(20, 30);
    cactus.style.height = randomHeight + 'px';
    cactus.style.width = randomWidth + 'px';

    function moveCactus() {
        if (gameIsOver) {
            if (cactus && cactus.parentNode) {
                cactus.remove();
            }
            clearInterval(timerId);
            return;
        }
        
        cactusPosition += gameSpeed;
        cactus.style.right = cactusPosition + "px";

        const dinoRect = dino.getBoundingClientRect();
        const cactusRect = cactus.getBoundingClientRect();
        
        // Add a small buffer to make collision detection more forgiving
        if (dinoRect.right - 5 > cactusRect.left &&
            dinoRect.left + 5 < cactusRect.right &&
            dinoRect.bottom - 5 > cactusRect.top &&
            dinoRect.top + 5 < cactusRect.bottom) {
            
            clearInterval(timerId);
            endGame();
            return;
        }
        

        // Atualizar pontuação quando o cacto passar pelo dino
        if (cactusPosition > game.offsetWidth - 50 && !cactus.passed) {
            score += 2;  // Increased to 2 points
            cactus.passed = true;
            scoreElement.textContent = score;
            updateDifficulty();
        }

        // Remover cacto quando sair da tela
        if (cactusPosition > game.offsetWidth + 100) {
            if (cactus && cactus.parentNode) {
                cactus.remove();
            }
            clearInterval(timerId);
        }
    }

    const timerId = setInterval(moveCactus, 20);
}

// Função para gerar próximo obstáculo
function generateNextObstacle() {
    if (gameIsOver) return;

    const level = Math.floor(score / 20) + 1;
    
    // Determina qual obstáculo gerar
    if (level >= 5) {
        // Em níveis mais altos, chance de gerar pássaro ou cacto
        if (Math.random() < 0.2) { // Reduced bird spawn chance from 0.3 to 0.2
            score += 5;  // Increased to 5 points
            updateDifficulty();
            generateCactus();
        } else {
            generateCactus();
        }
    } else {
        // Níveis iniciais, apenas cactos
        generateCactus();
    }

    // Agendar próximo obstáculo
    setTimeout(generateNextObstacle, spawnInterval);
}

// Função para finalizar o jogo
function endGame() {
    if (gameIsOver) return;
    
    gameIsOver = true;
    document.removeEventListener("keyup", control);
    
    fetch('/flippyhoki/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: 'score=' + score
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            alert("Game Over!\nPontuação: " + score + "\nPontuação salva com sucesso!");
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert("Game Over!\nPontuação: " + score);
    });
}

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Inicializar o jogo
scoreElement.textContent = "0";
levelElement.textContent = "Nível 1";
generateNextObstacle();
document.addEventListener("keyup", control);

document.addEventListener("DOMContentLoaded", function () {
    let botao = document.getElementById("reloadButton");
    botao.addEventListener("click", function () {
        location.reload();
    });
});
