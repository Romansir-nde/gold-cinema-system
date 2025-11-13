// Production filtering based on type
document.addEventListener('DOMContentLoaded', () => {
    const productionType = document.getElementById('production-type');
    const productionName = document.getElementById('production-name');
    const advisorSelect = document.getElementById('advisor-select');
    const advisorHelp = document.getElementById('advisor-help');
    const numberOfTickets = document.getElementById('numberOfTickets');
    
    // Generate seats when page loads
    generateSeats();
    
    // Update seat selection when number of tickets changes
    numberOfTickets?.addEventListener('change', (e) => {
        const value = parseInt(e.target.value);
        if (value < 1 || value > 10) {
            alert('You can select minimum 1 and maximum 10 tickets only');
            e.target.value = Math.max(1, Math.min(10, value));
        }
        updateSeatSelection();
    });
    
    // Filter productions based on type
    productionType?.addEventListener('change', () => {
        const selectedType = productionType.value;
        const options = productionName.querySelectorAll('option');
        
        // Clear current selection
        productionName.value = '';
        
        options.forEach(option => {
            if (option.value === '') {
                option.style.display = 'block';
                return;
            }
            
            const optionType = option.getAttribute('data-type');
            if (selectedType === '' || optionType === selectedType) {
                option.style.display = 'block';
            } else {
                option.style.display = 'none';
            }
        });
    });
    
    // Show/hide advisor help section
    advisorSelect?.addEventListener('change', () => {
        if (advisorSelect.value) {
            advisorHelp.style.display = 'block';
        } else {
            advisorHelp.style.display = 'none';
        }
    });
    

});

// Generate 1000 seats (25 rows x 40 seats)
function generateSeats() {
    const seatMap = document.getElementById('seat-map');
    if (!seatMap) return;
    
    seatMap.innerHTML = '';
    seatMap.style.gridTemplateColumns = 'repeat(40, 1fr)';
    
    for (let row = 1; row <= 25; row++) {
        for (let seat = 1; seat <= 40; seat++) {
            const seatButton = document.createElement('button');
            const seatId = `${String.fromCharCode(64 + row)}${seat}`;
            
            seatButton.type = 'button';
            seatButton.className = 'seat';
            seatButton.textContent = seatId;
            seatButton.dataset.seatId = seatId;
            
            // Check if seat is actually occupied
            const productionName = document.getElementById('production-name').value;
            const performanceDate = document.getElementById('performance-date').value;
            
            if (productionName && performanceDate) {
                const occupiedSeats = checkSeatAvailability(productionName, performanceDate);
                if (occupiedSeats.includes(seatId)) {
                    seatButton.classList.add('occupied');
                    seatButton.disabled = true;
                }
            } else {
                // Randomly mark some seats as occupied (5%) if no specific show selected
                if (Math.random() < 0.05) {
                    seatButton.classList.add('occupied');
                    seatButton.disabled = true;
                }
            }
            
            seatButton.addEventListener('click', () => selectSeat(seatButton));
            seatMap.appendChild(seatButton);
        }
    }
}

// Handle seat selection
function selectSeat(seatButton) {
    if (seatButton.classList.contains('occupied')) return;
    
    const maxTickets = parseInt(document.getElementById('numberOfTickets').value) || 0;
    const selectedSeats = document.querySelectorAll('.seat.selected');
    
    // Validate ticket count is between 1-10
    if (maxTickets < 1 || maxTickets > 10) {
        alert('Please select between 1 and 10 tickets first');
        return;
    }
    
    if (seatButton.classList.contains('selected')) {
        seatButton.classList.remove('selected');
    } else if (selectedSeats.length < maxTickets) {
        seatButton.classList.add('selected');
    } else {
        alert(`You can only select ${maxTickets} seats`);
    }
    
    updateSelectedSeatsInput();
}

// Update selected seats input
function updateSelectedSeatsInput() {
    const selectedSeats = document.querySelectorAll('.seat.selected');
    const seatIds = Array.from(selectedSeats).map(seat => seat.dataset.seatId);
    document.getElementById('selected-seats').value = seatIds.join(', ');
    
    // Update display
    const display = document.getElementById('selected-seats-display');
    if (display) {
        if (seatIds.length > 0) {
            display.textContent = `Selected Seats: ${seatIds.join(', ')}`;
            display.style.color = '#2196F3';
        } else {
            display.textContent = 'No seats selected';
            display.style.color = '#666';
        }
    }
}

// Update seat selection based on number of tickets
function updateSeatSelection() {
    const maxTickets = parseInt(document.getElementById('numberOfTickets').value) || 0;
    const selectedSeats = document.querySelectorAll('.seat.selected');
    
    // If user reduces ticket count, remove excess selections
    if (selectedSeats.length > maxTickets) {
        for (let i = maxTickets; i < selectedSeats.length; i++) {
            selectedSeats[i].classList.remove('selected');
        }
        updateSelectedSeatsInput();
    }
}

// Calculate ticket price based on production type
function calculateTicketPrice(productionType, numberOfTickets) {
    const prices = {
        'movie': 500,
        'play': 800,
        'series': 600,
        'concert': 1200
    };
    return (prices[productionType] || 500) * numberOfTickets;
}

// Save booking to local storage
function saveBooking(bookingData) {
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    bookings.push(bookingData);
    localStorage.setItem('bookings', JSON.stringify(bookings));
}

// Mark seats as occupied
function markSeatsAsOccupied(selectedSeats, performanceDate, productionName) {
    const occupiedSeats = JSON.parse(localStorage.getItem('occupiedSeats') || '{}');
    const key = `${productionName}_${performanceDate}`;
    
    if (!occupiedSeats[key]) {
        occupiedSeats[key] = [];
    }
    
    const seatArray = selectedSeats.split(', ');
    occupiedSeats[key] = [...occupiedSeats[key], ...seatArray];
    localStorage.setItem('occupiedSeats', JSON.stringify(occupiedSeats));
}

// Generate and display ticket
function generateTicket(bookingData) {
    const user = JSON.parse(localStorage.getItem('user'));
    
    const ticketModal = document.createElement('div');
    ticketModal.className = 'unique-id-modal';
    ticketModal.innerHTML = `
        <div class="modal-content" style="max-width: 500px;">
            <h3 style="color: #4CAF50; margin-bottom: 20px;">🎫 Booking Confirmed!</h3>
            <div class="ticket" style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 20px; border-radius: 10px; color: #333; margin: 15px 0;">
                <div style="text-align: center; border-bottom: 2px dashed #333; padding-bottom: 15px; margin-bottom: 15px;">
                    <h2 style="margin: 0; color: #333;">🎬 GOLD CINEMA</h2>
                    <p style="margin: 5px 0;">Your Entertainment Destination</p>
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                    <div><strong>Booking ID:</strong><br>${bookingData.bookingId}</div>
                    <div><strong>Customer:</strong><br>${user.firstName} ${user.lastName}</div>
                    <div><strong>Production:</strong><br>${bookingData.productionName}</div>
                    <div><strong>Type:</strong><br>${bookingData.productionType.toUpperCase()}</div>
                    <div><strong>Date:</strong><br>${new Date(bookingData.performanceDate).toLocaleDateString()}</div>
                    <div><strong>Tickets:</strong><br>${bookingData.numberOfTickets}</div>
                    <div><strong>Seats:</strong><br>${bookingData.selectedSeats}</div>
                    <div><strong>Total:</strong><br>KSH ${bookingData.ticketPrice}</div>
                </div>
                <div style="text-align: center; margin-top: 15px; padding-top: 15px; border-top: 2px dashed #333;">
                    <p style="margin: 0; font-size: 0.8em;">Present this ticket at the venue</p>
                    <p style="margin: 0; font-size: 0.8em;">Booking Date: ${new Date(bookingData.bookingDate).toLocaleString()}</p>
                </div>
            </div>
            <div class="modal-buttons">
                <button onclick="printTicket()">🖨️ Print Ticket</button>
                <button onclick="closeTicketModal()">✅ Done</button>
            </div>
        </div>
    `;
    document.body.appendChild(ticketModal);
}

// Print ticket function
function printTicket() {
    window.print();
}

// Close ticket modal
function closeTicketModal() {
    const modal = document.querySelector('.unique-id-modal');
    if (modal) {
        modal.remove();
    }
}

// Check if seats are occupied for current selection
function checkSeatAvailability(productionName, performanceDate) {
    const occupiedSeats = JSON.parse(localStorage.getItem('occupiedSeats') || '{}');
    const key = `${productionName}_${performanceDate}`;
    return occupiedSeats[key] || [];
}

// Handle booking form submission
document.getElementById('booking-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        alert('Please login first to make a booking');
        window.location.href = 'register.html';
        return;
    }

    const numberOfTickets = parseInt(document.getElementById('numberOfTickets').value);
    const selectedSeats = document.getElementById('selected-seats').value;
    
    // Validate ticket count
    if (numberOfTickets < 1 || numberOfTickets > 10) {
        alert('You must select between 1 and 10 tickets');
        return;
    }
    
    // Validate seat selection
    if (!selectedSeats || selectedSeats.split(', ').length !== numberOfTickets) {
        alert(`Please select exactly ${numberOfTickets} seats`);
        return;
    }

    const formData = {
        productionType: document.getElementById('production-type').value,
        productionName: document.getElementById('production-name').value,
        performanceDate: document.getElementById('performance-date').value,
        numberOfTickets: numberOfTickets,
        selectedSeats: selectedSeats,
        saleDate: document.getElementById('saleDate').value,
        userId: user._id,
        userEmail: user.email,
        advisor: document.getElementById('advisor-select').value,
        helpMessage: document.getElementById('help-message')?.value || ''
    };

    try {
        // Generate booking ID
        const bookingId = 'BK' + Date.now();
        
        // Create booking data
        const bookingData = {
            ...formData,
            bookingId: bookingId,
            bookingDate: new Date().toISOString(),
            status: 'confirmed',
            ticketPrice: calculateTicketPrice(formData.productionType, numberOfTickets)
        };
        
        // Save booking to local storage
        saveBooking(bookingData);
        
        // Mark seats as occupied
        markSeatsAsOccupied(formData.selectedSeats, formData.performanceDate, formData.productionName);
        
        // Generate and show ticket
        generateTicket(bookingData);
        
        // Reset form
        document.getElementById('booking-form').reset();
        document.getElementById('advisor-help').style.display = 'none';
        
        // Regenerate seats to show updated availability
        generateSeats();
        
    } catch (error) {
        alert('Error making booking: ' + error.message);
    }
});

