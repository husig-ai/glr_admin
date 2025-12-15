// Vehicle Management

class VehicleManager {
    constructor() {
        this.vehicles = [];
        this.currentVehicle = null;
        this.vehicleToDelete = null;
        this.isInitialized = false;
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

        // Add vehicle button
        if (addBtn) {
            addBtn.addEventListener('click', () => {
                this.showVehicleModal();
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

    async loadVehicles() {
        try {
            utils.showLoading();

            const { data, error } = await window.supabase
                .from('vehicles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            this.vehicles = data || [];
            this.renderVehicles();
            this.updateStats();

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

        if (this.vehicles.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="no-data">
                        <i class="fas fa-car"></i>
                        <h3>No vehicles found</h3>
                        <p>Get started by adding your first vehicle to the fleet.</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = this.vehicles.map(vehicle => `
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
            // Add mode
            title.textContent = 'Add New Vehicle';
        }

        modal.style.display = 'flex';
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
            this.vehicleToDelete = vehicleId;
            const deleteVehicleName = document.getElementById('deleteVehicleName');
            if (deleteVehicleName) {
                deleteVehicleName.textContent = `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
            }
            this.showDeleteModal();
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
        this.vehicleToDelete = null;
    }

    async confirmDelete() {
        if (!this.vehicleToDelete) return;

        try {
            utils.showLoading();
            this.hideDeleteModal();

            const { error } = await window.supabase
                .from('vehicles')
                .delete()
                .eq('id', this.vehicleToDelete);

            if (error) throw error;

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