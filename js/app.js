// Main Application Logic

class AdminApp {
    constructor() {
        this.currentSection = 'vehicles';
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupGlobalEventListeners();
        });
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        const sections = document.querySelectorAll('.content-section');

        navButtons.forEach(button => {
            button.addEventListener('click', () => {
                const sectionName = button.dataset.section;
                
                // Update navigation
                navButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Update sections
                sections.forEach(section => section.classList.remove('active'));
                const targetSection = document.getElementById(sectionName + 'Section');
                if (targetSection) {
                    targetSection.classList.add('active');
                    this.currentSection = sectionName;
                }

                // Load data for the active section
                this.loadSectionData(sectionName);
            });
        });
    }

    setupGlobalEventListeners() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape key to close modals
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'flex') {
                        modal.style.display = 'none';
                    }
                });
            }

            // Ctrl+N to add new vehicle (when in vehicles section)
            if (e.ctrlKey && e.key === 'n' && this.currentSection === 'vehicles') {
                e.preventDefault();
                if (window.vehicleManager) {
                    window.vehicleManager.showVehicleModal();
                }
            }
        });

        // Handle browser refresh
        window.addEventListener('beforeunload', (e) => {
            // Check if any modals are open or forms have unsaved changes
            const modals = document.querySelectorAll('.modal');
            const hasOpenModal = Array.from(modals).some(modal => 
                modal.style.display === 'flex'
            );

            if (hasOpenModal) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
                return e.returnValue;
            }
        });

        // Global error handling
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            utils.showError('An unexpected error occurred. Please refresh the page and try again.');
        });

        // Global promise rejection handling
        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
            utils.showError('An unexpected error occurred. Please refresh the page and try again.');
        });
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'vehicles':
                if (window.vehicleManager && window.authManager.isAuthenticated()) {
                    window.vehicleManager.loadVehicles();
                }
                break;
            
            // Add more cases as we implement other sections
            case 'drivers':
                // TODO: Implement driver management
                break;
            
            case 'customers':
                // TODO: Implement customer management
                break;
                
            case 'analytics':
                // TODO: Implement analytics
                break;
        }
    }
}

// Utility functions for the app
const appUtils = {
    // Debounce function for search inputs
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    // Format phone number
    formatPhoneNumber: (phone) => {
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    },

    // Validate file upload
    validateImageFile: (file) => {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload JPG, PNG, or WebP images only.');
        }

        if (file.size > maxSize) {
            throw new Error('File size too large. Please upload images under 5MB.');
        }

        return true;
    },

    // Generate random ID
    generateId: () => {
        return Math.random().toString(36).substr(2, 9);
    },

    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            utils.showSuccess('Copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy:', error);
            utils.showError('Failed to copy to clipboard');
        }
    }
};

// Initialize the application
const adminApp = new AdminApp();

// Make utilities available globally
window.appUtils = appUtils;

// Service worker registration for caching (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            // Uncomment if you create a service worker
            // const registration = await navigator.serviceWorker.register('/sw.js');
            // console.log('SW registered: ', registration);
        } catch (error) {
            console.log('SW registration failed: ', error);
        }
    });
}

// Enhanced error handling and reporting
class ErrorReporter {
    static report(error, context = '') {
        const errorInfo = {
            message: error.message,
            stack: error.stack,
            context: context,
            timestamp: new Date().toISOString(),
            url: window.location.href,
            userAgent: navigator.userAgent
        };

        // Log to console in development
        console.error('Error Report:', errorInfo);

        // In production, you might want to send this to a logging service
        // this.sendToLoggingService(errorInfo);
    }

    static sendToLoggingService(errorInfo) {
        // Implementation for sending errors to external logging service
        // e.g., Sentry, LogRocket, or custom endpoint
    }
}

window.ErrorReporter = ErrorReporter;