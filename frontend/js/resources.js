const API_URL = 'http://localhost:5000/api';
let resources = [];

// DOM Elements
const modal = document.getElementById('addResourceModal');
const addBtn = document.getElementById('addResourceBtn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancelBtn');
const resourceForm = document.getElementById('resourceForm');
const resourcesList = document.getElementById('resourcesList');
const categoryFilters = document.querySelectorAll('[data-category]');
const statusFilters = document.querySelectorAll('[data-status]');

// Current filters
let currentFilters = {
    category: 'all',
    status: 'all'
};

// On page load, check user and load resources
// (This is the main entry point for the resource page)
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    const adminLink = document.querySelector('a[href="admin.html"]');
    if (adminLink) {
        adminLink.style.display = user.role === 'admin' ? 'block' : 'none';
    }
    const addResourceBtn = document.getElementById('addResourceBtn');
    if (addResourceBtn) {
        addResourceBtn.style.display = user.role === 'admin' ? 'block' : 'none';
    }
    setupEventListeners();
    try {
        await fetchResources();
        filterAndDisplayResources();
    } catch (error) {
        console.error('Error loading resources:', error);
        showError('Failed to load resources. Please try again later.');
    }
});

async function fetchResources() {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to view resources');
    }
    const response = await fetch(`${API_URL}/resources`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('Failed to fetch resources');
    }
    resources = await response.json();
    console.log('Fetched resources:', resources);
    return resources;
}

function displayResources(resourcesToDisplay) {
    if (!resourcesList) {
        console.error('Resources list element not found');
        return;
    }
    resourcesList.innerHTML = '';
    if (!resourcesToDisplay || resourcesToDisplay.length === 0) {
        resourcesList.innerHTML = '<div class="no-resources">No resources found matching the selected filters.</div>';
        return;
    }
    resourcesToDisplay.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource-item';
        const bookingButton = resource.status.toLowerCase() === 'available' 
            ? `<button class="btn-book" onclick="openBookingModal('${resource.id}')">Book Now</button>`
            : '<span class="status-badge booked">Booked</span>';
        resourceElement.innerHTML = `
            <div class="resource-info">
                <h3>${resource.name}</h3>
                <p>${resource.description || 'No description available'}</p>
                <div class="resource-meta">
                    <span class="category">${resource.category}</span>
                    <span class="status ${resource.status.toLowerCase()}">${resource.status}</span>
                    ${bookingButton}
                </div>
            </div>
        `;
        resourcesList.appendChild(resourceElement);
    });
    console.log('Displayed resources:', resourcesToDisplay);
}

function setupEventListeners() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const modal = document.getElementById('addResourceModal');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancelBtn');
    const resourceForm = document.getElementById('resourceForm');
    if (user.role === 'admin') {
        if (addBtn) addBtn.onclick = () => modal.style.display = 'block';
        if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
        if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';
        if (modal) {
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        }
        if (resourceForm) {
            resourceForm.onsubmit = handleResourceSubmit;
        }
    }
    categoryFilters.forEach(button => {
        button.addEventListener('click', () => {
            categoryFilters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilters.category = button.dataset.category;
            filterAndDisplayResources();
        });
    });
    statusFilters.forEach(button => {
        button.addEventListener('click', () => {
            statusFilters.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentFilters.status = button.dataset.status;
            filterAndDisplayResources();
        });
    });
}

function filterAndDisplayResources() {
    if (!resources || !Array.isArray(resources)) {
        displayResources([]);
        return;
    }
    const filteredResources = resources.filter(resource => {
        const categoryMatch = currentFilters.category.toLowerCase() === 'all' || 
                            resource.category.toLowerCase() === currentFilters.category.toLowerCase();
        const statusMatch = currentFilters.status.toLowerCase() === 'all' || 
                          resource.status.toLowerCase() === currentFilters.status.toLowerCase();
        return categoryMatch && statusMatch;
    });
    displayResources(filteredResources);
}

async function handleResourceSubmit(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = {
        name: document.getElementById('resourceName').value,
        description: document.getElementById('resourceDescription').value,
        category: document.getElementById('resourceCategory').value,
        status: document.getElementById('resourceStatus').value
    };
    try {
        const response = await fetch(`${API_URL}/resources`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        if (!response.ok) {
            throw new Error('Failed to create resource');
        }
        const newResource = await response.json();
        resources.push(newResource);
        filterAndDisplayResources();
        modal.style.display = 'none';
        showSuccess('Resource created successfully');
        resourceForm.reset();
    } catch (error) {
        console.error('Error creating resource:', error);
        showError('Failed to create resource. Please try again.');
    }
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    document.querySelector('.header').appendChild(successDiv);
    setTimeout(() => successDiv.remove(), 3000);
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.querySelector('.header').appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

// --- Booking Modal Logic ---
function openBookingModal(resourceId) {
    console.log('Opening booking modal for resource:', resourceId);
    console.log('Available resources:', resources);
    const resource = resources.find(r => String(r.id) === String(resourceId));
    console.log('Found resource:', resource);
    if (!resource) {
        showError('Resource not found. Please refresh the page and try again.');
        return;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.id) {
        showError('Please log in to book a resource');
        return;
    }
    const modal = document.getElementById('bookingModal');
    if (!modal) {
        createBookingModal();
    }
    document.getElementById('bookingModal').style.display = 'block';
    document.getElementById('resourceId').value = resourceId;
    document.getElementById('resourceName').textContent = resource.name;
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
}

function createBookingModal() {
    const modalHtml = `
        <div class="modal" id="bookingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Book Resource</h2>
                    <span class="close" onclick="closeBookingModal()">&times;</span>
                </div>
                <div class="modal-body">
                    <h3 id="resourceName"></h3>
                    <form id="bookingForm">
                        <input type="hidden" id="resourceId">
                        <div class="form-group">
                            <label for="bookingDate">Date</label>
                            <input type="date" id="bookingDate" required>
                        </div>
                        <div class="form-group">
                            <label for="bookingTime">Time</label>
                            <input type="time" id="bookingTime" required>
                        </div>
                        <div class="form-group">
                            <label for="duration">Duration (hours)</label>
                            <input type="number" id="duration" min="1" max="8" value="1" required>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeBookingModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Confirm Booking</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
}

function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
}

async function handleBooking(e) {
    e.preventDefault();
    const resourceId = document.getElementById('resourceId').value;
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const duration = parseInt(document.getElementById('duration').value);
    console.log('Submitting booking with:', {
        resourceId,
        date,
        time,
        duration
    });
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (!user.id) {
            throw new Error('Please log in to book a resource');
        }
        const startTime = new Date(`${date}T${time}`);
        const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
        const bookingData = {
            userId: user.id,
            resourceId: String(resourceId),
            startTime: startTime.toISOString(),
            endTime: endTime.toISOString()
        };
        console.log('Sending booking data:', bookingData);
        const response = await fetch(`${API_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Server error response:', errorData);
            throw new Error(errorData.message || 'Failed to create booking');
        }
        const booking = await response.json();
        closeBookingModal();
        await fetchResources();
        filterAndDisplayResources();
        showSuccess('Booking confirmed successfully!');
    } catch (error) {
        console.error('Error creating booking:', error);
        showError(error.message || 'Failed to book resource. Please try again.');
    }
}

// Add styles for no resources message
const style = document.createElement('style');
style.textContent = `
    .no-resources {
        text-align: center;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        color: #666;
        grid-column: 1 / -1;
    }
`;
document.head.appendChild(style); 