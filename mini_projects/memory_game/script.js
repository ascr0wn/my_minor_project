/**
 * Advanced Memory Game
 * Features:
 * - Multiple difficulty levels (easy, medium, hard)
 * - Different card themes (emoji, animals, food)
 * - Timer and move counter
 * - Scoring system
 * - Sound effects
 * - Leaderboard with localStorage persistence
 * - Theme toggle (light/dark)
 */

// DOM Elements
const gameMenu = document.getElementById('game-menu');
const gameBoard = document.getElementById('game-board');
const gameOver = document.getElementById('game-over');
const leaderboardSection = document.getElementById('leaderboard');
const gameGrid = document.getElementById('game-grid');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const themeButtons = document.querySelectorAll('.theme-btn');
const viewLeaderboardBtn = document.querySelector('.view-leaderboard-btn');
const soundSwitch = document.getElementById('sound-switch');
const difficultyDisplay = document.getElementById('difficulty-display');
const timerDisplay = document.getElementById('timer');
const movesDisplay = document.getElementById('moves');
const restartBtn = document.getElementById('restart-btn');
const newGameBtn = document.getElementById('new-game-btn');
const pauseBtn = document.getElementById('pause-btn');
const resultTimeDisplay = document.getElementById('result-time');
const resultMovesDisplay = document.getElementById('result-moves');
const resultScoreDisplay = document.getElementById('result-score');
const playerNameInput = document.getElementById('player-name');
const saveScoreBtn = document.getElementById('save-score-btn');
const playAgainBtn = document.getElementById('play-again-btn');
const leaderboardBody = document.getElementById('leaderboard-body');
const filterButtons = document.querySelectorAll('.filter-btn');
const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
const pauseModal = document.getElementById('pause-modal');
const resumeBtn = document.getElementById('resume-btn');
const themeSwitch = document.getElementById('theme-switch');

// Audio Elements
const flipSound = document.getElementById('flip-sound');
const matchSound = document.getElementById('match-sound');
const successSound = document.getElementById('success-sound');
const errorSound = document.getElementById('error-sound');

// Game State
const gameState = {
  difficulty: 'medium',
  cardTheme: 'emoji',
  soundEnabled: true,
  cards: [],
  flippedCards: [],
  matchedPairs: 0,
  totalPairs: 0,
  moves: 0,
  startTime: null,
  timerInterval: null,
  gameActive: false,
  isPaused: false,
  elapsedTime: 0,
  score: 0
};

// Card Themes
const cardThemes = {
  emoji: ['😀', '😎', '🚀', '🌈', '🍕', '🎮', '🎵', '🎨', '🏆', '🌟', '🍦', '🎁', '🐱', '🐶', '🦄'],
  animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁', '🐯', '🐮', '🐷', '🐸', '🐵'],
  food: ['🍎', '🍌', '🍓', '🍕', '🍔', '🍦', '🍩', '🍪', '🍫', '🍿', '🥤', '🍉', '🍇', '🍒', '🥑']
};

// Difficulty Settings
const difficultySettings = {
  easy: { rows: 3, cols: 4, pairs: 6 },
  medium: { rows: 4, cols: 4, pairs: 8 },
  hard: { rows: 6, cols: 5, pairs: 15 }
};

// Initialize the game
function initGame() {
  // Set up event listeners
  setupEventListeners();
  
  // Load theme preference
  loadThemePreference();
  
  // Show the game menu initially
  showGameMenu();
}

// Set up event listeners
function setupEventListeners() {
  // Difficulty buttons
  difficultyButtons.forEach(button => {
    button.addEventListener('click', () => {
      gameState.difficulty = button.dataset.difficulty;
      startGame();
    });
  });
  
  // Theme buttons
  themeButtons.forEach(button => {
    button.addEventListener('click', () => {
      setCardTheme(button.dataset.theme);
    });
  });
  
  // Sound toggle
  soundSwitch.addEventListener('change', () => {
    gameState.soundEnabled = soundSwitch.checked;
  });
  
  // View leaderboard button
  viewLeaderboardBtn.addEventListener('click', showLeaderboard);
  
  // Game control buttons
  restartBtn.addEventListener('click', restartGame);
  newGameBtn.addEventListener('click', showGameMenu);
  pauseBtn.addEventListener('click', pauseGame);
  
  // Game over buttons
  saveScoreBtn.addEventListener('click', saveScore);
  playAgainBtn.addEventListener('click', () => {
    gameOver.style.display = 'none';
    showGameMenu();
  });
  
  // Leaderboard filter buttons
  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      filterLeaderboard(filter);
      
      // Update active class
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
    });
  });
  
  // Close leaderboard button
  closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardSection.style.display = 'none';
    
    if (gameState.gameActive) {
      gameBoard.style.display = 'block';
    } else {
      gameMenu.style.display = 'block';
    }
  });
  
  // Resume button
  resumeBtn.addEventListener('click', resumeGame);
  
  // Theme toggle
  themeSwitch.addEventListener('change', toggleTheme);
}

/**
 * Show the game menu
 */
function showGameMenu() {
  gameState.gameActive = false;
  stopTimer();
  
  gameMenu.style.display = 'block';
  gameBoard.style.display = 'none';
  gameOver.style.display = 'none';
  leaderboardSection.style.display = 'none';
}

/**
 * Set the card theme
 * @param {string} theme - The theme name
 */
function setCardTheme(theme) {
  gameState.cardTheme = theme;
  
  // Update active class
  themeButtons.forEach(button => {
    button.classList.toggle('active', button.dataset.theme === theme);
  });
}

/**
 * Start the game
 */
function startGame() {
  // Reset game state
  gameState.flippedCards = [];
  gameState.matchedPairs = 0;
  gameState.moves = 0;
  gameState.gameActive = true;
  gameState.isPaused = false;
  gameState.elapsedTime = 0;
  
  // Get difficulty settings
  const { rows, cols, pairs } = difficultySettings[gameState.difficulty];
  gameState.totalPairs = pairs;
  
  // Update UI
  difficultyDisplay.textContent = gameState.difficulty.charAt(0).toUpperCase() + gameState.difficulty.slice(1);
  movesDisplay.textContent = '0 Moves';
  timerDisplay.textContent = '00:00';
  
  // Create cards
  createCards();
  
  // Show game board
  gameMenu.style.display = 'none';
  gameBoard.style.display = 'block';
  gameOver.style.display = 'none';
  
  // Start timer
  startTimer();
}

/**
 * Create cards for the game
 */
function createCards() {
  // Clear the grid
  gameGrid.innerHTML = '';
  
  // Set grid class based on difficulty
  gameGrid.className = `grid ${gameState.difficulty}`;
  
  // Get difficulty settings
  const { rows, cols, pairs } = difficultySettings[gameState.difficulty];
  
  // Get theme symbols
  const themeSymbols = cardThemes[gameState.cardTheme].slice(0, pairs);
  
  // Create pairs
  const cardPairs = [...themeSymbols, ...themeSymbols];
  
  // Shuffle cards
  shuffleArray(cardPairs);
  
  // Create card elements
  gameState.cards = cardPairs.map((symbol, index) => {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.index = index;
    card.dataset.symbol = symbol;
    
    // Create card front and back
    const cardFront = document.createElement('div');
    cardFront.className = 'card-front';
    cardFront.textContent = symbol;
    
    const cardBack = document.createElement('div');
    cardBack.className = 'card-back';
    cardBack.innerHTML = '<i class="fas fa-question"></i>';
    
    card.appendChild(cardFront);
    card.appendChild(cardBack);
    
    // Add click event
    card.addEventListener('click', () => flipCard(card));
    
    gameGrid.appendChild(card);
    return card;
  });
  
  // Add animation delay to cards
  gameState.cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 50}ms`;
  });
}

/**
 * Flip a card
 * @param {HTMLElement} card - The card element
 */
function flipCard(card) {
  // Ignore if game is not active or paused
  if (!gameState.gameActive || gameState.isPaused) return;
  
  // Ignore if card is already flipped or matched
  if (card.classList.contains('flipped') || card.classList.contains('matched')) return;
  
  // Ignore if two cards are already flipped
  if (gameState.flippedCards.length === 2) return;
  
  // Flip the card
  card.classList.add('flipped');
  
  // Play flip sound
  playSound(flipSound);
  
  // Add to flipped cards
  gameState.flippedCards.push(card);
  
  // Check for match if two cards are flipped
  if (gameState.flippedCards.length === 2) {
    // Increment moves
    gameState.moves++;
    movesDisplay.textContent = `${gameState.moves} ${gameState.moves === 1 ? 'Move' : 'Moves'}`;
    
    // Check for match
    checkForMatch();
  }
}

/**
 * Check if the flipped cards match
 */
function checkForMatch() {
  const [card1, card2] = gameState.flippedCards;
  
  if (card1.dataset.symbol === card2.dataset.symbol) {
    // Match found
    setTimeout(() => {
      card1.classList.add('matched');
      card2.classList.add('matched');
      
      // Play match sound
      playSound(matchSound);
      
      // Clear flipped cards
      gameState.flippedCards = [];
      
      // Increment matched pairs
      gameState.matchedPairs++;
      
      // Check if game is complete
      if (gameState.matchedPairs === gameState.totalPairs) {
        endGame();
      }
    }, 500);
  } else {
    // No match
    setTimeout(() => {
      card1.classList.remove('flipped');
      card2.classList.remove('flipped');
      
      // Play error sound
      playSound(errorSound);
      
      // Clear flipped cards
      gameState.flippedCards = [];
    }, 1000);
  }
}

/**
 * End the game
 */
function endGame() {
  // Stop the timer
  stopTimer();
  
  // Play success sound
  playSound(successSound);
  
  // Calculate score
  calculateScore();
  
  // Update result display
  resultTimeDisplay.textContent = formatTime(gameState.elapsedTime);
  resultMovesDisplay.textContent = gameState.moves;
  resultScoreDisplay.textContent = gameState.score;
  
  // Show game over screen
  setTimeout(() => {
    gameBoard.style.display = 'none';
    gameOver.style.display = 'block';
    
    // Focus on name input
    playerNameInput.focus();
  }, 1000);
}

/**
 * Calculate the score
 */
function calculateScore() {
  // Base score depends on difficulty
  let baseScore = 0;
  switch (gameState.difficulty) {
    case 'easy':
      baseScore = 500;
      break;
    case 'medium':
      baseScore = 1000;
      break;
    case 'hard':
      baseScore = 2000;
      break;
  }
  
  // Time bonus (faster = better)
  const timeBonus = Math.max(0, 300 - Math.floor(gameState.elapsedTime / 10));
  
  // Moves penalty (fewer = better)
  const movesMinimum = gameState.totalPairs * 2; // Perfect play
  const movesPenalty = Math.max(0, gameState.moves - movesMinimum) * 10;
  
  // Calculate final score
  gameState.score = Math.max(0, baseScore + timeBonus - movesPenalty);
}

/**
 * Save the score to the leaderboard
 */
function saveScore() {
  const playerName = playerNameInput.value.trim() || 'Anonymous';
  
  // Create score object
  const scoreEntry = {
    name: playerName,
    difficulty: gameState.difficulty,
    score: gameState.score,
    time: gameState.elapsedTime,
    moves: gameState.moves,
    date: new Date().toISOString()
  };
  
  // Get existing leaderboard
  let leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard')) || [];
  
  // Add new score
  leaderboard.push(scoreEntry);
  
  // Sort by score (highest first)
  leaderboard.sort((a, b) => b.score - a.score);
  
  // Limit to top 100 scores
  leaderboard = leaderboard.slice(0, 100);
  
  // Save to localStorage
  localStorage.setItem('memoryGameLeaderboard', JSON.stringify(leaderboard));
  
  // Show leaderboard
  showLeaderboard();
}

/**
 * Show the leaderboard
 */
function showLeaderboard() {
  // Hide other screens
  gameMenu.style.display = 'none';
  gameBoard.style.display = 'none';
  gameOver.style.display = 'none';
  leaderboardSection.style.display = 'block';
  
  // Load leaderboard data
  loadLeaderboard();
}

/**
 * Load the leaderboard data
 */
function loadLeaderboard() {
  // Get leaderboard data
  const leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard')) || [];
  
  // Get active filter
  const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
  
  // Filter leaderboard
  filterLeaderboard(activeFilter);
}

/**
 * Filter the leaderboard
 * @param {string} filter - The filter to apply
 */
function filterLeaderboard(filter) {
  // Get leaderboard data
  const leaderboard = JSON.parse(localStorage.getItem('memoryGameLeaderboard')) || [];
  
  // Filter data
  let filteredData = leaderboard;
  if (filter !== 'all') {
    filteredData = leaderboard.filter(entry => entry.difficulty === filter);
  }
  
  // Clear leaderboard
  leaderboardBody.innerHTML = '';
  
  // Add entries
  if (filteredData.length === 0) {
    const emptyRow = document.createElement('tr');
    emptyRow.innerHTML = '<td colspan="7" style="text-align: center;">No scores yet</td>';
    leaderboardBody.appendChild(emptyRow);
  } else {
    filteredData.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Format date
      const date = new Date(entry.date);
      const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.name}</td>
        <td>${entry.difficulty.charAt(0).toUpperCase() + entry.difficulty.slice(1)}</td>
        <td>${entry.score}</td>
        <td>${formatTime(entry.time)}</td>
        <td>${entry.moves}</td>
        <td>${formattedDate}</td>
      `;
      
      leaderboardBody.appendChild(row);
    });
  }
}

/**
 * Restart the game
 */
function restartGame() {
  stopTimer();
  startGame();
}

/**
 * Pause the game
 */
function pauseGame() {
  if (!gameState.gameActive || gameState.isPaused) return;
  
  gameState.isPaused = true;
  stopTimer();
  
  // Show pause modal
  pauseModal.classList.add('show');
}

/**
 * Resume the game
 */
function resumeGame() {
  if (!gameState.gameActive || !gameState.isPaused) return;
  
  gameState.isPaused = false;
  startTimer();
  
  // Hide pause modal
  pauseModal.classList.remove('show');
}

/**
 * Start the timer
 */
function startTimer() {
  gameState.startTime = Date.now() - gameState.elapsedTime;
  
  gameState.timerInterval = setInterval(() => {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    timerDisplay.textContent = formatTime(gameState.elapsedTime);
  }, 1000);
}

/**
 * Stop the timer
 */
function stopTimer() {
  clearInterval(gameState.timerInterval);
}

/**
 * Format time in milliseconds to MM:SS
 * @param {number} time - Time in milliseconds
 * @returns {string} Formatted time
 */
function formatTime(time) {
  const totalSeconds = Math.floor(time / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Play a sound effect
 * @param {HTMLAudioElement} sound - The sound element to play
 */
function playSound(sound) {
  if (!gameState.soundEnabled) return;
  
  // Reset sound to beginning
  sound.currentTime = 0;
  sound.play().catch(error => {
    console.error('Error playing sound:', error);
  });
}

/**
 * Shuffle an array (Fisher-Yates algorithm)
 * @param {Array} array - The array to shuffle
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
  const isDarkTheme = themeSwitch.checked;
  document.body.classList.toggle('dark-theme', isDarkTheme);
  localStorage.setItem('darkTheme', isDarkTheme);
}

/**
 * Load theme preference from localStorage
 */
function loadThemePreference() {
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  themeSwitch.checked = isDarkTheme;
  document.body.classList.toggle('dark-theme', isDarkTheme);
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);