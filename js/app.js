// Main Application Entry Point

console.log('🚀 App.js loaded, starting application...');

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DOMContentLoaded fired');
    console.log('📊 DOM State:', {
        readyState: document.readyState,
        hasSupabase: !!window.supabase,
        hasUtils: !!window.utils
    });
    
    // Wait a bit for all scripts to load
    setTimeout(initializeApp, 100);
});

function initializeApp() {
    console.log('🔄 initializeApp() called');
    
    try {
        // Check if required dependencies are loaded
        const dependencies = {
            supabase: !!window.supabase,
            utils: !!window.utils,
            VehicleManager: !!window.VehicleManager
        };
        
        console.log('🔍 Dependencies check:', dependencies);
        
        // Check if all required DOM elements exist
        const elements = {
            loginSection: !!document.getElementById('loginSection'),
            dashboardSection: !!document.getElementById('dashboardSection'),
            loadingOverlay: !!document.getElementById('loadingOverlay'),
            loginForm: !!document.getElementById('loginForm')
        };
        
        console.log('🔍 DOM elements check:', elements);
        
        // Create AuthManager
        console.log('🔐 Creating AuthManager...');
        window.authManager = new AuthManager();
        console.log('✅ AuthManager created');
        
    } catch (error) {
        console.error('🚨 Error in initializeApp():', error);
        console.error('🚨 Error stack:', error.stack);
        
        // Show error to user
        if (window.utils) {
            window.utils.showError('Application failed to initialize: ' + error.message);
        }
    }
}

// Global error handler
window.addEventListener('error', function(event) {
    console.error('🚨 Global error:', event.error);
    console.error('🚨 Error details:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
    });
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
    console.error('🚨 Unhandled promise rejection:', event.reason);
});

console.log('✅ App.js setup completed');