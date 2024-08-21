const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    cart: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            quantity: Number,
            size: String
        }
    ],
    purchaseHistory: [
        {
            productId: mongoose.Schema.Types.ObjectId,
            name: String,
            image: String,
            size: String,
            quantity: Number,
            price: Number,
            purchaseDate: { type: Date, default: Date.now }
        }
    ],
    address: { type: String, default: '' }, // Add address field
    phoneNumber: { type: String, default: '' } // Add phone number field
});

const User = mongoose.model('User', userSchema);

module.exports = User;
