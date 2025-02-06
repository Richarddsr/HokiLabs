const player = {
    element: document.getElementById('player'),
    x: 300,
    y: 200,
    speed: 5,
    hp: 100,
    velocityX: 0,
    velocityY: 0,
    maxSpeed: 5,
    acceleration: 0.5,
    friction: 0.85
};

let score = 0;
let enemies = [];

// Add key tracking object
const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'hit-effect';
    effect.style.left = (x + 15) + 'px';
    effect.style.top = (y + 15) + 'px';
    effect.style.width = '30px';
    effect.style.height = '30px';
    effect.style.background = 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)';
    document.getElementById('gameArea').appendChild(effect);
    setTimeout(() => effect.remove(), 500);
}

function updatePlayer() {
    player.element.style.left = player.x + 'px';
    player.element.style.top = player.y + 'px';
    document.getElementById('hp').textContent = player.hp;
    document.getElementById('score').textContent = score;
}

function createEnemy() {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    const x = Math.random() * 570;
    const y = Math.random() * 370;
    enemy.style.left = x + 'px';
    enemy.style.top = y + 'px';
    document.getElementById('gameArea').appendChild(enemy);
    enemies.push({
        element: enemy,
        x: x,
        y: y,
        speed: 1 + Math.random() * 0.5, // Random speed between 1 and 2
        velocityX: 0,
        velocityY: 0
    });
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + 30 &&
           rect1.x + 30 > rect2.x &&
           rect1.y < rect2.y + 30 &&
           rect1.y + 30 > rect2.y;
}

// New function to handle player movement with physics
function movePlayer() {
    // Calculate input direction
    let dx = 0;
    let dy = 0;
    
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
    }
    
    // Apply acceleration
    player.velocityX += dx * player.acceleration;
    player.velocityY += dy * player.acceleration;
    
    // Apply friction
    player.velocityX *= player.friction;
    player.velocityY *= player.friction;
    
    // Limit maximum speed
    const currentSpeed = Math.sqrt(player.velocityX * player.velocityX + player.velocityY * player.velocityY);
    if (currentSpeed > player.maxSpeed) {
        const scale = player.maxSpeed / currentSpeed;
        player.velocityX *= scale;
        player.velocityY *= scale;
    }
    
    // Update position with boundaries
    player.x = Math.max(0, Math.min(570, player.x + player.velocityX));
    player.y = Math.max(0, Math.min(370, player.y + player.velocityY));
    
    // Stop velocity when hitting boundaries
    if (player.x <= 0 || player.x >= 570) player.velocityX = 0;
    if (player.y <= 0 || player.y >= 370) player.velocityY = 0;
    
    updatePlayer();
}

function moveEnemies() {
    enemies.forEach(enemy => {
        // Calculate direction to player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        
        // Normalize the direction
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            // Update enemy position
            enemy.x += dirX * enemy.speed;
            enemy.y += dirY * enemy.speed;
            
            // Keep enemy within bounds
            enemy.x = Math.max(0, Math.min(570, enemy.x));
            enemy.y = Math.max(0, Math.min(370, enemy.y));
            
            // Update enemy element position
            enemy.element.style.left = enemy.x + 'px';
            enemy.element.style.top = enemy.y + 'px';
        }
    });
}

function gameLoop() {
    movePlayer();
    moveEnemies(); // Add enemy movement
    
    enemies.forEach((enemy, index) => {
        if (checkCollision(player, enemy)) {
            player.hp -= 10;
            score += 10;
            createHitEffect(enemy.x, enemy.y);
            enemy.element.remove();
            enemies.splice(index, 1);
        }
    });

    if (player.hp <= 0) {
        // Send score to server
        fetch('/pixeldroid/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: 'score=' + score
        });

        alert('Game Over! Pontuação: ' + score);
        player.hp = 100;
        score = 0;
        enemies.forEach(enemy => enemy.element.remove());
        enemies = [];
    }

    if (Math.random() < 0.02 && enemies.length < 5) {
        createEnemy();
    }

    requestAnimationFrame(gameLoop);
}

// Update keydown event listener
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
        keys[key] = true;
    }
});

// Update keyup event listener
document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) {
        keys[key] = false;
    }
});

// Add restart button functionality
document.addEventListener("DOMContentLoaded", function () {
    let botao = document.getElementById("reloadButton");
    botao.addEventListener("click", function () {
        location.reload();
    });
});

player.x = 300;
player.y = 200;
updatePlayer();
gameLoop();

// Add getCookie function at the end of the file
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