const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');
const {
    findUserByUsername,
    findUserById,
    saveUser,
    populateCartData,
    logUserActivity
} = require('../utils/persist'); // Import utility functions from persist module (adjust path as needed)

const authRouter = express.Router();

// GET route to serve the login page
authRouter.get('/login', (req, res) => {
    // Serve the login.html file located in the public/html directory
    res.sendFile(path.join(__dirname, '../public/html/login.html')); 
});

// POST route to handle user login
authRouter.post('/login', async (req, res) => {
    const { username, password, rememberMe } = req.body; // Extract username, password, and rememberMe from the request body

    try {
        // Find the user by username
        const user = await findUserByUsername(username);
        
        // Check if the user exists and the password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid username or password' }); // Respond with 400 if credentials are incorrect
        }

        // Set the maxAge for cookies based on the rememberMe option
        const maxAge = rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000; // 10 days or 30 minutes

        // Set cookies for userId and username
        res.cookie('userId', user._id, { maxAge, httpOnly: false, secure: false, sameSite: 'Lax' });
        res.cookie('username', user.username, { maxAge, httpOnly: false, secure: false });

        // Log the login activity
        await logUserActivity(user, 'login');

        // Load and set the cart cookie after a successful login
        const cart = await populateCartData(user.cart);

        // Debugging: Output the cart before setting the cookie
        console.log(`Cart for ${username}:`, cart);

        res.cookie('cart', JSON.stringify(cart), { maxAge, httpOnly: false, secure: false, sameSite: 'Lax' });

        // Save the user data to the file after login
        await saveUser(user);

        // Redirect to the appropriate page based on the user role
        res.redirect(user.isAdmin ? 'http://localhost:3000/html/activityLog.html' : 'http://localhost:3000/html/main.html');
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' }); // Respond with 500 Internal Server Error on failure
    }
});

// GET route to handle user logout
// GET route to handle user logout
authRouter.get('/logout', async (req, res) => {
    const { userId, username } = req.cookies; // Extract userId and username from cookies

    try {
        // Find the user by userId
        const user = await findUserById(userId);
        
        // Log the logout activity if the user is found and the username matches
        if (user && user.username === username) {
            await logUserActivity(user, 'logout');
        }

        // Clear all cookies related to the user session on logout
        res.clearCookie('userId');
        res.clearCookie('username');
        res.clearCookie('cart');
        res.clearCookie('address'); // Clear address cookie if it is used

        // Redirect to the login page or another appropriate page after logout
        res.redirect('http://localhost:3000/login');
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' }); // Respond with 500 Internal Server Error on failure
    }
});

module.exports = authRouter; // Export the authRouter to be used in other parts of the application
