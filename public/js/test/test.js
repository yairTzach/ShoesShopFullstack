import fetch from 'node-fetch';
import mongoose from 'mongoose';

// Define your database URL
const dbUrl = 'mongodb://127.0.0.1:27018/authDB';
const baseUrl = 'http://localhost:3000';

let validProductId;
let validUserId;
let latestOrderNumber;

// Connect to the MongoDB database and retrieve IDs dynamically
async function fetchIdsFromDatabase() {
    try {
        await mongoose.connect(dbUrl);
        console.log('Connected to the database.');

        const Product = mongoose.model('Product', new mongoose.Schema({}, { strict: false, collection: 'products' }));
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

        const product = await Product.findOne({});
        const user = await User.findOne({ username: 'admin' });

        validProductId = product ? product._id.toString() : null;
        validUserId = user ? user._id.toString() : null;

        if (!validProductId || !validUserId) {
            throw new Error('Could not fetch valid IDs from the database.');
        }

        console.log(`Fetched Product ID: ${validProductId}`);
        console.log(`Fetched User ID: ${validUserId}`);
    } catch (error) {
        console.error('Error fetching IDs from the database:', error);
        process.exit(1);
    }
}


async function fetchReviewId() {
    try {
        // Define the Review model
        const Review = mongoose.model('Review', new mongoose.Schema({}, { strict: false, collection: 'reviews' }));

        // Fetch the first review that matches the criteria (you can customize the query as needed)
        const review = await Review.findOne({ title: 'Great Product' }); // Example filter by title

        if (!review) {
            throw new Error('No review found matching the criteria.');
        }

        const reviewId = review._id.toString();
        console.log(`Fetched Review ID: ${reviewId}`);
        return reviewId;
    } catch (error) {
        console.error('Error fetching review ID:', error);
        process.exit(1);
    }
}


function checkStatus(response, expectedStatus, testName) {
    if (response.status === expectedStatus) {
        console.log(`✓ ${testName}`);
    } else {
        console.log(`✗ ${testName} - Expected ${expectedStatus}, got ${response.status}`);
    }
}

async function runGetTests() {
    try {
        let response = await fetch(`${baseUrl}/main.html`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Main Page');

        response = await fetch(`${baseUrl}/api/products`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET All Products');

        response = await fetch(`${baseUrl}/api/products/${validProductId}`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Single Product');

        response = await fetch(`${baseUrl}/api/brands`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Brands');

        response = await fetch(`${baseUrl}/api/validate-user`, { credentials: 'include', headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Validate User');

        response = await fetch(`${baseUrl}/api/purchaseHistory`, { credentials: 'include', headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Purchase History');

        response = await fetch(`${baseUrl}/api/publicReviews`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Public Reviews');

        response = await fetch(`${baseUrl}/profile.html`, { headers: { 'Cookie': `userId=${validUserId}; username=admin` } });
        checkStatus(response, 200, 'GET Profile Page');
    } catch (error) {
        console.error('Error during GET tests:', error);
    }
}

async function runPostTests() {
    try {
        let response = await fetch(`${baseUrl}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'testuser', password: 'TestPass1!', email: 'test@example.com' })
        });
        checkStatus(response, 200, 'POST Register New User');

        response = await fetch(`${baseUrl}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        checkStatus(response, 200, 'POST User Login');

        response = await fetch(`${baseUrl}/api/cart/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `userId=${validUserId}; username=admin` },
            body: JSON.stringify({ productId: validProductId, size: '36', quantity: 1 })
        });
        checkStatus(response, 200, 'POST Add to Cart');

        await simulatePurchase();

        response = await fetch(`${baseUrl}/api/submit-submitReview`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'Cookie': `userId=${validUserId}; username=admin; orderNumber=${latestOrderNumber}` // Set the cookies correctly
            },
            body: JSON.stringify({
                productId: validProductId,
                title: 'Great Product',
                comfort: 4,
                style: 5,
                durability: 4,
                materialQuality: 5,
                valueForMoney: 4,
                additionalComments: 'Loved it!',
                orderNumber: latestOrderNumber
            })
        });
        checkStatus(response, 200, 'POST Submit Review');
    } catch (error) {
        console.error('Error during POST tests:', error);
    }
}

async function simulatePurchase() {
    try {
        let response = await fetch(`${baseUrl}/api/cart/purchase`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Cookie': `userId=${validUserId}; username=admin` },
            body: JSON.stringify({
                purchases: [{ productId: validProductId, size: '36', quantity: 1 }],
                cardDetails: { number: '1', name: '1', expiryMonth: '1', expiryYear: '1', cvc: '1' }
            })
        });

        if (response.status === 200) {
            console.log('✓ Simulated Purchase Successfully.');
            await fetchLatestOrderNumber();
        } else {
            console.log('✗ Failed to Simulate Purchase:', await response.json());
        }
    } catch (error) {
        console.error('Error simulating purchase:', error);
    }
}

async function fetchLatestOrderNumber() {
    try {
        // Check if the 'User' model is already compiled
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false, collection: 'users' }));

        // Fetch the user's purchase history using the ObjectId constructor properly
        const user = await User.findOne({ _id: new mongoose.Types.ObjectId(validUserId) });

        // Sort the purchase history by purchaseDate and retrieve the latest one
        if (user && user.purchaseHistory.length > 0) {
            user.purchaseHistory.sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate));
            latestOrderNumber = user.purchaseHistory[0]._id.toString(); // Convert the _id to a string
            console.log(`Fetched Latest Order Number: ${latestOrderNumber}`);
        } else {
            console.error('No purchase history found for the user.');
        }
    } catch (error) {
        console.error('Error fetching latest order number:', error);
    }
}
async function runPutTests() {
    try {
        let response = await fetch(`${baseUrl}/api/products/${validProductId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': `userId=${validUserId}; username=admin` },
            body: JSON.stringify({ name: 'Updated Product Name', price: 89.99 })
        });
        checkStatus(response, 200, 'PUT Update Product');

        response = await fetch(`${baseUrl}/api/update-profile`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Cookie': `userId=${validUserId}; username=admin` },
            body: JSON.stringify({ oldUsername: 'admin', newUsername: 'admin', newEmail: 'admin@example.com', address: '', phoneNumber: '' })
        });
        checkStatus(response, 200, 'PUT Update Profile');
    } catch (error) {
        console.error('Error during PUT tests:', error);
    }
}

async function runDeleteTests() {
    try {
        // Fetch the Review ID dynamically
        const reviewId = await fetchReviewId();

        // Delete the product first (if this is part of your tests)
        let response = await fetch(`${baseUrl}/api/products/${validProductId}`, {
            method: 'DELETE',
            headers: { 
                'Content-Type': 'application/json', 
                'Cookie': `userId=${validUserId}; username=admin; orderNumber=${latestOrderNumber}` // Set the cookies correctly
            },
        });
        checkStatus(response, 204, 'DELETE Product');

        // Now, delete the review using its ID
        response = await fetch(`${baseUrl}/api/submitReview/${reviewId}`, {
            method: 'DELETE',
            headers: { 'Cookie': `userId=${validUserId}; username=admin` }
        });
        checkStatus(response, 200, 'DELETE Submit Review');
    } catch (error) {
        console.error('Error during DELETE tests:', error);
    }
}

// Main function to run all tests
async function main() {
    await fetchIdsFromDatabase();
    await runGetTests();
    await runPostTests();
    await runPutTests();
    await runDeleteTests();
}

// Execute the main function
main().catch(error => console.error('Error during test execution:', error));