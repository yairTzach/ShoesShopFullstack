const express = require('express');
const path = require('path');
const {
    findUserById,
    saveUser,
    updateOrAddToCart,
    removeFromCart,
    populatePurchases
} = require('../utils/persist'); // Import utility functions from persist module (adjust path as needed)

const router = express.Router();

// Middleware to check if the user is authorized
async function isAuthorized(req, res, next) {
    const { userId, username } = req.cookies;

    // Check if userId and username cookies exist
    if (userId && username) {
        const user = await findUserById(userId);

        // Check if the user exists and the username matches
        if (user && user.username === username) {
            req.user = user; // Attach the user object to the request
            return next(); // Proceed to the next middleware or route handler
        }
    }
    
    // Respond with 401 Unauthorized if the user is not authorized
    res.status(401).json({ message: 'Unauthorized' });
}

// Route to update the cart (add/update a product in the cart)
router.post('/api/cart/update', isAuthorized, async (req, res) => {
    try {
        const { productId, size, quantity } = req.body; // Extract product details from the request body
        const user = req.user; // Get the authenticated user from the request

        const result = await updateOrAddToCart(user, productId, size, quantity); // Update or add the product to the cart

        // Handle insufficient stock or other issues
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        await saveUser(user); // Save the updated user data
        res.json({ success: true, message: 'Cart updated successfully', cart: result.cart });
    } catch (error) {
        console.error('Cart update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
});

// Route to add a product to the cart
router.post('/api/cart/add', isAuthorized, async (req, res) => {
    try {
        const { productId, size, quantity } = req.body; // Extract product details from the request body
        const user = req.user; // Get the authenticated user from the request

        const result = await updateOrAddToCart(user, productId, size, quantity); // Add the product to the cart

        // Handle insufficient stock or other issues
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        // Log the 'add-to-cart' activity
        const currentActivity = { 
            type: 'add-to-cart', 
            datetime: new Date().toISOString(), 
            username: user.username 
        };
        user.activityLog.push(currentActivity); // Append the activity to the user's log

        await saveUser(user); // Save the updated user data

        res.status(200).json({ success: true, message: 'Product added to cart', cart: result.cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
});

// Route to remove a product from the cart
router.post('/api/cart/remove', isAuthorized, async (req, res) => {
    try {
        const { productId, size } = req.body; // Extract product details from the request body
        const user = req.user; // Get the authenticated user from the request

        const updatedCart = removeFromCart(user, productId, size); // Remove the product from the cart
        await saveUser(user); // Save the updated user data

        res.status(200).json({ success: true, cart: updatedCart });
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).json({ success: false, message: 'Failed to update cart' });
    }
});

// Route to display the cart page
router.get('/cart', async (req, res) => {
    const user = await findUserByUsername(req.cookies.username); // Fetch user data using the username cookie

    if (user && user.cart) {
        const populatedCart = await populateCartData(user.cart); // Populate the cart with product details
        res.render('cart', { cart: populatedCart }); // Render the cart page with the populated cart data
    } else {
        res.render('cart', { cart: [] }); // Render the cart page with an empty cart if the user has no items
    }
});

// Route to complete a purchase
router.post('/api/cart/purchase', isAuthorized, async (req, res) => {
    try {
        const user = req.user; // Get the authenticated user from the request

        const populatedPurchases = await populatePurchases(user.cart); // Populate purchases with product details

        // Add the populated purchases to the user's purchase history
        user.purchaseHistory = user.purchaseHistory.concat(populatedPurchases);

        // Clear the user's cart after purchase
        user.cart = [];

        await saveUser(user); // Save the updated user data

        // Set a cookie indicating that the purchase was completed (valid for 10 minutes)
        res.cookie('purchaseCompleted', 'true', { httpOnly: false, maxAge: 600000 });

        res.status(200).json({ success: true, message: 'Purchase completed successfully', purchaseHistory: user.purchaseHistory });
    } catch (error) {
        // Ensure the purchaseCompleted cookie is set even if an error occurs
        res.cookie('purchaseCompleted', 'true', { httpOnly: false, maxAge: 600000 });
        
        console.error('Error finalizing purchase:', error);
        res.status(500).json({ success: false, message: 'Failed to complete purchase' });
    }
});

module.exports = router; // Export the router to be used in other parts of the application
