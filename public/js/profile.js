document.addEventListener('DOMContentLoaded', () => {
    console.log('profile.js is loaded and running');

    // Load user profile data
    loadUserProfile();
});

function loadUserProfile() {
    const username = getCookie('username');
    console.log("Username from cookie:", username);

    if (username) {
        fetch(`/api/user-profile?username=${username}`)
            .then(response => response.json())
            .then(userProfile => {
                document.getElementById('username').value = userProfile.username;
                document.getElementById('email').value = userProfile.email;
                document.getElementById('address').value = userProfile.address || 'Update your address';
                document.getElementById('phoneNumber').value = userProfile.phoneNumber || 'Update your phone number';
            })
            .catch(error => {
                console.error('Error loading user profile:', error);
                if (error.message === 'User not found') {
                    alert('User not found. Please log in again.');
                    window.location.href = '/login.html';
                } else {
                    alert('An error occurred while loading the user profile.');
                }
            });
    } else {
        alert('User not logged in');
        window.location.href = '/login.html';
    }
}

function toggleEdit(fieldId) {
    const inputField = document.getElementById(fieldId);
    inputField.disabled = !inputField.disabled;

    // If the field is enabled (edit mode), focus on it
    if (!inputField.disabled) {
        inputField.focus();
        document.getElementById('saveButton').style.display = 'block';
    }
}

function saveProfile() {
    const oldUsername = getCookie('username'); 
    const newUsername = document.getElementById('username').value;

    const oldEmail = getCookie('email');
    const newEmail = document.getElementById('email').value;

    const address = document.getElementById('address').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    let updateUsernamePromise = Promise.resolve();
    let updateEmailPromise = Promise.resolve();

    // Update username only if it has changed
    if (oldUsername !== newUsername) {
        updateUsernamePromise = fetch('/api/update-username', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ oldUsername, newUsername })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Username updated successfully') {
                setCookie('username', newUsername, 7);
            } else {
                throw new Error(data.message);
            }
        });
    }

    // Update email only if it has changed
    if (oldEmail !== newEmail) {
        updateEmailPromise = updateUsernamePromise.then(() => {
            return fetch('/api/update-email', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: newUsername, newEmail })
            });
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Email updated successfully' || data.message === 'Email remains the same, no update necessary.') {
                setCookie('email', newEmail, 7);
            } else if (data.message === 'Email already exists') {
                throw new Error('This email is already associated with another account. Please use a different email.');
            } else {
                throw new Error(data.message);
            }
        });
    }

    // Update address and phone number only after username and email updates are resolved
    Promise.all([updateUsernamePromise, updateEmailPromise])
    .then(() => {
        if (oldUsername === newUsername && oldEmail === newEmail) {
            return; // No need to update the profile if neither username nor email changed
        }
        
        return fetch('/api/update-profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: newUsername, address, phoneNumber })
        });
    })
    .then(response => response ? response.json() : { message: 'Profile updated successfully' })
    .then(data => {
        if (data.message === 'Profile updated successfully') {
            alert('Profile updated successfully!');
        } else if (data.message) {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        alert(error.message);
    });

    // Disable input fields after saving
    document.getElementById('email').disabled = true;
    document.getElementById('address').disabled = true;
    document.getElementById('phoneNumber').disabled = true;

    // Hide the save button
    document.getElementById('saveButton').style.display = 'none';
}
function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    const username = getCookie('username');

    if (newPassword !== confirmNewPassword) {
        alert('New password and confirmation do not match!');
        return;
    }

    fetch('/api/update-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, currentPassword, newPassword })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Password updated successfully') {
            alert('Password updated successfully!');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            throw new Error(data.message);
        }
    })
    .catch(error => {
        console.error('Error updating password:', error);
        alert(error.message);
    });
}

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

function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Convert days to milliseconds
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}
