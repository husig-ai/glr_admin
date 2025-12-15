// Authentication Management

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    async init() {
        try {
            // Add delay for GitHub Pages or custom domains
            const isGitHubPages = window.location.hostname.includes('github.io') || 
                                 window.location.hostname.includes('husig.ai');
            
            if (isGitHubPages) {
                console.log('GitHub Pages or custom domain detected - adding initialization delay');
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Check if Supabase is properly loaded
            if (!window.supabase) {
                console.error('Supabase not loaded yet, retrying...');
                setTimeout(() => this.init(), 1000);
                return;
            }

            // Check if user is already logged in
            const { data: { user } } = await window.supabase.auth.getUser();
            if (user) {
                this.currentUser = user;
                this.showDashboard();
            } else {
                this.showLogin();
            }

            // Listen for auth changes
            window.supabase.auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.showDashboard();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.showLogin();
                }
            });
        } catch (error) {
            console.error('Auth initialization error:', error);
            this.showLogin();
        }
    }

    async signIn(email, password) {
        try {
            utils.showLoading();
            
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            this.currentUser = data.user;
            utils.hideLoading();
            return { success: true };

        } catch (error) {
            utils.hideLoading();
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        try {
            utils.showLoading();
            
            const { error } = await window.supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            this.currentUser = null;
            utils.hideLoading();
            
        } catch (error) {
            utils.hideLoading();
            utils.showError('Error signing out: ' + error.message);
        }
    }

    showLogin() {
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('dashboardSection').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('dashboardSection').style.display = 'block';
        
        // Update UI with user info
        if (this.currentUser) {
            document.getElementById('userEmail').textContent = this.currentUser.email;
        }

        // Initialize vehicle manager if not already done
        if (!window.vehicleManager) {
            window.vehicleManager = new window.VehicleManager();
            window.vehicleManager.init();
        } else {
            // Just load vehicles if already initialized
            window.vehicleManager.loadVehicles();
        }
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
window.authManager = new AuthManager();

// Login form handler
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate inputs
        if (!email || !password) {
            showLoginError('Please enter both email and password.');
            return;
        }

        if (!utils.isValidEmail(email)) {
            showLoginError('Please enter a valid email address.');
            return;
        }

        // Show loading state
        const submitBtn = loginForm.querySelector('.login-btn');
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';
        submitBtn.disabled = true;
        hideLoginError();

        // Attempt login
        const result = await authManager.signIn(email, password);

        // Reset button state
        btnText.style.display = 'block';
        btnLoading.style.display = 'none';
        submitBtn.disabled = false;

        if (!result.success) {
            showLoginError(result.error || 'Login failed. Please try again.');
        }
    });

    // Logout button handler
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to sign out?')) {
            await authManager.signOut();
        }
    });

    function showLoginError(message) {
        loginError.textContent = message;
        loginError.style.display = 'block';
    }

    function hideLoginError() {
        loginError.style.display = 'none';
    }
});