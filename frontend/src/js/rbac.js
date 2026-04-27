/**
 * Centralized Role-Based Access Control (RBAC) Configuration
 * 
 * Defines permissions for UI elements and API endpoints based on user roles.
 * Roles: 'admin', 'clinician'
 */

var PERMISSIONS = {
    ROLES: {
        ADMIN: 'admin',
        CLINICIAN: 'clinician'
    },

    ENDPOINTS: {
        PATIENT_CREATE: 'POST:/api/patient/create',
        MEDICAL_HISTORY_CREATE: 'POST:/api/patient/medical-history/create',
        MEDICAL_HISTORY_GET: 'GET:/api/patient/medical-history/',
        PERSONAL_INFO_UPDATE: 'PUT:/api/patient/personal-info/update/',
        DATA_INGEST: 'POST:/api/data/',
        KIBANA: '/kibana/',
        PATIENT_COMPLETE: 'POST:/api/patient/complete',
        PATIENT_FIND_ID: 'GET:/api/patient/find/id',
        PATIENT_PERSONAL: 'GET:/api/patient/personal/',
        PATIENT_LIST: 'GET:/api/patient/list/'
    },

    UI_ELEMENTS: {
        // Admin-only (select existing, edit patients)
        'selectContainer': { endpoints: ['PATIENT_LIST'], redirectOnAccessDenied: 'homePage.html' },
        'editContainer': { endpoints: ['PERSONAL_INFO_UPDATE'], redirectOnAccessDenied: 'homePage.html' },
        'editButton': { endpoints: ['PERSONAL_INFO_UPDATE'], redirectOnAccessDenied: 'homePage.html' },
        
        // Clinician can create new patient via /api/patient/complete
        'createContainer': { endpoints: ['PATIENT_COMPLETE'], redirectOnAccessDenied: null },
        'createButton': { endpoints: ['PATIENT_COMPLETE'], redirectOnAccessDenied: null },
        
        // Both can lookup by name
        'lookupContainer': { endpoints: ['PATIENT_FIND_ID'], redirectOnAccessDenied: null },
        'lookupButton': { endpoints: ['PATIENT_FIND_ID'], redirectOnAccessDenied: null },
        
        // Admin-only buttons (not in current HTML)
        'createPatientBtn': { endpoints: ['PATIENT_CREATE'], redirectOnAccessDenied: 'selectPatient.html' },
        'updatePatientBtn': { endpoints: ['PERSONAL_INFO_UPDATE'], redirectOnAccessDenied: 'selectPatient.html' },
        'createPatientMedBtn': { endpoints: ['MEDICAL_HISTORY_CREATE'], redirectOnAccessDenied: 'selectPatient.html' },
        'editPatientMedBtn': { endpoints: ['MEDICAL_HISTORY_CREATE'], redirectOnAccessDenied: 'selectPatient.html' },
        'dataIngestContainer': { endpoints: ['DATA_INGEST'], redirectOnAccessDenied: 'selectPatient.html' }
    },

    PAGE_ACCESS: {
        // Admin-only pages (use admin-only API endpoints)
        'editPatient.html': { allowedRoles: ['admin'], redirectOnAccessDenied: 'homePage.html', message: 'Access denied. Only administrators can edit patient information.' },
        'editPatientMed.html': { allowedRoles: ['admin'], redirectOnAccessDenied: 'homePage.html', message: 'Access denied. Only administrators can edit medical history.' },
        
        // Pages that can use shared endpoint for creating
        'createPatient.html': { allowedRoles: ['admin', 'clinician'], redirectOnAccessDenied: 'homePage.html', message: 'Access denied.' },
        'createPatientMed.html': { allowedRoles: ['admin', 'clinician'], redirectOnAccessDenied: 'homePage.html', message: 'Access denied.' },
        
        // Other pages
        'selectPatient.html': { allowedRoles: ['admin', 'clinician'], redirectOnAccessDenied: 'index.html', message: null },
        'graphDisplay.html': { allowedRoles: ['admin'], redirectOnAccessDenied: 'index.html', message: 'Access denied. Only administrators can view graphs.' },
        'lookupPatient.html': { allowedRoles: ['admin', 'clinician'], redirectOnAccessDenied: 'index.html', message: null },
        'homePage.html': { allowedRoles: ['admin', 'clinician'], redirectOnAccessDenied: 'index.html', message: null }
    }
};

var PermissionService = {
    UNAUTHORIZED_MESSAGE: 'You do not have permission to access this resource.',

    getUserRole: function() {
        return localStorage.getItem('role');
    },

    isAdmin: function() {
        return this.getUserRole() === PERMISSIONS.ROLES.ADMIN;
    },

    isClinician: function() {
        return this.getUserRole() === PERMISSIONS.ROLES.CLINICIAN;
    },

    isAuthenticated: function() {
        return !!localStorage.getItem('accessToken');
    },

    canAccessEndpoint: function(endpoint) {
        var endpointConfig = PERMISSIONS.ENDPOINTS[endpoint];
        if (!endpointConfig) {
            console.warn('Unknown endpoint:', endpoint);
            return false;
        }

        var adminOnlyEndpoints = [
            PERMISSIONS.ENDPOINTS.PATIENT_CREATE,
            PERMISSIONS.ENDPOINTS.MEDICAL_HISTORY_CREATE,
            PERMISSIONS.ENDPOINTS.MEDICAL_HISTORY_GET,
            PERMISSIONS.ENDPOINTS.PERSONAL_INFO_UPDATE,
            PERMISSIONS.ENDPOINTS.DATA_INGEST,
            PERMISSIONS.ENDPOINTS.KIBANA
        ];

        if (adminOnlyEndpoints.indexOf(endpointConfig) !== -1) {
            return this.isAdmin();
        }

        return this.isAuthenticated();
    },

    canAccessPage: function(pageName) {
        var pageConfig = PERMISSIONS.PAGE_ACCESS[pageName];
        if (!pageConfig) {
            console.warn('Unknown page:', pageName);
            return false;
        }

        var userRole = this.getUserRole();
        if (!userRole) {
            return false;
        }

        return pageConfig.allowedRoles.indexOf(userRole) !== -1;
    },

    getPageRedirectConfig: function(pageName) {
        return PERMISSIONS.PAGE_ACCESS[pageName] || null;
    },

    applyUIPermissions: function() {
        var userRole = this.getUserRole();
        
        // Define admin-only endpoints (clinician cannot access these APIs)
        // Note: UI may hide shared endpoints based on business rules
        var adminOnlyList = [
            PERMISSIONS.ENDPOINTS.PATIENT_CREATE,
            PERMISSIONS.ENDPOINTS.MEDICAL_HISTORY_CREATE,
            PERMISSIONS.ENDPOINTS.MEDICAL_HISTORY_GET,
            PERMISSIONS.ENDPOINTS.PERSONAL_INFO_UPDATE,
            PERMISSIONS.ENDPOINTS.DATA_INGEST,
            PERMISSIONS.ENDPOINTS.KIBANA,
            PERMISSIONS.ENDPOINTS.PATIENT_LIST
        ];

        if (!userRole) {
            return;
        }

        Object.keys(PERMISSIONS.UI_ELEMENTS).forEach(function(elementId) {
            var elementConfig = PERMISSIONS.UI_ELEMENTS[elementId];
            var element = document.getElementById(elementId);

            if (!element) {
                return;
            }

            var allEndpointsAdminOnly = elementConfig.endpoints.every(function(endpoint) {
                var endpointConfig = PERMISSIONS.ENDPOINTS[endpoint];
                return adminOnlyList.indexOf(endpointConfig) !== -1;
            });

            // Hide only if clinician and all endpoints are admin-only
            if (allEndpointsAdminOnly && userRole !== PERMISSIONS.ROLES.ADMIN) {
                element.style.display = 'none';
            }
        });
    },

    guardPage: function(pageName, customMessage) {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }

        var pageConfig = PERMISSIONS.PAGE_ACCESS[pageName];
        if (!pageConfig) {
            console.warn('No access configuration for page:', pageName);
            return true;
        }

        var userRole = this.getUserRole();
        
        if (pageConfig.allowedRoles.indexOf(userRole) === -1) {
            var message = customMessage || pageConfig.message || this.UNAUTHORIZED_MESSAGE;
            if (message) {
                alert(message);
            }
            window.location.href = pageConfig.redirectOnAccessDenied || 'homePage.html';
            return false;
        }

        return true;
    },

    showAccessDenied: function(message) {
        var msg = message || this.UNAUTHORIZED_MESSAGE;
        var modalContainer = document.getElementById('unauthorizedModal');
        if (modalContainer) {
            var messageEl = document.getElementById('unauthorizedMessage');
            if (messageEl) {
                messageEl.textContent = msg;
            }
            modalContainer.style.display = 'block';
            return;
        }
        alert(msg);
    }
};

window.PERMISSIONS = PERMISSIONS;
window.PermissionService = PermissionService;
window.Permissions = {
    can: function(endpoint) {
        return PermissionService.canAccessEndpoint(endpoint);
    },
    canPage: function(pageName) {
        return PermissionService.canAccessPage(pageName);
    },
    apply: function() {
        return PermissionService.applyUIPermissions();
    },
    guard: function(pageName) {
        return PermissionService.guardPage(pageName);
    },
    isAdmin: function() {
        return PermissionService.isAdmin();
    }
};