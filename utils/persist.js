// Import necessary modules
const express = require('express');
const bcrypt = require('bcryptjs'); // Library for hashing passwords
const mongoose = require('mongoose'); // MongoDB object modeling tool

// Import models
const User = require('../models/User.js'); // User model (adjust path as necessary)
const Review = require('../models/Review.js'); // Review model
const Product = require('../models/Product.js'); // Product model

// Import utilities for file and path handling
const path = require('path'); 
const fs = require('fs'); 

// Directory for storing user data
const USER_DATA_DIR = path.join(__dirname, '../userData');

// Helper function to get the file path for a user's data
const getUserFilePath = (username) => path.join(USER_DATA_DIR, `${username}.json`);

// Function to load user data from a file
const loadUserFromFile = (username) => {
    const filePath = getUserFilePath(username);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    }
    return null; // Return null if the user file doesn't exist
};

// Path for storing the activity log
const activityLogFilePath = path.join(__dirname, 'activity-log.json');

// Function to validate usernames
function validateUsername(username) {
    const usernameRegex = /^(?!.*__)[a-zA-Z0-9_]{5,20}$/; // Usernames must be 5-20 characters, alphanumeric with optional underscores, and no consecutive underscores
    return usernameRegex.test(username);
}

// Function to validate passwords
function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/; // Passwords must be 8+ characters with at least one uppercase letter, one lowercase letter, one digit, and one special character
    const commonPasswords = ['123456', 'password', '123456789', '12345678', '12345'];
    return passwordRegex.test(password) && !commonPasswords.includes(password); // Rejects common passwords
}

// Function to validate email addresses
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Standard email format validation
    return emailRegex.test(email);
}

// Function to delete a product by its ID from the database
const deleteProductById = async (productId) => {
    try {
        const result = await Product.findByIdAndDelete(productId);
        if (!result) {
            throw new Error('Product not found');
        }
        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error; // Propagate the error after logging
    }
};

// Function to save user data to the file system and MongoDB
const saveUser = async (user) => {
    // Load existing user data from the file system
    const existingUser = loadUserFromFile(user.oldUsername || user.username);

    if (existingUser) {
        // Check if the email is already used by another user in MongoDB
        const emailExists = await findUserByUsernameOrEmail(null, user.email);
        if (emailExists && emailExists._id.toString() !== user._id.toString()) {
            throw new Error('Email already in use.');
        }

        // If the username has changed, delete the old user file
        const oldFilePath = getUserFilePath(existingUser.username);
        const newFilePath = getUserFilePath(user.username);

        if (oldFilePath !== newFilePath && fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath); // Remove the old file from the file system
        }
    }

    // Save the updated user data to MongoDB first
    const savedUser = await saveUserToMongoDB(user);

    // If MongoDB save is successful, then update the file system
    saveUserToFile(savedUser);
};

// Function to save user data to a file
const saveUserToFile = (user) => {
    const filePath = getUserFilePath(user.username);
    fs.writeFileSync(filePath, JSON.stringify(user, null, 2)); // Save the user data with 2-space indentation
};

// Function to find a user by username in the file system
const findUserByUsername = async (username) => {
    return loadUserFromFile(username); // Return user data from the file system
};

// Function to save user data to MongoDB
const saveUserToMongoDB = async (user) => {
    try {
        const savedUser = await User.findByIdAndUpdate(user._id, user, { new: true, upsert: true });
        saveUserToFile(savedUser); // Backup to the file system after successful MongoDB save
        return savedUser;
    } catch (error) {
        console.error('Error saving user to MongoDB:', error);
        throw error;
    }
};

// Function to find a user by their ID in the file system
const findUserById = async (userId) => {
    try {
        const userFiles = fs.readdirSync(USER_DATA_DIR);
        for (const file of userFiles) {
            const filePath = path.join(USER_DATA_DIR, file);
            const user = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
            if (user._id === userId) {
                return user;
            }
        }
        return null; // Return null if the user is not found
    } catch (error) {
        console.error(`Error reading user data: ${error.message}`);
        return null;
    }
};

// Function to create a new user
const createUser = async (username, hashedPassword, email) => {
    const newUser = {
        _id: new mongoose.Types.ObjectId(), // Generate a new MongoDB ObjectId
        username,
        password: hashedPassword,
        email,
        cart: [], // Initialize an empty cart
        purchaseHistory: [], // Initialize an empty purchase history
        activityLog: [] // Initialize an empty activity log
    };
    saveUserToFile(newUser); // Save the new user to the file system
    const savedUser = await saveUserToMongoDB(newUser); // Save the new user to MongoDB

    return newUser;
};

// Function to find a user by their username or email in MongoDB
const findUserByUsernameOrEmail = async (username, email) => {
    if (!username && !email) {
        throw new Error('Username or email must be provided'); // Ensure at least one parameter is provided
    }

    const query = {};

    if (username) {
        query.username = username.toLowerCase(); // Case-insensitive search for username
    }

    if (email) {
        query.email = email.toLowerCase(); // Case-insensitive search for email
    }

    return await User.findOne(query); // Return the first matching user
};

// Function to check if a username is already taken
const isUsernameTaken = async (username) => {
    return loadUserFromFile(username) !== null; // Return true if the username exists in the file system
};

// Function to hash a password
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10); // Generate a salt for hashing
    return await bcrypt.hash(password, salt); // Return the hashed password
};

// Function to save a review to MongoDB
const saveReview = async (reviewData) => {
    try {
        const review = new Review(reviewData);
        return await review.save(); // Save the review and return it
    } catch (error) {
        console.error('Error saving review:', error);
        throw error;
    }
};

// Function to find reviews by product ID
const findReviewsByProductId = async (productId) => {
    try {
        return await Review.find({ productId }); // Return all reviews for the given product ID
    } catch (error) {
        console.error('Error finding reviews:', error);
        throw error;
    }
};

// Function to update a product's average rating
const updateProductAverageRating = async (productId, averageRating) => {
    try {
        return await Product.findByIdAndUpdate(productId, { averageRating }); // Update the product's average rating
    } catch (error) {
        console.error('Error updating product average rating:', error);
        throw error;
    }
};

// Function to find a product by its ID
const findProductById = async (productId) => {
    try {
        return await Product.findById(productId); // Return the product with the given ID
    } catch (error) {
        console.error('Error finding product by ID:', error);
        throw error;
    }
};

// Function to populate purchase details with product data
const populatePurchases = async (purchases) => {
    try {
        return await Promise.all(purchases.map(async (purchase) => {
            const product = await findProductById(purchase.productId);

            if (!product) {
                console.error(`Product with ID ${purchase.productId} not found`);
                throw new Error(`Product with ID ${purchase.productId} not found`);
            }

            const sizeToUpdate = product.sizes.find(sizeObj => sizeObj.size === purchase.size);

            if (sizeToUpdate) {
                console.log(`Before update: Size ${purchase.size} has ${sizeToUpdate.amount} in stock`);

                if (sizeToUpdate.amount >= purchase.quantity) {
                    sizeToUpdate.amount -= purchase.quantity; // Decrease the quantity in stock
                    console.log(`After update: Size ${purchase.size} has ${sizeToUpdate.amount} left`);
                    await product.save(); // Save the updated product
                    console.log(`Product ${product.brand} - ${product.model} saved successfully after quantity update`);
                } else {
                    console.error(`Insufficient quantity for size ${purchase.size} of product ${product.brand} - ${product.model}`);
                    throw new Error(`Insufficient quantity for size ${purchase.size} of product ${product.brand} - ${product.model}`);
                }
            } else {
                console.error(`Size ${purchase.size} not found for product ${product.brand} - ${product.model}`);
                throw new Error(`Size ${purchase.size} not found for product ${product.brand} - ${product.model}`);
            }

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
    } catch (error) {
        console.error('Error populating purchases:', error);
        throw error;
    }
};

// Helper function to get the file path for a product's data
const getProductFilePath = (productId) => path.join(__dirname, '../productData', `${productId}.json`);

// Function to load product data from a file
const loadProductFromFile = (productId) => {
    const filePath = getProductFilePath(productId);
    if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data); // Return the parsed product data
    }
    return null; // Return null if the product file doesn't exist
};

// Function to populate cart data with product information
const populateCartData = async (cart) => {
    return await Promise.all(cart.map(async item => {
        let product = loadProductFromFile(item.productId);

        if (!product) {
            product = await findProductById(item.productId); // Fetch product from the database if not found in the file system
        }

        return {
            productId: item.productId,
            size: item.size,
            quantity: item.quantity,
            price: product ? product.price : 0, // Default to 0 if product is not found
            image: product ? product.image : '', // Default to empty if product is not found
            brand: product ? product.brand : 'Unknown',
            model: product ? product.model : 'Unknown'
        };
    }));
};

// Function to log user activity
const logUserActivity = async (user, activityType) => {
    try {
        const lastActivity = user.activityLog[user.activityLog.length - 1];
        if (!lastActivity || lastActivity.type !== activityType) {
            user.activityLog.push({ type: activityType, datetime: new Date().toISOString(), username: user.username });
            await saveUser(user); // Save the updated user data
        }
    } catch (error) {
        console.error('Error logging user activity:', error);
        throw error;
    }
};

// Function to update or add to the user's cart
// Function to update or add to the user's cart
const updateOrAddToCart = async (user, productId, size, quantity) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            throw new Error('Product not found');
        }

        const sizeObj = product.sizes.find(sizeObj => sizeObj.size === size);
        if (!sizeObj) {
            throw new Error(`Size ${size} not found for product ${product.brand} - ${product.model}`);
        }

        const cartItemIndex = user.cart.findIndex(item => item.productId.toString() === productId && item.size === size);
        if (cartItemIndex !== -1) {
            user.cart[cartItemIndex].quantity += quantity; // Adjust quantity
            // Remove item if quantity is zero or less
            if (user.cart[cartItemIndex].quantity <= 0) {
                user.cart.splice(cartItemIndex, 1);
            }
        } else {
            // Add new item to cart if quantity adjustment is positive
            if (quantity > 0) {
                user.cart.push({ productId, size, quantity });
            }
        }
        return { success: true, cart: user.cart };
    } catch (error) {
        console.error('Error updating or adding to cart:', error);
        throw error;
    }
};

// Function to remove an item from the user's cart
 // Function to remove an item from the user's cart
const removeFromCart = (user, productId, size) => {
    try {
        // Filter out the item with the matching productId and size
        user.cart = user.cart.filter(item => !(item.productId.toString() === productId && item.size === size));
        return user.cart;
    } catch (error) {
        console.error('Error removing from cart:', error);
        throw error;
    }
};


// Function to find reviews based on a query
const findReviews = async (query) => {
    try {
        return await Review.find(query).lean(); // Return reviews matching the query
    } catch (error) {
        console.error('Error finding reviews:', error);
        throw error;
    }
};

// Function to check if a user is an admin
const isUserAdmin = async (userId, username) => {
    try {
        const user = await findUserById(userId);
        return user && user.username === username && user.isAdmin ? user : null; // Return the user if they are an admin
    } catch (error) {
        console.error('Error checking if user is admin:', error);
        throw error;
    }
};

// Function to fetch activity logs for all users
const fetchAllUsersActivityLogs = async () => {
    try {
        const users = fs.readdirSync(USER_DATA_DIR).map(file => JSON.parse(fs.readFileSync(path.join(USER_DATA_DIR, file), 'utf-8')));
        const activityLog = [];

        users.forEach(user => {
            if (Array.isArray(user.activityLog)) { // Ensure activityLog is an array
                user.activityLog.forEach(activity => {
                    activityLog.push({
                        datetime: activity.datetime,
                        username: activity.username || user.username,
                        type: activity.type
                    });
                });
            }
        });

        return activityLog.sort((a, b) => new Date(b.datetime) - new Date(a.datetime)); // Sort logs by date in descending order
    } catch (error) {
        console.error('Error fetching all users activity logs:', error);
        throw error;
    }
};

// Function to create an admin user if it doesn't already exist
const createAdminUser = async () => {
    try {
        const existingAdmin = loadUserFromFile('admin');

        if (!existingAdmin) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash('admin', salt);

            const adminUser = {
                _id: new mongoose.Types.ObjectId(),  // Generate a new MongoDB ObjectId for the admin
                username: 'admin',
                password: hashedPassword,
                email: 'admin@example.com', // Default email for admin
                isAdmin: true,
                cart: [],
                purchaseHistory: [],
                activityLog: []
            };

            saveUserToFile(adminUser); // Save admin to the file system
            
            const mongoAdminUser = new User(adminUser);
            await mongoAdminUser.save(); // Save admin to MongoDB

            console.log('Admin user created successfully in both file system and MongoDB');
        } else {
            console.log('Admin user already exists');
        }
    } catch (err) {
        console.error('Error creating admin user:', err);
        throw err;
    }
};

// Function to create a new product
const createProduct = async (productData) => {
    try {
        const product = new Product(productData);
        await product.save(); // Save the new product to MongoDB
        saveProductToFile(product); // Save the new product to the file system
        return product;
    } catch (error) {
        console.error('Error creating product:', error.message);
        throw new Error('Failed to create product.'); // Provide a more user-friendly error message
    }
};

// Function to load initial products from a JSON file
const loadProducts = async () => {
    try {
        console.log('Forcing JSON loading for testing...');
        const data = fs.readFileSync(path.join(__dirname, '../models/products.json'), 'utf-8');
        const products = JSON.parse(data);

        for (const product of products) {
            const existingProduct = await Product.findOne({ brand: product.brand, model: product.model });

            if (!existingProduct) {
                const newProduct = new Product(product);
                await newProduct.save(); // Save new product to MongoDB
                saveProductToFile(newProduct); // Save new product to the file system
                console.log(`Product added: ${product.brand} - ${product.model}`);
            } else {
                console.log(`Product already exists: ${product.brand} - ${product.model}`);
            }
        }

        console.log('Product loading completed.');
    } catch (err) {
        console.error('Error loading products:', err);
        throw err;
    }
};

// Function to find products based on a query
const findProducts = async (query) => {
    try {
        const { search, maxPrice, categories, brand, size, sortByRating, sortByPrice } = query;
        const queryObj = {};

        if (search) {
            queryObj.$or = [
                { brand: new RegExp(search, 'i') },
                { model: new RegExp(search, 'i') },
                { description: new RegExp(search, 'i') }
            ];
        }

        if (maxPrice) {
            queryObj.price = { $lte: parseFloat(maxPrice) }; // Filter by maximum price
        }

        if (categories) {
            const categoryArray = categories.split(',').map(category => category.trim());
            queryObj.categories = { $all: categoryArray }; // Filter by categories
        }

        if (brand) {
            queryObj.brand = brand; // Filter by brand
        }

        if (size) {
            queryObj.sizes = { $elemMatch: { size: size, amount: { $gt: 0 } } }; // Filter by size and availability
        }

        let products = await Product.find(queryObj).lean();

        // Aggregate ratings for the filtered products
        const productIds = products.map(product => product._id);
        const ratings = await Review.aggregate([
            { $match: { productId: { $in: productIds } } },
            {
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$overallRating' }
                }
            }
        ]);

        const ratingMap = new Map(ratings.map(rating => [rating._id.toString(), rating.averageRating]));
        products.forEach(product => {
            product.averageRating = ratingMap.get(product._id.toString()) || 0; // Attach average rating to each product
        });

        // Sort products based on rating or price if requested
        products.sort((a, b) => {
            if (sortByRating) {
                if (sortByRating === 'desc') {
                    return b.averageRating - a.averageRating;
                } else {
                    return a.averageRating - b.averageRating;
                }
            }

            if (sortByPrice) {
                if (sortByPrice === 'desc') {
                    return b.price - a.price;
                } else {
                    return a.price - b.price;
                }
            }
        });

        return products;
    } catch (error) {
        console.error('Error finding products:', error);
        throw error;
    }
};

// Function to fetch all available brands
const fetchBrands = async () => {
    try {
        const brands = await Product.aggregate([
            { $group: { _id: '$brand', count: { $sum: 1 } } } // Group by brand and count occurrences
        ]);

        return brands.reduce((acc, brand) => {
            acc[brand._id] = brand.count;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error fetching brands:', error);
        throw error;
    }
};

// Function to update a product by its ID
const updateProductById = async (productId, updateData) => {
    try {
        const updatedProduct = await Product.findByIdAndUpdate(productId, updateData, { new: true });
        if (!updatedProduct) {
            throw new Error('Product not found');
        }
        saveProductToFile(updatedProduct); // Save the updated product to the file system
        return updatedProduct;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
};

// Function to load initial data from disk
const loadInitialDataFromDisk = async () => {
    try {
        const files = fs.readdirSync(USER_DATA_DIR);
        for (const file of files) {
            const filePath = path.join(USER_DATA_DIR, file);
            const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

            if (typeof data._id === 'string') {
                data._id = mongoose.Types.ObjectId.isValid(data._id) ? new mongoose.Types.ObjectId(data._id) : new mongoose.Types.ObjectId();
            }

            if (!data.image || !data.price || !data.description || !data.model || !data.brand) {
                console.error(`Missing required fields in file ${file}:`, data);
                continue; // Skip this entry if required fields are missing
            }

            const existingProduct = await Product.findOne({ brand: data.brand, model: data.model });
            if (!existingProduct) {
                const newProduct = new Product(data);
                await newProduct.save(); // Save the new product to MongoDB
            } else {
                console.log(`Product already exists: ${data.brand} - ${data.model}`);
            }
        }
        console.log('Data loaded from disk successfully.');
    } catch (error) {
        console.error('Error loading data from disk:', error);
        throw error;
    }
};

// Helper function to save product data to a file
const saveProductToFile = (product) => {
    const dir = path.join(__dirname, '../productData');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create the directory if it doesn't exist
    }

    const filePath = getProductFilePath(product._id);
    fs.writeFileSync(filePath, JSON.stringify(product, null, 2)); // Save product data with 2-space indentation
};

// Function to find a review by order number
const findReviewByOrderNumber = async (userId, orderNumber) => {
    try {
        return await Review.findOne({ userId, orderNumber }); // Return the review for the given user ID and order number
    } catch (error) {
        console.error('Error finding review by order number:', error);
        throw error;
    }
};

// Export all functions to be used in other parts of the application
module.exports = {
    findReviewByOrderNumber,
    findUserByUsername,
    saveUser,
    isUsernameTaken,
    hashPassword,
    findUserById,
    createUser,
    findUserByUsernameOrEmail,
    saveReview,
    findReviewsByProductId,
    updateProductAverageRating,
    findProductById,
    populatePurchases,
    updateOrAddToCart,
    removeFromCart,
    populateCartData,
    logUserActivity,
    findReviews,
    isUserAdmin,
    fetchAllUsersActivityLogs,
    createAdminUser,
    loadProducts,
    fetchBrands,
    findProducts,
    createProduct,
    deleteProductById,
    updateProductById,
    loadInitialDataFromDisk,
    saveUserToMongoDB,
    loadProductFromFile,
    saveProductToFile,
    validateUsername,
    validatePassword,
    validateEmail
};
