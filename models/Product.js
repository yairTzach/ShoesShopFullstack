const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    categories: {
        type: [String],
        required: true
    },
    sizes: {
        type: [String],
        required: true
    }
});

module.exports = mongoose.model('Product', ProductSchema);
