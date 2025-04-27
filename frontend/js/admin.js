const API_URL = 'https://todo-backend-fan5.onrender.com/api';

// This Check if user is admin on page load
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    
    if (!token || !user || user.role !== 'admin') {
        window.location.href = '/';
        return;
    }

    setupTabs();
    setupEventListeners();
    await loadResources();
    await loadBookings();
    await loadUsers();
});


function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.add('hidden'));

            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.remove('hidden');
        });
    });
}

function setupEventListeners() {
    const modal = document.getElementById('resourceModal');
    const closeBtn = document.querySelector('.close');
    
    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    document.getElementById('resourceForm').addEventListener('submit', handleResourceSubmit);
}

async function loadResources() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/resources`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch resources');

        const resources = await response.json();
        displayResources(resources);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load resources');
    }
}

function displayResources(resources) {
    const list = document.getElementById('adminResourcesList');
    list.innerHTML = '';

    resources.forEach(resource => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="item-info">
                <h3>${resource.name}</h3>
                <p>${resource.description}</p>
                <div class="item-meta">
                    <div class="meta-tags">
                        <span class="category">${resource.category}</span>
                    </div>
                    <div class="meta-actions">
                        <button onclick="editResource('${resource.id}')" class="edit-btn">Edit</button>
                        <button onclick="deleteResource('${resource.id}')" class="delete-btn">Delete</button>
                    </div>
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

async function loadBookings() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch bookings');

        const bookings = await response.json();
        displayBookings(bookings);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load bookings');
    }
}

function displayBookings(bookings) {
    const list = document.getElementById('adminBookingsList');
    list.innerHTML = '';

    // Sort bookings by start time, most recent first
    bookings.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    bookings.forEach(booking => {
        const startTime = new Date(booking.startTime);
        const endTime = new Date(booking.endTime);
        const duration = (endTime - startTime) / (1000 * 60 * 60); // Convert to hours

        const item = document.createElement('div');
        item.className = 'admin-list-item';
        
        // Add status-specific class for styling
        if (booking.status === 'cancelled') {
            item.classList.add('cancelled-booking');
        }

        item.innerHTML = `
            <div class="item-info">
                <h3>${booking.resource?.name || 'N/A'}</h3>
                <p>Booked by: ${booking.user?.name || 'N/A'}</p>
                <div class="item-details">
                    <span>Start: ${startTime.toLocaleString()}</span>
                    <span>End: ${endTime.toLocaleString()}</span>
                    <span>Duration: ${duration} hours</span>
                </div>
                <div class="booking-status ${booking.status.toLowerCase()}">
                    Status: ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
            </div>
        `;
        list.appendChild(item);
    });

    
    if (bookings.length === 0) {
        list.innerHTML = '<div class="no-bookings">No bookings found</div>';
    }
}


async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch users');

        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load users');
    }
}


function displayUsers(users) {
    const list = document.getElementById('adminUsersList');
    list.innerHTML = '';

    users.forEach(user => {
        const item = document.createElement('div');
        item.className = 'admin-list-item';
        item.innerHTML = `
            <div class="item-info">
                <h3>${user.name}</h3>
                <p>${user.email}</p>
                <div class="item-details">
                    <span class="role">${user.role}</span>
                </div>
            </div>
            <div class="item-actions">
                <button onclick="toggleUserRole('${user.id}')" 
                        ${user.role === 'admin' ? 'class="warning-btn"' : ''}>
                    ${user.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </button>
            </div>
        `;
        list.appendChild(item);
    });
}


function openAddResourceModal() {
    document.getElementById('resourceModalTitle').textContent = 'Add New Resource';
    document.getElementById('resourceForm').reset();
    document.getElementById('resourceId').value = '';
    document.getElementById('resourceModal').style.display = 'block';
}


async function editResource(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/resources/${id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to fetch resource');

        const resource = await response.json();
        
        document.getElementById('resourceModalTitle').textContent = 'Edit Resource';
        document.getElementById('resourceId').value = resource.id;
        document.getElementById('name').value = resource.name;
        document.getElementById('description').value = resource.description;
        document.getElementById('category').value = resource.category;
        
        document.getElementById('resourceModal').style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to load resource details');
    }
}


async function handleResourceSubmit(e) {
    e.preventDefault();

    const resourceId = document.getElementById('resourceId').value;
    const resource = {
        name: document.getElementById('name').value.trim(),
        description: document.getElementById('description').value.trim(),
        category: document.getElementById('category').value.toLowerCase(),
        status: 'available',
        capacity: 1  
    };

    
    if (!resource.name || !resource.description || !resource.category) {
        showError('Please fill in all required fields');
        return;
    }

    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const url = resourceId ? 
            `${API_URL}/resources/${resourceId}` : 
            `${API_URL}/resources`;
        
        console.log('Sending resource data:', resource);
        
        const response = await fetch(url, {
            method: resourceId ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(resource)
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to save resource');
        }

        const savedResource = await response.json();
        console.log('Resource saved:', savedResource);

        document.getElementById('resourceModal').style.display = 'none';
        document.getElementById('resourceForm').reset();
        showSuccess(`Resource ${resourceId ? 'updated' : 'added'} successfully`);
        await loadResources();
    } catch (error) {
        console.error('Error saving resource:', error);
        showError(error.message || 'Failed to save resource. Please try again.');
    }
}


async function deleteResource(id) {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/resources/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to delete resource');

        showSuccess('Resource deleted successfully');
        await loadResources();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to delete resource');
    }
}


async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to cancel booking');

        showSuccess('Booking cancelled successfully');
        await loadBookings();
        await loadResources();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to cancel booking');
    }
}


async function toggleUserRole(id) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/users/${id}/toggle-role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Failed to update user role');

        showSuccess('User role updated successfully');
        await loadUsers();
    } catch (error) {
        console.error('Error:', error);
        showError('Failed to update user role');
    }
}


function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.admin-panel').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}


function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.admin-panel').prepend(successDiv);
    setTimeout(() => successDiv.remove(), 5000);
} 