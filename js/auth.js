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
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            // Check if Supabase is properly loaded
            if (!window.supabase) {
                console.error('Supabase not loaded yet, retrying...');
                setTimeout(() => this.init(), 1000);
                return;
            }

            // Check if user is already logged in
            const { data: { user }, error } = await window.supabase.auth.getUser();
            
            if (error) {
                console.error('Auth error:', error);
            }
            
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
            await window.supabase.auth.signOut();
            this.currentUser = null;
        } catch (error) {
            console.error('Sign out error:', error);
        }
    }

    showLogin() {
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loginSection && dashboardSection && loadingOverlay) {
            loginSection.style.display = 'flex';
            dashboardSection.style.display = 'none';
            loadingOverlay.style.display = 'none';
        }

        // Setup login form if not already done
        this.setupLoginForm();
    }

    showDashboard() {
        const loginSection = document.getElementById('loginSection');
        const dashboardSection = document.getElementById('dashboardSection');
        const loadingOverlay = document.getElementById('loadingOverlay');

        if (loginSection && dashboardSection && loadingOverlay) {
            loginSection.style.display = 'none';
            dashboardSection.style.display = 'block';
            loadingOverlay.style.display = 'none';
        }

        // Setup navigation
        this.setupNavigation();

        // Initialize vehicle manager if not already done
        if (!window.vehicleManager) {
            window.vehicleManager = new window.VehicleManager();
            window.vehicleManager.init();
        }
    }

    setupNavigation() {
        // Setup tab navigation
        const navTabs = document.querySelectorAll('.nav-btn');
        const contentSections = document.querySelectorAll('.content-section');

        navTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSection = tab.getAttribute('data-section');

                // Update active tab
                navTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                // Show target section
                contentSections.forEach(section => {
                    section.classList.remove('active');
                });

                // Handle different section names
                let targetElementId;
                if (targetSection === 'vehicles') {
                    targetElementId = 'vehiclesSection';
                } else if (targetSection === 'drivers') {
                    targetElementId = 'driversSection';
                } else if (targetSection === 'customers') {
                    targetElementId = 'customersSection';
                } else if (targetSection === 'rides') {
                    targetElementId = 'ridesSection';
                } else if (targetSection === 'analytics') {
                    targetElementId = 'analyticsSection';
                }

                const targetElement = document.getElementById(targetElementId);
                if (targetElement) {
                    targetElement.classList.add('active');
                }

                // Handle placeholder sections
                if (['drivers', 'customers', 'rides', 'analytics'].includes(targetSection)) {
                    this.showPlaceholderMessage(targetElementId);
                }
            });
        });

        // Setup logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.signOut();
            });
        }
    }

    showPlaceholderMessage(sectionId) {
        const section = document.getElementById(sectionId);
        if (!section) return;

        const sectionNames = {
            driversSection: 'Driver Management',
            customersSection: 'Customer Management', 
            ridesSection: 'Ride Management',
            analyticsSection: 'Analytics & Reports'
        };

        section.innerHTML = `
            <div class="placeholder-content">
                <div class="placeholder-icon">
                    <i class="fas fa-cog fa-spin"></i>
                </div>
                <h2>${sectionNames[sectionId]}</h2>
                <p>This feature is coming soon. Currently focusing on vehicle fleet management.</p>
                <div class="placeholder-features">
                    <h4>Planned Features:</h4>
                    <ul>
                        ${this.getPlaceholderFeatures(sectionId)}
                    </ul>
                </div>
            </div>
        `;
    }

    getPlaceholderFeatures(sectionId) {
        const features = {
            driversSection: [
                'Driver registration and verification',
                'Performance tracking and ratings',
                'Earnings and commission management',
                'Real-time location monitoring'
            ],
            customersSection: [
                'Customer profiles and preferences',
                'Booking history and analytics',
                'Loyalty program management',
                'Support ticket system'
            ],
            ridesSection: [
                'Real-time ride monitoring',
                'Dispatch and routing optimization',
                'Fare calculation and billing',
                'Trip history and reporting'
            ],
            analyticsSection: [
                'Revenue and profit analytics',
                'Driver performance metrics',
                'Customer satisfaction reports',
                'Operational efficiency insights'
            ]
        };

        return features[sectionId]?.map(feature => `<li>${feature}</li>`).join('') || '';
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        
        if (!loginForm) return;

        // Remove existing event listeners to avoid duplicates
        const newForm = loginForm.cloneNode(true);
        loginForm.parentNode.replaceChild(newForm, loginForm);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const emailInput = document.getElementById('email');
            const passwordInput = document.getElementById('password');
            const errorDiv = document.getElementById('loginError');

            if (!emailInput || !passwordInput) return;

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                if (errorDiv) errorDiv.textContent = 'Please enter both email and password.';
                return;
            }

            const result = await this.signIn(email, password);

            if (!result.success) {
                if (errorDiv) {
                    errorDiv.textContent = result.error || 'Login failed. Please try again.';
                }
            }
        });
    }
}

// Global logout function
window.logout = async () => {
    if (window.authManager) {
        await window.authManager.signOut();
    }
};