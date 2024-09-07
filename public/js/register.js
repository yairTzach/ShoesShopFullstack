document.addEventListener('DOMContentLoaded', function () {
    // Get the registration form element by its ID
    const registerForm = document.getElementById('register-form');

    // Add an event listener for the form submission event
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        // Collect form data into a FormData object
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries()); // Convert form data to a plain object

        let alertShown = false;  // Flag to ensure only one alert is shown at a time

        // Password Validation
        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/; // Password regex pattern
        const commonPasswords = ["password", "123456", "123456789", "qwerty", "abc123", "password1", "12345678"]; // List of common passwords

        // Check if passwords match
        if (data.password !== data.repeatPassword) {
            if (!alertShown) {
                alert('Passwords do not match.'); // Show alert if passwords do not match
                alertShown = true;
            }
            return; // Exit function if validation fails
        }

        // Validate password strength and ensure it's not a common password
        if (!passwordPattern.test(data.password) || commonPasswords.includes(data.password.toLowerCase())) {
            if (!alertShown) {
                alert('Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not be a common password.');
                alertShown = true;
            }
            return; // Exit function if validation fails
        }

        // Username Validation
        const usernamePattern = /^[a-zA-Z0-9_]{5,20}$/; // Username regex pattern
        if (!usernamePattern.test(data.username) || /__/.test(data.username)) {
            if (!alertShown) {
                alert('Username must be 5-20 characters long, contain only letters, numbers, and underscores, and cannot have consecutive underscores.');
                alertShown = true;
            }
            return; // Exit function if validation fails
        }

        try {
            // Send the registration data to the server
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data) // Convert data object to JSON
            });
            
            if (!response.ok) {
                let result;
                try {
                    result = await response.json(); // Attempt to parse the response as JSON
                } catch (jsonError) {
                    console.error('Error parsing JSON:', jsonError);
                    result = { message: 'Registration failed. Please try again.' }; // Fallback error message
                }

                // Show appropriate alert based on the server response
                if (!alertShown) {
                    if (result.message.includes('Username already exists')) {
                        alert('Username already exists. Please choose a different one.');
                    } else if (result.message.includes('Email already exists')) {
                        alert('Email already exists. Please use a different email.');
                    } else {
                        alert(result.message || 'Registration failed. Please try again.');
                    }
                    alertShown = true;
                }
                return; // Exit function if registration fails
            }

            const result = await response.json(); // Parse the successful response as JSON
            console.log('Registration result:', result);

            // Show server message and redirect if registration is successful
            if (result.message) {
                console.log('Server message:', result.message);
                if (!alertShown) {
                    alert(result.message);
                    alertShown = true;
                }
                if (result.message.includes('Registration successful')) {
                    window.location.href = '/login'; // Redirect to login page after successful registration
                }
            } else {
                if (!alertShown) {
                    alert('Registration successful. Good luck!');
                    alertShown = true;
                    window.location.href = '/login'; // Redirect to login page after successful registration
                }
            }
        } catch (error) {
            console.error('Registration error:', error);
            if (!alertShown) {
                alert('An error occurred. Please try again.'); // Show error alert if the request fails
                alertShown = true;
            }
        }
    });
});
