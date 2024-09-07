// Import necessary modules
require('dotenv').config(); // Load environment variables from .env file
const express = require('express'); 
const mongoose = require('mongoose'); 
const bodyParser = require('body-parser'); 
const cookieParser = require('cookie-parser'); 
const path = require('path'); 
const fs = require('fs'); 
const security = require('./public/js/security'); // Import your security middleware with rate limiting

// Import utility functions
const { loadProducts, createAdminUser, loadInitialDataFromDisk } = require('./utils/persist');

// Import route handlers
const authRouter = require('./routes/authRouter');
const cartRouter = require('./routes/cartRouter');
const profileRouter = require('./routes/profileRouter');
const purchaseHistoryRouter = require('./routes/purchaseHistoryRouter');
const registerRouter = require('./routes/registerRouter');
const submitReviewRouter = require('./routes/submitReviewRouter');
const publicReviewsRouter = require('./routes/publicReviewsRouter');
const adminRouter = require('./routes/adminRouter');
const adminTrackRouter = require('./routes/adminTrackRouter');
const mainPageRouter = require('./routes/mainPageRouter');
const thankYouRouter = require('./routes/thankYouRouter');
const thankYouReviewRouter = require('./routes/thankYouReviewRouter');

// Set the port for the server to listen on
const PORT = process.env.PORT || 3000;
const app = express();

// Middleware setup
app.use(bodyParser.json()); 
app.use(cookieParser()); 

// Connect to MongoDB and load initial data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/authDB')
    .then(async () => {
        console.log('MongoDB connected...');

        // Load initial data from disk into the database
        await loadInitialDataFromDisk();

        // Load product data from disk and save to database
        await loadProducts();

        // Ensure an admin user is created
        await createAdminUser();

        // Only after data is loaded, apply security middleware including rate limiting
        security(app); // This applies rate limiting after the data loading is complete

        // Set up route handlers
        app.use('/', authRouter);
        app.use('/', cartRouter);
        app.use('/', profileRouter);
        app.use('/', purchaseHistoryRouter);
        app.use('/', registerRouter);
        app.use('/', submitReviewRouter);
        app.use('/', publicReviewsRouter);
        app.use('/', adminRouter);
        app.use('/', adminTrackRouter);
        app.use('/', mainPageRouter);
        app.use('/', thankYouRouter); 
        app.use('/html', thankYouReviewRouter); 

        // Serve static files from the 'public' directory
        app.use(express.static('public'));

        // Start the server
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => console.log(err)); // Log connection errors
