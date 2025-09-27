// EU AI Act Incident Reporting Platform
// JavaScript Application Logic

class IncidentReportingPlatform {
    constructor() {
        this.currentPage = 'home';
        this.currentStep = 1;
        this.totalSteps = 5;
        this.currentIncidentId = null;
        this.formData = {};
        this.incidents = this.loadIncidents();
        
        // Data from the application
        this.data = {
            incidentClassifications: [
                "Death",
                "Harm to a person's health", 
                "Disruption of the management of critical infrastructure",
                "Disruption of the operation of critical infrastructure",
                "Infringement of obligations under Union law intended to protect fundamental rights",
                "Harm to property",
                "Harm to environment",
                "All other reportable incidents"
            ],
            reportTypes: [
                "Initial",
                "Follow up", 
                "Combined initial and final",
                "Final (Reportable incident)",
                "Final (Non-reportable incident)"
            ],
            submitterTypes: [
                "Provider",
                "Deployer", 
                "Authorised representative",
                "Other"
            ],
            operatorTypes: [
                "Professional user",
                "Other"
            ],
            euCountries: [
                "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", 
                "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary",
                "Ireland", "Italy", "Latvia", "Lithuania", "Luxembourg", "Malta", 
                "Netherlands", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", 
                "Spain", "Sweden"
            ]
        };

        this.init();
    }

    init() {
        this.setupEventListeners();
        this.populateSelects();
        this.updateDashboard();
        this.updateAdminDashboard();
        this.setCurrentDate();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.navigateToPage(e.target.dataset.page);
            });
        });

        // Page actions
        document.querySelectorAll('[data-action="start-report"]').forEach(btn => {
            btn.addEventListener('click', () => this.startNewReport());
        });

        document.querySelectorAll('[data-action="view-dashboard"]').forEach(btn => {
            btn.addEventListener('click', () => this.navigateToPage('dashboard'));
        });

        // Form navigation
        document.getElementById('next-btn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prev-btn')?.addEventListener('click', () => this.prevStep());
        document.getElementById('save-draft-btn')?.addEventListener('click', () => this.saveDraft());
        document.getElementById('submit-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Form submission
        document.getElementById('incident-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitReport();
        });

        // Dynamic form fields
        document.getElementById('submitter-type')?.addEventListener('change', (e) => {
            this.updateSubmitterFields(e.target.value);
        });

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', () => this.closeModal());
        });

        document.getElementById('print-report')?.addEventListener('click', () => this.printReport());

        // Dashboard filters
        document.getElementById('filter-status')?.addEventListener('change', () => this.filterIncidents());
        document.getElementById('filter-classification')?.addEventListener('change', () => this.filterIncidents());
        document.getElementById('filter-search')?.addEventListener('input', () => this.filterIncidents());

        // Admin actions
        document.getElementById('download-schema')?.addEventListener('click', () => this.downloadDatabaseSchema());
        document.getElementById('export-all-data')?.addEventListener('click', () => this.exportAllData());
        document.getElementById('export-reports')?.addEventListener('click', () => this.exportReports());

        // Close modal on outside click
        document.getElementById('incident-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'incident-modal') {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    populateSelects() {
        // Populate authority countries
        const authorityCountrySelect = document.getElementById('authority-country');
        if (authorityCountrySelect) {
            this.data.euCountries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                authorityCountrySelect.appendChild(option);
            });
        }

        // Populate report types
        const reportTypeSelect = document.getElementById('report-type');
        if (reportTypeSelect) {
            this.data.reportTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                reportTypeSelect.appendChild(option);
            });
        }

        // Populate incident classifications
        const classificationSelects = document.querySelectorAll('#incident-classification, #filter-classification');
        classificationSelects.forEach(select => {
            this.data.incidentClassifications.forEach(classification => {
                const option = document.createElement('option');
                option.value = classification;
                option.textContent = classification;
                select.appendChild(option);
            });
        });

        // Populate submitter types
        const submitterTypeSelect = document.getElementById('submitter-type');
        if (submitterTypeSelect) {
            this.data.submitterTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                submitterTypeSelect.appendChild(option);
            });
        }

        // Populate operator types
        const operatorTypeSelect = document.getElementById('operator-type');
        if (operatorTypeSelect) {
            this.data.operatorTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type;
                option.textContent = type;
                operatorTypeSelect.appendChild(option);
            });
        }
    }

    setCurrentDate() {
        const reportDateInput = document.getElementById('report-date');
        if (reportDateInput) {
            const today = new Date().toISOString().split('T')[0];
            reportDateInput.value = today;
        }
    }

    navigateToPage(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

        // Show selected page
        document.getElementById(`${page}-page`).classList.add('active');
        document.querySelector(`.nav-btn[data-page="${page}"]`)?.classList.add('active');

        this.currentPage = page;

        if (page === 'dashboard') {
            this.updateDashboard();
        } else if (page === 'admin') {
            this.updateAdminDashboard();
        }
    }

    startNewReport() {
        this.currentIncidentId = this.generateIncidentId();
        this.formData = {};
        this.currentStep = 1;
        this.resetForm();
        this.navigateToPage('report');
        this.updateProgress();
    }

    generateIncidentId() {
        return 'AI-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    resetForm() {
        const form = document.getElementById('incident-form');
        if (form) {
            form.reset();
        }
        this.setCurrentDate();
        this.updateSubmitterFields('');
    }

    updateSubmitterFields(submitterType) {
        const container = document.getElementById('submitter-fields');
        if (!container) return;

        container.innerHTML = '';

        if (!submitterType) return;

        // Common fields for all submitter types
        const commonFields = `
            <div class="form-group">
                <label class="form-label" for="submitter-name">${submitterType} Name *</label>
                <input type="text" id="submitter-name" name="submitterName" class="form-control" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="submitter-email">Email Address *</label>
                <input type="email" id="submitter-email" name="submitterEmail" class="form-control" required>
            </div>
            <div class="form-group">
                <label class="form-label" for="submitter-phone">Phone Number</label>
                <input type="tel" id="submitter-phone" name="submitterPhone" class="form-control">
            </div>
            <div class="form-group">
                <label class="form-label" for="submitter-address">Address *</label>
                <textarea id="submitter-address" name="submitterAddress" class="form-control" rows="3" required></textarea>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label" for="submitter-city">City *</label>
                    <input type="text" id="submitter-city" name="submitterCity" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="submitter-postal">Postal Code *</label>
                    <input type="text" id="submitter-postal" name="submitterPostal" class="form-control" required>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label" for="submitter-country">Country *</label>
                <select id="submitter-country" name="submitterCountry" class="form-control" required>
                    <option value="">Select country</option>
                    ${this.data.euCountries.map(country => `<option value="${country}">${country}</option>`).join('')}
                </select>
            </div>
        `;

        container.innerHTML = commonFields;

        // Add specific fields based on submitter type
        if (submitterType === 'Provider') {
            container.innerHTML += `
                <div class="form-group">
                    <label class="form-label" for="registration-number">Registration Number</label>
                    <input type="text" id="registration-number" name="registrationNumber" class="form-control">
                </div>
                <div class="form-group">
                    <label class="form-label" for="vat-number">VAT Number</label>
                    <input type="text" id="vat-number" name="vatNumber" class="form-control">
                </div>
            `;
        } else if (submitterType === 'Authorised representative') {
            container.innerHTML += `
                <div class="form-group">
                    <label class="form-label" for="represented-provider">Represented Provider Name *</label>
                    <input type="text" id="represented-provider" name="representedProvider" class="form-control" required>
                </div>
                <div class="form-group">
                    <label class="form-label" for="authorization-number">Authorization Number</label>
                    <input type="text" id="authorization-number" name="authorizationNumber" class="form-control">
                </div>
            `;
        }
    }

    updateProgress() {
        // Update progress steps
        document.querySelectorAll('.progress-step').forEach((step, index) => {
            const stepNumber = index + 1;
            step.classList.toggle('active', stepNumber === this.currentStep);
            step.classList.toggle('completed', stepNumber < this.currentStep);
        });

        // Show/hide sections
        document.querySelectorAll('.form-section').forEach((section, index) => {
            section.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update navigation buttons
        const prevBtn = document.getElementById('prev-btn');
        const nextBtn = document.getElementById('next-btn');
        const submitBtn = document.getElementById('submit-btn');

        if (prevBtn) prevBtn.style.display = this.currentStep === 1 ? 'none' : 'block';
        if (nextBtn) nextBtn.style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        if (submitBtn) submitBtn.style.display = this.currentStep === this.totalSteps ? 'block' : 'none';

        // Update form summary on last step
        if (this.currentStep === this.totalSteps) {
            this.updateFormSummary();
        }
    }

    nextStep() {
        if (this.validateCurrentStep()) {
            this.saveFormData();
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateProgress();
            }
        }
    }

    prevStep() {
        this.saveFormData();
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateProgress();
        }
    }

    validateCurrentStep() {
        const currentSection = document.querySelector(`.form-section[data-section="${this.currentStep}"]`);
        const requiredFields = currentSection.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                this.showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                this.clearFieldError(field);
            }

            // Email validation
            if (field.type === 'email' && field.value && !this.isValidEmail(field.value)) {
                this.showFieldError(field, 'Please enter a valid email address');
                isValid = false;
            }
        });

        if (!isValid) {
            this.showMessage('Please fill in all required fields', 'error');
        }

        return isValid;
    }

    showFieldError(field, message) {
        this.clearFieldError(field);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = 'var(--color-error)';
        errorDiv.style.fontSize = 'var(--font-size-sm)';
        errorDiv.style.marginTop = 'var(--space-4)';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = 'var(--color-error)';
    }

    clearFieldError(field) {
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        field.style.borderColor = '';
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    saveFormData() {
        const form = document.getElementById('incident-form');
        if (!form) return;

        const formDataObj = new FormData(form);
        for (let [key, value] of formDataObj.entries()) {
            this.formData[key] = value;
        }
    }

    updateFormSummary() {
        const summaryContainer = document.getElementById('form-summary');
        if (!summaryContainer) return;

        this.saveFormData();

        const summary = `
            <div class="summary-item">
                <strong>Report Type:</strong> ${this.formData.reportType || 'Not specified'}
            </div>
            <div class="summary-item">
                <strong>Classification:</strong> ${this.formData.incidentClassification || 'Not specified'}
            </div>
            <div class="summary-item">
                <strong>Submitter:</strong> ${this.formData.submitterType || 'Not specified'}
            </div>
            <div class="summary-item">
                <strong>Authority:</strong> ${this.formData.authorityName || 'Not specified'} (${this.formData.authorityCountry || 'Not specified'})
            </div>
            <div class="summary-item">
                <strong>System Description:</strong> ${this.formData.systemDescription ? (this.formData.systemDescription.substring(0, 100) + (this.formData.systemDescription.length > 100 ? '...' : '')) : 'Not specified'}
            </div>
        `;

        summaryContainer.innerHTML = summary;
    }

    saveDraft() {
        this.saveFormData();
        const incident = {
            id: this.currentIncidentId,
            ...this.formData,
            status: 'draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.incidents[this.currentIncidentId] = incident;
        this.saveIncidents();
        this.showMessage('Draft saved successfully', 'success');
    }

    submitReport() {
        if (!this.validateCurrentStep()) {
            return;
        }

        this.saveFormData();

        // Check legal affirmation
        if (!this.formData.legalAffirmation) {
            this.showMessage('Please confirm the legal affirmation to submit the report', 'error');
            return;
        }

        this.showLoading(true);

        // Simulate submission delay
        setTimeout(() => {
            const incident = {
                id: this.currentIncidentId,
                ...this.formData,
                status: 'submitted',
                priority: this.calculatePriority(this.formData.incidentClassification),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                submittedAt: new Date().toISOString()
            };

            this.incidents[this.currentIncidentId] = incident;
            this.saveIncidents();
            
            this.showLoading(false);
            this.showMessage(`Report submitted successfully. Incident ID: ${this.currentIncidentId}`, 'success');
            
            setTimeout(() => {
                this.navigateToPage('dashboard');
            }, 2000);
        }, 1500);
    }

    calculatePriority(classification) {
        const highPriority = ['Death', 'Harm to a person\'s health', 'Disruption of the management of critical infrastructure'];
        const mediumPriority = ['Disruption of the operation of critical infrastructure', 'Infringement of obligations under Union law intended to protect fundamental rights'];
        
        if (highPriority.includes(classification)) return 'high';
        if (mediumPriority.includes(classification)) return 'medium';
        return 'low';
    }

    loadIncidents() {
        try {
            const stored = localStorage.getItem('ai_incidents');
            return stored ? JSON.parse(stored) : {};
        } catch (e) {
            console.error('Error loading incidents:', e);
            return {};
        }
    }

    saveIncidents() {
        try {
            localStorage.setItem('ai_incidents', JSON.stringify(this.incidents));
        } catch (e) {
            console.error('Error saving incidents:', e);
            this.showMessage('Error saving data', 'error');
        }
    }

    updateDashboard() {
        const tableBody = document.getElementById('incidents-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        const incidents = Object.values(this.incidents);
        
        if (incidents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="7" style="text-align: center; padding: var(--space-32);">
                        No incidents reported yet. <a href="#" onclick="app.startNewReport()">Report your first incident</a>
                    </td>
                </tr>
            `;
            return;
        }

        incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        incidents.forEach(incident => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${incident.id}</td>
                <td>${new Date(incident.createdAt).toLocaleDateString()}</td>
                <td>${incident.incidentClassification || 'Not specified'}</td>
                <td>${incident.reportType || 'Not specified'}</td>
                <td><span class="status-badge status-badge--${incident.status}">${incident.status}</span></td>
                <td>${incident.submitterType || 'Unknown'}</td>
                <td>
                    <button class="action-btn action-btn--view" onclick="app.viewIncident('${incident.id}')">View</button>
                    ${incident.status === 'draft' ? `<button class="action-btn action-btn--edit" onclick="app.editIncident('${incident.id}')">Edit</button>` : ''}
                </td>
            `;
            tableBody.appendChild(row);
        });

        this.updateFilteredResults();
    }

    updateAdminDashboard() {
        // Update statistics
        const incidents = Object.values(this.incidents);
        const totalReports = incidents.length;
        const pendingReports = incidents.filter(i => i.status === 'submitted').length;
        const urgentReports = incidents.filter(i => i.priority === 'high').length;

        document.getElementById('total-reports').textContent = totalReports;
        document.getElementById('pending-reports').textContent = pendingReports;
        document.getElementById('urgent-reports').textContent = urgentReports;

        // Update admin table
        const tableBody = document.getElementById('admin-incidents-table-body');
        if (!tableBody) return;

        tableBody.innerHTML = '';

        if (incidents.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: var(--space-32);">
                        No incidents to review
                    </td>
                </tr>
            `;
            return;
        }

        incidents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        incidents.forEach(incident => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${incident.id}</td>
                <td>${new Date(incident.createdAt).toLocaleDateString()}</td>
                <td>${incident.incidentClassification || 'Not specified'}</td>
                <td><span class="status-badge status-badge--${incident.status}">${incident.status}</span></td>
                <td><span class="priority-badge priority-badge--${incident.priority || 'low'}">${incident.priority || 'low'}</span></td>
                <td>
                    <button class="action-btn action-btn--view" onclick="app.viewIncident('${incident.id}')">Review</button>
                    <select onchange="app.updateIncidentStatus('${incident.id}', this.value)" class="form-control" style="width: auto; display: inline-block; margin-left: 8px;">
                        <option value="${incident.status}" selected>${incident.status}</option>
                        <option value="under-review">Under Review</option>
                        <option value="closed">Closed</option>
                    </select>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateIncidentStatus(incidentId, newStatus) {
        if (this.incidents[incidentId]) {
            this.incidents[incidentId].status = newStatus;
            this.incidents[incidentId].updatedAt = new Date().toISOString();
            this.saveIncidents();
            this.updateAdminDashboard();
            this.updateDashboard();
            this.showMessage('Incident status updated', 'success');
        }
    }

    filterIncidents() {
        const statusFilter = document.getElementById('filter-status')?.value;
        const classificationFilter = document.getElementById('filter-classification')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();

        const rows = document.querySelectorAll('#incidents-table-body tr');

        rows.forEach(row => {
            if (row.children.length <= 1) return; // Skip empty rows

            const status = row.children[4].textContent.toLowerCase();
            const classification = row.children[2].textContent.toLowerCase();
            const allText = row.textContent.toLowerCase();

            const statusMatch = !statusFilter || status.includes(statusFilter.toLowerCase());
            const classificationMatch = !classificationFilter || classification.includes(classificationFilter.toLowerCase());
            const searchMatch = !searchFilter || allText.includes(searchFilter);

            row.style.display = statusMatch && classificationMatch && searchMatch ? '' : 'none';
        });

        this.updateFilteredResults();
    }

    updateFilteredResults() {
        const rows = document.querySelectorAll('#incidents-table-body tr');
        const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none' && row.children.length > 1);
        
        // Could add a results counter here if needed
    }

    viewIncident(incidentId) {
        const incident = this.incidents[incidentId];
        if (!incident) return;

        const modal = document.getElementById('incident-modal');
        const detailsContainer = document.getElementById('incident-details');

        const details = `
            <div class="incident-detail">
                <h4>Incident ID: ${incident.id}</h4>
                <div class="detail-grid">
                    <div class="detail-item">
                        <strong>Status:</strong> 
                        <span class="status-badge status-badge--${incident.status}">${incident.status}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Priority:</strong> 
                        <span class="priority-badge priority-badge--${incident.priority || 'low'}">${incident.priority || 'low'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Report Date:</strong> ${incident.reportDate || 'Not specified'}
                    </div>
                    <div class="detail-item">
                        <strong>Classification:</strong> ${incident.incidentClassification || 'Not specified'}
                    </div>
                    <div class="detail-item">
                        <strong>Report Type:</strong> ${incident.reportType || 'Not specified'}
                    </div>
                    <div class="detail-item">
                        <strong>Submitter:</strong> ${incident.submitterType || 'Not specified'}
                    </div>
                </div>
                
                <h5>Administrative Information</h5>
                <div class="detail-section">
                    <p><strong>Authority:</strong> ${incident.authorityName || 'Not specified'} (${incident.authorityCountry || 'Not specified'})</p>
                    <p><strong>Submitter Name:</strong> ${incident.submitterName || 'Not specified'}</p>
                    <p><strong>Contact:</strong> ${incident.submitterEmail || 'Not specified'}</p>
                </div>

                <h5>AI System Information</h5>
                <div class="detail-section">
                    <p><strong>EU Database ID:</strong> ${incident.euDatabaseId || 'Not specified'}</p>
                    <p><strong>Commercial Name:</strong> ${incident.commercialName || 'Not specified'}</p>
                    <p><strong>Model/Version:</strong> ${incident.modelVersion || 'Not specified'}</p>
                    <p><strong>Description:</strong> ${incident.systemDescription || 'Not specified'}</p>
                </div>

                <h5>Incident Details</h5>
                <div class="detail-section">
                    <p><strong>Description:</strong> ${incident.incidentDescription || 'Not specified'}</p>
                    <p><strong>Affected Users:</strong> ${incident.affectedUsers || 'Not specified'}</p>
                    <p><strong>Remedial Actions:</strong> ${incident.remedialActions || 'Not specified'}</p>
                </div>

                <h5>Provider Analysis</h5>
                <div class="detail-section">
                    <p><strong>Preliminary Investigation:</strong> ${incident.preliminaryInvestigation || 'Not specified'}</p>
                    <p><strong>Root Cause:</strong> ${incident.rootCause || 'Not specified'}</p>
                    <p><strong>Risk Assessment Status:</strong> ${incident.riskAssessment || 'Not specified'}</p>
                    <p><strong>Corrective Actions:</strong> ${incident.correctiveActions || 'Not specified'}</p>
                </div>

                ${incident.generalComments ? `
                <h5>General Comments</h5>
                <div class="detail-section">
                    <p>${incident.generalComments}</p>
                </div>
                ` : ''}

                <div class="timestamps">
                    <p><strong>Created:</strong> ${new Date(incident.createdAt).toLocaleString()}</p>
                    <p><strong>Updated:</strong> ${new Date(incident.updatedAt).toLocaleString()}</p>
                    ${incident.submittedAt ? `<p><strong>Submitted:</strong> ${new Date(incident.submittedAt).toLocaleString()}</p>` : ''}
                </div>
            </div>
        `;

        detailsContainer.innerHTML = details;
        modal.classList.remove('hidden');
        
        // Set current incident for printing
        this.currentViewingIncident = incident;
    }

    editIncident(incidentId) {
        const incident = this.incidents[incidentId];
        if (!incident || incident.status !== 'draft') {
            this.showMessage('Only draft incidents can be edited', 'error');
            return;
        }

        this.currentIncidentId = incidentId;
        this.formData = { ...incident };
        this.loadFormData();
        this.navigateToPage('report');
        this.updateProgress();
    }

    loadFormData() {
        const form = document.getElementById('incident-form');
        if (!form || !this.formData) return;

        Object.keys(this.formData).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = this.formData[key];
                } else {
                    field.value = this.formData[key];
                }

                // Trigger change event for submitter type to update dynamic fields
                if (key === 'submitterType') {
                    field.dispatchEvent(new Event('change'));
                }
            }
        });
    }

    closeModal() {
        document.getElementById('incident-modal')?.classList.add('hidden');
    }

    printReport() {
        if (this.currentViewingIncident) {
            const printContent = document.getElementById('incident-details').innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>AI Incident Report - ${this.currentViewingIncident.id}</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                        .detail-section { margin: 15px 0; }
                        .status-badge, .priority-badge { 
                            padding: 4px 8px; 
                            border-radius: 4px; 
                            font-size: 12px;
                            font-weight: bold;
                        }
                        h4, h5 { color: #003399; margin-top: 25px; }
                        .timestamps { margin-top: 30px; font-size: 12px; color: #666; }
                    </style>
                </head>
                <body>
                    <h1>EU AI Act Incident Report</h1>
                    ${printContent}
                </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.print();
        }
    }

    exportReports() {
        const incidents = Object.values(this.incidents);
        if (incidents.length === 0) {
            this.showMessage('No reports to export', 'info');
            return;
        }

        const csvContent = this.generateCSV(incidents);
        this.downloadFile(csvContent, 'ai-incident-reports.csv', 'text/csv');
        this.showMessage('Reports exported successfully', 'success');
    }

    exportAllData() {
        const data = {
            incidents: this.incidents,
            exportedAt: new Date().toISOString(),
            totalIncidents: Object.keys(this.incidents).length
        };

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, 'ai-incidents-full-export.json', 'application/json');
        this.showMessage('All data exported successfully', 'success');
    }

    generateCSV(incidents) {
        const headers = [
            'ID', 'Status', 'Priority', 'Created At', 'Report Date', 'Classification', 
            'Report Type', 'Submitter Type', 'Authority Name', 'Authority Country',
            'System Description', 'Commercial Name', 'Incident Description', 
            'Affected Users', 'Submitter Email'
        ];

        const rows = incidents.map(incident => [
            incident.id,
            incident.status,
            incident.priority || 'low',
            incident.createdAt,
            incident.reportDate || '',
            incident.incidentClassification || '',
            incident.reportType || '',
            incident.submitterType || '',
            incident.authorityName || '',
            incident.authorityCountry || '',
            incident.systemDescription || '',
            incident.commercialName || '',
            incident.incidentDescription || '',
            incident.affectedUsers || '',
            incident.submitterEmail || ''
        ]);

        return [headers, ...rows]
            .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            .join('\n');
    }

    downloadDatabaseSchema() {
        const schema = `
-- EU AI Act Incident Reporting Database Schema
-- Generated on: ${new Date().toISOString()}
-- Copyright (c) 2025 Fabrizio Degni. All rights reserved.

CREATE DATABASE ai_incidents_db;
USE ai_incidents_db;

-- Main incidents table
CREATE TABLE incidents (
    id VARCHAR(50) PRIMARY KEY,
    status ENUM('draft', 'submitted', 'under-review', 'closed') NOT NULL DEFAULT 'draft',
    priority ENUM('low', 'medium', 'high') DEFAULT 'low',
    report_date DATE,
    report_type VARCHAR(100),
    incident_classification VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP NULL,
    legal_affirmation BOOLEAN DEFAULT FALSE
);

-- Administrative information
CREATE TABLE administrative_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    authority_name VARCHAR(200),
    authority_country VARCHAR(100),
    submitter_type ENUM('Provider', 'Deployer', 'Authorised representative', 'Other'),
    submitter_name VARCHAR(200),
    submitter_email VARCHAR(200),
    submitter_phone VARCHAR(50),
    registration_number VARCHAR(100),
    vat_number VARCHAR(50),
    represented_provider VARCHAR(200),
    authorization_number VARCHAR(100),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Address information
CREATE TABLE addresses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    address_type ENUM('submitter', 'authority', 'provider') NOT NULL,
    street_address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- AI System information
CREATE TABLE ai_system_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    eu_database_id VARCHAR(100),
    system_description TEXT,
    commercial_name VARCHAR(200),
    model_version VARCHAR(100),
    serial_number VARCHAR(100),
    software_version VARCHAR(100),
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Incident details
CREATE TABLE incident_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    incident_description TEXT,
    affected_users INT,
    operator_type ENUM('Professional user', 'Other'),
    initial_reporter VARCHAR(200),
    remedial_actions TEXT,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Provider analysis
CREATE TABLE provider_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    preliminary_investigation TEXT,
    root_cause TEXT,
    risk_assessment_status ENUM('pending', 'in-progress', 'completed', 'not-applicable'),
    corrective_actions TEXT,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- General comments
CREATE TABLE general_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id VARCHAR(50),
    comments TEXT,
    FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_priority ON incidents(priority);
CREATE INDEX idx_incidents_created ON incidents(created_at);
CREATE INDEX idx_incidents_classification ON incidents(incident_classification);
CREATE INDEX idx_admin_incident ON administrative_info(incident_id);
CREATE INDEX idx_addresses_incident ON addresses(incident_id);

-- Sample data insertion
INSERT INTO incidents (id, status, priority, report_date, report_type, incident_classification) VALUES
('AI-SAMPLE-001', 'submitted', 'high', '2025-01-15', 'Initial', 'Death'),
('AI-SAMPLE-002', 'under-review', 'medium', '2025-01-10', 'Follow up', 'Harm to a person''s health');

-- Views for reporting
CREATE VIEW incident_summary AS
SELECT 
    i.id,
    i.status,
    i.priority,
    i.report_date,
    i.incident_classification,
    ai.authority_name,
    ai.authority_country,
    ai.submitter_type,
    ai.submitter_name,
    ai.submitter_email,
    i.created_at,
    i.submitted_at
FROM incidents i
LEFT JOIN administrative_info ai ON i.id = ai.incident_id;

CREATE VIEW authority_dashboard AS
SELECT 
    authority_country,
    COUNT(*) as total_incidents,
    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as pending_review,
    SUM(CASE WHEN priority = 'high' THEN 1 ELSE 0 END) as urgent_cases
FROM incident_summary
GROUP BY authority_country;

-- Stored procedures
DELIMITER //

CREATE PROCEDURE GetIncidentsByStatus(IN incident_status VARCHAR(20))
BEGIN
    SELECT * FROM incident_summary WHERE status = incident_status;
END //

CREATE PROCEDURE UpdateIncidentStatus(IN incident_id VARCHAR(50), IN new_status VARCHAR(20))
BEGIN
    UPDATE incidents 
    SET status = new_status, updated_at = CURRENT_TIMESTAMP 
    WHERE id = incident_id;
END //

DELIMITER ;

-- Grant permissions (adjust as needed)
-- CREATE USER 'ai_incidents_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE ON ai_incidents_db.* TO 'ai_incidents_user'@'localhost';

-- End of schema
        `;

        this.downloadFile(schema.trim(), 'ai-incidents-database-schema.sql', 'text/sql');
        this.showMessage('Database schema downloaded successfully', 'success');
    }

    downloadFile(content, filename, contentType) {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.toggle('hidden', !show);
        }
    }

    showMessage(message, type = 'info') {
        const container = document.getElementById('message-container');
        if (!container) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message message--${type}`;
        messageDiv.textContent = message;

        container.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);

        // Allow manual close
        messageDiv.addEventListener('click', () => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        });
    }
}

// Initialize the application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new IncidentReportingPlatform();
});

// Make app globally accessible for onclick handlers
window.app = app;