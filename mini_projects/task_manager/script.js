/**
 * Task Manager Application
 * Features:
 * - Create, edit, and delete tasks
 * - Set priority and due dates
 * - Filter and sort tasks
 * - Dark/light theme toggle
 * - Local storage persistence
 * - Task statistics
 */

// DOM Elements
const taskInput = document.getElementById('task-input');
const dueDateInput = document.getElementById('due-date');
const prioritySelect = document.getElementById('priority');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const filterStatus = document.getElementById('filter-status');
const filterPriority = document.getElementById('filter-priority');
const sortBy = document.getElementById('sort-by');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const themeSwitch = document.getElementById('theme-switch');
const taskCount = document.getElementById('task-count');
const totalTasksEl = document.getElementById('total-tasks');
const completedTasksEl = document.getElementById('completed-tasks');
const pendingTasksEl = document.getElementById('pending-tasks');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editTaskId = document.getElementById('edit-task-id');
const editTitle = document.getElementById('edit-title');
const editDueDate = document.getElementById('edit-due-date');
const editPriority = document.getElementById('edit-priority');
const closeModal = document.querySelector('.close-modal');

// Task template
const taskTemplate = document.getElementById('task-template');

// Global variables
let tasks = [];
let nextId = 1;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    loadTheme();
    updateTaskStats();
    
    // Set today's date as the default for the due date input
    const today = new Date().toISOString().split('T')[0];
    dueDateInput.value = today;
    
    // Add event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });
    
    filterStatus.addEventListener('change', filterTasks);
    filterPriority.addEventListener('change', filterTasks);
    sortBy.addEventListener('change', filterTasks);
    
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    clearAllBtn.addEventListener('click', clearAllTasks);
    
    themeSwitch.addEventListener('change', toggleTheme);
    
    closeModal.addEventListener('click', () => {
        editModal.classList.remove('show');
    });
    
    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveEditedTask();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            editModal.classList.remove('show');
        }
    });
});

/**
 * Add a new task
 */
function addTask() {
    const title = taskInput.value.trim();
    if (!title) {
        showNotification('Please enter a task title', 'error');
        taskInput.focus();
        return;
    }
    
    const dueDate = dueDateInput.value;
    const priority = prioritySelect.value;
    
    const task = {
        id: nextId++,
        title,
        dueDate,
        priority,
        completed: false,
        dateAdded: new Date().toISOString()
    };
    
    tasks.push(task);
    saveTasks();
    renderTask(task);
    updateTaskStats();
    
    // Reset input fields
    taskInput.value = '';
    taskInput.focus();
    
    showNotification('Task added successfully', 'success');
}

/**
 * Render a single task
 * @param {Object} task - The task object to render
 */
function renderTask(task) {
    const clone = document.importNode(taskTemplate.content, true);
    const taskItem = clone.querySelector('.task-item');
    
    taskItem.dataset.id = task.id;
    if (task.completed) {
        taskItem.classList.add('completed');
    }
    
    const checkbox = taskItem.querySelector('.task-checkbox');
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id));
    
    taskItem.querySelector('.task-title').textContent = task.title;
    
    const priorityEl = taskItem.querySelector('.task-priority');
    priorityEl.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    priorityEl.classList.add(task.priority);
    
    const dueDateEl = taskItem.querySelector('.task-due-date');
    if (task.dueDate) {
        const formattedDate = formatDate(task.dueDate);
        dueDateEl.textContent = formattedDate;
        
        // Check if task is overdue
        if (!task.completed && isOverdue(task.dueDate)) {
            dueDateEl.classList.add('overdue');
        }
    } else {
        dueDateEl.textContent = 'No due date';
    }
    
    // Add event listeners for edit and delete buttons
    taskItem.querySelector('.edit-btn').addEventListener('click', () => openEditModal(task.id));
    taskItem.querySelector('.delete-btn').addEventListener('click', () => deleteTask(task.id));
    
    taskList.appendChild(taskItem);
}

/**
 * Toggle task completion status
 * @param {number} id - The task ID
 */
function toggleTaskComplete(id) {
    const taskIndex = tasks.findIndex(task => task.id === id);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasks();
        filterTasks(); // Re-render with current filters
        updateTaskStats();
    }
}

/**
 * Open the edit modal for a task
 * @param {number} id - The task ID
 */
function openEditModal(id) {
    const task = tasks.find(task => task.id === id);
    if (!task) return;
    
    editTaskId.value = task.id;
    editTitle.value = task.title;
    editDueDate.value = task.dueDate;
    editPriority.value = task.priority;
    
    editModal.classList.add('show');
    editTitle.focus();
}

/**
 * Save the edited task
 */
function saveEditedTask() {
    const id = parseInt(editTaskId.value);
    const taskIndex = tasks.findIndex(task => task.id === id);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].title = editTitle.value.trim();
        tasks[taskIndex].dueDate = editDueDate.value;
        tasks[taskIndex].priority = editPriority.value;
        
        saveTasks();
        filterTasks(); // Re-render with current filters
        editModal.classList.remove('show');
        
        showNotification('Task updated successfully', 'success');
    }
}

/**
 * Delete a task
 * @param {number} id - The task ID
 */
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(task => task.id !== id);
        saveTasks();
        filterTasks(); // Re-render with current filters
        updateTaskStats();
        
        showNotification('Task deleted', 'success');
    }
}

/**
 * Clear all completed tasks
 */
function clearCompletedTasks() {
    const completedCount = tasks.filter(task => task.completed).length;
    
    if (completedCount === 0) {
        showNotification('No completed tasks to clear', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to clear ${completedCount} completed task(s)?`)) {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        filterTasks(); // Re-render with current filters
        updateTaskStats();
        
        showNotification('Completed tasks cleared', 'success');
    }
}

/**
 * Clear all tasks
 */
function clearAllTasks() {
    if (tasks.length === 0) {
        showNotification('No tasks to clear', 'info');
        return;
    }
    
    if (confirm(`Are you sure you want to clear all ${tasks.length} task(s)?`)) {
        tasks = [];
        saveTasks();
        filterTasks(); // Re-render with current filters
        updateTaskStats();
        
        showNotification('All tasks cleared', 'success');
    }
}

/**
 * Filter and sort tasks based on current filter settings
 */
function filterTasks() {
    // Clear current task list
    taskList.innerHTML = '';
    
    // Get filter values
    const statusFilter = filterStatus.value;
    const priorityFilter = filterPriority.value;
    const sortByValue = sortBy.value;
    
    // Filter tasks
    let filteredTasks = [...tasks];
    
    if (statusFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => 
            (statusFilter === 'completed' && task.completed) || 
            (statusFilter === 'active' && !task.completed)
        );
    }
    
    if (priorityFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.priority === priorityFilter);
    }
    
    // Sort tasks
    filteredTasks.sort((a, b) => {
        switch (sortByValue) {
            case 'due-date':
                // Sort by due date (null dates at the end)
                if (!a.dueDate) return 1;
                if (!b.dueDate) return -1;
                return new Date(a.dueDate) - new Date(b.dueDate);
            
            case 'priority':
                // Sort by priority (high > medium > low)
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            
            case 'date-added':
            default:
                // Sort by date added (newest first)
                return new Date(b.dateAdded) - new Date(a.dateAdded);
        }
    });
    
    // Render filtered and sorted tasks
    filteredTasks.forEach(task => renderTask(task));
    
    // Update task count
    taskCount.textContent = `(${filteredTasks.length})`;
    
    // Show message if no tasks match filters
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('li');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No tasks match your filters';
        taskList.appendChild(emptyMessage);
    }
}

/**
 * Update task statistics
 */
function updateTaskStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    
    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
}

/**
 * Toggle between light and dark theme
 */
function toggleTheme() {
    const isDarkTheme = themeSwitch.checked;
    document.body.classList.toggle('dark-theme', isDarkTheme);
    localStorage.setItem('darkTheme', isDarkTheme);
}

/**
 * Load theme preference from localStorage
 */
function loadTheme() {
    const isDarkTheme = localStorage.getItem('darkTheme') === 'true';
    themeSwitch.checked = isDarkTheme;
    document.body.classList.toggle('dark-theme', isDarkTheme);
}

/**
 * Save tasks to localStorage
 */
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('nextId', nextId.toString());
}

/**
 * Load tasks from localStorage
 */
function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    const savedNextId = localStorage.getItem('nextId');
    
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if (savedNextId) {
        nextId = parseInt(savedNextId);
    }
    
    filterTasks(); // Initial render with default filters
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

/**
 * Check if a date is in the past
 * @param {string} dateString - ISO date string
 * @returns {boolean} True if date is in the past
 */
function isOverdue(dateString) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dueDate = new Date(dateString);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
}

/**
 * Show a notification message
 * @param {string} message - The message to display
 * @param {string} type - The type of notification (success, error, info)
 */
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add notification styles dynamically
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transform: translateY(100px);
        opacity: 0;
        transition: transform 0.3s, opacity 0.3s;
        z-index: 1100;
    }
    
    .notification.show {
        transform: translateY(0);
        opacity: 1;
    }
    
    .notification.success {
        background-color: var(--success-color);
    }
    
    .notification.error {
        background-color: var(--danger-color);
    }
    
    .notification.info {
        background-color: var(--primary-color);
    }
`;
document.head.appendChild(notificationStyles);