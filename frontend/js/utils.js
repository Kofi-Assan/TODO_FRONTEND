// Sound effect utility
const clickSound = new Audio('../audio/Click sound effect.mp3');

function playClickSound() {
    clickSound.currentTime = 0; // Reset sound to start
    clickSound.play().catch(err => console.log('Error playing sound:', err));
}

// Add click sound to all clickable elements
function addClickSoundToElements() {
    // Select all potentially clickable elements
    const clickableElements = document.querySelectorAll(`
        a, button, 
        .btn-book, .btn-primary, .btn-secondary, .filter-btn,
        .card, .resource-item, .booking-item,
        .nav-btn, .tab-btn, .filter-options button,
        [onclick], [role="button"],
        .clickable, .selectable, .interactive
    `);

    // Add click sound to each element
    clickableElements.forEach(element => {
        element.addEventListener('click', playClickSound);
    });

    // Add click sound to dynamically added elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { 
                        const newClickableElements = node.querySelectorAll(`
                            a, button, 
                            .btn-book, .btn-primary, .btn-secondary, .filter-btn,
                            .card, .resource-item, .booking-item,
                            .nav-btn, .tab-btn, .filter-options button,
                            [onclick], [role="button"],
                            .clickable, .selectable, .interactive
                        `);
                        newClickableElements.forEach(element => {
                            element.addEventListener('click', playClickSound);
                        });
                        
                        // Check if the node itself is clickable
                        if (node.matches(`
                            a, button, 
                            .btn-book, .btn-primary, .btn-secondary, .filter-btn,
                            .card, .resource-item, .booking-item,
                            .nav-btn, .tab-btn, .filter-options button,
                            [onclick], [role="button"],
                            .clickable, .selectable, .interactive
                        `)) {
                            node.addEventListener('click', playClickSound);
                        }
                    }
                });
            }
        });
    });

    // Observe the entire document for dynamic changes
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Export utilities
window.playClickSound = playClickSound;
window.addClickSoundToElements = addClickSoundToElements; 