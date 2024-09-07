    const express = require('express');
    const path = require('path');
    const {
        findProducts,
        findProductById,
        createProduct,
        updateProductById,
        deleteProductById,
        fetchBrands
    } = require('../utils/persist'); // Import utility functions from persist module (adjust path as needed)

    const mainPageRouter = express.Router();

    // Serve the main page (main.html)
    mainPageRouter.get('/main.html', (req, res) => {
        // Send the main.html file located in the public/html directory
        res.sendFile(path.join(__dirname, '../public/html/main.html'));
    });

    // Fetch all products based on query parameters
    mainPageRouter.get('/api/products', async (req, res) => {
        try {
            // Find products using the query parameters passed in the request
            const products = await findProducts(req.query);
            // Respond with the list of products found
            res.status(200).json(products);
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error fetching products:', error);
            res.status(500).json({ message: 'Failed to fetch products' });
        }
    });

    // Fetch a single product by its ID
    mainPageRouter.get('/api/products/:id', async (req, res) => {
        try {
            // Find the product by its ID
            const product = await findProductById(req.params.id);
            if (!product) {
                // Respond with a 404 status if the product is not found
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with the product data if found
            res.json(product);
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error fetching product:', error);
            res.status(500).json({ message: 'Server error fetching product' });
        }
    });

    // Add a new product
    mainPageRouter.post('/api/products', async (req, res) => {
        try {
            // Create a new product using the data from the request body
            const newProduct = await createProduct(req.body);
            // Respond with the newly created product and a 201 status
            res.status(201).json(newProduct);
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error adding product:', error);
            res.status(500).json({ message: 'Failed to add product' });
        }
    });

    // Update an existing product by its ID
    mainPageRouter.put('/api/products/:id', async (req, res) => {
        try {
            // Update the product using its ID and the data from the request body
            const updatedProduct = await updateProductById(req.params.id, req.body);
            if (!updatedProduct) {
                // Respond with a 404 status if the product is not found
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with the updated product data
            res.json(updatedProduct);
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error updating product:', error);
            res.status(500).json({ message: 'Failed to update product' });
        }
    });

    // Delete a product by its ID
    mainPageRouter.delete('/api/products/:id', async (req, res) => {
        try {
            // Delete the product using its ID
            const deletedProduct = await deleteProductById(req.params.id);
            if (!deletedProduct) {
                // Respond with a 404 status if the product is not found
                return res.status(404).json({ message: 'Product not found' });
            }
            // Respond with a 204 status to indicate successful deletion
            res.status(204).end();
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error deleting product:', error);
            res.status(500).json({ message: 'Failed to delete product' });
        }
    });

    // Fetch brand data (e.g., counts of products per brand)
    mainPageRouter.get('/api/brands', async (req, res) => {
        try {
            // Fetch brand data, such as counts of products per brand
            const brandCounts = await fetchBrands();
            // Respond with the brand data
            res.json(brandCounts);
        } catch (error) {
            // Log the error and respond with a 500 status if an error occurs
            console.error('Error fetching brands:', error);
            res.status(500).json({ message: 'Failed to fetch brands' });
        }
    });

    module.exports = mainPageRouter; // Export the router to be used in other parts of the application
