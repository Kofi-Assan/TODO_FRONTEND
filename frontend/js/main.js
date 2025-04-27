const API_URL = 'http://localhost:5000/api';


async function fetchResources() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/resources`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch resources');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load resources. Please try again later.');
    }
}


async function fetchBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/my-bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load bookings. Please try again later.');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.main-content').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.main-content').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
}

// Check if user is admin
function isAdmin() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.role === 'admin';
}

// Show/hide admin features based on user role
document.addEventListener('DOMContentLoaded', function() {
    const adminLink = document.querySelector('a[href="/admin.html"]');
    if (adminLink) {
        adminLink.style.display = isAdmin() ? 'block' : 'none';
    }
}); 