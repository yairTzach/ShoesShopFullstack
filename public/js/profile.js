document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const editDetailsButton = document.getElementById('editDetailsButton');
    const saveButton = document.getElementById('saveButton');
    const editPasswordButton = document.getElementById('editPasswordButton');
    const changePasswordButton = document.getElementById('changePasswordButton');

    // Add event listener to the logout button
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default button behavior

            try {
                const response = await fetch('/logout', { method: 'GET' });
                if (response.redirected) {
                    window.location.href = response.url; // Redirect to the login page after logout
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }

    // Add event listener for editing profile details
    if (editDetailsButton) {
        editDetailsButton.addEventListener('click', toggleEditDetails);
    }

    // Add event listener for saving profile changes
    if (saveButton) {
        saveButton.addEventListener('click', saveProfile);
    }

    // Add event listener for editing password
    if (editPasswordButton) {
        editPasswordButton.addEventListener('click', toggleEditPassword);
    }

    // Add event listener for changing password
    if (changePasswordButton) {
        changePasswordButton.addEventListener('click', changePassword);
    }

    // Initially hide the save and change password buttons
    saveButton.style.display = 'none';
    changePasswordButton.style.display = 'none';

    // Load user profile data when the page loads
    loadUserProfile();
});

// Function to load user profile data from the server
async function loadUserProfile() {
    const username = getCookie('username');
    console.log("Username from cookie:", username);

    if (username) {
        try {
            const response = await fetch(`/api/user-profile?username=${username}`);
            if (!response.ok) throw new Error('Failed to load user profile');
            const userProfile = await response.json();

            // Populate the form fields with the user's profile data
            document.getElementById('username').value = userProfile.username;
            document.getElementById('email').value = userProfile.email;
            document.getElementById('address').value = userProfile.address || 'Update your address';
            document.getElementById('phoneNumber').value = userProfile.phoneNumber || 'Update your phone number';
        } catch (error) {
            console.error('Error loading user profile:', error);
            alert('An error occurred while loading the user profile.');
            if (error.message === 'User not found') {
                window.location.href = '/html/login.html'; // Redirect to login if user is not found
            }
        }
    } else {
        window.location.href = '/html/login.html'; // Redirect to login if username is not found in cookies
    }
}

// Function to toggle the edit mode for profile details
function toggleEditDetails() {
    const detailsFields = ['username', 'email', 'address', 'phoneNumber'];
    const areDetailsDisabled = document.getElementById('username').disabled;

    // Toggle the disabled state of the form fields
    detailsFields.forEach(field => {
        document.getElementById(field).disabled = !areDetailsDisabled;
    });

    // Toggle the visibility of the save button
    document.getElementById('saveButton').style.display = areDetailsDisabled ? 'block' : 'none';
    document.getElementById('editDetailsButton').textContent = areDetailsDisabled ? 'Cancel' : 'Edit Details';
}

// Function to toggle the edit mode for the password fields
function toggleEditPassword() {
    const passwordFields = ['currentPassword', 'newPassword', 'confirmNewPassword'];
    const arePasswordFieldsDisabled = document.getElementById('currentPassword').disabled;

    // Toggle the disabled state of the password fields
    passwordFields.forEach(field => {
        document.getElementById(field).disabled = !arePasswordFieldsDisabled;
    });

    // Toggle the visibility of the change password button
    document.getElementById('changePasswordButton').style.display = arePasswordFieldsDisabled ? 'block' : 'none';
    document.getElementById('editPasswordButton').textContent = arePasswordFieldsDisabled ? 'Cancel' : 'Edit Password';
}

// Function to handle password change
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const username = getCookie('username');

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all password fields.');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match.');
        return;
    }

    try {
        const response = await fetch('/api/update-password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, currentPassword, newPassword })
        });

        const data = await response.json();

        if (data.message === 'Password updated successfully') {
            alert('Password updated successfully!');
            // Clear the password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';

            toggleEditPassword(); // Reset the password fields
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('Error updating password:', error);
        alert(error.message);
    }
}

// Function to save profile changes
async function saveProfile() {
    const oldUsername = getCookie('username');
    const newUsername = document.getElementById('username').value;
    const oldEmail = getCookie('email');
    const newEmail = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    try {
        const response = await fetch('/api/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldUsername, newUsername, newEmail, address, phoneNumber })
        });

        const data = await response.json();

        if (data.message === 'Profile updated successfully') {
            alert('Profile updated successfully!');
            setCookie('username', newUsername, 7);
            setCookie('email', newEmail, 7);

            toggleEditDetails(); // Reset the fields
        } else {
            alert(data.message); // Display the error message
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        alert('An error occurred while updating the profile.');
    }
}

// Utility function to get the value of a specific cookie by name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Utility function to set a cookie with a specified name, value, and expiration in days
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
