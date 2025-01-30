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

// Função para atualizar a dificuldade
function updateDifficulty() {
    // Aumenta a velocidade e diminui o intervalo a cada 10 pontos
    gameSpeed = 5 + Math.floor(score / 10);
    spawnInterval = Math.max(1000, 2000 - (score * 50));
    
    // Atualiza o nível
    const level = Math.floor(score / 10) + 1;
    levelElement.textContent = `Nível ${level}`;
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
    
    let cactusPosition = game.offsetWidth;
    const cactus = document.createElement("div");
    
    cactus.classList.add("cactus");
    game.appendChild(cactus);
    cactus.style.right = "0px";

    function moveCactus() {
        if (gameIsOver) {
            cactus.remove();
            return;
        }
        
        cactusPosition -= gameSpeed; // Usa a velocidade dinâmica
        cactus.style.right = game.offsetWidth - cactusPosition + "px";

        // Verificar colisão com precisão usando getBoundingClientRect
        const dinoRect = dino.getBoundingClientRect();
        const cactusRect = cactus.getBoundingClientRect();
        
        // Verificação de colisão mais precisa
        if (
            dinoRect.right > cactusRect.left &&
            dinoRect.left < cactusRect.right &&
            dinoRect.bottom > cactusRect.top &&
            dinoRect.top < cactusRect.bottom
        ) {
            clearInterval(timerId);
            gameIsOver = true;
            document.removeEventListener("keyup", control);
            
            // Salvar a pontuação
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
                    alert("Game Over! Pontuação: " + score + "\nPontuação salva com sucesso!");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Game Over! Pontuação: " + score);
            });
            
            return;
        }

        // Atualizar pontuação quando o cacto passar pelo dino
        if (cactusPosition < 50 && !cactus.passed) {
            score++;
            cactus.passed = true;
            scoreElement.textContent = score;
            updateDifficulty(); // Atualiza a dificuldade quando pontua
        }

        // Remover cacto quando sair da tela
        if (cactusPosition < -20) {
            clearInterval(timerId);
            game.removeChild(cactus);
        }
    }

    let timerId = setInterval(moveCactus, 20);
    if (!gameIsOver) setTimeout(generateCactus, spawnInterval); // Usa o intervalo dinâmico
}

// Função para pegar o cookie do CSRF token
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

generateCactus();
document.addEventListener("keyup", control);

document.addEventListener("DOMContentLoaded", function () {
    let botao = document.getElementById("reloadButton");
    botao.addEventListener("click", function () {
        location.reload();
    });
});
