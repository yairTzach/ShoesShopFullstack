const express = require('express');
const path = require('path');
const Review = require('../models/Review');
const { findReviews, findUserById } = require('../utils/persist'); 

const publicReviewsRouter = express.Router();

// Route to validate if the user is authenticated
publicReviewsRouter.get('/api/validate-user', async (req, res) => {
    const { userId, username } = req.cookies;

    // Check if userId and username are present in the cookies
    if (!userId || !username) {
        return res.status(401).json({ isValid: false, message: 'Unauthorized' });
    }

    try {
        const user = await findUserById(userId);
        // Validate if the user exists and the username matches
        if (!user || user.username !== username) {
            return res.status(404).json({ isValid: false, message: 'User not found or username mismatch' });
        }

        // Respond with a success status if the user is valid
        res.status(200).json({ isValid: true });
    } catch (error) {
        console.error('Error validating user:', error);
        res.status(500).json({ isValid: false, message: 'Server error' });
    }
});




// Route to fetch public reviews based on query parameters
publicReviewsRouter.get('/api/publicReviews', async (req, res) => {
    try {
        const { title, brand, rating, productId } = req.query; // Extract query parameters
        const query = {};

        // Build the query based on provided parameters
        if (title) {
            query.title = new RegExp(title, 'i'); // Case-insensitive title search
        }

        if (brand) {
            query.brand = brand; // Exact match for brand
        }

        if (rating) {
            query.overallRating = { $gte: parseFloat(rating) }; // Match reviews with a rating greater than or equal to the specified rating
        }

        if (productId) {
            query.productId = productId; // Exact match for productId
        }

        const reviews = await findReviews(query);
        res.status(200).json(reviews); // Return the list of reviews as a JSON array
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
});

// Route to delete a review by its ID, only accessible to admins
publicReviewsRouter.delete('/api/submitReview/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extract review ID from the request parameters

        // Ensure the user is an admin
        const { userId } = req.cookies;
        const user = await findUserById(userId);

        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Unauthorized action' }); // Respond with 403 Forbidden if the user is not an admin
        }

        const submitReview = await Review.findByIdAndDelete(id); // Delete the review by its ID

        if (submitReview) {
            return res.status(200).json({ success: true, message: 'Review deleted successfully' }); // Confirm deletion
        } else {
            return res.status(404).json({ message: 'Review not found' }); // Respond with 404 Not Found if the review doesn't exist
        }
    } catch (error) {
        console.error('Error deleting review:', error);
        return res.status(500).json({ message: 'Failed to delete review', error: error.message }); // Respond with 500 Internal Server Error on failure
    }
});

// Route to check if the current user is an admin
publicReviewsRouter.get('/api/check-admin', async (req, res) => {
    try {
        const { userId } = req.cookies;
        const user = await findUserById(userId);

        // Respond with isAdmin status
        if (user && user.isAdmin) {
            res.json({ isAdmin: true });
        } else {
            res.json({ isAdmin: false });
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
        res.status(500).json({ message: 'Error checking admin status' });
    }
});

module.exports = publicReviewsRouter;
