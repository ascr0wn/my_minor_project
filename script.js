/**
 * Portfolio Website JavaScript
 * Handles navigation, collapsible sections, project links, theme toggling, and image hover effects
 */

// DOM Elements
const toggleButton = document.getElementById('theme-toggle');
const profileImg = document.querySelector('.profile-img');

/**
 * Navigation: Toggle between content sections and update accessibility attributes
 */
document.querySelectorAll(".navbar button[data-section]").forEach(btn => {
    btn.addEventListener("click", () => {
        const section = btn.dataset.section;

        // Update content visibility
        document.querySelectorAll(".content-section").forEach(sec => {
            const isActive = sec.id === section;
            sec.style.display = isActive ? "block" : "none";
        });

        // Update ARIA attributes for accessibility
        document.querySelectorAll(".navbar button[data-section]").forEach(navBtn => {
            navBtn.setAttribute('aria-pressed', navBtn === btn);
        });

        // Save active section to localStorage
        localStorage.setItem('activeSection', section);
    });
});

/**
 * Collapsibles: Expand/Collapse Details with Animation
 */
document.querySelectorAll(".collapsible-header").forEach(header => {
    header.addEventListener("click", () => {
        try {
            const targetId = header.dataset.toggle;
            const el = document.getElementById(targetId);

            if (!el) {
                console.error(`Element with ID "${targetId}" not found`);
                return;
            }

            const isExpanded = el.classList.toggle("show");

            // Update accessibility attributes
            header.setAttribute('aria-expanded', isExpanded);
            el.setAttribute('aria-hidden', !isExpanded);
        } catch (error) {
            console.error("Error toggling collapsible section:", error);
        }
    });
});

/**
 * Profile Image Hover Effect
 */
if (profileImg) {
    const originalSrc = profileImg.src;
    const hoverSrc = profileImg.dataset.hoverSrc;

    if (hoverSrc) {
        profileImg.addEventListener('mouseover', () => {
            profileImg.src = hoverSrc;
        });

        profileImg.addEventListener('mouseout', () => {
            profileImg.src = originalSrc;
        });
    }
}

/**
 * Project Cards: Open project links
 */
document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => {
        const url = card.dataset.projectUrl;
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    });
});

/**
 * Theme Toggle: Switch between light and dark mode
 */
toggleButton.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    toggleButton.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
    toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

/**
 * Digital Clock Functionality
 */
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';

    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    hours = hours.toString().padStart(2, '0');

    // Update the clock elements
    document.getElementById('hours').textContent = hours;
    document.getElementById('minutes').textContent = minutes;
    document.getElementById('seconds').textContent = seconds;
    document.getElementById('ampm').textContent = ampm;
}

// Update the clock every second
setInterval(updateClock, 1000);

/**
 * Comment Section Functionality
 */
// Load comments from localStorage
function loadComments() {
    const comments = JSON.parse(localStorage.getItem('comments')) || [];
    const commentsList = document.getElementById('comments-list');

    // Clear current comments
    commentsList.innerHTML = '';

    if (comments.length === 0) {
        commentsList.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
        return;
    }

    // Display comments in reverse chronological order (newest first)
    comments.reverse().forEach(comment => {
        const commentItem = document.createElement('div');
        commentItem.className = 'comment-item';

        const commentDate = new Date(comment.date);
        const formattedDate = commentDate.toLocaleDateString() + ' ' + 
                             commentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        commentItem.innerHTML = `
            <div class="comment-header">
                <span class="comment-author">${comment.name}</span>
                <span class="comment-date">${formattedDate}</span>
            </div>
            <div class="comment-text">${comment.comment}</div>
        `;

        commentsList.appendChild(commentItem);
    });
}

// Handle comment form submission
document.getElementById('comment-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const commentInput = document.getElementById('comment');

    // Validate inputs
    if (!nameInput.value.trim() || !emailInput.value.trim() || !commentInput.value.trim()) {
        alert('Please fill in all fields');
        return;
    }

    // Create comment object
    const newComment = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        comment: commentInput.value.trim(),
        date: new Date().toISOString()
    };

    // Get existing comments
    const comments = JSON.parse(localStorage.getItem('comments')) || [];

    // Add new comment
    comments.push(newComment);

    // Save to localStorage
    localStorage.setItem('comments', JSON.stringify(comments));

    // Reset form
    this.reset();

    // Reload comments
    loadComments();

    // Show confirmation
    alert('Comment submitted successfully!');
});

/**
 * Back to Top Button Functionality
 */
const backToTopButton = document.getElementById('back-to-top');

// Show/hide button based on scroll position
window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) { // Show button after scrolling down 300px
        backToTopButton.style.display = 'block';
    } else {
        backToTopButton.style.display = 'none';
    }
});

// Scroll to top when button is clicked
backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth' // Smooth scrolling animation
    });
});

/**
 * Initialize: Restore Theme & Last Active Section
 */
document.addEventListener('DOMContentLoaded', () => {
    try {
        const savedTheme = localStorage.getItem('theme');
        const lastSection = localStorage.getItem('activeSection') || 'home';

        // Apply saved theme
        if (savedTheme === 'dark') {
            document.body.classList.add('dark');
            toggleButton.textContent = '☀️ Light Mode';
            toggleButton.setAttribute('aria-label', 'Switch to light mode');
        }

        // Show the last active section and update ARIA attributes
        document.querySelectorAll(".content-section").forEach(sec => {
            const isActive = sec.id === lastSection;
            sec.style.display = isActive ? "block" : "none";
        });

        document.querySelectorAll(".navbar button[data-section]").forEach(btn => {
            btn.setAttribute('aria-pressed', btn.dataset.section === lastSection);
        });

        // Initialize collapsible sections with accessibility attributes
        document.querySelectorAll(".collapsible-header").forEach(header => {
            const targetId = header.dataset.toggle;
            const el = document.getElementById(targetId);

            if (el) {
                const isExpanded = el.classList.contains("show");
                header.setAttribute('aria-expanded', isExpanded);
                el.setAttribute('aria-hidden', !isExpanded);
            }
        });

        // Initialize the clock
        updateClock();

        // Load comments
        loadComments();
    } catch (error) {
        console.error("Error initializing application:", error);
    }
});
