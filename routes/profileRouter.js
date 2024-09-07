const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const {
    findUserByUsername,
    findUserByUsernameOrEmail,
    saveUser,
    isUsernameTaken,
    hashPassword,
    validateUsername,
    validatePassword,
    validateEmail,
    findUserById
} = require('../utils/persist'); // Adjust the path to the persist module as needed

const router = express.Router();

// Route to get user profile data
router.get('/api/user-profile', async (req, res) => {
    const { username } = req.query; // Extract username from query parameters

    try {
        // Find the user by username
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Respond with 404 if user doesn't exist
        }

        // Respond with the user's profile data
        res.status(200).json({
            username: user.username,
            email: user.email,
            address: user.address,
            phoneNumber: user.phoneNumber
        });
    } catch (error) {
        console.error('Error fetching user profile:', error); // Log any errors
        res.status(500).json({ message: 'Server error fetching user profile' }); // Respond with 500 Internal Server Error on failure
    }
});

// Route to update the user's profile
router.put('/api/update-profile', async (req, res) => {
    const { oldUsername, newUsername, newEmail, address, phoneNumber } = req.body; // Extract profile data from request body

    try {
        // Find the user by old username
        const user = await findUserByUsername(oldUsername);
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Respond with 404 if user doesn't exist
        }

        // Validate new username and email
        if (!validateUsername(newUsername)) {
            return res.status(400).json({ 
                message: 'Username must be 5-20 characters long, contain only letters, numbers, and underscores, and cannot have consecutive underscores.' 
            });
        }

        if (!validateEmail(newEmail)) {
            return res.status(400).json({ message: 'Invalid email format.' });
        }

        // Check if the new username is already taken (if it has changed)
        if (oldUsername != newUsername) {
            const existingUser = await isUsernameTaken(newUsername);
            if (existingUser) {
                return res.status(400).json({ message: 'Username already exists' });
            }
        }

        // Validate if the new email is already in use by another user
        const emailExists = await findUserByUsernameOrEmail(null, newEmail);
        if (emailExists && emailExists._id.toString() != user._id.toString()) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Update the user's profile data
        user.username = newUsername;
        user.email = newEmail;
        user.address = address;
        user.phoneNumber = phoneNumber;

        // Include oldUsername to trigger file deletion if needed
        await saveUser({ ...user, oldUsername });

        // Respond with success message
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        console.error('Error updating profile:', error); // Log any errors
        res.status(500).json({ message: 'Server error updating profile', error: error.message }); // Respond with 500 Internal Server Error on failure
    }
});

// Route to serve the profile.html page
router.get('/profile.html', async (req, res) => {
    const { userId, username } = req.cookies; // Extract userId and username from cookies

    // Check if userId and username are present in the cookies
    if (!userId || !username) {
        return res.redirect('/html/login'); // Redirect to login if cookies are missing
    }

    try {
        // Find the user by userId
        const user = await findUserById(userId);
        // Validate if the user exists and the username matches
        if (user && user.username == username) {
            return res.sendFile(path.join(__dirname, '../public/html/profile.html')); // Serve profile.html if credentials match
        } else {
            return res.redirect('/login'); // Redirect to login if credentials do not match
        }
    } catch (error) {
        console.error('Error validating user for profile page:', error); // Log any errors
        return res.status(500).json({ message: 'Server error' }); // Respond with 500 Internal Server Error on failure
    }
});

// Route to update the user's password
router.put('/api/update-password', async (req, res) => {
    const { username, currentPassword, newPassword } = req.body; // Extract username, current password, and new password from request body

    try {
        // Find the user by username
        const user = await findUserByUsername(username);
        if (!user) {
            return res.status(404).json({ message: 'User not found' }); // Respond with 404 if user doesn't exist
        }

        // Compare the current password with the stored hashed password
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' }); // Respond with 400 if current password doesn't match
        }

        // Validate the new password
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ 
                message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not be a common password.' 
            });
        }

        // Hash the new password and save it to the user's profile
        const hashedPassword = await hashPassword(newPassword);
        user.password = hashedPassword;
        await saveUser(user);

        // Respond with success message
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error); // Log any errors
        res.status(500).json({ message: 'Server error updating password' }); // Respond with 500 Internal Server Error on failure
    }
});

module.exports = router;
