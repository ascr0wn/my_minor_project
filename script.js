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
    } catch (error) {
        console.error("Error initializing application:", error);
    }
});