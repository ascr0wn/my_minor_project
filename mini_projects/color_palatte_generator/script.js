/**
 * Advanced Color Palette Generator
 * Features:
 * - Multiple palette generation modes (random, complementary, analogous, triadic, monochromatic)
 * - Color adjustment with HSL sliders
 * - Save and load palettes
 * - Export options (CSS, JSON, URL, Image)
 * - Theme toggle (light/dark)
 * - Color locking
 */

// DOM Elements
const paletteContainer = document.getElementById('palette');
const generateBtn = document.getElementById('generate-btn');
const lockAllBtn = document.getElementById('lock-all-btn');
const savePaletteBtn = document.getElementById('save-palette-btn');
const modeButtons = document.querySelectorAll('.mode-btn');
const decreaseCountBtn = document.getElementById('decrease-count');
const increaseCountBtn = document.getElementById('increase-count');
const colorCountDisplay = document.getElementById('color-count');
const selectedColorEl = document.getElementById('selected-color');
const hexValueEl = document.getElementById('hex-value');
const rgbValueEl = document.getElementById('rgb-value');
const hslValueEl = document.getElementById('hsl-value');
const hueSlider = document.getElementById('hue-slider');
const saturationSlider = document.getElementById('saturation-slider');
const lightnessSlider = document.getElementById('lightness-slider');
const applyAdjustmentBtn = document.getElementById('apply-adjustment');
const exportCssBtn = document.getElementById('export-css');
const exportJsonBtn = document.getElementById('export-json');
const exportUrlBtn = document.getElementById('export-url');
const exportImageBtn = document.getElementById('export-image');
const exportModal = document.getElementById('export-modal');
const exportTitle = document.getElementById('export-title');
const exportData = document.getElementById('export-data');
const copyExportBtn = document.getElementById('copy-export');
const closeModalBtn = document.querySelector('.close-modal');
const savedList = document.getElementById('saved-list');
const clearSavedBtn = document.getElementById('clear-saved');
const themeSwitch = document.getElementById('theme-switch');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const exportCanvas = document.getElementById('export-canvas');

// App State
const state = {
  colors: [],
  colorCount: 5,
  generationMode: 'random',
  selectedColorIndex: null,
  lockedColors: {},
  savedPalettes: [],
  allColorsLocked: false
};

// Initialize the app
function initApp() {
  // Load saved palettes from localStorage
  loadSavedPalettes();

  // Load theme preference
  loadThemePreference();

  // Generate initial palette
  generatePalette();

  // Add event listeners
  setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
  // Generate button
  generateBtn.addEventListener('click', generatePalette);

  // Lock all button
  lockAllBtn.addEventListener('click', toggleLockAll);

  // Save palette button
  savePaletteBtn.addEventListener('click', savePalette);

  // Mode buttons
  modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      setGenerationMode(btn.dataset.mode);
    });
  });

  // Color count controls
  decreaseCountBtn.addEventListener('click', decreaseColorCount);
  increaseCountBtn.addEventListener('click', increaseColorCount);

  // Color adjustment
  hueSlider.addEventListener('input', updateColorPreview);
  saturationSlider.addEventListener('input', updateColorPreview);
  lightnessSlider.addEventListener('input', updateColorPreview);
  applyAdjustmentBtn.addEventListener('click', applyColorAdjustment);

  // Export buttons
  exportCssBtn.addEventListener('click', () => exportPalette('css'));
  exportJsonBtn.addEventListener('click', () => exportPalette('json'));
  exportUrlBtn.addEventListener('click', () => exportPalette('url'));
  exportImageBtn.addEventListener('click', () => exportPalette('image'));

  // Copy export data
  copyExportBtn.addEventListener('click', copyExportData);

  // Close modal
  closeModalBtn.addEventListener('click', closeModal);
  window.addEventListener('click', (e) => {
    if (e.target === exportModal) {
      closeModal();
    }
  });

  // Clear saved palettes
  clearSavedBtn.addEventListener('click', clearSavedPalettes);

  // Theme toggle
  themeSwitch.addEventListener('change', toggleTheme);

  // Copy color format buttons
  document.querySelectorAll('.copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.target;
      const inputEl = document.getElementById(targetId);
      copyToClipboard(inputEl.value);
    });
  });
}

/**
 * Generate a palette based on the current mode
 */
function generatePalette() {
  // Clear the palette container
  paletteContainer.innerHTML = '';

  // Generate colors based on the selected mode
  switch (state.generationMode) {
    case 'random':
      generateRandomPalette();
      break;
    case 'complementary':
      generateComplementaryPalette();
      break;
    case 'analogous':
      generateAnalogousPalette();
      break;
    case 'triadic':
      generateTriadicPalette();
      break;
    case 'monochromatic':
      generateMonochromaticPalette();
      break;
    default:
      generateRandomPalette();
  }

  // Render the palette
  renderPalette();

  // Update lock all button text
  updateLockAllButton();
}

/**
 * Generate a random color palette
 */
function generateRandomPalette() {
  state.colors = [];

  for (let i = 0; i < state.colorCount; i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      state.colors.push(generateRandomColor());
    }
  }
}

/**
 * Generate a complementary color palette
 */
function generateComplementaryPalette() {
  state.colors = [];

  // Generate a base color or use a locked color
  let baseColor;
  const lockedIndices = Object.keys(state.lockedColors).map(Number);

  if (lockedIndices.length > 0) {
    // Use the first locked color as the base
    baseColor = state.lockedColors[lockedIndices[0]];
  } else {
    // Generate a random base color
    baseColor = generateRandomColor();
  }

  // Convert to HSL for easier manipulation
  const baseHsl = hexToHSL(baseColor);

  // Add the base color
  state.colors.push(baseColor);

  // Add complementary color (opposite on the color wheel)
  const complementaryHue = (baseHsl.h + 180) % 360;
  state.colors.push(hslToHex(complementaryHue, baseHsl.s, baseHsl.l));

  // Fill the rest with variations
  for (let i = 2; i < state.colorCount; i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      // Alternate between base and complementary variations
      const isBaseVariation = i % 2 === 0;
      const hue = isBaseVariation ? baseHsl.h : complementaryHue;
      const saturation = Math.min(100, Math.max(20, baseHsl.s + (Math.random() * 30 - 15)));
      const lightness = Math.min(90, Math.max(10, baseHsl.l + (Math.random() * 30 - 15)));

      state.colors.push(hslToHex(hue, saturation, lightness));
    }
  }
}

/**
 * Generate an analogous color palette (colors adjacent on the color wheel)
 */
function generateAnalogousPalette() {
  state.colors = [];

  // Generate a base color or use a locked color
  let baseColor;
  const lockedIndices = Object.keys(state.lockedColors).map(Number);

  if (lockedIndices.length > 0) {
    // Use the first locked color as the base
    baseColor = state.lockedColors[lockedIndices[0]];
  } else {
    // Generate a random base color
    baseColor = generateRandomColor();
  }

  // Convert to HSL for easier manipulation
  const baseHsl = hexToHSL(baseColor);

  // Calculate the step size based on color count
  const step = 30; // 30 degrees on the color wheel

  for (let i = 0; i < state.colorCount; i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      // Calculate hue offset (centered around the base color)
      const offset = (i - Math.floor(state.colorCount / 2)) * step;
      const hue = (baseHsl.h + offset + 360) % 360;

      state.colors.push(hslToHex(hue, baseHsl.s, baseHsl.l));
    }
  }
}

/**
 * Generate a triadic color palette (three colors equally spaced on the color wheel)
 */
function generateTriadicPalette() {
  state.colors = [];

  // Generate a base color or use a locked color
  let baseColor;
  const lockedIndices = Object.keys(state.lockedColors).map(Number);

  if (lockedIndices.length > 0) {
    // Use the first locked color as the base
    baseColor = state.lockedColors[lockedIndices[0]];
  } else {
    // Generate a random base color
    baseColor = generateRandomColor();
  }

  // Convert to HSL for easier manipulation
  const baseHsl = hexToHSL(baseColor);

  // Calculate the three main triadic colors
  const hues = [
    baseHsl.h,
    (baseHsl.h + 120) % 360,
    (baseHsl.h + 240) % 360
  ];

  // Add the three main colors first
  for (let i = 0; i < Math.min(3, state.colorCount); i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      state.colors.push(hslToHex(hues[i], baseHsl.s, baseHsl.l));
    }
  }

  // Fill the rest with variations
  for (let i = 3; i < state.colorCount; i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      const hueIndex = i % 3;
      const saturation = Math.min(100, Math.max(20, baseHsl.s + (Math.random() * 20 - 10)));
      const lightness = Math.min(90, Math.max(10, baseHsl.l + (Math.random() * 20 - 10)));

      state.colors.push(hslToHex(hues[hueIndex], saturation, lightness));
    }
  }
}

/**
 * Generate a monochromatic color palette (variations of a single hue)
 */
function generateMonochromaticPalette() {
  state.colors = [];

  // Generate a base color or use a locked color
  let baseColor;
  const lockedIndices = Object.keys(state.lockedColors).map(Number);

  if (lockedIndices.length > 0) {
    // Use the first locked color as the base
    baseColor = state.lockedColors[lockedIndices[0]];
  } else {
    // Generate a random base color
    baseColor = generateRandomColor();
  }

  // Convert to HSL for easier manipulation
  const baseHsl = hexToHSL(baseColor);

  // Calculate the step size for lightness
  const lightnessStep = 80 / (state.colorCount - 1 || 1);

  for (let i = 0; i < state.colorCount; i++) {
    if (state.lockedColors[i]) {
      state.colors.push(state.lockedColors[i]);
    } else {
      // Vary the lightness from 10% to 90%
      const lightness = 10 + (i * lightnessStep);

      state.colors.push(hslToHex(baseHsl.h, baseHsl.s, lightness));
    }
  }
}

/**
 * Generate a random hex color
 * @returns {string} Hex color code
 */
function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Render the current palette
 */
function renderPalette() {
  paletteContainer.innerHTML = '';

  state.colors.forEach((color, index) => {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = color;
    colorBox.dataset.index = index;

    // Add color value
    const colorValue = document.createElement('span');
    colorValue.className = 'color-value';
    colorValue.textContent = color.toUpperCase();

    // Add lock button
    const lockBtn = document.createElement('button');
    lockBtn.className = 'color-lock';
    lockBtn.innerHTML = state.lockedColors[index] ? '<i class="fas fa-lock"></i>' : '<i class="fas fa-unlock"></i>';
    lockBtn.setAttribute('aria-label', state.lockedColors[index] ? 'Unlock color' : 'Lock color');

    // Add event listeners
    colorBox.addEventListener('click', () => selectColor(index));
    lockBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleLock(index);
    });

    // Append elements
    colorBox.appendChild(colorValue);
    colorBox.appendChild(lockBtn);
    paletteContainer.appendChild(colorBox);
  });
}

/**
 * Select a color for editing
 * @param {number} index - The index of the selected color
 */
function selectColor(index) {
  state.selectedColorIndex = index;
  const color = state.colors[index];

  // Update selected color display
  selectedColorEl.style.backgroundColor = color;

  // Update color format displays
  hexValueEl.value = color.toUpperCase();
  rgbValueEl.value = hexToRGB(color);

  // Convert to HSL and update sliders
  const hsl = hexToHSL(color);
  hslValueEl.value = `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;

  // Update sliders
  hueSlider.value = hsl.h;
  saturationSlider.value = hsl.s;
  lightnessSlider.value = hsl.l;

  // Update saturation and lightness slider backgrounds
  updateSliderBackgrounds(hsl.h);

  // Add selected class to the color box
  document.querySelectorAll('.color-box').forEach((box, i) => {
    box.classList.toggle('selected', i === index);
  });
}

/**
 * Update the color preview based on slider values
 */
function updateColorPreview() {
  const hue = parseInt(hueSlider.value);
  const saturation = parseInt(saturationSlider.value);
  const lightness = parseInt(lightnessSlider.value);

  // Update slider backgrounds
  updateSliderBackgrounds(hue);

  // Update preview color
  const previewColor = hslToHex(hue, saturation, lightness);
  selectedColorEl.style.backgroundColor = previewColor;

  // Update color format displays
  hexValueEl.value = previewColor.toUpperCase();
  rgbValueEl.value = hexToRGB(previewColor);
  hslValueEl.value = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Update slider backgrounds based on current hue
 * @param {number} hue - The current hue value
 */
function updateSliderBackgrounds(hue) {
  // Update saturation slider background
  saturationSlider.style.background = `linear-gradient(to right, 
    hsl(${hue}, 0%, 50%), 
    hsl(${hue}, 100%, 50%))`;

  // Update lightness slider background
  lightnessSlider.style.background = `linear-gradient(to right, 
    hsl(${hue}, 100%, 0%), 
    hsl(${hue}, 100%, 50%), 
    hsl(${hue}, 100%, 100%))`;
}

/**
 * Apply the color adjustment to the selected color
 */
function applyColorAdjustment() {
  if (state.selectedColorIndex === null) {
    showNotification('Please select a color first', 'warning');
    return;
  }

  const hue = parseInt(hueSlider.value);
  const saturation = parseInt(saturationSlider.value);
  const lightness = parseInt(lightnessSlider.value);

  const newColor = hslToHex(hue, saturation, lightness);
  state.colors[state.selectedColorIndex] = newColor;

  // If the color is locked, update the locked color as well
  if (state.lockedColors[state.selectedColorIndex]) {
    state.lockedColors[state.selectedColorIndex] = newColor;
  }

  // Re-render the palette
  renderPalette();

  // Re-select the color
  selectColor(state.selectedColorIndex);

  showNotification('Color updated', 'success');
}

/**
 * Toggle lock state for a color
 * @param {number} index - The index of the color to toggle
 */
function toggleLock(index) {
  if (state.lockedColors[index]) {
    delete state.lockedColors[index];
  } else {
    state.lockedColors[index] = state.colors[index];
  }

  // Re-render the palette
  renderPalette();

  // Update lock all button
  updateLockAllButton();
}

/**
 * Toggle lock state for all colors
 */
function toggleLockAll() {
  if (state.allColorsLocked) {
    // Unlock all colors
    state.lockedColors = {};
    state.allColorsLocked = false;
  } else {
    // Lock all colors
    state.colors.forEach((color, index) => {
      state.lockedColors[index] = color;
    });
    state.allColorsLocked = true;
  }

  // Re-render the palette
  renderPalette();

  // Update lock all button
  updateLockAllButton();
}

/**
 * Update the lock all button text
 */
function updateLockAllButton() {
  const lockedCount = Object.keys(state.lockedColors).length;
  state.allColorsLocked = lockedCount === state.colorCount;

  lockAllBtn.innerHTML = state.allColorsLocked ? 
    '<i class="fas fa-unlock"></i> Unlock All' : 
    '<i class="fas fa-lock"></i> Lock All';
}

/**
 * Set the generation mode
 * @param {string} mode - The generation mode
 */
function setGenerationMode(mode) {
  state.generationMode = mode;

  // Update active class on mode buttons
  modeButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Generate a new palette
  generatePalette();
}

/**
 * Decrease the color count
 */
function decreaseColorCount() {
  if (state.colorCount > 2) {
    state.colorCount--;
    colorCountDisplay.textContent = state.colorCount;
    generatePalette();
  }
}

/**
 * Increase the color count
 */
function increaseColorCount() {
  if (state.colorCount < 10) {
    state.colorCount++;
    colorCountDisplay.textContent = state.colorCount;
    generatePalette();
  }
}

/**
 * Save the current palette
 */
function savePalette() {
  const palette = {
    id: Date.now(),
    colors: [...state.colors],
    date: new Date().toISOString()
  };

  state.savedPalettes.push(palette);

  // Save to localStorage
  localStorage.setItem('savedPalettes', JSON.stringify(state.savedPalettes));

  // Update the saved palettes display
  renderSavedPalettes();

  showNotification('Palette saved', 'success');
}

/**
 * Load saved palettes from localStorage
 */
function loadSavedPalettes() {
  const savedPalettes = localStorage.getItem('savedPalettes');

  if (savedPalettes) {
    state.savedPalettes = JSON.parse(savedPalettes);
    renderSavedPalettes();
  }
}

/**
 * Render saved palettes
 */
function renderSavedPalettes() {
  savedList.innerHTML = '';

  if (state.savedPalettes.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.className = 'empty-saved';
    emptyMessage.textContent = 'No saved palettes yet';
    savedList.appendChild(emptyMessage);
    return;
  }

  state.savedPalettes.forEach(palette => {
    const paletteEl = document.createElement('div');
    paletteEl.className = 'saved-palette';

    // Create color preview
    const colorsEl = document.createElement('div');
    colorsEl.className = 'saved-colors';

    palette.colors.forEach(color => {
      const colorEl = document.createElement('div');
      colorEl.className = 'saved-color';
      colorEl.style.backgroundColor = color;
      colorsEl.appendChild(colorEl);
    });

    // Create info section
    const infoEl = document.createElement('div');
    infoEl.className = 'saved-info';

    const dateEl = document.createElement('span');
    dateEl.className = 'saved-date';
    dateEl.textContent = new Date(palette.date).toLocaleDateString();

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'saved-delete';
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
    deleteBtn.setAttribute('aria-label', 'Delete palette');

    infoEl.appendChild(dateEl);
    infoEl.appendChild(deleteBtn);

    // Add event listeners
    paletteEl.addEventListener('click', () => loadPalette(palette));
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePalette(palette.id);
    });

    // Append elements
    paletteEl.appendChild(colorsEl);
    paletteEl.appendChild(infoEl);
    savedList.appendChild(paletteEl);
  });
}

/**
 * Load a saved palette
 * @param {Object} palette - The palette to load
 */
function loadPalette(palette) {
  state.colors = [...palette.colors];
  state.colorCount = palette.colors.length;
  colorCountDisplay.textContent = state.colorCount;

  // Clear locked colors
  state.lockedColors = {};
  state.allColorsLocked = false;

  // Re-render the palette
  renderPalette();

  // Update lock all button
  updateLockAllButton();

  showNotification('Palette loaded', 'success');
}

/**
 * Delete a saved palette
 * @param {number} id - The ID of the palette to delete
 */
function deletePalette(id) {
  state.savedPalettes = state.savedPalettes.filter(palette => palette.id !== id);

  // Save to localStorage
  localStorage.setItem('savedPalettes', JSON.stringify(state.savedPalettes));

  // Update the saved palettes display
  renderSavedPalettes();

  showNotification('Palette deleted', 'success');
}

/**
 * Clear all saved palettes
 */
function clearSavedPalettes() {
  if (state.savedPalettes.length === 0) {
    showNotification('No palettes to clear', 'warning');
    return;
  }

  if (confirm('Are you sure you want to delete all saved palettes?')) {
    state.savedPalettes = [];

    // Save to localStorage
    localStorage.setItem('savedPalettes', JSON.stringify(state.savedPalettes));

    // Update the saved palettes display
    renderSavedPalettes();

    showNotification('All palettes cleared', 'success');
  }
}

/**
 * Export the current palette
 * @param {string} format - The export format (css, json, url, image)
 */
function exportPalette(format) {
  let exportContent = '';
  let title = '';

  switch (format) {
    case 'css':
      title = 'CSS Variables';
      exportContent = `:root {\n${state.colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}\n}`;
      break;

    case 'json':
      title = 'JSON';
      exportContent = JSON.stringify({ colors: state.colors }, null, 2);
      break;

    case 'url':
      title = 'URL';
      const colorParams = state.colors.map(c => c.replace('#', '')).join('-');
      exportContent = `${window.location.origin}${window.location.pathname}?colors=${colorParams}`;
      break;

    case 'image':
      title = 'Image';
      exportContent = 'Generating image...';
      generatePaletteImage();
      break;
  }

  if (format !== 'image') {
    showExportModal(title, exportContent);
  }
}

/**
 * Show the export modal
 * @param {string} title - The export title
 * @param {string} content - The export content
 */
function showExportModal(title, content) {
  exportTitle.textContent = `Export Palette as ${title}`;
  exportData.value = content;
  exportModal.classList.add('show');
}

/**
 * Close the export modal
 */
function closeModal() {
  exportModal.classList.remove('show');
}

/**
 * Copy export data to clipboard
 */
function copyExportData() {
  copyToClipboard(exportData.value);
}

/**
 * Generate an image of the current palette
 */
function generatePaletteImage() {
  const canvas = exportCanvas;
  const ctx = canvas.getContext('2d');

  // Set canvas size
  const width = 800;
  const height = 400;
  canvas.width = width;
  canvas.height = height;

  // Calculate color box width
  const boxWidth = width / state.colors.length;

  // Draw background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Draw color boxes
  state.colors.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.fillRect(i * boxWidth, 0, boxWidth, height * 0.8);

    // Draw color code
    ctx.fillStyle = getContrastColor(color);
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(color.toUpperCase(), i * boxWidth + boxWidth / 2, height * 0.4);
  });

  // Draw title
  ctx.fillStyle = '#333333';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Color Palette', width / 2, height * 0.9);

  // Convert to data URL
  const dataUrl = canvas.toDataURL('image/png');

  // Create download link
  const link = document.createElement('a');
  link.download = 'color-palette.png';
  link.href = dataUrl;
  link.click();

  showNotification('Image downloaded', 'success');
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

/**
 * Show a notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, warning, error)
 */
function showNotification(message, type = 'success') {
  notificationMessage.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add('show');

  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 */
function copyToClipboard(text) {
  navigator.clipboard.writeText(text)
    .then(() => {
      showNotification('Copied to clipboard!', 'success');
    })
    .catch(err => {
      showNotification('Failed to copy: ' + err, 'error');
    });
}

/**
 * Convert hex color to RGB
 * @param {string} hex - The hex color code
 * @returns {string} RGB color string
 */
function hexToRGB(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Convert hex color to HSL
 * @param {string} hex - The hex color code
 * @returns {Object} HSL values {h, s, l}
 */
function hexToHSL(hex) {
  // Remove # if present
  hex = hex.replace('#', '');

  // Parse the hex values
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }

  // Convert to degrees, percentage
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return { h, s, l };
}

/**
 * Convert HSL to hex color
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-100)
 * @param {number} l - Lightness (0-100)
 * @returns {string} Hex color code
 */
function hslToHex(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;

  let r, g, b;

  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  // Convert to hex
  const toHex = x => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Get a contrasting color (black or white) for text on a given background color
 * @param {string} hexColor - The background color in hex
 * @returns {string} Black or white, whichever contrasts better
 */
function getContrastColor(hexColor) {
  // Remove # if present
  hexColor = hexColor.replace('#', '');

  // Parse the hex values
  const r = parseInt(hexColor.substring(0, 2), 16);
  const g = parseInt(hexColor.substring(2, 4), 16);
  const b = parseInt(hexColor.substring(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black for light colors, white for dark colors
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Check for URL parameters to load a palette
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const colors = urlParams.get('colors');

  if (colors) {
    const colorArray = colors.split('-').map(c => `#${c}`);
    if (colorArray.length > 0) {
      state.colors = colorArray;
      state.colorCount = colorArray.length;
      colorCountDisplay.textContent = state.colorCount;
      renderPalette();
    }
  }
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initApp();
  checkUrlParams();
});
