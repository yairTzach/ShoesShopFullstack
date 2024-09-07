const mongoose = require('mongoose');

// Define the schema for a product
const ProductSchema = new mongoose.Schema({
    // Brand of the product (e.g., Nike, Adidas)
    brand: {
        type: String,
        required: true // This field is required
    },
    
    // Model of the product (e.g., Air Max, Ultraboost)
    model: {
        type: String,
        required: true // This field is required
    },
    
    // Description of the product
    description: {
        type: String,
        required: true // This field is required
    },
    
    // Price of the product
    price: {
        type: Number,
        required: true // This field is required
    },
    
    // Image URL or path for the product
    image: {
        type: String,
        required: true // This field is required
    },
    
    // Categories the product belongs to (e.g., "running", "sportswear")
    categories: {
        type: [String], // Array of strings
        required: true // This field is required
    },
    
    // Available sizes and their corresponding stock amounts
    sizes: [{
        size: {
            type: String,
            required: true // The size itself is required
        },
        amount: {
            type: Number,
            required: true // The stock amount for the size is required
        }
    }]
});

module.exports = mongoose.model('Product', ProductSchema); // Export the Product model for use in other parts of the application
