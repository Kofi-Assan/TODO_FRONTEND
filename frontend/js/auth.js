// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('token');
    // Prevent redirect loop if already on login page
    if (!token && !window.location.pathname.endsWith('login.html')) {
        window.location.href = '/login.html';
        return null;
    }
    return token;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    return JSON.parse(userStr);
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Handle admin access
function handleAdminAccess() {
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = isAdmin() ? 'block' : 'none';
    }

    // Redirect from admin page if user is not admin
    if (window.location.pathname.includes('admin.html') && !isAdmin()) {
        window.location.href = '/';
    }
}

// Handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    const token = checkAuth();
    if (!token) return;
    
    handleAdminAccess();
    
    // Set up logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}); 