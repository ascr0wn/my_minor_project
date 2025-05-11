/**
 * Advanced Data Visualization Tool
 * Features:
 * - Multiple data input methods (sample data, CSV upload, manual entry)
 * - Various chart types (bar, line, pie, doughnut, radar, polar area, scatter)
 * - Chart customization options
 * - Data export (PNG, CSV, JSON)
 * - Theme toggle (light/dark)
 * - Responsive design
 */

// DOM Elements
const chartCanvas = document.getElementById('chart-canvas');
const dataSourceSelect = document.getElementById('data-source');
const csvUploadContainer = document.getElementById('csv-upload-container');
const manualEntryContainer = document.getElementById('manual-entry-container');
const csvFileInput = document.getElementById('csv-file');
const fileNameDisplay = document.getElementById('file-name');
const headerRowCheckbox = document.getElementById('header-row');
const delimiterSelect = document.getElementById('delimiter');
const loadCsvBtn = document.getElementById('load-csv-btn');
const labelsInput = document.getElementById('labels-input');
const datasetsContainer = document.getElementById('datasets-container');
const addDatasetBtn = document.getElementById('add-dataset-btn');
const loadManualBtn = document.getElementById('load-manual-btn');
const chartTypeSelect = document.getElementById('chart-type');
const chartTitleInput = document.getElementById('chart-title');
const xAxisLabelInput = document.getElementById('x-axis-label');
const yAxisLabelInput = document.getElementById('y-axis-label');
const legendPositionSelect = document.getElementById('legend-position');
const showDataLabelsCheckbox = document.getElementById('show-data-labels');
const showGridLinesCheckbox = document.getElementById('show-grid-lines');
const enableAnimationsCheckbox = document.getElementById('enable-animations');
const applyOptionsBtn = document.getElementById('apply-options-btn');
const exportImageBtn = document.getElementById('export-image-btn');
const exportCsvBtn = document.getElementById('export-csv-btn');
const exportJsonBtn = document.getElementById('export-json-btn');
const dataTable = document.getElementById('data-table');
const tableHeader = document.getElementById('table-header');
const tableBody = document.getElementById('table-body');
const themeSwitch = document.getElementById('theme-switch');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');

// Chart instance
let chart = null;

// Chart data
let chartData = {
  labels: [],
  datasets: []
};

// Sample data
const sampleData = {
  labels: ['January', 'February', 'March', 'April', 'May', 'June'],
  datasets: [
    {
      label: 'Sales 2023',
      data: [65, 59, 80, 81, 56, 55],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    },
    {
      label: 'Sales 2022',
      data: [28, 48, 40, 19, 86, 27],
      backgroundColor: 'rgba(255, 99, 132, 0.6)',
      borderColor: 'rgba(255, 99, 132, 1)',
      borderWidth: 1
    }
  ]
};

// Default chart options
const defaultOptions = {
  type: 'bar',
  title: 'Data Visualization Chart',
  xAxisLabel: '',
  yAxisLabel: '',
  legendPosition: 'top',
  showDataLabels: false,
  showGridLines: true,
  enableAnimations: true
};

// Current chart options
let chartOptions = { ...defaultOptions };

// Initialize the application
function initApp() {
  // Set up event listeners
  setupEventListeners();
  
  // Load theme preference
  loadThemePreference();
  
  // Load sample data initially
  loadSampleData();
}

// Set up event listeners
function setupEventListeners() {
  // Data source selection
  dataSourceSelect.addEventListener('change', handleDataSourceChange);
  
  // CSV file input
  csvFileInput.addEventListener('change', handleFileSelection);
  loadCsvBtn.addEventListener('click', loadCsvData);
  
  // Manual data entry
  addDatasetBtn.addEventListener('click', addDatasetInput);
  loadManualBtn.addEventListener('click', loadManualData);
  
  // Chart options
  applyOptionsBtn.addEventListener('click', applyChartOptions);
  
  // Export buttons
  exportImageBtn.addEventListener('click', exportAsImage);
  exportCsvBtn.addEventListener('click', exportAsCsv);
  exportJsonBtn.addEventListener('click', exportAsJson);
  
  // Theme toggle
  themeSwitch.addEventListener('change', toggleTheme);
}

/**
 * Handle data source change
 */
function handleDataSourceChange() {
  const source = dataSourceSelect.value;
  
  // Hide all data input containers
  csvUploadContainer.style.display = 'none';
  manualEntryContainer.style.display = 'none';
  
  // Show the selected container
  if (source === 'csv') {
    csvUploadContainer.style.display = 'block';
  } else if (source === 'manual') {
    manualEntryContainer.style.display = 'block';
  } else if (source === 'sample') {
    loadSampleData();
  }
}

/**
 * Handle file selection for CSV upload
 */
function handleFileSelection() {
  if (csvFileInput.files.length > 0) {
    fileNameDisplay.textContent = csvFileInput.files[0].name;
  } else {
    fileNameDisplay.textContent = 'No file chosen';
  }
}

/**
 * Load sample data
 */
function loadSampleData() {
  chartData = JSON.parse(JSON.stringify(sampleData)); // Deep copy
  createChart();
  updateDataTable();
  showNotification('Sample data loaded', 'success');
}

/**
 * Load data from CSV file
 */
function loadCsvData() {
  const file = csvFileInput.files[0];
  if (!file) {
    showNotification('Please select a CSV file', 'warning');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const csv = e.target.result;
    const hasHeader = headerRowCheckbox.checked;
    const delimiter = delimiterSelect.value;
    
    // Parse CSV using PapaParse
    Papa.parse(csv, {
      delimiter: delimiter,
      header: hasHeader,
      dynamicTyping: true,
      complete: function(results) {
        if (results.errors.length > 0) {
          showNotification('Error parsing CSV: ' + results.errors[0].message, 'error');
          return;
        }
        
        processCSVData(results.data, hasHeader);
      }
    });
  };
  
  reader.readAsText(file);
}

/**
 * Process CSV data and convert to chart format
 * @param {Array} data - The parsed CSV data
 * @param {boolean} hasHeader - Whether the CSV has a header row
 */
function processCSVData(data, hasHeader) {
  if (data.length === 0) {
    showNotification('CSV file is empty', 'warning');
    return;
  }
  
  try {
    // Reset chart data
    chartData = {
      labels: [],
      datasets: []
    };
    
    if (hasHeader) {
      // First column contains labels, other columns are datasets
      const headers = Object.keys(data[0]);
      
      if (headers.length < 2) {
        showNotification('CSV must have at least 2 columns', 'warning');
        return;
      }
      
      // First column is for labels
      const labelColumn = headers[0];
      chartData.labels = data.map(row => row[labelColumn].toString());
      
      // Other columns are datasets
      for (let i = 1; i < headers.length; i++) {
        const datasetLabel = headers[i];
        const color = getRandomColor();
        
        chartData.datasets.push({
          label: datasetLabel,
          data: data.map(row => {
            const value = row[datasetLabel];
            return typeof value === 'number' ? value : 0;
          }),
          backgroundColor: color.replace('1)', '0.6)'),
          borderColor: color,
          borderWidth: 1
        });
      }
    } else {
      // First row is labels, other rows are datasets
      if (data[0].length < 2) {
        showNotification('CSV must have at least 2 columns', 'warning');
        return;
      }
      
      // First column of each row is the dataset label
      chartData.labels = data[0].slice(1).map(String);
      
      // Each row is a dataset
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const color = getRandomColor();
        
        chartData.datasets.push({
          label: row[0].toString(),
          data: row.slice(1).map(value => typeof value === 'number' ? value : 0),
          backgroundColor: color.replace('1)', '0.6)'),
          borderColor: color,
          borderWidth: 1
        });
      }
    }
    
    createChart();
    updateDataTable();
    showNotification('CSV data loaded successfully', 'success');
  } catch (error) {
    showNotification('Error processing CSV data: ' + error.message, 'error');
  }
}

/**
 * Add a new dataset input field for manual entry
 */
function addDatasetInput() {
  const datasetCount = document.querySelectorAll('.dataset-input').length;
  const datasetIndex = datasetCount;
  
  const datasetDiv = document.createElement('div');
  datasetDiv.className = 'dataset-input';
  datasetDiv.dataset.index = datasetIndex;
  
  // Generate a random color
  const color = getRandomColor();
  const rgbColor = hexToRgb(color.replace('rgba(', '').replace(')', ''));
  const hexColor = rgbToHex(rgbColor.r, rgbColor.g, rgbColor.b);
  
  datasetDiv.innerHTML = `
    <button type="button" class="remove-dataset" title="Remove dataset">
      <i class="fas fa-times"></i>
    </button>
    <div class="input-group">
      <label for="dataset-name-${datasetIndex}">Dataset Name:</label>
      <input type="text" id="dataset-name-${datasetIndex}" placeholder="Dataset ${datasetIndex + 1}">
    </div>
    <div class="input-group">
      <label for="dataset-values-${datasetIndex}">Values (comma separated):</label>
      <input type="text" id="dataset-values-${datasetIndex}" placeholder="10, 20, 30...">
    </div>
    <div class="input-group">
      <label for="dataset-color-${datasetIndex}">Color:</label>
      <input type="color" id="dataset-color-${datasetIndex}" value="${hexColor}">
    </div>
  `;
  
  datasetsContainer.appendChild(datasetDiv);
  
  // Add event listener to remove button
  datasetDiv.querySelector('.remove-dataset').addEventListener('click', function() {
    datasetDiv.remove();
  });
}

/**
 * Load manually entered data
 */
function loadManualData() {
  const labels = labelsInput.value.split(',').map(label => label.trim());
  
  if (labels.length === 0 || (labels.length === 1 && labels[0] === '')) {
    showNotification('Please enter at least one label', 'warning');
    return;
  }
  
  const datasetInputs = document.querySelectorAll('.dataset-input');
  if (datasetInputs.length === 0) {
    showNotification('Please add at least one dataset', 'warning');
    return;
  }
  
  // Reset chart data
  chartData = {
    labels: labels,
    datasets: []
  };
  
  // Process each dataset
  datasetInputs.forEach(datasetInput => {
    const index = datasetInput.dataset.index;
    const nameInput = document.getElementById(`dataset-name-${index}`);
    const valuesInput = document.getElementById(`dataset-values-${index}`);
    const colorInput = document.getElementById(`dataset-color-${index}`);
    
    const name = nameInput.value.trim() || `Dataset ${parseInt(index) + 1}`;
    const valuesText = valuesInput.value.trim();
    
    if (!valuesText) {
      showNotification(`Please enter values for ${name}`, 'warning');
      return;
    }
    
    const values = valuesText.split(',').map(value => {
      const parsed = parseFloat(value.trim());
      return isNaN(parsed) ? 0 : parsed;
    });
    
    // Convert hex color to rgba
    const hexColor = colorInput.value;
    const rgb = hexToRgb(hexColor.substring(1));
    const rgbaColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`;
    
    chartData.datasets.push({
      label: name,
      data: values,
      backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.6)`,
      borderColor: rgbaColor,
      borderWidth: 1
    });
  });
  
  if (chartData.datasets.length === 0) {
    showNotification('No valid datasets found', 'warning');
    return;
  }
  
  createChart();
  updateDataTable();
  showNotification('Manual data loaded successfully', 'success');
}

/**
 * Apply chart options
 */
function applyChartOptions() {
  chartOptions = {
    type: chartTypeSelect.value,
    title: chartTitleInput.value || defaultOptions.title,
    xAxisLabel: xAxisLabelInput.value,
    yAxisLabel: yAxisLabelInput.value,
    legendPosition: legendPositionSelect.value,
    showDataLabels: showDataLabelsCheckbox.checked,
    showGridLines: showGridLinesCheckbox.checked,
    enableAnimations: enableAnimationsCheckbox.checked
  };
  
  createChart();
  showNotification('Chart options applied', 'success');
}

/**
 * Create or update the chart
 */
function createChart() {
  // Destroy existing chart if it exists
  if (chart) {
    chart.destroy();
  }
  
  // Register the datalabels plugin if needed
  if (chartOptions.showDataLabels) {
    Chart.register(ChartDataLabels);
  }
  
  // Configure chart options
  const config = {
    type: chartOptions.type,
    data: chartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: chartOptions.enableAnimations ? 1000 : 0
      },
      plugins: {
        legend: {
          position: chartOptions.legendPosition,
          labels: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        },
        title: {
          display: !!chartOptions.title,
          text: chartOptions.title,
          color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
          font: {
            size: 16
          }
        },
        datalabels: chartOptions.showDataLabels ? {
          color: '#fff',
          font: {
            weight: 'bold'
          },
          formatter: (value) => value
        } : false
      },
      scales: {
        x: {
          title: {
            display: !!chartOptions.xAxisLabel,
            text: chartOptions.xAxisLabel,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          grid: {
            display: chartOptions.showGridLines,
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        },
        y: {
          title: {
            display: !!chartOptions.yAxisLabel,
            text: chartOptions.yAxisLabel,
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          },
          grid: {
            display: chartOptions.showGridLines,
            color: getComputedStyle(document.documentElement).getPropertyValue('--border-color')
          },
          ticks: {
            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
          }
        }
      }
    }
  };
  
  // Special configurations for different chart types
  if (['pie', 'doughnut', 'polarArea'].includes(chartOptions.type)) {
    // Remove scales for these chart types
    delete config.options.scales;
  }
  
  // Create the chart
  chart = new Chart(chartCanvas, config);
}

/**
 * Update the data table
 */
function updateDataTable() {
  // Clear existing table
  tableHeader.innerHTML = '<th>Label</th>';
  tableBody.innerHTML = '';
  
  // Add dataset headers
  chartData.datasets.forEach(dataset => {
    const th = document.createElement('th');
    th.textContent = dataset.label;
    tableHeader.appendChild(th);
  });
  
  // Add data rows
  chartData.labels.forEach((label, labelIndex) => {
    const row = document.createElement('tr');
    
    // Add label cell
    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    row.appendChild(labelCell);
    
    // Add data cells
    chartData.datasets.forEach(dataset => {
      const dataCell = document.createElement('td');
      dataCell.textContent = dataset.data[labelIndex];
      row.appendChild(dataCell);
    });
    
    tableBody.appendChild(row);
  });
}

/**
 * Export chart as PNG image
 */
function exportAsImage() {
  if (!chart) {
    showNotification('No chart to export', 'warning');
    return;
  }
  
  // Create a link element
  const link = document.createElement('a');
  link.download = 'chart.png';
  link.href = chart.toBase64Image();
  link.click();
  
  showNotification('Chart exported as PNG', 'success');
}

/**
 * Export data as CSV
 */
function exportAsCsv() {
  if (!chartData.labels || chartData.labels.length === 0) {
    showNotification('No data to export', 'warning');
    return;
  }
  
  let csvContent = 'data:text/csv;charset=utf-8,';
  
  // Add header row
  const headers = ['Label', ...chartData.datasets.map(ds => ds.label)];
  csvContent += headers.join(',') + '\n';
  
  // Add data rows
  chartData.labels.forEach((label, labelIndex) => {
    const row = [label, ...chartData.datasets.map(ds => ds.data[labelIndex])];
    csvContent += row.join(',') + '\n';
  });
  
  // Create a link element
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'chart_data.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Data exported as CSV', 'success');
}

/**
 * Export data as JSON
 */
function exportAsJson() {
  if (!chartData.labels || chartData.labels.length === 0) {
    showNotification('No data to export', 'warning');
    return;
  }
  
  // Create a structured data object
  const exportData = {
    labels: chartData.labels,
    datasets: chartData.datasets.map(ds => ({
      label: ds.label,
      data: ds.data
    }))
  };
  
  // Convert to JSON string
  const jsonString = JSON.stringify(exportData, null, 2);
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(jsonString);
  
  // Create a link element
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', 'chart_data.json');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  showNotification('Data exported as JSON', 'success');
}

/**
 * Toggle theme between light and dark
 */
function toggleTheme() {
  const isDarkTheme = themeSwitch.checked;
  document.body.classList.toggle('dark-theme', isDarkTheme);
  localStorage.setItem('darkTheme', isDarkTheme);
  
  // Update chart colors if it exists
  if (chart) {
    createChart(); // Recreate chart with updated theme colors
  }
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
 * Generate a random color
 * @returns {string} Random RGBA color
 */
function getRandomColor() {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 1)`;
}

/**
 * Convert hex color to RGB object
 * @param {string} hex - Hex color code
 * @returns {Object} RGB object with r, g, b properties
 */
function hexToRgb(hex) {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return { r, g, b };
}

/**
 * Convert RGB values to hex color
 * @param {number} r - Red value (0-255)
 * @param {number} g - Green value (0-255)
 * @param {number} b - Blue value (0-255)
 * @returns {string} Hex color code
 */
function rgbToHex(r, g, b) {
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);