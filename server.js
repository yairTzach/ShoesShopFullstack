const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); // Import crypto module
const User = require('./models/User');
const Product = require('./models/Product'); // Import the Product model
const app = express();
const PORT = process.env.PORT || 3000;

// Generate a random secret key
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27018/authDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

app.use(session({
  secret: sessionSecret, // Use the generated secret key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set 'secure: true' if using HTTPS
}));

function isAdmin(req, res, next) {
    if (req.session.user && req.session.user.isAdmin) {
      return next();
    }
    res.status(403).json({ message: 'Access denied' });
  }
  
  app.get('/admin.html', isAdmin, (req, res) => {
    res.sendFile(__dirname + '/public/admin.html'); // Serve the admin page if user is admin
  });
  


// Redirect to login if not logged in
app.get('/', (req, res) => {
  if (req.session.user) {
    res.redirect('/index.html'); // Redirect to shoes page if logged in
  } else {
    res.redirect('/login'); // Redirect to login page if not logged in
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Route to the shoes page (only accessible if logged in)
app.get('/index.html', (req, res) => {
  if (req.session.user) {
    res.sendFile(__dirname + '/public/index.html'); // Serve index.html if logged in
  } else {
    res.redirect('/login'); // Redirect to login if not logged in
  }
});

// Serve static files
app.use(express.static('public'));

// API Endpoints for Products

// Get all products with optional filters
app.get('/api/products', async (req, res) => {
  try {
    const { search, maxPrice, category, brand, size } = req.query;

    // Build the query object
    const query = {};

    if (search) {
      const regex = new RegExp(search, 'i');
      query.$or = [
        { brand: regex },
        { model: regex },
        { description: regex }
      ];
    }

    if (maxPrice) {
      query.price = { $lte: parseFloat(maxPrice) };
    }

    if (category) {
      query.categories = category;
    }

    if (brand) {
      query.brand = brand;
    }

    if (size) {
      query.sizes = size;
    }

    const products = await Product.find(query);
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
});

// Get a specific product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error fetching product' });
  }
});

// Add a product to the cart and store it in a cookie
app.post('/cart/add', (req, res) => {
  const { productId, size, price, image, brand, model } = req.body;
  let cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};

  if (!cart[productId]) {
    cart[productId] = { sizes: {}, price, image, brand, model };
  }

  if (!cart[productId].sizes[size]) {
    cart[productId].sizes[size] = 0;
  }

  cart[productId].sizes[size] += 1;

  res.cookie('cart', JSON.stringify(cart), { httpOnly: true });
  console.log('Cart stored in cookie:', cart); // Log cart content
  res.status(200).json({ message: 'Product added to cart', cart });
});

// Fetch cart data for display on the checkout page
app.get('/cart', (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  res.status(200).json(cart);
});

// User login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const user = await User.findOne({ username });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
      }
  
      req.session.user = {
        id: user._id,
        username: user.username,
        isAdmin: user.isAdmin
      };
  
      if (user.isAdmin) {
        // Redirect admin to the admin page
        res.redirect('/admin.html');
      } else {
        // Redirect regular user to the index page
        res.redirect('/index.html');
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'Server error during login' });
    }
  });
    
// User registration
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;
  
    try {
      // Check if the user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
  
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      // Create a new user
      const newUser = new User({
        username,
        password: hashedPassword,
        email
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(200).json({ message: 'Registration successful' });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({ message: 'Server error during registration' });
    }
  });
  // Add a new product
app.post('/api/products', async (req, res) => {
    try {
      const newProduct = new Product(req.body);
      await newProduct.save();
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error adding product:', error);
      res.status(500).json({ message: 'Failed to add product' });
    }
  });
  

// Update a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
});

// Delete a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
});

// Get a list of brands with product counts
app.get('/api/brands', async (req, res) => {
  try {
    const brands = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 } } }
    ]);

    const brandCounts = brands.reduce((acc, brand) => {
      acc[brand._id] = brand.count;
      return acc;
    }, {});

    res.json(brandCounts);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ message: 'Failed to fetch brands' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
