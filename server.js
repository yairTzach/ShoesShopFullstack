const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const crypto = require('crypto'); // Import crypto module
const User = require('./models/User');
const Product = require('./models/Product'); // Import the Product model
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27018/authDB')
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Middleware to check if the user is admin
async function isAdmin(req, res, next) {
  const { userId, username } = req.cookies;

  if (userId && username) {
      try {
          const user = await User.findById(userId);
          if (!user || user.username !== username || !user.isAdmin) {
              res.clearCookie('userId');
              res.clearCookie('username');
              return res.status(403).json({ message: 'Access denied' });
          } else {
              req.user = user;  // Attach the user object to the request for use in subsequent routes
              next();  // Proceed to the next middleware or route handler
          }
      } catch (err) {
          console.error('Error finding user:', err);
          res.clearCookie('userId');
          res.clearCookie('username');
          return res.status(500).json({ message: 'Internal server error' });
      }
  } else {
      res.status(403).json({ message: 'Access denied' });
  }
}

app.get('/set-test-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', { httpOnly: false, secure: false, sameSite: 'Lax' });
  res.send('Test cookie set');
});


// Routes

app.get('/admin.html', isAdmin, (req, res) => {
  res.sendFile(__dirname + '/public/admin.html'); // Serve the admin page if the user is admin
});

// Redirect to login if not logged in
app.get('/', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.redirect('/index.html'); // Redirect to shoes page if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

// Route to the shoes page (only accessible if logged in)
app.get('/index.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/index.html'); // Serve index.html if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/checkout.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/checkout.html'); // Serve checkout.html if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/purchase-hist.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/purchase-hist.html'); // Serve purchase-hist.html if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/profile.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/profile.html'); // Serve profile.html if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/review.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/review.html'); // Serve review.html if logged in
  } else {
      res.redirect('/login'); // Redirect to login if not logged in
  }
});

app.get('/cart.html', (req, res) => {
  const { userId, username } = req.cookies;

  if (userId && username) {
      res.sendFile(__dirname + '/public/cart.html'); // Serve cart.html if logged in
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

        res.json({
            _id: product._id,
            brand: product.brand,
            model: product.model,
            description: product.description,
            price: product.price,  // Ensure the price is returned
            sizes: product.sizes,
            image: product.image  // Ensure the image field is included
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Server error fetching product' });
    }
});

app.put('/api/update-username', async (req, res) => {
  const { oldUsername, newUsername } = req.body;

  try {
      const user = await User.findOne({ username: oldUsername });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the new username is already taken
      const existingUser = await User.findOne({ username: newUsername });
      if (existingUser) {
          return res.status(400).json({ message: 'Username already exists' });
      }

      user.username = newUsername;
      await user.save();

      res.status(200).json({ message: 'Username updated successfully' });
  } catch (error) {
      console.error('Error updating username:', error);
      res.status(500).json({ message: 'Server error updating username' });
  }
});

app.put('/api/update-email', async (req, res) => {
  const { username, newEmail } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the new email is different from the current email
      if (user.email !== newEmail) {
          // Check if the new email is already taken by another user
          const existingUser = await User.findOne({ email: newEmail });
          if (existingUser) {
              return res.status(400).json({ message: 'Email already exists' });
          }

          // Update the email since it's not taken
          user.email = newEmail;
          await user.save();
          return res.status(200).json({ message: 'Email updated successfully' });
      } else {
          // If the email is the same, no need to update, but still return a success response
          return res.status(200).json({ message: 'Email remains the same, no update necessary.' });
      }
  } catch (error) {
      console.error('Error updating email:', error);
      res.status(500).json({ message: 'Server error updating email' });
  }
});


app.get('/api/user-profile', async (req, res) => {
  const { username } = req.query;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json({
          username: user.username,
          email: user.email,
          address: user.address,
          phoneNumber: user.phoneNumber
      });
  } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ message: 'Server error fetching user profile' });
  }
});

app.put('/api/update-profile', async (req, res) => {
  const { username, address, phoneNumber } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      user.address = address;
      user.phoneNumber = phoneNumber;
      await user.save();

      res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ message: 'Server error updating profile' });
  }
});
// Checkout API
app.post('/api/checkout', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      // Find the user in the database
      const user = await User.findById(userId);
      if (!user || user.username !== username) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Populate purchase history with complete details
      const populatedPurchases = await Promise.all(req.body.purchases.map(async (purchase) => {
          const product = await Product.findById(purchase.productId);

          return {
              productId: purchase.productId,
              name: `${product.brand} - ${product.model}`.trim(),
              image: product.image,
              size: purchase.size,
              quantity: purchase.quantity,
              price: product.price,
              purchaseDate: new Date(),
          };
      }));

      // Add the purchases to the user's purchase history
      user.purchaseHistory.push(...populatedPurchases);

      // Clear the user's cart in the database
      user.cart = [];
      await user.save();

      // Set the purchase history in a cookie
      console.log('Setting purchaseHistory cookie:', JSON.stringify(user.purchaseHistory));
      res.cookie('purchaseHistory', JSON.stringify(user.purchaseHistory), { httpOnly: false, secure: false, sameSite: 'Lax' });

      // Now send the response
      res.status(200).json({ message: 'Purchase successful' });

  } catch (error) {
      console.error('Error processing checkout:', error);
      // Only send an error response if one hasn't already been sent
      if (!res.headersSent) {
          res.status(500).json({ message: 'Server error during checkout' });
      }
  }
});


app.put('/api/update-password', async (req, res) => {
  const { username, currentPassword, newPassword } = req.body;

  try {
      const user = await User.findOne({ username });
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Check if the current password is correct
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash the new password before saving
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update the password in the database
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
      console.error('Error updating password:', error);
      res.status(500).json({ message: 'Server error updating password' });
  }
});

// Cart API - Update cart
app.post('/api/cart/update', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      const user = await User.findById(userId);

      if (!user || user.username !== username) {
          return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId, size, quantity } = req.body;
      const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId && item.size === size);
      if (cartItemIndex !== -1) {
          user.cart[cartItemIndex].quantity += quantity;
      } else {
          user.cart.push({ productId, size, quantity });
      }

      await user.save();
      res.json({ success: true, message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
      console.error('Cart update error:', error);
      res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Add a product to the cart and store it in a cookie
app.post('/api/cart/add', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).send('Unauthorized');
  }

  try {
      const user = await User.findById(userId);

      if (!user || user.username !== username) {
          return res.status(401).send('Unauthorized');
      }

      const { productId, size, quantity } = req.body;
      let cartItem = user.cart.find(item => item.productId.toString() === productId && item.size === size);

      if (cartItem) {
          cartItem.quantity += quantity;
      } else {
          cartItem = { productId, size, quantity };
          user.cart.push(cartItem);
      }

      await user.save();
      res.cookie('cart', JSON.stringify(user.cart), { httpOnly: false, secure: false, sameSite: 'Lax' });
      res.status(200).json({ success: true, message: 'Product added to cart', cart: user.cart });
  } catch (error) {
      console.error('Error updating cart:', error);
      res.status(500).json({ success: false, message: 'Failed to update cart' });
  }
});

// Login route
// Login route
app.post('/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;

  try {
      const user = await User.findOne({ username }).exec();
      if (!user || !(await bcrypt.compare(password, user.password))) {
          return res.status(400).json({ message: 'Invalid credentials' });
      }

      const maxAge = rememberMe ? 10 * 24 * 60 * 60 * 1000 : 30 * 60 * 1000;
      res.cookie('userId', user._id.toString(), { maxAge, httpOnly: true });
      res.cookie('username', user.username, { maxAge, httpOnly: false, secure: false });

      // Load cart from database and enrich with product details
      const cart = await Promise.all(user.cart.map(async item => {
          const product = await Product.findById(item.productId);
          return {
              productId: item.productId,
              size: item.size,
              quantity: item.quantity,
              price: product.price,
              image: product.image,
              brand: product.brand,
              model: product.model
          };
      }));
      
      // Store the enriched cart in the cookie
      res.cookie('cart', JSON.stringify(cart), { maxAge, httpOnly: false });

      res.redirect(user.isAdmin ? '/admin.html' : '/index.html');
  } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error during login' });
  }
});


// Fetch cart data for display on the checkout page
app.get('/cart', (req, res) => {
  const cart = req.cookies.cart ? JSON.parse(req.cookies.cart) : {};
  res.status(200).json(cart);
});

// Remove a product from the cart or decrease quantity by one
app.post('/api/cart/remove', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  try {
      const user = await User.findById(userId);

      if (!user || user.username !== username) {
          return res.status(401).json({ message: 'Unauthorized' });
      }

      const { productId, size } = req.body;
      const cartItem = user.cart.find(item => item.productId.toString() === productId && item.size === size);

      if (cartItem) {
          cartItem.quantity -= 1;

          // If the quantity reaches 0, remove the item from the cart
          if (cartItem.quantity <= 0) {
              user.cart = user.cart.filter(item => !(item.productId.toString() === productId && item.size === size));
          }

          await user.save();
          res.status(200).json({ success: true, cart: user.cart });
      } else {
          res.status(404).json({ success: false, message: 'Item not found in cart' });
      }
  } catch (error) {
      console.error('Error removing item from cart:', error);
      res.status(500).json({ success: false, message: 'Failed to update cart' });
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
app.post('/api/checkout', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      // Find the user in the database
      const user = await User.findById(userId);
      if (!user || user.username !== username) {
          return res.status(404).json({ message: 'User not found' });
      }

      // Populate purchase history with complete details
      const populatedPurchases = await Promise.all(req.body.purchases.map(async (purchase) => {
          const product = await Product.findById(purchase.productId);

          return {
              productId: purchase.productId,
              name: `${product.brand} - ${product.model}`.trim(),
              image: product.image,
              size: purchase.size,
              quantity: purchase.quantity,
              price: product.price,
              purchaseDate: new Date(),
          };
      }));

      // Add the purchases to the user's purchase history
      user.purchaseHistory.push(...populatedPurchases);

      // Clear the user's cart in the database
      user.cart = [];
      await user.save();

      // Clear the cart cookie after clearing the cart in the database
      res.cookie('cart', '', { maxAge: 0, path: '/' });

      // Set the purchase history in a cookie
      res.cookie('purchaseHistory', JSON.stringify(user.purchaseHistory), { httpOnly: false, secure: false, sameSite: 'Lax' });

      res.status(200).json({ message: 'Purchase successful' });
  } catch (error) {
      console.error('Error processing checkout:', error);
      res.status(500).json({ message: 'Server error during checkout' });
  }
});

// API route to get purchase history
app.get('/api/purchase-history', async (req, res) => {
  const { userId, username } = req.cookies;

  if (!userId || !username) {
      return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
      // Find the user in the database
      const user = await User.findById(userId).select('purchaseHistory');
      if (!user || user.username !== username) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(user.purchaseHistory);
  } catch (error) {
      console.error('Error fetching purchase history:', error);
      res.status(500).json({ message: 'Server error fetching purchase history' });
  }
});

// Logout route
app.get('/logout', (req, res) => {
  res.clearCookie('userId');
  res.clearCookie('username');
  res.clearCookie('cart');
  res.clearCookie('purchaseHistory'); // Clear the purchaseHistory cookie
  res.redirect('/login');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
