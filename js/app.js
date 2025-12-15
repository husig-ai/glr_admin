// Main Application Entry Point

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for all scripts to load
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    try {
        // Create AuthManager
        window.authManager = new AuthManager();
        
    } catch (error) {
        console.error('Error in initializeApp():', error);
        
        // Show error to user
        if (window.utils) {
            window.utils.showError('Application failed to initialize: ' + error.message);
        }
    }
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
});