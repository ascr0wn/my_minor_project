/**
 * Advanced Calculator Application
 * Features:
 * - Standard and scientific calculator modes
 * - Memory functions (MC, MR, M+, M-)
 * - Calculation history
 * - Theme toggle (light/dark)
 * - Keyboard support
 */

// DOM Elements
const display = document.getElementById('display');
const expressionDisplay = document.getElementById('expression');
const memoryIndicator = document.getElementById('memory-indicator');
const historyList = document.getElementById('history-list');
const standardMode = document.getElementById('standard-mode');
const scientificMode = document.getElementById('scientific-mode');
const standardButtons = document.querySelector('.standard-buttons');
const scientificButtons = document.querySelector('.scientific-buttons');
const themeSwitch = document.getElementById('theme-switch');
const keyboardInfoBtn = document.getElementById('keyboard-info-btn');
const shortcutsPanel = document.getElementById('shortcuts-panel');
const clearHistoryBtn = document.getElementById('clear-history-btn');

// Calculator State
const calculatorState = {
  currentValue: '0',
  expression: '',
  result: null,
  memory: 0,
  isScientificMode: false,
  waitingForOperand: false,
  lastOperation: null,
  history: []
};

// Initialize the calculator
function initCalculator() {
  // Add event listeners to all buttons
  document.querySelectorAll('button').forEach(button => {
    if (button.dataset.value) {
      // Number buttons
      button.addEventListener('click', () => handleNumberInput(button.dataset.value));
    } else if (button.dataset.action) {
      // Action buttons
      button.addEventListener('click', () => handleAction(button.dataset.action));
    }
    
    // Add animation class on button press
    button.addEventListener('mousedown', () => button.classList.add('pressed'));
    button.addEventListener('mouseup', () => button.classList.remove('pressed'));
    button.addEventListener('mouseleave', () => button.classList.remove('pressed'));
  });
  
  // Mode toggle
  standardMode.addEventListener('click', () => setCalculatorMode(false));
  scientificMode.addEventListener('click', () => setCalculatorMode(true));
  
  // Theme toggle
  themeSwitch.addEventListener('change', toggleTheme);
  
  // Keyboard shortcuts info
  keyboardInfoBtn.addEventListener('click', toggleShortcutsPanel);
  
  // Clear history
  clearHistoryBtn.addEventListener('click', clearHistory);
  
  // Keyboard support
  document.addEventListener('keydown', handleKeyboardInput);
  
  // Load saved state
  loadCalculatorState();
  
  // Initial display update
  updateDisplay();
}

/**
 * Handle number input
 * @param {string} value - The number or decimal point
 */
function handleNumberInput(value) {
  if (calculatorState.waitingForOperand) {
    calculatorState.currentValue = value;
    calculatorState.waitingForOperand = false;
  } else {
    // If current value is 0, replace it unless it's a decimal point
    calculatorState.currentValue = calculatorState.currentValue === '0' && value !== '.' 
      ? value 
      : calculatorState.currentValue + value;
    
    // Prevent multiple decimal points
    if (value === '.' && calculatorState.currentValue.split('.').length > 2) {
      calculatorState.currentValue = calculatorState.currentValue.slice(0, -1);
    }
  }
  
  updateDisplay();
}

/**
 * Handle calculator actions
 * @param {string} action - The action to perform
 */
function handleAction(action) {
  switch (action) {
    case 'clear':
      clearCalculator();
      break;
    case 'backspace':
      handleBackspace();
      break;
    case 'negate':
      negateValue();
      break;
    case 'percent':
      calculatePercent();
      break;
    case 'calculate':
      calculateResult();
      break;
    case 'memory-clear':
      clearMemory();
      break;
    case 'memory-recall':
      recallMemory();
      break;
    case 'memory-add':
      addToMemory();
      break;
    case 'memory-subtract':
      subtractFromMemory();
      break;
    case 'add':
    case 'subtract':
    case 'multiply':
    case 'divide':
      handleOperator(action);
      break;
    case 'square':
      calculateSquare();
      break;
    case 'cube':
      calculateCube();
      break;
    case 'power':
      handleOperator('power');
      break;
    case 'root':
      calculateSquareRoot();
      break;
    case 'sin':
    case 'cos':
    case 'tan':
    case 'log':
    case 'ln':
      calculateFunction(action);
      break;
    case 'factorial':
      calculateFactorial();
      break;
    case 'pi':
      insertConstant(Math.PI);
      break;
    case 'e':
      insertConstant(Math.E);
      break;
    case 'open-parenthesis':
    case 'close-parenthesis':
      handleParenthesis(action);
      break;
    case 'exp':
      handleOperator('exp');
      break;
    case 'mod':
      handleOperator('mod');
      break;
  }
  
  updateDisplay();
  saveCalculatorState();
}

/**
 * Handle keyboard input
 * @param {KeyboardEvent} event - The keyboard event
 */
function handleKeyboardInput(event) {
  // Prevent default behavior for calculator keys
  if (
    /^[0-9+\-*/.%=()]$/.test(event.key) ||
    event.key === 'Enter' ||
    event.key === 'Escape' ||
    event.key === 'Backspace' ||
    event.key === 'Delete'
  ) {
    event.preventDefault();
  }
  
  // Numbers and decimal point
  if (/^[0-9.]$/.test(event.key)) {
    handleNumberInput(event.key);
    animateButton(`[data-value="${event.key}"]`);
  }
  
  // Operators
  switch (event.key) {
    case '+':
      handleAction('add');
      animateButton('[data-action="add"]');
      break;
    case '-':
      handleAction('subtract');
      animateButton('[data-action="subtract"]');
      break;
    case '*':
      handleAction('multiply');
      animateButton('[data-action="multiply"]');
      break;
    case '/':
      handleAction('divide');
      animateButton('[data-action="divide"]');
      break;
    case '%':
      handleAction('percent');
      animateButton('[data-action="percent"]');
      break;
    case '=':
    case 'Enter':
      handleAction('calculate');
      animateButton('[data-action="calculate"]');
      break;
    case 'Escape':
      handleAction('clear');
      animateButton('[data-action="clear"]');
      break;
    case 'Backspace':
      handleAction('backspace');
      animateButton('[data-action="backspace"]');
      break;
    case 'Delete':
      handleAction('clear');
      animateButton('[data-action="clear"]');
      break;
    case '(':
      if (calculatorState.isScientificMode) {
        handleAction('open-parenthesis');
        animateButton('[data-action="open-parenthesis"]');
      }
      break;
    case ')':
      if (calculatorState.isScientificMode) {
        handleAction('close-parenthesis');
        animateButton('[data-action="close-parenthesis"]');
      }
      break;
    case 'm':
      // Toggle calculator mode
      setCalculatorMode(!calculatorState.isScientificMode);
      break;
    case 't':
      // Toggle theme
      themeSwitch.checked = !themeSwitch.checked;
      toggleTheme();
      break;
  }
}

/**
 * Animate button press
 * @param {string} selector - CSS selector for the button
 */
function animateButton(selector) {
  const button = document.querySelector(selector);
  if (button) {
    button.classList.add('pressed');
    setTimeout(() => button.classList.remove('pressed'), 100);
  }
}

/**
 * Clear the calculator
 */
function clearCalculator() {
  calculatorState.currentValue = '0';
  calculatorState.expression = '';
  calculatorState.result = null;
  calculatorState.waitingForOperand = false;
  calculatorState.lastOperation = null;
}

/**
 * Handle backspace
 */
function handleBackspace() {
  if (calculatorState.currentValue.length > 1) {
    calculatorState.currentValue = calculatorState.currentValue.slice(0, -1);
  } else {
    calculatorState.currentValue = '0';
  }
}

/**
 * Negate the current value
 */
function negateValue() {
  if (calculatorState.currentValue !== '0') {
    calculatorState.currentValue = calculatorState.currentValue.startsWith('-') 
      ? calculatorState.currentValue.slice(1) 
      : '-' + calculatorState.currentValue;
  }
}

/**
 * Calculate percentage
 */
function calculatePercent() {
  const value = parseFloat(calculatorState.currentValue);
  calculatorState.currentValue = (value / 100).toString();
}

/**
 * Handle operators (+, -, *, /, etc.)
 * @param {string} operator - The operator
 */
function handleOperator(operator) {
  const operatorSymbols = {
    add: '+',
    subtract: '-',
    multiply: '×',
    divide: '÷',
    power: '^',
    exp: 'E',
    mod: 'mod'
  };
  
  const value = calculatorState.currentValue;
  
  if (calculatorState.expression === '') {
    calculatorState.expression = value + ' ' + operatorSymbols[operator] + ' ';
  } else if (calculatorState.waitingForOperand) {
    // Replace the last operator
    calculatorState.expression = calculatorState.expression.slice(0, -2) + operatorSymbols[operator] + ' ';
  } else {
    calculatorState.expression += value + ' ' + operatorSymbols[operator] + ' ';
  }
  
  calculatorState.waitingForOperand = true;
}

/**
 * Calculate the result
 */
function calculateResult() {
  if (calculatorState.expression === '') {
    return;
  }
  
  let expression = calculatorState.expression;
  
  if (!calculatorState.waitingForOperand) {
    expression += calculatorState.currentValue;
  } else {
    // Remove the trailing operator
    expression = expression.slice(0, -2);
  }
  
  try {
    // Replace symbols with JavaScript operators
    let evalExpression = expression
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\^/g, '**')
      .replace(/mod/g, '%')
      .replace(/E/g, 'e');
    
    // Evaluate the expression
    const result = eval(evalExpression);
    
    // Add to history
    addToHistory(expression, result);
    
    // Update calculator state
    calculatorState.currentValue = result.toString();
    calculatorState.expression = '';
    calculatorState.result = result;
    calculatorState.waitingForOperand = false;
  } catch (error) {
    calculatorState.currentValue = 'Error';
    calculatorState.waitingForOperand = true;
  }
}

/**
 * Calculate square (x²)
 */
function calculateSquare() {
  const value = parseFloat(calculatorState.currentValue);
  const result = value * value;
  
  addToHistory(`${value}²`, result);
  
  calculatorState.currentValue = result.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Calculate cube (x³)
 */
function calculateCube() {
  const value = parseFloat(calculatorState.currentValue);
  const result = value * value * value;
  
  addToHistory(`${value}³`, result);
  
  calculatorState.currentValue = result.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Calculate square root (√x)
 */
function calculateSquareRoot() {
  const value = parseFloat(calculatorState.currentValue);
  
  if (value < 0) {
    calculatorState.currentValue = 'Error';
    return;
  }
  
  const result = Math.sqrt(value);
  
  addToHistory(`√${value}`, result);
  
  calculatorState.currentValue = result.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Calculate trigonometric and logarithmic functions
 * @param {string} func - The function to calculate
 */
function calculateFunction(func) {
  const value = parseFloat(calculatorState.currentValue);
  let result;
  
  switch (func) {
    case 'sin':
      result = Math.sin(value);
      break;
    case 'cos':
      result = Math.cos(value);
      break;
    case 'tan':
      result = Math.tan(value);
      break;
    case 'log':
      result = Math.log10(value);
      break;
    case 'ln':
      result = Math.log(value);
      break;
  }
  
  addToHistory(`${func}(${value})`, result);
  
  calculatorState.currentValue = result.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Calculate factorial
 */
function calculateFactorial() {
  const value = parseInt(calculatorState.currentValue);
  
  if (value < 0 || value > 170) {
    calculatorState.currentValue = 'Error';
    return;
  }
  
  let result = 1;
  for (let i = 2; i <= value; i++) {
    result *= i;
  }
  
  addToHistory(`${value}!`, result);
  
  calculatorState.currentValue = result.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Insert mathematical constant
 * @param {number} constant - The constant value
 */
function insertConstant(constant) {
  calculatorState.currentValue = constant.toString();
  calculatorState.waitingForOperand = false;
}

/**
 * Handle parentheses
 * @param {string} type - open-parenthesis or close-parenthesis
 */
function handleParenthesis(type) {
  if (type === 'open-parenthesis') {
    if (calculatorState.waitingForOperand) {
      calculatorState.expression += '(';
    } else {
      calculatorState.expression += calculatorState.currentValue + ' × (';
      calculatorState.waitingForOperand = true;
    }
  } else {
    if (calculatorState.waitingForOperand) {
      calculatorState.expression = calculatorState.expression.slice(0, -2) + ')';
    } else {
      calculatorState.expression += calculatorState.currentValue + ')';
      calculatorState.waitingForOperand = true;
    }
  }
}

/**
 * Memory functions
 */
function clearMemory() {
  calculatorState.memory = 0;
  updateMemoryDisplay();
}

function recallMemory() {
  calculatorState.currentValue = calculatorState.memory.toString();
  calculatorState.waitingForOperand = false;
  updateDisplay();
}

function addToMemory() {
  calculatorState.memory += parseFloat(calculatorState.currentValue);
  updateMemoryDisplay();
  calculatorState.waitingForOperand = true;
}

function subtractFromMemory() {
  calculatorState.memory -= parseFloat(calculatorState.currentValue);
  updateMemoryDisplay();
  calculatorState.waitingForOperand = true;
}

/**
 * Update memory display
 */
function updateMemoryDisplay() {
  memoryIndicator.textContent = `M: ${calculatorState.memory}`;
}

/**
 * Add calculation to history
 * @param {string} expression - The expression
 * @param {number} result - The result
 */
function addToHistory(expression, result) {
  // Create history item
  const historyItem = {
    expression,
    result,
    timestamp: new Date().toISOString()
  };
  
  // Add to history array
  calculatorState.history.unshift(historyItem);
  
  // Limit history to 10 items
  if (calculatorState.history.length > 10) {
    calculatorState.history.pop();
  }
  
  // Update history display
  updateHistoryDisplay();
}

/**
 * Update history display
 */
function updateHistoryDisplay() {
  // Clear history list
  historyList.innerHTML = '';
  
  if (calculatorState.history.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-history';
    emptyMessage.textContent = 'No calculations yet';
    historyList.appendChild(emptyMessage);
    return;
  }
  
  // Add history items
  calculatorState.history.forEach(item => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-expression">${item.expression}</div>
      <div class="history-result">${item.result}</div>
    `;
    
    // Add click event to recall this calculation
    historyItem.addEventListener('click', () => {
      calculatorState.currentValue = item.result.toString();
      updateDisplay();
    });
    
    historyList.appendChild(historyItem);
  });
}

/**
 * Clear history
 */
function clearHistory() {
  calculatorState.history = [];
  updateHistoryDisplay();
  saveCalculatorState();
}

/**
 * Set calculator mode (standard or scientific)
 * @param {boolean} isScientific - Whether to use scientific mode
 */
function setCalculatorMode(isScientific) {
  calculatorState.isScientificMode = isScientific;
  
  // Update UI
  standardMode.classList.toggle('active', !isScientific);
  scientificMode.classList.toggle('active', isScientific);
  standardMode.setAttribute('aria-pressed', !isScientific);
  scientificMode.setAttribute('aria-pressed', isScientific);
  
  // Show/hide scientific buttons
  standardButtons.style.display = 'grid';
  scientificButtons.style.display = isScientific ? 'grid' : 'none';
  
  saveCalculatorState();
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
 * Toggle shortcuts panel
 */
function toggleShortcutsPanel() {
  shortcutsPanel.classList.toggle('show');
}

/**
 * Update the display
 */
function updateDisplay() {
  display.textContent = calculatorState.currentValue;
  expressionDisplay.textContent = calculatorState.expression;
}

/**
 * Save calculator state to localStorage
 */
function saveCalculatorState() {
  const state = {
    memory: calculatorState.memory,
    isScientificMode: calculatorState.isScientificMode,
    history: calculatorState.history
  };
  
  localStorage.setItem('calculatorState', JSON.stringify(state));
}

/**
 * Load calculator state from localStorage
 */
function loadCalculatorState() {
  const savedState = localStorage.getItem('calculatorState');
  
  if (savedState) {
    const state = JSON.parse(savedState);
    
    calculatorState.memory = state.memory || 0;
    calculatorState.isScientificMode = state.isScientificMode || false;
    calculatorState.history = state.history || [];
    
    // Update UI based on loaded state
    setCalculatorMode(calculatorState.isScientificMode);
    updateMemoryDisplay();
    updateHistoryDisplay();
  }
  
  // Load theme preference
  const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
  themeSwitch.checked = isDarkTheme;
  document.body.classList.toggle('dark-theme', isDarkTheme);
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', initCalculator);