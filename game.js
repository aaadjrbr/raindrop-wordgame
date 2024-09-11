const gameArea = document.getElementById('gameArea');
const collectedLetters = document.getElementById('collectedLetters');
const selectedLetters = document.getElementById('selectedLetters');
const timerDisplay = document.getElementById('timer');
const startButton = document.getElementById('startButton');
const pauseButton = document.getElementById('pauseButton');
const restartButton = document.getElementById('restartButton');
const difficultySelect = document.getElementById('difficulty');
const stormMessage = document.createElement('div');
stormMessage.classList.add('stormMessage');
stormMessage.innerHTML = 'A storm is coming!';
gameArea.appendChild(stormMessage);

const superpowerMessage = document.createElement('div');
superpowerMessage.id = 'superpowerMessage';
gameArea.appendChild(superpowerMessage);

let drops = [];
let timer;
let timeLeft = 60;
let userWord = '';
let wordsCreated = [];
let currentSpeed = 4000;  // Adjusted speed for slower falling letters
let points = 0;
let stormActive = false;
let gamePaused = false;
let dropInterval;

const validWords = [
    'APPLE', 'BALL', 'CAT', 'DOG', 'ELEPHANT', 'HOUSE', 'TREE', 'WATER', 'SUN', 'MOON',
    'BANANA', 'GRAPE', 'ORANGE', 'CAR', 'TRAIN', 'BICYCLE', 'SHIP', 'PLANE', 'CHAIR',
    'TABLE', 'COMPUTER', 'MOUSE', 'KEYBOARD', 'PHONE', 'CUP', 'PLATE', 'BOOK', 'PENCIL',
    'PAPER', 'FISH', 'BIRD', 'HORSE', 'MONKEY', 'ZEBRA', 'LION', 'TIGER', 'BEAR', 'SNAKE',
    'GIRAFFE', 'SHARK', 'COW', 'SHEEP', 'GOAT', 'PIG', 'ROOSTER', 'DUCK', 'GOOSE', 'ANT',
    'BUTTERFLY', 'SPIDER', 'FROG', 'BAT', 'RABBIT', 'CAMEL', 'OCEAN', 'RIVER', 'MOUNTAIN',
    'DESERT', 'FOREST', 'ISLAND', 'VALLEY', 'CLOUD', 'RAIN', 'SNOW', 'STORM', 'WIND',
    'FIRE', 'WOOD', 'STONE', 'METAL', 'GLASS', 'PLASTIC', 'GOLD', 'SILVER', 'IRON', 'COTTON',
    'SILK', 'WOOL', 'LEATHER', 'BRICK', 'SAND', 'CLAY', 'POTATO', 'CARROT', 'TOMATO',
    'LETTUCE', 'CABBAGE', 'CUCUMBER', 'ONION', 'GARLIC', 'PEPPER', 'CHEESE', 'BREAD',
    'BUTTER', 'MILK', 'EGG', 'CHICKEN', 'BEEF', 'PORK', 'FISH', 'SUGAR', 'SALT', 'PEPPER',
    'CHOCOLATE', 'CAKE', 'PIE', 'COOKIE', 'ICECREAM', 'JUICE', 'COFFEE', 'TEA', 'WINE',
    'BEER', 'PIZZA', 'BURGER', 'SANDWICH', 'PASTA', 'RICE', 'NOODLE', 'SOUP', 'SALAD'
];

// Word formation message
const wordMessage = document.createElement('div');
wordMessage.id = 'wordMessage';
wordMessage.style.position = 'absolute';
wordMessage.style.top = '50%';
wordMessage.style.left = '50%';
wordMessage.style.transform = 'translate(-50%, -50%)';
wordMessage.style.padding = '20px';
wordMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
wordMessage.style.color = 'white';
wordMessage.style.fontSize = '24px';
wordMessage.style.display = 'none'; // Initially hidden
gameArea.appendChild(wordMessage);

startButton.addEventListener('click', startGame);
pauseButton.addEventListener('click', togglePause);
restartButton.addEventListener('click', restartGame);

function startGame() {
    document.getElementById('controls').style.display = 'none';  // Hide start controls
    pauseButton.style.display = 'block';  // Show pause button

    const difficulty = difficultySelect.value;
    switch (difficulty) {
        case 'easy':
            currentSpeed = 4000;
            break;
        case 'medium':
            currentSpeed = 3000;
            break;
        case 'hard':
            currentSpeed = 2000;
            break;
    }
    
    timeLeft = 60;
    timerDisplay.innerHTML = `${timeLeft}s`;
    userWord = '';
    wordsCreated = [];
    drops = [];

    createDrops();
    startTimer();
    stormInterval();
}

function startTimer() {
    timer = setInterval(() => {
        if (gamePaused) return;
        timeLeft--;
        timerDisplay.innerHTML = `${timeLeft}s`;

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function createDrops() {
    dropInterval = setInterval(() => {
        if (timeLeft <= 0 || gamePaused) {
            clearInterval(dropInterval);
            return;
        }

        let dropCount = Math.floor(Math.random() * 4) + 2;  // Create between 2 to 5 drops at a time
        for (let i = 0; i < dropCount; i++) {
            createSingleDrop();  // Create each drop
        }

    }, currentSpeed / 2);  // Reduce the interval time for faster drop generation
}

function createSingleDrop() {
    let drop = document.createElement('div');
    drop.classList.add('drop');
    drop.innerText = String.fromCharCode(65 + Math.floor(Math.random() * 26));  // Random letter A-Z
    drop.style.left = `${Math.random() * (gameArea.clientWidth - 50)}px`;

    // Randomly assign a power-up (5% chance)
    const isPowerUp = Math.random() < 0.05;
    if (isPowerUp) {
        assignPowerUp(drop);
    }

    drop.style.animationDuration = `${currentSpeed / 1000}s`;  // Adjust fall speed
    gameArea.appendChild(drop);
    drops.push(drop);

    drop.addEventListener('animationend', () => {
        accumulateAtBottom(drop);
    });
}

function assignPowerUp(drop) {
    const powerUpType = Math.random();
    
    if (powerUpType < 0.33) {
        drop.classList.add('red');  // Red bubble: Disable clicks for 3 seconds
        drop.dataset.power = 'disableClick';
    } else if (powerUpType < 0.66) {
        drop.classList.add('green');  // Green bubble: Extra points
        drop.dataset.power = 'extraPoints';
    } else {
        drop.classList.add('blue');  // Blue bubble: Speed up drops
        drop.dataset.power = 'speedUp';
    }

    // Add hover effect to indicate it’s a power-up
    drop.style.border = '2px solid white';
}

function accumulateAtBottom(drop) {
    drop.style.position = 'static'; // Reset the positioning so it flows into the container
    drop.style.animation = 'none';  // Stop the animation

    collectedLetters.appendChild(drop);

    // Add click listener for the drops
    drop.addEventListener('click', () => {
        moveToSelected(drop);
    });

    checkForWall();  // After accumulating, check if a wall is forming
}

function moveToSelected(drop) {
    // Check if the drop is a power-up
    if (drop.dataset.power) {
        activatePowerUp(drop);
        return;
    }

    let letter = document.createElement('span');
    letter.classList.add('letter');
    letter.innerText = drop.innerText;
    selectedLetters.appendChild(letter);

    if (collectedLetters.contains(drop)) {
        collectedLetters.removeChild(drop);
    }

    letter.addEventListener('click', () => {
        selectedLetters.removeChild(letter);  // Remove from selected letters
    });

    // Check if the formed word is valid
    checkWordFormed();
}

function checkWordFormed() {
    // Form the word from selected letters
    const formedWord = Array.from(selectedLetters.querySelectorAll('span')).map(letter => letter.innerText).join('');

    // Check if the word is valid
    if (validWords.includes(formedWord)) {
        // Display success message
        wordMessage.innerText = `A word formed! Good job! You formed: ${formedWord}`;
        wordMessage.style.display = 'block';

        setTimeout(() => {
            wordMessage.style.display = 'none';  // Hide after 2 seconds
        }, 2000);

        // Clear selected letters after forming a word
        selectedLetters.innerHTML = '';
    }
}

function activatePowerUp(drop) {
    if (drop.dataset.power === 'disableClick') {
        disableClicks();
        showSuperpowerMessage('Red bubble clicked! Clicking disabled for 3 seconds.');
    } else if (drop.dataset.power === 'extraPoints') {
        points += 10;  // Add 10 extra points
        showSuperpowerMessage('Green bubble clicked! You gained 10 extra points.');
    } else if (drop.dataset.power === 'speedUp') {
        currentSpeed = Math.max(1000, currentSpeed - 500);  // Speed up drops (minimum speed of 1s)
        showSuperpowerMessage('Blue bubble clicked! Letters are now falling faster.');
    }

    if (collectedLetters.contains(drop)) {
        collectedLetters.removeChild(drop);
    }
}

function disableClicks() {
    gamePaused = true;
    setTimeout(() => {
        gamePaused = false;
    }, 3000);  // Disable clicks for 3 seconds
}

function checkForWall() {
    const dropElements = Array.from(collectedLetters.getElementsByClassName('drop'));

    if (dropElements.length >= 20) {  // If 20 drops have stacked up
        clearWall();
    }
}

function clearWall() {
    while (collectedLetters.firstChild) {
        collectedLetters.removeChild(collectedLetters.firstChild);  // Remove all letters
    }
}

function showSuperpowerMessage(message) {
    superpowerMessage.innerText = message;
    superpowerMessage.style.display = 'block';
    setTimeout(() => {
        superpowerMessage.style.display = 'none';
    }, 2000);  // Hide after 2 seconds
}

function endGame() {
    clearInterval(stormInterval);  // Stop the storm when the game ends
    gameArea.innerHTML = '';  // Clear game area
    timerDisplay.innerHTML = 'Time\'s Up!';
    pauseButton.style.display = 'none';
    restartButton.style.display = 'block';
    displayResults();  // Show results at the end
}

function displayResults() {
    alert(`Game Over! You formed ${wordsCreated.length} words and scored a total of ${points} points.`);
}

function togglePause() {
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        // Pause game logic
        pauseButton.innerText = 'Resume';
        
        // Stop drop creation
        clearInterval(dropInterval);

        // Pause all ongoing drop animations
        document.querySelectorAll('.drop').forEach(drop => {
            drop.style.animationPlayState = 'paused';
        });
    } else {
        // Resume game logic
        pauseButton.innerText = 'Pause';
        
        // Resume drop creation
        createDrops();

        // Resume drop animations
        document.querySelectorAll('.drop').forEach(drop => {
            drop.style.animationPlayState = 'running';
        });
    }
}

function restartGame() {
    location.reload();  // Simple reload to restart game
}

function checkWordFormed() {
    // Form the word from selected letters
    const formedWord = Array.from(selectedLetters.querySelectorAll('span')).map(letter => letter.innerText).join('');

    // Check if the word is valid
    if (validWords.includes(formedWord)) {
        // Display success message
        wordMessage.innerText = `A word formed! Good job! You formed: ${formedWord}`;
        wordMessage.style.display = 'block';

        setTimeout(() => {
            wordMessage.style.display = 'none';  // Hide after 2 seconds
        }, 2000);

        // Award points based on word length or complexity
        if (formedWord.length <= 4) {
            points += 5;  // Easy words
        } else if (formedWord.length <= 6) {
            points += 10;  // Medium words
        } else {
            points += 15;  // Hard words
        }

        // Add the word to wordsCreated list
        wordsCreated.push(formedWord);

        // Clear selected letters after forming a word
        selectedLetters.innerHTML = '';
    }
}

function stormInterval() {
    const stormInterval = setInterval(() => {
        if (stormActive || gamePaused || timeLeft <= 0) return;  // Stop storm when time is up

        stormMessage.style.display = 'block';  // Show storm message
        setTimeout(() => {
            stormMessage.style.display = 'none';
        }, 1000);

        stormActive = true;
        document.body.classList.add('stormEffect');
        
        let lightningCount = 10;  // Number of lightning bolts to drop
        for (let i = 0; i < lightningCount; i++) {
            let lightning = document.createElement('div');
            lightning.classList.add('lightning');
            lightning.style.left = `${Math.random() * gameArea.clientWidth}px`;
            lightning.style.top = `${Math.random() * gameArea.clientHeight}px`;  // Spread across the screen
            gameArea.appendChild(lightning);
        }

        setTimeout(() => {
            document.body.classList.remove('stormEffect');
            const lightnings = document.querySelectorAll('.lightning');
            lightnings.forEach(lightning => gameArea.removeChild(lightning));
            stormActive = false;
        }, 5000);  // Storm lasts for 5 seconds

    }, 10000);  // Storm every 10 seconds
}
