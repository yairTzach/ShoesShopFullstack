const mongoose = require('mongoose');

// Define the schema for a review
const reviewSchema = new mongoose.Schema({
    // Reference to the User who made the review
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // References the User model
        required: true // This field is required
    },
    
    // Reference to the Product being reviewed
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product', // References the Product model
        required: true // This field is required
    },
    
    // Reference to the Order associated with the review
    orderNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order', // References the Order model
        required: true // This field is required
    },
    
    // Title of the review
    title: String,
    
    // Ratings for various aspects of the product
    comfort: Number,           // Rating for comfort
    style: Number,             // Rating for style
    durability: Number,        // Rating for durability
    materialQuality: Number,   // Rating for material quality
    valueForMoney: Number,     // Rating for value for money
    
    // Overall rating for the product
    overallRating: Number,
    
    // Additional comments provided by the user
    additionalComments: String
});

// Create the Review model using the schema
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review; // Export the Review model for use in other parts of the application
