// Handle login form submission
document.getElementById('Login Form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        uniqueId: document.getElementById('unique-id').value
    };

    try {
        const response = await fetch('http://localhost:5000/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        // Store token in localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        alert('Login successful!');
        window.location.href = 'booking.html';
    } catch (error) {
        // Try local login if server fails
        const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        const user = users.find(u => 
            u.email.toLowerCase() === formData.email.toLowerCase() && 
            u.uniqueId === formData.uniqueId
        );
        
        if (user) {
            const token = 'token_' + Date.now();
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            alert('Login successful!');
            window.location.href = 'booking.html';
        } else {
            alert('Login failed: Invalid email or unique ID');
        }
    }
});

// Generate unique ID with algorithm
function generateUniqueId(firstName, lastName, city) {
    const year = new Date().getFullYear().toString().slice(-2);
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const firstInitial = firstName.charAt(0).toUpperCase();
    const lastInitial = lastName.charAt(0).toUpperCase();
    const cityCode = city.substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 999) + 1;
    const paddedNum = String(randomNum).padStart(3, '0');
    
    return `GCS-${year}${month}-${firstInitial}${lastInitial}-${cityCode}-${paddedNum}`;
}

// Handle registration form submission
document.getElementById('SignUp Form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    clearErrorHighlights();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('signupEmail').value;
    const mobile = document.getElementById('mobile').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;
    
    // Validate fields before submission
    const validationErrors = validateRegistrationFields(firstName, lastName, email, mobile, address, city, zip);
    if (validationErrors.length > 0) {
        showRegistrationError(validationErrors.join('. ') + '.');
        return;
    }
    
    const formData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        mobile: mobile,
        address: address,
        city: city,
        zipCode: zip,
        uniqueId: generateUniqueId(firstName, lastName, city)
    };

    try {
        // Check for duplicate email/mobile in local storage
        const duplicateCheck = checkForDuplicates(email, mobile);
        if (duplicateCheck) {
            showRegistrationError(duplicateCheck);
            return;
        }
        
        // Simulate successful registration
        const userData = {
            ...formData,
            id: Date.now(),
            createdAt: new Date().toISOString()
        };
        
        // Store user data locally
        saveUserData(userData);
        
        // Generate token
        const token = 'token_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        // Show unique ID in a modal popup
        showUniqueIdModal(formData.uniqueId, firstName, lastName);
    } catch (error) {
        showRegistrationError(error.message);
    }
});

// Show/Hide forms based on tab selection
function showForm(formType) {
    const loginForm = document.getElementById('Login Form');
    const signupForm = document.getElementById('SignUp Form');
    
    // Remove active class from both forms
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    
    // Show selected form
    if (formType === 'Login') {
        loginForm.classList.add('active');
    } else if (formType === 'SignUp') {
        signupForm.classList.add('active');
    }
}

// Toggle support chat
function toggleSupport() {
    const overlay = document.getElementById('support-overlay');
    if (overlay.style.display === 'none' || overlay.style.display === '') {
        overlay.style.display = 'block';
        // Load welcome message if chat is empty
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages && chatMessages.children.length === 0) {
            addMessageToChat('Support Team', 'Welcome to Gold Cinema Support! How can we help you today? No login required - just ask your question!', 'advisor-message');
        }
    } else {
        overlay.style.display = 'none';
    }
}

// Show login form by default when page loads
document.addEventListener('DOMContentLoaded', () => {
    showForm('Login');
    initializeSupport();
    
    // Add input listeners to clear error highlights
    const formFields = ['firstName', 'lastName', 'signupEmail', 'mobile', 'address', 'city', 'zip'];
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', () => {
                field.style.borderColor = '#ccc';
                field.style.backgroundColor = 'white';
            });
        }
    });
});

// Support chat functionality
function initializeSupport() {
    const submitIssueBtn = document.getElementById('submit-issue');
    const issueDescription = document.getElementById('issue-description');
    const advisorSelect = document.getElementById('advisor-select');
    const chatMessages = document.getElementById('chat-messages');

    submitIssueBtn?.addEventListener('click', async () => {
        const issue = issueDescription.value.trim();
        if (!issue) {
            alert('Please describe your issue');
            return;
        }

        try {
            // Add user message to chat immediately
            addMessageToChat('You', issue, 'user-message');
            
            // Clear input
            issueDescription.value = '';
            
            // Simulate advisor response (replace with real API call)
            setTimeout(() => {
                const advisorName = getAdvisorName(advisorSelect.value);
                const response = generateAdvisorResponse(issue, advisorName);
                addMessageToChat(advisorName, response, 'advisor-message');
            }, 2000);
            
        } catch (error) {
            addMessageToChat('System', 'Failed to submit issue: ' + error.message, 'advisor-message');
        }
    });

    // Load existing tickets if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
        loadUserTickets();
    }
}

// Show unique ID modal
function showUniqueIdModal(uniqueId, firstName, lastName) {
    const modal = document.createElement('div');
    modal.className = 'unique-id-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="color: #4CAF50; margin-bottom: 20px;">🎉 Account Created Successfully!</h3>
            <p style="font-size: 1.1em; margin-bottom: 10px;">Welcome to Gold Cinema, <strong>${firstName} ${lastName}</strong>!</p>
            <p style="margin-bottom: 15px;">Your Unique Customer ID is:</p>
            <div class="unique-id-display">${uniqueId}</div>
            <div style="background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
                <p style="margin: 0; font-size: 0.9em; color: #856404;"><strong>⚠️ Important:</strong> Save this ID safely! You'll need it to login.</p>
            </div>
            <div style="font-size: 0.8em; color: #666; margin-bottom: 20px;">
                <p><strong>ID Format Explanation:</strong></p>
                <p>GCS-${uniqueId.split('-')[1]}-${uniqueId.split('-')[2]}-${uniqueId.split('-')[3]}-${uniqueId.split('-')[4]}</p>
                <p>Year-Month | Initials | City | Number</p>
            </div>
            <div class="modal-buttons">
                <button onclick="copyUniqueId('${uniqueId}')">📋 Copy ID</button>
                <button onclick="closeUniqueIdModal()">🎬 Start Booking</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Copy unique ID to clipboard
function copyUniqueId(uniqueId) {
    navigator.clipboard.writeText(uniqueId).then(() => {
        alert('Unique ID copied to clipboard!');
    });
}

// Close unique ID modal
function closeUniqueIdModal() {
    const modal = document.querySelector('.unique-id-modal');
    if (modal) {
        modal.remove();
        window.location.href = 'booking.html';
    }
}

// Show registration error with field highlighting
function showRegistrationError(errorMessage) {
    // Clear previous errors
    clearErrorHighlights();
    
    // Determine which fields to highlight based on error
    const errorFields = getErrorFields(errorMessage);
    
    // Highlight problematic fields
    errorFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#f44336';
            field.style.backgroundColor = '#ffebee';
        }
    });
    
    // Show error modal
    const modal = document.createElement('div');
    modal.className = 'unique-id-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h3 style="color: #f44336; margin-bottom: 20px;">❌ Registration Failed</h3>
            <div style="background-color: #ffebee; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #f44336;">
                <p style="margin: 0; color: #c62828;"><strong>Error:</strong> ${errorMessage}</p>
            </div>
            <div style="font-size: 0.9em; color: #666; margin-bottom: 20px;">
                <p><strong>Please check the highlighted fields and try again.</strong></p>
                ${getErrorSuggestions(errorMessage)}
            </div>
            <div class="modal-buttons">
                <button onclick="closeErrorModal()" style="background-color: #f44336;">🔄 Try Again</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// Get fields to highlight based on error message
function getErrorFields(errorMessage) {
    const fields = [];
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('email')) fields.push('signupEmail');
    if (lowerError.includes('name') || lowerError.includes('first')) fields.push('firstName');
    if (lowerError.includes('last')) fields.push('lastName');
    if (lowerError.includes('mobile') || lowerError.includes('phone')) fields.push('mobile');
    if (lowerError.includes('address')) fields.push('address');
    if (lowerError.includes('city')) fields.push('city');
    if (lowerError.includes('zip') || lowerError.includes('postal')) fields.push('zip');
    
    // If no specific field identified, highlight all required fields
    if (fields.length === 0) {
        return ['firstName', 'lastName', 'signupEmail', 'mobile', 'address', 'city', 'zip'];
    }
    
    return fields;
}

// Get error suggestions based on error message
function getErrorSuggestions(errorMessage) {
    const lowerError = errorMessage.toLowerCase();
    
    if (lowerError.includes('email')) {
        return '<p>• Make sure email format is correct (example@domain.com)</p><p>• Email might already be registered</p>';
    }
    if (lowerError.includes('mobile') || lowerError.includes('phone')) {
        return '<p>• Use format: 123-456-7890</p><p>• Include country code if international</p>';
    }
    if (lowerError.includes('network') || lowerError.includes('connection')) {
        return '<p>• Check your internet connection</p><p>• Try refreshing the page</p>';
    }
    if (lowerError.includes('server')) {
        return '<p>• Server temporarily unavailable</p><p>• Please try again in a few minutes</p>';
    }
    
    return '<p>• Ensure all fields are filled correctly</p><p>• Check for special characters or invalid formats</p>';
}

// Clear error highlights
function clearErrorHighlights() {
    const fields = ['firstName', 'lastName', 'signupEmail', 'mobile', 'address', 'city', 'zip'];
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.style.borderColor = '#ccc';
            field.style.backgroundColor = 'white';
        }
    });
}

// Close error modal
function closeErrorModal() {
    const modal = document.querySelector('.unique-id-modal');
    if (modal) {
        modal.remove();
    }
    clearErrorHighlights();
}

// Validate registration fields
function validateRegistrationFields(firstName, lastName, email, mobile, address, city, zip) {
    const errors = [];
    
    // Name validation
    if (!firstName || firstName.trim().length < 2) {
        errors.push('First Name must be at least 2 characters');
        highlightField('firstName');
    }
    if (!lastName || lastName.trim().length < 2) {
        errors.push('Last Name must be at least 2 characters');
        highlightField('lastName');
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
        errors.push('Please enter a valid email address');
        highlightField('signupEmail');
    }
    
    // Mobile validation
    const mobileRegex = /^[\d\-\+\(\)\s]{10,15}$/;
    if (!mobile || !mobileRegex.test(mobile)) {
        errors.push('Mobile number must be 10-15 digits (format: 123-456-7890)');
        highlightField('mobile');
    }
    
    // Address validation
    if (!address || address.trim().length < 5) {
        errors.push('Address must be at least 5 characters');
        highlightField('address');
    }
    
    // City validation
    if (!city || city.trim().length < 2) {
        errors.push('City name must be at least 2 characters');
        highlightField('city');
    }
    
    // Zip code validation
    const zipRegex = /^[\d\-]{4,10}$/;
    if (!zip || !zipRegex.test(zip)) {
        errors.push('Zip code must be 4-10 digits');
        highlightField('zip');
    }
    
    return errors;
}

// Highlight specific field
function highlightField(fieldId) {
    const field = document.getElementById(fieldId);
    if (field) {
        field.style.borderColor = '#f44336';
        field.style.backgroundColor = '#ffebee';
    }
}

// Check for duplicate email or mobile
function checkForDuplicates(email, mobile) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    const emailExists = users.find(user => user.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
        highlightField('signupEmail');
        return 'This email address is already registered. Please use a different email or try logging in.';
    }
    
    const mobileExists = users.find(user => user.mobile === mobile);
    if (mobileExists) {
        highlightField('mobile');
        return 'This mobile number is already registered. Please use a different number or try logging in.';
    }
    
    return null;
}

// Save user data to local storage
function saveUserData(userData) {
    const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    users.push(userData);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
}

// Add message to chat
function addMessageToChat(sender, message, messageType) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${messageType}`;
    messageDiv.innerHTML = `
        <div class="message-header">${sender} - ${new Date().toLocaleTimeString()}</div>
        <div class="message-content">${message}</div>
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Get advisor name from select value
function getAdvisorName(advisorValue) {
    const advisorNames = {
        'advisor3': 'Armour Johns',
        'advisor6': 'Roman Sande'
    };
    return advisorNames[advisorValue] || 'Support Team';
}

// Generate advisor response based on issue
function generateAdvisorResponse(issue, advisorName) {
    const lowerIssue = issue.toLowerCase();
    
    // Roman Sande - Company Information
    if (advisorName === 'Roman Sande') {
        if (lowerIssue.includes('about') || lowerIssue.includes('company') || lowerIssue.includes('gold cinema')) {
            return `Hi! I'm Roman Sande. Gold Cinema was established in 2020 as a premium entertainment destination. We offer movies, theatrical plays, TV series screenings, and live concerts with 1000-seat capacity. Our mission is to provide world-class entertainment experiences. What would you like to know about our company?`;
        }
        if (lowerIssue.includes('services') || lowerIssue.includes('what')) {
            return `Hello! Roman Sande here. Gold Cinema offers: 1) Latest movie screenings, 2) Live theatrical performances, 3) TV series special events, 4) Concert shows, 5) VIP services, 6) Group bookings, 7) Advanced online booking system. Which service interests you most?`;
        }
        return `Hi! I'm Roman Sande from Gold Cinema. I'm here to tell you about our company and services. We're a premier entertainment venue offering movies, plays, series, and concerts. What specific information about Gold Cinema can I share with you?`;
    }
    
    // Armour Johns - General Support
    if (lowerIssue.includes('register') || lowerIssue.includes('account') || lowerIssue.includes('signup')) {
        return `Hello! ${advisorName} here for general support. For registration: 1) Fill all required fields, 2) Use valid email format, 3) You'll get a unique ID (GCS-YYMM-II-CCC-NNN), 4) Save your ID for future logins. What registration issue can I help with?`;
    }
    if (lowerIssue.includes('login') || lowerIssue.includes('access')) {
        return `Hi! ${advisorName} speaking. For login help: 1) Use your registered email, 2) Enter your unique ID correctly, 3) Check for typos, 4) Contact us if you forgot your ID. What login problem are you experiencing?`;
    }
    if (lowerIssue.includes('password') || lowerIssue.includes('forgot')) {
        return `Hello! ${advisorName} here. We use unique IDs instead of passwords. If you forgot your unique ID, please provide your registered email and I can help you recover it. Do you remember your email address?`;
    }
    
    return `Hi! I'm ${advisorName} from Gold Cinema general support. I help with account issues, registration problems, and general questions. How can I assist you today with: "${issue}"?`;
}

async function loadUserTickets() {
    // Add welcome message when support chat loads
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages && chatMessages.children.length === 0) {
        addMessageToChat('Support Team', 'Welcome to Gold Cinema Support! How can we help you today? Please describe your issue and select an advisor if you have a preference.', 'advisor-message');
    }
}