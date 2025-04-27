const API_URL = 'https://todo-backend-fan5.onrender.com/api';

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || !user.id) {
        window.location.href = 'login.html';
        return;
    }
    loadBookings();
});

async function loadBookings() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = 'Loading...';
    try {
        const response = await fetch(`${API_URL}/bookings`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch bookings');
        const bookings = await response.json();
        // Only show bookings for the current user
        const userBookings = bookings.filter(b => b.userId === user.id);
        displayBookings(userBookings);
    } catch (error) {
        bookingsList.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
}

function displayBookings(bookings) {
    const bookingsList = document.getElementById('bookingsList');
    bookingsList.innerHTML = '';
    if (!bookings || bookings.length === 0) {
        bookingsList.innerHTML = '<div class="no-bookings">No bookings found</div>';
        return;
    }
    bookings.forEach(booking => {
        const bookingElement = document.createElement('div');
        bookingElement.className = 'booking-item';
        const isActive = booking.status?.toLowerCase() !== 'cancelled';
        const statusClass = isActive ? 'active' : 'cancelled';
        const resourceName = booking.resource?.name || booking.resource || 'Unknown Resource';
        const status = booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1).toLowerCase() || 'Active';
        const userName = booking.user?.name || 'Unknown User';
        const bookingId = booking.id || booking._id;
        if (isActive && bookingId) {
            bookingElement.innerHTML = `
                <div class="booking-header">
                    <h3>${resourceName}</h3>
                </div>
                <div class="booking-info">
                    <div class="booking-user"><span style="color: green;">${userName}</span></div>
                    <div class="booking-time">Start: ${formatDateTime(booking.startTime)}</div>
                    <div class="booking-time">End: ${formatDateTime(booking.endTime)}</div>
                    <div class="booking-status-container">
                        <div class="booking-status ${statusClass}">
                            Status: ${status}
                        </div>
                        <button class="cancel-btn" onclick="cancelBooking('${bookingId}')">
                            Cancel Booking
                        </button>
                    </div>
                </div>
            `;
        } else {
            bookingElement.innerHTML = `
                <div class="booking-header">
                    <h3>${resourceName}</h3>
                </div>
                <div class="booking-info">
                    <div class="booking-user"><span style="color: green;">${userName}</span></div>
                    <div class="booking-time">Start: ${formatDateTime(booking.startTime)}</div>
                    <div class="booking-time">End: ${formatDateTime(booking.endTime)}</div>
                    <div class="booking-status-container">
                        <div class="booking-status ${statusClass}">
                            Status: ${status}
                        </div>
                    </div>
        </div>
            `;
        }
        bookingsList.appendChild(bookingElement);
    });
}

function formatDateTime(dateTimeStr) {
    if (!dateTimeStr) return 'Not specified';
    try {
        const date = new Date(dateTimeStr);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            month: 'numeric',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true
        });
    } catch (error) {
        return 'Invalid Date';
    }
}

async function cancelBooking(bookingId) {
    if (!bookingId) {
        console.error('No booking ID provided');
        alert('Unable to cancel booking: Invalid booking ID');
        return;
    }
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error(`Failed to cancel booking (Status: ${response.status})`);
        }
        await loadBookings();
        alert('Booking cancelled successfully');
    } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
    }
}

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

window.displayBookings = displayBookings; 