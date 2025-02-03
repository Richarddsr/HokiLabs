const dino = document.getElementById("dino");
const game = document.getElementById("game");
const scoreElement = document.getElementById("score");

let isJumping = false;
let gravity = 0.9;
let position = 0;
let score = 0;
let gameIsOver = false;
let gameSpeed = 5; // Velocidade inicial
let spawnInterval = 2000; // Intervalo inicial entre cactos
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
    gameSpeed = 5 + Math.floor(score / 20); // Ajustado para pontuação x2
    spawnInterval = Math.max(1000, 2000 - (score * 25)); // Ajustado para pontuação x2
    
    // Atualiza o nível
    const level = Math.floor(score / 20) + 1; // Ajustado para pontuação x2
    levelElement.textContent = `Nível ${level}`;

    // Muda o fundo no nível 5
    if (level === 5) {
        game.style.backgroundColor = '#2c3e50'; // Cor mais escura
        game.style.transition = 'background-color 1s';
        document.body.style.backgroundColor = '#1a2634'; // Muda também o fundo do body
        document.body.style.transition = 'background-color 1s';
        levelElement.style.color = '#e74c3c'; // Muda a cor do nível para vermelho
        scoreElement.style.color = '#e74c3c'; // Muda a cor do score para vermelho
    } else if (level < 5) {
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
    let jumpForce = 20;
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
    const randomHeight = getRandomNumber(30, 50);
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
        
        if (dinoRect.right > cactusRect.left &&
            dinoRect.left < cactusRect.right &&
            dinoRect.bottom > cactusRect.top &&
            dinoRect.top < cactusRect.bottom) {
            
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

// Gerar pássaros
function generateBird() {
    if (gameIsOver) return;
    
    const bird = document.createElement("div");
    bird.classList.add("bird");
    game.appendChild(bird);
    
    let birdPosition = -30;
    let birdHeight = getRandomNumber(50, 150);
    bird.style.right = birdPosition + "px";
    bird.style.bottom = birdHeight + "px";

    function moveBird() {
        if (gameIsOver) {
            if (bird && bird.parentNode) {
                bird.remove();
            }
            clearInterval(birdTimerId);
            return;
        }

        birdPosition += gameSpeed;
        bird.style.right = birdPosition + "px";

        const dinoRect = dino.getBoundingClientRect();
        const birdRect = bird.getBoundingClientRect();

        if (dinoRect.right > birdRect.left &&
            dinoRect.left < birdRect.right &&
            dinoRect.bottom > birdRect.top &&
            dinoRect.top < birdRect.bottom) {
            
            clearInterval(birdTimerId);
            endGame();
            return;
        }

        // Remover pássaro quando sair da tela
        if (birdPosition > game.offsetWidth + 100) {
            if (bird && bird.parentNode) {
                bird.remove();
            }
            clearInterval(birdTimerId);
        }
    }

    const birdTimerId = setInterval(moveBird, 20);
}

// Função para gerar próximo obstáculo
function generateNextObstacle() {
    if (gameIsOver) return;

    const level = Math.floor(score / 20) + 1;
    
    // Determina qual obstáculo gerar
    if (level >= 5) {
        // Em níveis mais altos, chance de gerar pássaro ou cacto
        if (Math.random() < 0.3) {
            generateBird();
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
