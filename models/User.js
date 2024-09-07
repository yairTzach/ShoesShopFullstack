const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
    // Username is required, must be unique
    username: { type: String, required: true, unique: true },
    
    // Email is required, must be unique
    email: { type: String, required: true, unique: true },
    
    // Password is required
    password: { type: String, required: true },
    
    // isAdmin is a boolean to indicate if the user is an admin, default is false
    isAdmin: { type: Boolean, default: false },
    
    // Cart is an array of objects representing products in the user's cart
    cart: [
        {
            // productId references a product in the database
            productId: mongoose.Schema.Types.ObjectId,
            
            // Quantity of the product in the cart
            quantity: Number,
            
            // Size of the product (if applicable)
            size: String
        }
    ],
    
    // Purchase history is an array of objects representing past purchases
    purchaseHistory: [
        {
            // productId references a product in the database
            productId: mongoose.Schema.Types.ObjectId,
            
            // Name of the product
            name: String,
            
            // Image URL or path for the product
            image: String,
            
            // Size of the product (if applicable)
            size: String,
            
            // Quantity of the product purchased
            quantity: Number,
            
            // Price at which the product was purchased
            price: Number,
            
            // Date when the purchase was made, default is the current date
            purchaseDate: { type: Date, default: Date.now }
        }
    ],

    // Activity log is an array of objects representing user actions
    activityLog: [
        {
            // Type of activity (e.g., login, logout, add-to-cart)
            type: {
                type: String,
                enum: ['login', 'logout', 'add-to-cart'], // Restrict to specific values
                required: true
            },
            
            // Timestamp of the activity, default is the current date and time
            datetime: { type: Date, default: Date.now },
        }
    ],

    // Address is a string field for the user's address, default is an empty string
    address: { type: String, default: '' }, 
    
    // Phone number is a string field for the user's phone number, default is an empty string
    phoneNumber: { type: String, default: '' } 
});

// Create the User model using the schema
const User = mongoose.model('User', userSchema);

module.exports = User; // Export the User model for use in other parts of the application
