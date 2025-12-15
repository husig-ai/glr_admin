// Authentication Management

console.log('🔄 Loading auth.js...');

class AuthManager {
    constructor() {
        console.log('🔐 AuthManager constructor called');
        this.currentUser = null;
        this.init();
        console.log('✅ AuthManager constructor completed');
    }

    async init() {
        console.log('🔄 AuthManager.init() started');
        
        try {
            // Add delay for GitHub Pages or custom domains
            const isGitHubPages = window.location.hostname.includes('github.io') || 
                                 window.location.hostname.includes('husig.ai');
            
            console.log('🌐 Domain check complete. Is GitHub Pages/Custom Domain?', isGitHubPages);
            console.log('🌐 Current hostname:', window.location.hostname);
            
            if (isGitHubPages) {
                console.log('⏰ Adding initialization delay for static hosting...');
                await new Promise(resolve => setTimeout(resolve, 1000));
                console.log('⏰ Initialization delay complete');
            }

            // Check if Supabase is properly loaded
            console.log('🔍 Checking if Supabase is loaded...', !!window.supabase);
            if (!window.supabase) {
                console.error('❌ Supabase not loaded yet, retrying...');
                setTimeout(() => this.init(), 1000);
                return;
            }

            console.log('✅ Supabase client found, proceeding with auth check');

            // Check if user is already logged in
            console.log('👤 Calling supabase.auth.getUser()...');
            
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            console.log('👤 getUser() completed');
            console.log('👤 User found:', !!user);
            console.log('👤 Auth error:', error);
            
            if (error) {
                console.error('🚨 Auth error details:', error);
            }
            
            if (user) {
                console.log('✅ User authenticated, showing dashboard');
                this.currentUser = user;
                this.showDashboard();
            } else {
                console.log('🔓 No user found, showing login');
                this.showLogin();
            }

            // Listen for auth changes
            console.log('🔄 Setting up auth state change listener');
            window.supabase.auth.onAuthStateChange((event, session) => {
                console.log('🔄 Auth state changed:', event, !!session);
                if (event === 'SIGNED_IN') {
                    this.currentUser = session.user;
                    this.showDashboard();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.showLogin();
                }
            });
            
        } catch (error) {
            console.error('🚨 Auth initialization error:', error);
            console.error('🚨 Error stack:', error.stack);
            this.showLogin();
        }
    }

    async signIn(email, password) {
        console.log('🔄 Sign in attempt for:', email);
        
        try {
            utils.showLoading();
            
            const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            console.log('🔄 Sign in response:', { user: !!data?.user, error });

            if (error) {
                console.error('🚨 Sign in error:', error);
                throw error;
            }

            this.currentUser = data.user;
            utils.hideLoading();
            console.log('✅ Sign in successful');
            return { success: true };

        } catch (error) {
            console.error('🚨 Sign in exception:', error);
            utils.hideLoading();
            return { success: false, error: error.message };
        }
    }

    async signOut() {
        console.log('🔄 Sign out initiated');
        
        try {
            await window.supabase.auth.signOut();
            this.currentUser = null;
            console.log('✅ Sign out successful');
        } catch (error) {
            console.error('🚨 Sign out error:', error);
        }
    }

    showLogin() {
        console.log('🔄 Showing login form');
        
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loginSection && dashboardSection && loadingOverlay) {
            loginSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
            loadingOverlay.style.display = 'none';
            console.log('✅ Login form displayed');
        } else {
            console.error('❌ Login form elements not found:', {
                loginSection: !!loginSection,
                dashboardSection: !!dashboardSection,
                loadingOverlay: !!loadingOverlay
            });
        }

        // Setup login form if not already done
        this.setupLoginForm();
    }

    showDashboard() {
        console.log('🔄 Showing dashboard');
        
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loginSection && dashboardSection && loadingOverlay) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadingOverlay.style.display = 'none';
            console.log('✅ Dashboard displayed');
        } else {
            console.error('❌ Dashboard elements not found:', {
                loginSection: !!loginSection,
                dashboardSection: !!dashboardSection,
                loadingOverlay: !!loadingOverlay
            });
        }

        // Initialize vehicle manager if not already done
        if (!window.vehicleManager) {
            console.log('🔄 Initializing VehicleManager');
            window.vehicleManager = new window.VehicleManager();
            window.vehicleManager.init();
            console.log('✅ VehicleManager initialized');
        }
    }

    setupLoginForm() {
        console.log('🔄 Setting up login form');
        
        const loginForm = document.getElementById('loginForm');
        
        if (!loginForm) {
            console.error('❌ Login form not found');
            return;
        }

        // Remove existing event listeners to avoid duplicates
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('🔄 Login form submitted');

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const errorDiv = document.getElementById('loginError');

            if (!emailInput || !passwordInput) {
                console.error('❌ Login form inputs not found');
                return;
            }

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            console.log('🔄 Attempting login with email:', email);

            if (!email || !password) {
                const errorMsg = 'Please enter both email and password.';
                console.warn('⚠️ Login validation failed:', errorMsg);
                if (errorDiv) errorDiv.textContent = errorMsg;
                return;
            }

            const result = await this.signIn(email, password);

            if (!result.success) {
                console.error('🚨 Login failed:', result.error);
                if (errorDiv) {
                    errorDiv.textContent = result.error || 'Login failed. Please try again.';
                }
            }
        });

        console.log('✅ Login form event listener attached');
    }
}

// Global logout function
window.logout = async () => {
    console.log('🔄 Global logout called');
    if (window.authManager) {
        await window.authManager.signOut();
    }
};

console.log('✅ Auth.js loaded completely');