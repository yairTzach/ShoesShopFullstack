// routes/adminTrackRouter.js

const express = require('express');
const path = require('path');
const {
    isUserAdmin,
    fetchAllUsersActivityLogs,
} = require('../utils/persist'); // Import utility functions from persist module (adjust path as needed)

const adminTrackRouter = express.Router();

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

// Route to fetch and display all users' activity logs (accessible only to admins)
adminTrackRouter.get('/admin/activity-log', isAdmin, async (req, res) => {
    try {
        // Fetch all users' activity logs
        const activityLog = await fetchAllUsersActivityLogs();
        // Respond with the activity log in JSON format
        res.json(activityLog);
    } catch (error) {
        console.error('Error fetching activity log:', error);
        // Respond with 500 Internal Server Error if an error occurs
        res.status(500).json({ message: 'Server error fetching activity log' });
    }
});

module.exports = adminTrackRouter; // Export the adminTrackRouter to be used in other parts of the application
