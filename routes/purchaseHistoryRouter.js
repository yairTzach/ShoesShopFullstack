// routes/purchaseHistoryRouter.js

const express = require('express');
const { findUserById, findReviewByOrderNumber } = require('../utils/persist'); // Adjust the path as needed

const router = express.Router();

router.get('/api/purchaseHistory', async (req, res) => {
    const { userId, username } = req.cookies;
    console.log('Received Cookies:', { userId, username });

    if (!userId || !username) {
        console.log('Unauthorized: Missing userId or username in cookies');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const user = await findUserById(userId);
        if (!user) {
            console.log(`User not found: No user with userId ${userId}`);
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.username !== username) {
            console.log(`Username mismatch: Expected ${user.username}, but got ${username}`);
            return res.status(404).json({ message: 'User not found or username mismatch' });
        }

        // Check for reviews in the database
        const purchaseHistoryWithReviews = await Promise.all(user.purchaseHistory.map(async (purchase) => {
            const reviewExists = await findReviewByOrderNumber(userId, purchase._id);
            return {
                ...purchase,
                reviewSubmitted: !!reviewExists
            };
        }));

        res.status(200).json(purchaseHistoryWithReviews);
    } catch (error) {
        console.error('Error fetching purchase history:', error);
        res.status(500).json({ message: 'Server error fetching purchase history' });
    }
});



module.exports = router;
