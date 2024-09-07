const express = require('express');
const path = require('path');
const { isUserAdmin } = require('../utils/persist'); // Import the isUserAdmin function from the persist module

const adminRouter = express.Router();

// Middleware to check if the user is an admin
async function isAdmin(req, res, next) {
    const { userId, username } = req.cookies; // Extract userId and username from cookies

    // Check if userId and username cookies exist
    if (userId && username) {
        try {
            // Verify if the user is an admin
            const user = await isUserAdmin(userId, username);
            if (!user) {
                // Clear cookies and respond with 403 Access Denied if the user is not an admin
                res.clearCookie('userId');
                res.clearCookie('username');
                return res.status(403).json({ message: 'Access denied' });
            } else {
                req.user = user;  // Attach the user object to the request for use in subsequent routes
                next();  // Proceed to the next middleware or route handler
            }
        } catch (err) {
            console.error('Error finding user:', err);
            // Clear cookies and respond with 500 Internal Server Error if an error occurs
            res.clearCookie('userId');
            res.clearCookie('username');
            return res.status(500).json({ message: 'Internal server error' });
        }
    } else {
        // Respond with 403 Access Denied if cookies are missing
        res.status(403).json({ message: 'Access denied' });
    }
}

// Route to serve the admin page (admin.html)
// This route is protected by the isAdmin middleware
adminRouter.get('/admin.html', isAdmin, (req, res) => {
    // Send the admin.html file located in the public/html directory
    res.sendFile(path.join(__dirname, '../public/html/admin.html')); 
});

module.exports = adminRouter; // Export the adminRouter to be used in other parts of the application
