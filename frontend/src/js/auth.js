// Utility functions for authentication

function getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    if (!token) {
        return {};
    }
    return {
        'Authorization': `Bearer ${token}`
    };
}

async function authenticatedFetch(url, options = {}) {
    const headers = { ...getAuthHeaders(), ...options.headers };
    return fetch(url, { ...options, headers });
}

// Function to check if user is authenticated
function isAuthenticated() {
    return !!localStorage.getItem('accessToken');
}

// Function to get user role
function getUserRole() {
    return localStorage.getItem('role');
}

// Function to logout
async function logout() {
    try {
        await authenticatedFetch('/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    window.location.href = 'index.html';
}