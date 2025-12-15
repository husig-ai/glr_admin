console.log('🔄 Loading Supabase config...');

const SUPABASE_URL = 'https://ldqmwlvahjfuqbrvyakj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkcW13bHZhaGpmdXFicnZ5YWtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NTI3MzgsImV4cCI6MjA4MTMyODczOH0.DFzQoImxjE07PZZHK5CDCPS0vZ1OQtclIhqlTZ8ptzE'

console.log('🔍 Supabase credentials check:', {
    url: SUPABASE_URL,
    keyLength: SUPABASE_ANON_KEY.length,
    keyPrefix: SUPABASE_ANON_KEY.substring(0, 10) + '...'
});

// Check if Supabase is loaded
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase library not loaded! Make sure the CDN link is working.');
} else {
    console.log('✅ Supabase library loaded successfully');
}

// Initialize Supabase client
let supabaseClient;
try {
    console.log('🔄 Creating Supabase client...');
    const { createClient } = supabase;
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized successfully');
} catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
}

// Configuration object
const config = {
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY,
    tables: {
        vehicles: 'vehicles',
        drivers: 'driver_profiles',
        customers: 'customer_profiles',
        rides: 'rides',
        users: 'users'
    }
};

// Export for use in other files
window.supabase = supabaseClient;
window.config = config;

console.log('🔄 Supabase config file loaded, client available:', !!window.supabase);

// Utility functions
const utils = {
    // Format currency
    formatCurrency: (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    },

    // Format date
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    },

    // Show loading state
    showLoading: () => {
        console.log('🔄 Utils: showLoading called');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'flex';
            console.log('✅ Loading overlay shown');
        } else {
            console.warn('⚠️ Loading overlay element not found');
        }
    },

    // Hide loading state
    hideLoading: () => {
        console.log('🔄 Utils: hideLoading called');
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
            console.log('✅ Loading overlay hidden');
        } else {
            console.warn('⚠️ Loading overlay element not found');
        }
    },

    // Show error message
    showError: (message) => {
        console.log('🚨 Utils: showError called with message:', message);
        // Create a better error notification
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        errorDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-exclamation-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: auto;">×</button>
            </div>
        `;
        document.body.appendChild(errorDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    },

    // Show success message
    showSuccess: (message) => {
        console.log('✅ Utils: showSuccess called with message:', message);
        // Create a better success notification
        const successDiv = document.createElement('div');
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            z-index: 9999;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        `;
        successDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <i class="fas fa-check-circle"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; margin-left: auto;">×</button>
            </div>
        `;
        document.body.appendChild(successDiv);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (successDiv.parentElement) {
                successDiv.remove();
            }
        }, 3000);
    },

    // Validate email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
};

window.utils = utils;

console.log('🔄 Utils object attached to window:', !!window.utils);