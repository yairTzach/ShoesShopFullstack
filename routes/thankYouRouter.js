const express = require('express');
const path = require('path');

const router = express.Router();

// Middleware to ensure the user is authenticated by checking the presence of userId and username cookies
function ensureAuthenticated(req, res, next) {
    const { userId, username } = req.cookies;

    // If userId or username is missing, redirect to the main page
    if (!userId || !username) {
        return res.redirect('/html/main.html');
    }

    // If authentication is successful, proceed to the next middleware or route handler
    next();
}

// Route to serve the thankYou.html page, protected by the ensureAuthenticated middleware
router.get('/thankYou.html', ensureAuthenticated, async (req, res) => {
    const { userId, username } = req.cookies; // Extract userId and username from cookies

    try {
        // Find the user in the database using the userId from the cookie
        const user = await findUserById(userId);

        // Check if the user exists and the username matches the one in the cookie
        if (user && user.username === username) {
            // If the user is valid, send the thankYou.html page
            return res.sendFile(path.join(__dirname, '../public/html/thankYou.html'));
        } else {
            // If the user is not valid, redirect to the main page
            return res.redirect('/html/main.html');
        }
    } catch (error) {
        // Handle any errors that occur during the process
        console.error('Error validating user:', error);
        return res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
