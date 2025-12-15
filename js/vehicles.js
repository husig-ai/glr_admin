// Vehicle Management

class VehicleManager {
    constructor() {
        this.vehicles = [];
        this.filteredVehicles = [];
        this.currentVehicle = null;
        this.vehicleToDelete = null;
        this.isInitialized = false;
        this.searchTerm = '';
        this.sortBy = 'created_at-desc';
    }

    init() {
        if (this.isInitialized) return;
        this.setupEventListeners();
        this.loadVehicles();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Safely get elements and only add listeners if they exist
        const addBtn = document.getElementById('addVehicleBtn');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const vehicleForm = document.getElementById('vehicleForm');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const closeDeleteModalBtn = document.getElementById('closeDeleteModalBtn');
        const vehicleModal = document.getElementById('vehicleModal');
        const deleteModal = document.getElementById('deleteModal');
        const searchInput = document.getElementById('vehicleSearch');
        const sortSelect = document.getElementById('vehicleSort');

        // Add vehicle button
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showVehicleModal();
            });
        }

        // Search functionality
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchTerm = e.target.value.toLowerCase();
                this.filterAndSort();
            });
        }

        // Sort functionality
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortBy = e.target.value;
                this.filterAndSort();
            });
        }

        // Modal close buttons
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.hideVehicleModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideVehicleModal();
            });
        }

        // Vehicle form submission
        if (vehicleForm) {
            vehicleForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveVehicle();
            });
        }

        // Delete confirmation modal
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        if (closeDeleteModalBtn) {
            closeDeleteModalBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }

        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }

        // Close modals when clicking outside
        if (vehicleModal) {
            vehicleModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideVehicleModal();
                }
            });
        }

        if (deleteModal) {
            deleteModal.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) {
                    this.hideDeleteModal();
                }
            });
        }
    }

    filterAndSort() {
        // Filter vehicles based on search term
        this.filteredVehicles = this.vehicles.filter(vehicle => {
            if (!this.searchTerm) return true;
            
            const searchFields = [
                vehicle.make,
                vehicle.model,
                vehicle.color,
                vehicle.license_plate,
                vehicle.type,
                `${vehicle.year}`,
                `${vehicle.year} ${vehicle.make} ${vehicle.model}`
            ].map(field => field.toLowerCase());
            
            return searchFields.some(field => field.includes(this.searchTerm));
        });

        // Sort filtered vehicles
        const [field, direction] = this.sortBy.split('-');
        this.filteredVehicles.sort((a, b) => {
            let aVal, bVal;
            
            switch (field) {
                case 'make':
                case 'model':
                case 'color':
                case 'type':
                case 'license_plate':
                    aVal = a[field].toLowerCase();
                    bVal = b[field].toLowerCase();
                    break;
                case 'year':
                case 'base_price':
                case 'price_per_km':
                    aVal = a[field];
                    bVal = b[field];
                    break;
                case 'created_at':
                    aVal = new Date(a[field]);
                    bVal = new Date(b[field]);
                    break;
                default:
                    aVal = a.created_at;
                    bVal = b.created_at;
            }
            
            if (direction === 'asc') {
                return aVal > bVal ? 1 : -1;
            } else {
                return aVal < bVal ? 1 : -1;
            }
        });

        this.renderVehicles();
        this.updateStats();
    }

    async loadVehicles() {
        try {
            utils.showLoading();

            const { data, error } = await window.supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.vehicles = data || [];
            this.filteredVehicles = [...this.vehicles];
            this.filterAndSort();

        } catch (error) {
            console.error('Load vehicles error:', error);
            utils.showError('Failed to load vehicles: ' + (error.message || 'Unknown error'));
        } finally {
            utils.hideLoading();
        }
    }

    renderVehicles() {
        const tableBody = document.getElementById('vehiclesTableBody');
        if (!tableBody) {
            console.warn('Vehicle table body not found');
            return;
        }

        if (this.filteredVehicles.length === 0) {
            const noDataMessage = this.searchTerm ? 
                `No vehicles found matching "${this.searchTerm}"` : 
                'No vehicles found';
            
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-car"></i>
                        <h3>${noDataMessage}</h3>
                        <p>${this.searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding your first vehicle to the fleet.'}</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = this.filteredVehicles.map(vehicle => `
            <tr>
                <td>
                    <div class="vehicle-info">
                        ${vehicle.image_url ? 
                            `<img src="${vehicle.image_url}" alt="${vehicle.make} ${vehicle.model}" class="vehicle-image">` :
                            '<div class="vehicle-placeholder"><i class="fas fa-car"></i></div>'
                        }
                        <div class="vehicle-details">
                            <h4>${vehicle.year} ${vehicle.make} ${vehicle.model}</h4>
                            <p>${vehicle.color}</p>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="vehicle-type">${vehicle.type}</span>
                </td>
                <td>
                    <span class="license-plate">${vehicle.license_plate}</span>
                </td>
                <td>
                    <span class="status-badge ${vehicle.is_available ? 'status-available' : 'status-unavailable'}">
                        ${vehicle.is_available ? 'Available' : 'Out of Service'}
                    </span>
                </td>
                <td>
                    <span class="price">${utils.formatCurrency(vehicle.price_per_km)}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="window.vehicleManager.editVehicle('${vehicle.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="delete-btn" onclick="window.vehicleManager.deleteVehicle('${vehicle.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    updateStats() {
        const total = this.vehicles.length;
        const available = this.vehicles.filter(v => v.is_available).length;
        const unavailable = total - available;

        // Safely update stats with null checks
        const totalEl = document.getElementById('totalVehicles');
        const availableEl = document.getElementById('availableVehicles');
        const inServiceEl = document.getElementById('inServiceVehicles');
        const maintenanceEl = document.getElementById('maintenanceVehicles');

        if (totalEl) totalEl.textContent = total;
        if (availableEl) availableEl.textContent = available;
        if (inServiceEl) inServiceEl.textContent = '0'; // TODO: Get from rides table
        if (maintenanceEl) maintenanceEl.textContent = unavailable;
    }

    showVehicleModal(vehicle = null) {
        this.currentVehicle = vehicle;
        const modal = document.getElementById('vehicleModal');
        const form = document.getElementById('vehicleForm');
        const title = document.getElementById('modalTitle');

        if (!modal || !form || !title) {
            console.warn('Modal elements not found');
            return;
        }

        // Reset form
        form.reset();

        if (vehicle) {
            // Edit mode
            title.textContent = 'Edit Vehicle';
            this.populateForm(vehicle);
        } else {
            // Add mode - fill with test data for easier testing
            title.textContent = 'Add New Vehicle';
            this.fillTestData();
        }

        modal.style.display = 'flex';
    }

    fillTestData() {
        // Generate random test data for easier testing
        const testMakes = ['Mercedes-Benz', 'BMW', 'Audi', 'Lexus', 'Cadillac', 'Tesla'];
        const testModels = ['S-Class', 'X7', 'A8', 'LS', 'Escalade', 'Model S'];
        const testColors = ['Black', 'White', 'Silver', 'Navy Blue', 'Charcoal'];
        const testTypes = ['Sedan', 'SUV', 'Van', 'Limousine'];

        const randomMake = testMakes[Math.floor(Math.random() * testMakes.length)];
        const randomModel = testModels[Math.floor(Math.random() * testModels.length)];
        const randomColor = testColors[Math.floor(Math.random() * testColors.length)];
        const randomType = testTypes[Math.floor(Math.random() * testTypes.length)];
        const randomYear = 2020 + Math.floor(Math.random() * 5); // 2020-2024
        const randomLicense = 'GLR' + Math.floor(Math.random() * 900 + 100); // GLR100-GLR999

        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        };

        setValue('make', randomMake);
        setValue('model', randomModel);
        setValue('year', randomYear);
        setValue('color', randomColor);
        setValue('licensePlate', randomLicense);
        setValue('type', randomType);
        setValue('basePrice', '50.00');
        setValue('pricePerKm', '2.50');
        setValue('capacity', '4');
        setValue('isAvailable', 'true');
        setValue('imageUrl', '');
    }

    hideVehicleModal() {
        const modal = document.getElementById('vehicleModal');
        if (modal) {
            modal.style.display = 'none';
        }
        this.currentVehicle = null;
    }

    populateForm(vehicle) {
        // Helper function to safely set form values
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element) {
                element.value = value || '';
            } else {
                console.warn(`Element with ID '${id}' not found`);
            }
        };

        setValue('make', vehicle.make);
        setValue('model', vehicle.model);
        setValue('year', vehicle.year);
        setValue('color', vehicle.color);
        setValue('licensePlate', vehicle.license_plate);
        setValue('type', vehicle.type);
        setValue('basePrice', vehicle.base_price);
        setValue('pricePerKm', vehicle.price_per_km);
        setValue('capacity', vehicle.capacity);
        setValue('isAvailable', vehicle.is_available ? 'true' : 'false');
        setValue('imageUrl', vehicle.image_url);
    }

    async saveVehicle() {
        const form = document.getElementById('vehicleForm');
        if (!form) {
            utils.showError('Form not found');
            return;
        }

        const submitBtn = document.getElementById('saveBtn');
        const saveText = document.getElementById('saveText');

        try {
            // Show loading state
            if (submitBtn) {
                submitBtn.disabled = true;
            }
            if (saveText) {
                saveText.textContent = 'Saving...';
            }

            // Helper function to safely get form values
            const getValue = (id) => {
                const element = document.getElementById(id);
                return element ? element.value.trim() : '';
            };

            // Collect form data
            const vehicleData = {
                make: getValue('make'),
                model: getValue('model'),
                year: parseInt(getValue('year')),
                color: getValue('color'),
                license_plate: getValue('licensePlate').toUpperCase(),
                type: getValue('type'),
                base_price: parseFloat(getValue('basePrice')) || 0,
                price_per_km: parseFloat(getValue('pricePerKm')) || 0,
                capacity: parseInt(getValue('capacity')) || 4,
                is_available: getValue('isAvailable') === 'true',
                image_url: getValue('imageUrl') || null
            };

            // Validate required fields
            if (!vehicleData.make || !vehicleData.model || !vehicleData.year || !vehicleData.color || !vehicleData.license_plate || !vehicleData.type) {
                throw new Error('Please fill in all required fields.');
            }

            if (vehicleData.year < 1900 || vehicleData.year > new Date().getFullYear() + 2) {
                throw new Error('Please enter a valid year.');
            }

            let result;
            if (this.currentVehicle) {
                // Update existing vehicle
                result = await window.supabase
                    .from('vehicles')
                    .update(vehicleData)
                    .eq('id', this.currentVehicle.id);
            } else {
                // Create new vehicle
                result = await window.supabase
                    .from('vehicles')
                    .insert([vehicleData]);
            }

            if (result.error) {
                throw result.error;
            }

            // Success
            this.hideVehicleModal();
            this.loadVehicles();
            utils.showSuccess(this.currentVehicle ? 'Vehicle updated successfully!' : 'Vehicle added successfully!');

        } catch (error) {
            console.error('Error saving vehicle:', error);
            utils.showError('Failed to save vehicle: ' + (error.message || error));
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
            }
            if (saveText) {
                saveText.textContent = 'Save Vehicle';
            }
        }
    }

    editVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            this.showVehicleModal(vehicle);
        }
    }

    deleteVehicle(vehicleId) {
        const vehicle = this.vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            this.vehicleToDelete = vehicleId; // Store the actual vehicle ID
            const deleteVehicleName = document.getElementById('deleteVehicleName');
            if (deleteVehicleName) {
                deleteVehicleName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            }
            this.showDeleteModal();
        } else {
            console.error('Vehicle not found for deletion:', vehicleId);
            utils.showError('Vehicle not found');
        }
    }

    showDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            modal.style.display = 'none';
        }
        // Don't reset vehicleToDelete here - only reset after successful deletion
    }

    async confirmDelete() {
        if (!this.vehicleToDelete) {
            utils.showError('No vehicle selected for deletion');
            return;
        }

        console.log('Deleting vehicle with ID:', this.vehicleToDelete); // Debug log

        try {
            utils.showLoading();
            this.hideDeleteModal();

            const { error } = await window.supabase
                .from('vehicles')
                .delete()
                .eq('id', this.vehicleToDelete);

            if (error) {
                console.error('Supabase delete error:', error);
                throw error;
            }

            // Clear the vehicleToDelete only after successful deletion
            this.vehicleToDelete = null;
            
            this.loadVehicles();
            utils.showSuccess('Vehicle deleted successfully!');

        } catch (error) {
            console.error('Error deleting vehicle:', error);
            utils.showError('Failed to delete vehicle: ' + (error.message || error));
        } finally {
            utils.hideLoading();
        }
    }
}

// Export for global access - will be initialized after login
window.VehicleManager = VehicleManager;