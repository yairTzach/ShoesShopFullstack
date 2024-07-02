const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost:27018/shoeShop')
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));

// Define the product schema and model
const productSchema = new mongoose.Schema({
    brand: String,
    model: String,
    description: String,
    price: Number,
    image: String,
    categories: [String],
    sizes: [Number]
});

const Product = mongoose.model('Product', productSchema);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// API routes
app.get('/api/products', async (req, res) => {
    const { search, maxPrice, type, category, brand, size } = req.query;

    let query = {};
    if (search) {
        const regex = new RegExp(search, 'i'); // case-insensitive search
        query.$or = [{ brand: regex }, { model: regex }, { description: regex }];
    }
    if (maxPrice) query.price = { $lte: parseFloat(maxPrice) };
    if (category) query.categories = category;
    if (brand) query.brand = brand;
    if (size) query.sizes = parseFloat(size);

    try {
        const products = await Product.find(query);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.get('/api/brands', async (req, res) => {
    try {
        const brandCounts = await Product.aggregate([
            { $group: { _id: '$brand', count: { $sum: 1 } } }
        ]);
        res.json(brandCounts.reduce((acc, brand) => {
            acc[brand._id] = brand.count;
            return acc;
        }, {}));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.delete('/api/products/:id', async (req, res) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(req.params.id);
        if (deletedProduct) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});