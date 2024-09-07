document.addEventListener('DOMContentLoaded', () => {
    let showingOutOfStock = false; // State to track whether the "out-of-stock" filter is applied

    // Handle logout functionality when the logout button is clicked
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async function (event) {
            event.preventDefault();
            try {
                // Log out the user and redirect to the login page if successful
                const response = await fetch('/logout', { method: 'GET' });
                if (response.redirected) {
                    window.location.href = response.url;
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    } else {
        console.warn('Logout button not found!');
    }

    // Navigate to the Activity Log page when the button is clicked
    const activityLogButton = document.getElementById('activityLogButton');
    if (activityLogButton) {
        activityLogButton.addEventListener('click', () => {
            window.location.href = '/html/activityLog.html';
        });
    }

    // Navigate to the Admin Management page when the button is clicked
    const adminManagementButton = document.getElementById('adminManagementButton');
    if (adminManagementButton) {
        adminManagementButton.addEventListener('click', () => {
            window.location.href = '/html/admin.html';
        });
    }

    // Add additional size and amount input fields in the product addition form
    const addUpdateSizeAmountButton = document.getElementById('addUpdateSizeAmountButton');
    if (addUpdateSizeAmountButton) {
        addUpdateSizeAmountButton.addEventListener('click', () => {
            const updateSizeAmountContainer = document.getElementById('updateSizeAmountContainer');
            const sizeAmountDiv = document.createElement('div');
            sizeAmountDiv.className = 'size-amount-group';
            sizeAmountDiv.innerHTML = `
                <label>Size: <input type="text" class="sizeInput" required></label>
                <label>Amount: <input type="number" class="amountInput" required></label>
            `;
            updateSizeAmountContainer.appendChild(sizeAmountDiv);
        });
    }

    // Add size and amount fields dynamically in the add product form
    const addSizeAmountButton = document.getElementById('addSizeAmountButton');
    if (addSizeAmountButton) {
        addSizeAmountButton.addEventListener('click', () => {
            const sizeAmountContainer = document.getElementById('sizeAmountContainer');
            const sizeAmountDiv = document.createElement('div');
            sizeAmountDiv.className = 'size-amount-group';
            sizeAmountDiv.innerHTML = `
                <label>Size: <input type="text" class="sizeInput" required></label>
                <label>Amount: <input type="number" class="amountInput" required></label>
            `;
            sizeAmountContainer.appendChild(sizeAmountDiv);
        });
    }

    // Handle form submission for adding a new product
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Gather size and amount data from the form
            const sizes = Array.from(document.querySelectorAll('.sizeInput')).map((input, index) => {
                const sizeValue = input.value.trim();
                const amountValue = document.querySelectorAll('.amountInput')[index].value.trim();

                if (sizeValue && amountValue) { // Only add size and amount if both are provided
                    return {
                        size: sizeValue,
                        amount: parseInt(amountValue, 10)
                    };
                }
            }).filter(sizeObj => sizeObj); // Filter out undefined entries

            // Create a product object with form data
            const newProduct = {
                brand: document.getElementById('newBrand').value.trim(),
                model: document.getElementById('newModel').value.trim(),
                description: document.getElementById('newDescription').value.trim(),
                price: parseFloat(document.getElementById('newPrice').value.trim()),
                image: document.getElementById('newImage').value.trim(),
                categories: Array.from(document.querySelectorAll('.categories input[type="checkbox"]:checked')).map(checkbox => checkbox.value.trim()),
                sizes: sizes
            };

            try {
                // Send the new product data to the server
                const response = await fetch('http://localhost:3000/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newProduct)
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                const product = await response.json();
                console.log('Product added:', product);
                fetchProducts(); // Refresh the product list
                addProductForm.reset(); // Reset the form fields
                document.getElementById('sizeAmountContainer').innerHTML = ''; // Clear the size/amount inputs
            } catch (error) {
                console.error('Error adding product:', error);
            }
        });
    }

    // Handle form submission for updating an existing product
    const updateProductForm = document.getElementById('updateProductForm');
    const updateTitle = document.getElementById('updateTitle');

    if (updateProductForm && updateTitle) {
        // Hide the update section initially
        updateProductForm.classList.add('hidden');
        updateTitle.classList.add('hidden');

        updateProductForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            // Gather size and amount data from the update form
            const sizes = Array.from(document.querySelectorAll('#updateSizeAmountContainer .sizeInput')).map((input, index) => {
                return {
                    size: input.value.trim(),
                    amount: parseInt(document.querySelectorAll('#updateSizeAmountContainer .amountInput')[index].value.trim(), 10)
                };
            });

            // Create an updated product object with form data
            const updatedProduct = {
                brand: document.getElementById('updateBrand').value.trim(),
                model: document.getElementById('updateModel').value.trim(),
                description: document.getElementById('updateDescription').value.trim(),
                price: parseFloat(document.getElementById('updatePrice').value.trim()),
                image: document.getElementById('updateImage').value.trim(),
                categories: Array.from(document.querySelectorAll('#updateProductForm .categories input[type="checkbox"]:checked')).map(checkbox => checkbox.value.trim()),
                sizes: sizes
            };

            const productId = document.getElementById('updateProductId').value;

            try {
                // Send the updated product data to the server
                const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updatedProduct)
                });

                if (!response.ok) throw new Error(`Server error: ${response.status}`);
                const product = await response.json();
                console.log('Product updated:', product);
                fetchProducts(); // Refresh the product list
                updateProductForm.reset(); // Reset the form fields
                updateProductForm.classList.add('hidden'); // Hide the update form
                updateTitle.classList.add('hidden'); // Hide the update title
            } catch (error) {
                console.error('Error updating product:', error);
            }
        });
    }

    // Filter products to show only out-of-stock items
    const filterOutOfStockButton = document.getElementById('filterOutOfStockButton');
    if (filterOutOfStockButton) {
        filterOutOfStockButton.addEventListener('click', () => {
            if (showingOutOfStock) {
                fetchProducts(); // Show all products
                filterOutOfStockButton.textContent = 'Filter Out of Stock';
            } else {
                fetchOutOfStockProducts(); // Show only out-of-stock products
                filterOutOfStockButton.textContent = 'Show All Products';
            }
            showingOutOfStock = !showingOutOfStock; // Toggle the state
        });
    }

    fetchProducts(); // Load all products initially
});

// Add event listeners for dynamically generated buttons in the product list
document.addEventListener('click', function (event) {
    if (event.target.classList.contains('remove-button')) {
        const productId = event.target.dataset.productId;
        removeProduct(productId);
    } else if (event.target.classList.contains('update-button')) {
        const productId = event.target.dataset.productId;
        showUpdateForm(productId);
    }
});

// Fetch all products from the server and display them
async function fetchProducts() {
    console.log('Fetching products...'); // Debug log

    try {
        const response = await fetch('http://localhost:3000/api/products');
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const products = await response.json();
        console.log('Fetched products:', products); // Debug log

        const productList = document.getElementById('productList');
        productList.innerHTML = ''; // Clear previous products

        // Iterate through the products and create HTML elements for each
        products.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <img src="${product.image}" alt="${product.model}">
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <p>Sizes: ${product.sizes.map(s => `${s.size}: ${s.amount}`).join(', ')}</p>
                </div>
                <div>
                    <button class="remove-button" data-product-id="${product._id}">Remove</button>
                    <button class="update-button" data-product-id="${product._id}">Update</button>
                </div>
            `;
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Fetch out-of-stock products from the server and display them
async function fetchOutOfStockProducts() {
    console.log('Fetching out-of-stock products...'); // Debug log

    try {
        const response = await fetch('http://localhost:3000/api/your-endpoint', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const products = await response.json();
        console.log('Fetched products for filtering:', products); // Debug log

        // Filter out products that are out of stock
        const outOfStockProducts = products.filter(product =>
            product.sizes.every(sizeObj => sizeObj.amount === 0)
        );

        const productList = document.getElementById('productList');
        productList.innerHTML = ''; // Clear previous products

        // Iterate through the out-of-stock products and create HTML elements for each
        outOfStockProducts.forEach(product => {
            const productDiv = document.createElement('div');
            productDiv.className = 'product';
            productDiv.innerHTML = `
                <div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <img src="${product.image}" alt="${product.model}">
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <p>Sizes: ${product.sizes.map(s => `${s.size}: ${s.amount}`).join(', ')}</p>
                </div>
                <div>
                    <button class="remove-button" data-product-id="${product._id}">Remove</button>
                    <button class="update-button" data-product-id="${product._id}">Update</button>
                </div>
            `;
            productList.appendChild(productDiv);
        });
    } catch (error) {
        console.error('Error fetching out-of-stock products:', error);
    }
}

// Remove a product from the database and update the product list
async function removeProduct(productId) {
    console.log('Removing product:', productId); // Debug log

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        console.log('Product removed');
        fetchProducts(); // Refresh the product list
    } catch (error) {
        console.error('Error removing product:', error);
    }
}

// Fetch product data by ID and populate the update form for editing
async function showUpdateForm(productId) {
    console.log('Fetching product for update:', productId); // Debug log

    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) throw new Error(`Server error: ${response.status}`);
        const product = await response.json();

        if (product) {
            document.getElementById('updateProductId').value = product._id;
            document.getElementById('updateBrand').value = product.brand;
            document.getElementById('updateModel').value = product.model;
            document.getElementById('updateDescription').value = product.description;
            document.getElementById('updatePrice').value = product.price;
            document.getElementById('updateImage').value = product.image;

            const updateSizeAmountContainer = document.getElementById('updateSizeAmountContainer');
            updateSizeAmountContainer.innerHTML = ''; // Clear previous size/amount inputs

            // Populate all existing sizes
            product.sizes.forEach(sizeAmount => {
                const sizeAmountDiv = document.createElement('div');
                sizeAmountDiv.className = 'size-amount-group';
                sizeAmountDiv.innerHTML = `
                    <label>Size: <input type="text" value="${sizeAmount.size || ''}" class="sizeInput" required></label>
                    <label>Amount: <input type="number" value="${sizeAmount.amount || 0}" class="amountInput" required></label>
                `;
                updateSizeAmountContainer.appendChild(sizeAmountDiv);
            });

            // Pre-populate the categories
            const categoryCheckboxes = document.querySelectorAll('#updateProductForm .categories input[type="checkbox"]');
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = product.categories.includes(checkbox.value);
            });

            document.getElementById('updateProductForm').classList.remove('hidden');
            document.getElementById('updateTitle').classList.remove('hidden');

            // Scroll the page to the update form
            document.getElementById('updateProductForm').scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching product:', error);
    }
}
