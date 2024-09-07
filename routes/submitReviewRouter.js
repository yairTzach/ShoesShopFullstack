const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

// Import utility functions for handling reviews and product ratings
const {
    saveReview,
    findReviewsByProductId,
    updateProductAverageRating,
} = require('../utils/persist');

const reviewRouter = express.Router();

// Route to serve the submitReview.html page
reviewRouter.get('../submitReview.html', (req, res) => {
    const { userId, username, productTitle, productImage, productId } = req.cookies;

    // Check if the user is authenticated
    if (userId && username) {
        // If product details are missing in the cookies, redirect to the purchase history page
        if (!productTitle || !productImage || !productId) {
            return res.redirect('/main.html');
        }

        // Serve the submitReview.html page if the user is logged in and product details are available
        res.sendFile(path.join(__dirname, '../public/html/submitReview.html'));
    } else {
        // Redirect to the login page if the user is not logged in
        res.redirect('/login');
    }
});

// Route to handle review submission
reviewRouter.post('/api/submit-submitReview', async (req, res) => {
    try {
        console.log('Request received to submit a review:', req.body); // Log the request body
        console.log('Cookies received:', req.cookies); // Log the cookies

        const { userId, orderNumber } = req.cookies; // Retrieve the user's ID and order number from cookies

        // Destructure the review data from the request body
        const {
            productId,
            title,
            comfort,
            style,
            durability,
            materialQuality,
            valueForMoney,
            additionalComments
        } = req.body;

        // Validate that the user is authenticated
        if (!userId) {
            console.error('User ID not found in cookies.');
            return res.status(400).json({ message: 'Authentication required. Please log in.' });
        }

        // Validate the presence of productId and orderNumber
        if (!productId || !orderNumber) {
            console.error('Missing productId or orderNumber:', { productId, orderNumber });
            return res.status(400).json({ message: 'Product ID and Order Number are required for submitting a review.' });
        }

        // Ensure all necessary fields are provided
        if (![title, comfort, style, durability, materialQuality, valueForMoney].every(Boolean)) {
            console.error('Missing one or more required fields:', { title, comfort, style, durability, materialQuality, valueForMoney });
            return res.status(400).json({ message: 'All fields must be filled, please check your input.' });
        }

        // Validate that userId and productId are valid MongoDB ObjectIds
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({ message: 'Invalid user ID format.' });
        }

        if (!mongoose.Types.ObjectId.isValid(productId)) {
            console.error('Invalid product ID format:', productId);
            return res.status(400).json({ message: 'Invalid product ID format.' });
        }

        // The orderNumber is from the cookie, so it's treated as a plain string, not an ObjectId.
        console.log('Validated and using IDs:', { userId, productId, orderNumber });

        // Calculate the overall rating as the average of individual ratings
        const overallRating = (comfort + style + durability + materialQuality + valueForMoney) / 5;

        // Create the review data object
        const reviewData = {
            userId: new mongoose.Types.ObjectId(userId), // Convert to ObjectId
            productId: new mongoose.Types.ObjectId(productId), // Convert to ObjectId
            orderNumber, // This remains a string, not an ObjectId
            title,
            comfort,
            style,
            durability,
            materialQuality,
            valueForMoney,
            additionalComments,
            overallRating // Store the calculated overall rating
        };

        console.log('Review data to be saved:', reviewData);

        // Save the review to the database
        const submitReview = await saveReview(reviewData);
        console.log('Review saved successfully:', submitReview);

        // Retrieve all reviews for the product to update the average rating
        const reviews = await findReviewsByProductId(productId);
        const averageRating = reviews.reduce((acc, cur) => acc + cur.overallRating, 0) / reviews.length;

        console.log('Calculated new average rating:', averageRating);

        // Update the product's average rating in the database
        await updateProductAverageRating(productId, averageRating);

        // Respond with a success message and the new average rating
        res.status(200).json({ message: 'Review submitted successfully', reviewId: submitReview._id, averageRating });
    } catch (error) {
        console.error('Error submitting review:', error); // Log the error details for debugging
        res.status(500).json({ message: 'Internal server error while submitting review.', error: error.message });
    }
});

module.exports = reviewRouter;
