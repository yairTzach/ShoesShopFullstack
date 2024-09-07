// routes/registerRouter.js

const express = require('express');
const {
    findUserByUsernameOrEmail,
    createUser,
    hashPassword,
    validateUsername,
    validatePassword,
    validateEmail,
} = require('../utils/persist'); // Adjust the path to persist module as needed

const registerRouter = express.Router();

// Registration route
registerRouter.post('/register', async (req, res) => {
    const { username, password, email } = req.body; // Extract username, password, and email from the request body

    // Validate the provided username
    if (!validateUsername(username)) {
        return res.status(400).json({ 
            message: 'Username must be 5-20 characters long, contain only letters, numbers, and underscores, and cannot have consecutive underscores.' 
        });
    }

    // Validate the provided password
    if (!validatePassword(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, one number, one special character, and must not be a common password.' 
        });
    }

    // Validate the provided email
    if (!validateEmail(email)) {
        return res.status(400).json({ message: 'Invalid email format.' });
    }

    try {
        // Check if the username or email already exists in the database
        const existingUser = await findUserByUsernameOrEmail(username, email);
        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(400).json({ message: 'Username already exists' });
            }
            if (existingUser.email === email) {
                return res.status(400).json({ message: 'Email already exists' });
            }
        }

        // Hash the password before storing it in the database
        const hashedPassword = await hashPassword(password);

        // Create and save the new user in the database
        await createUser(username, hashedPassword, email);

        // Send a success message after successful registration
        res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
        // Log the error and send a server error response
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

module.exports = registerRouter;
