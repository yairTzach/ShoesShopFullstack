const express = require('express');
const path = require('path');

const router = express.Router();

// Middleware to check if a review was submitted
function checkReviewSubmission(req, res, next) {
    const reviewSubmitted = req.cookies.reviewSubmitted; // Check if the reviewSubmitted cookie is present

    // If the reviewSubmitted cookie exists and is set to 'true'
    if (reviewSubmitted && reviewSubmitted === 'true') {
        res.clearCookie('reviewSubmitted', { path: '/' }); // Clear the cookie to prevent reuse
        return next(); // Proceed to the next middleware or route handler
    } else {
        // If the review was not submitted, redirect the user to the main page
        return res.redirect('/html/main.html');
    }
}

// Route to serve the thankYouReview.html page, protected by the checkReviewSubmission middleware
router.get('/thankYouReview.html', checkReviewSubmission, (req, res) => {
    // Serve the thankYouReview.html page if the middleware check passes
    res.sendFile(path.join(__dirname, '../public/html/thankYouReview.html'));
});

module.exports = router;
