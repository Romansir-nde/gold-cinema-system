// Admin credentials (in production, this should be handled securely)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'goldcinema2025'
};

// Check if admin is logged in
document.addEventListener('DOMContentLoaded', () => {
    const isAdminLoggedIn = localStorage.getItem('adminLoggedIn');
    if (isAdminLoggedIn === 'true') {
        showAdminDashboard();
        loadAllData();
    }
});

// Handle admin login
document.getElementById('admin-login-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminLoggedIn', 'true');
        showAdminDashboard();
        loadAllData();
    } else {
        alert('Invalid admin credentials!');
    }
});

// Show admin dashboard
function showAdminDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active class from all buttons
    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    event.target.classList.add('active');
    
    // Load data for the selected tab
    switch(tabName) {
        case 'bookings':
            loadBookings();
            break;
        case 'users':
            loadUsers();
            break;
        case 'advisors':
            loadAdvisorRecords();
            break;
        case 'stats':
            loadStatistics();
            break;
    }
}

// Load all data
async function loadAllData() {
    await loadBookings();
    await loadUsers();
    await loadAdvisorRecords();
    await loadStatistics();
}

// Load bookings data
async function loadBookings() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/bookings', {
            headers: {
                'Authorization': 'Bearer admin-token' // In production, use proper admin token
            }
        });
        
        if (response.ok) {
            const bookings = await response.json();
            displayBookings(bookings);
        } else {
            // Fallback to mock data if backend not available
            displayBookings(getMockBookings());
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        displayBookings(getMockBookings());
    }
}

// Display bookings in table
function displayBookings(bookings) {
    const tbody = document.getElementById('bookings-tbody');
    tbody.innerHTML = '';
    
    bookings.forEach(booking => {
        const statusColor = booking.status === 'cancelled' ? 'red' : 'green';
        const statusText = booking.status === 'cancelled' ? 'Cancelled' : 'Confirmed';
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${booking.bookingId || booking._id || booking.id}</td>
            <td>${booking.userEmail}</td>
            <td>${booking.productionName}</td>
            <td>${booking.productionType}</td>
            <td>${new Date(booking.performanceDate).toLocaleDateString()}</td>
            <td>${booking.numberOfTickets}</td>
            <td>${booking.selectedSeats || 'N/A'}</td>
            <td>${booking.advisor || 'None'}</td>
            <td>
                <span style="color: ${statusColor};">${statusText}</span>
                ${booking.status !== 'cancelled' ? `<br><button onclick="cancelBooking('${booking.bookingId}')" style="background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-top: 5px;">Cancel</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Load users data
async function loadUsers() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/users', {
            headers: {
                'Authorization': 'Bearer admin-token'
            }
        });
        
        if (response.ok) {
            const users = await response.json();
            displayUsers(users);
        } else {
            displayUsers(getMockUsers());
        }
    } catch (error) {
        console.error('Error loading users:', error);
        displayUsers(getMockUsers());
    }
}

// Display users in table
function displayUsers(users) {
    const tbody = document.getElementById('users-tbody');
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.uniqueId}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.mobile}</td>
            <td>${user.city}</td>
            <td>${new Date(user.createdAt || Date.now()).toLocaleDateString()}</td>
            <td>${user.totalBookings || 0}</td>
        `;
        tbody.appendChild(row);
    });
}

// Load advisor records
async function loadAdvisorRecords() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/advisor-records', {
            headers: {
                'Authorization': 'Bearer admin-token'
            }
        });
        
        if (response.ok) {
            const records = await response.json();
            displayAdvisorRecords(records);
        } else {
            displayAdvisorRecords(getMockAdvisorRecords());
        }
    } catch (error) {
        console.error('Error loading advisor records:', error);
        displayAdvisorRecords(getMockAdvisorRecords());
    }
}

// Display advisor records
function displayAdvisorRecords(records) {
    const tbody = document.getElementById('advisors-tbody');
    tbody.innerHTML = '';
    
    records.forEach(record => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(record.date).toLocaleDateString()}</td>
            <td>${record.advisorName}</td>
            <td>${record.userEmail}</td>
            <td>${record.bookingId}</td>
            <td>${record.helpMessage}</td>
            <td><span style="color: orange;">Pending</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Load statistics
async function loadStatistics() {
    try {
        const response = await fetch('http://localhost:5000/api/admin/statistics', {
            headers: {
                'Authorization': 'Bearer admin-token'
            }
        });
        
        if (response.ok) {
            const stats = await response.json();
            displayStatistics(stats);
        } else {
            displayStatistics(getMockStatistics());
        }
    } catch (error) {
        console.error('Error loading statistics:', error);
        displayStatistics(getMockStatistics());
    }
}

// Display statistics
function displayStatistics(stats) {
    document.getElementById('total-bookings').textContent = stats.totalBookings;
    document.getElementById('total-users').textContent = stats.totalUsers;
    document.getElementById('total-revenue').textContent = '$' + stats.totalRevenue;
    document.getElementById('advisor-requests').textContent = stats.advisorRequests;
}

// Export functions
function exportBookings() {
    const table = document.getElementById('bookings-table');
    exportTableToCSV(table, 'bookings.csv');
}

function exportUsers() {
    const table = document.getElementById('users-table');
    exportTableToCSV(table, 'users.csv');
}

function exportAdvisorRecords() {
    const table = document.getElementById('advisors-table');
    exportTableToCSV(table, 'advisor-records.csv');
}

// Generic CSV export function
function exportTableToCSV(table, filename) {
    const csv = [];
    const rows = table.querySelectorAll('tr');
    
    for (let i = 0; i < rows.length; i++) {
        const row = [];
        const cols = rows[i].querySelectorAll('td, th');
        
        for (let j = 0; j < cols.length; j++) {
            row.push(cols[j].innerText);
        }
        
        csv.push(row.join(','));
    }
    
    const csvFile = new Blob([csv.join('\n')], { type: 'text/csv' });
    const downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

// Search functionality
document.getElementById('booking-search')?.addEventListener('input', (e) => {
    filterTable('bookings-table', e.target.value);
});

document.getElementById('user-search')?.addEventListener('input', (e) => {
    filterTable('users-table', e.target.value);
});

document.getElementById('advisor-search')?.addEventListener('input', (e) => {
    filterTable('advisors-table', e.target.value);
});

// Generic table filter function
function filterTable(tableId, searchTerm) {
    const table = document.getElementById(tableId);
    const rows = table.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    });
}

// Mock data for demonstration (remove when backend is ready)
// Cancel booking function
function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking? The customer will be notified.')) {
        return;
    }
    
    // Update booking status
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const bookingIndex = bookings.findIndex(b => b.bookingId === bookingId);
    
    if (bookingIndex !== -1) {
        const booking = bookings[bookingIndex];
        booking.status = 'cancelled';
        booking.cancelledAt = new Date().toISOString();
        booking.cancelledBy = 'admin';
        
        // Free up the seats
        const occupiedSeats = JSON.parse(localStorage.getItem('occupiedSeats') || '{}');
        const key = `${booking.productionName}_${booking.performanceDate}`;
        
        if (occupiedSeats[key]) {
            const seatArray = booking.selectedSeats.split(', ');
            occupiedSeats[key] = occupiedSeats[key].filter(seat => !seatArray.includes(seat));
            localStorage.setItem('occupiedSeats', JSON.stringify(occupiedSeats));
        }
        
        // Save updated bookings
        localStorage.setItem('bookings', JSON.stringify(bookings));
        
        // Send notification to customer
        sendCancellationNotification(booking);
        
        // Refresh the display
        loadBookings();
        
        alert('Booking cancelled successfully. Customer has been notified.');
    }
}

// Send cancellation notification
function sendCancellationNotification(booking) {
    const notifications = JSON.parse(localStorage.getItem('customerNotifications') || '[]');
    
    const notification = {
        id: Date.now(),
        bookingId: booking.bookingId,
        userEmail: booking.userEmail,
        type: 'cancellation',
        message: `Your booking for ${booking.productionName} on ${new Date(booking.performanceDate).toLocaleDateString()} has been cancelled by admin. Refund will be processed within 3-5 business days.`,
        timestamp: new Date().toISOString(),
        read: false
    };
    
    notifications.push(notification);
    localStorage.setItem('customerNotifications', JSON.stringify(notifications));
}

function getMockBookings() {
    // Load actual bookings from localStorage
    const actualBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // If no actual bookings, return mock data
    if (actualBookings.length === 0) {
        return [
            {
                bookingId: 'BK001',
                userEmail: 'john@example.com',
                productionName: 'Avengers: Endgame',
                productionType: 'movie',
                performanceDate: '2025-01-15',
                numberOfTickets: 2,
                selectedSeats: 'A1, A2',
                advisor: 'Juliana Ngaira',
                status: 'confirmed'
            }
        ];
    }
    
    return actualBookings;
}

function getMockUsers() {
    return [
        {
            uniqueId: 'GCS-12345',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            mobile: '123-456-7890',
            city: 'Kisii',
            totalBookings: 3
        },
        {
            uniqueId: 'GCS-12346',
            firstName: 'Mary',
            lastName: 'Smith',
            email: 'mary@example.com',
            mobile: '098-765-4321',
            city: 'Nairobi',
            totalBookings: 1
        }
    ];
}

function getMockAdvisorRecords() {
    return [
        {
            date: '2025-01-10',
            advisorName: 'Juliana Ngaira',
            userEmail: 'john@example.com',
            bookingId: 'BK001',
            helpMessage: 'Need help selecting best seats for family'
        },
        {
            date: '2025-01-12',
            advisorName: 'Kelvin Kipkemoi',
            userEmail: 'sarah@example.com',
            bookingId: 'BK003',
            helpMessage: 'Technical issue with payment'
        }
    ];
}

function getMockStatistics() {
    return {
        totalBookings: 25,
        totalUsers: 18,
        totalRevenue: 2500,
        advisorRequests: 8
    };
}

// Logout function
function adminLogout() {
    localStorage.removeItem('adminLoggedIn');
    location.reload();
}