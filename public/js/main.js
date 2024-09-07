// Wait for the DOM to fully load before executing the script
document.addEventListener('DOMContentLoaded', () => {
    // **Element Selection**
    // Select all necessary DOM elements upfront to avoid scoping issues
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const navMenu = document.getElementById('navMenu');
    const categoryToggle = document.querySelector('.category-toggle');
    const categorySection = document.querySelector('.category-section');
    const sidebar = document.getElementById('sidebar');
    const filtersClose = document.getElementById('filtersClose');
    const logoutButton = document.getElementById('logoutButton');
    const cartIcon = document.getElementById('cartIcon');
    const cartContainer = document.getElementById('cartContainer');
    const viewCartButton = document.getElementById('viewCartButton');
    const sortRating = document.getElementById('sortByRatingSelect');
    const sortPrice = document.getElementById('sortByPriceSelect');
    const applyFiltersButton = document.getElementById('applyFiltersButton');
    const filterBySelectedCategories = document.getElementById('filterBySelectedCategories');
    const searchInput = document.getElementById('searchInput');
    const sizeFilter = document.getElementById('sizeFilter');
    const availableBrandsToggle = document.getElementById('availableBrandsToggle');
    const availableBrands = document.getElementById('availableBrands');

    // **Initial State Setup**
    // Hide certain UI elements initially to ensure correct behavior on the first interaction
    if (cartContainer) cartContainer.style.display = 'none'; // Hide cart container initially
    if (availableBrands) availableBrands.style.display = 'none'; // Hide "Available Brands" section initially
    if (categorySection) categorySection.style.display = 'none'; // Hide categories section initially

    // **Hamburger Menu Toggle**
    if (hamburgerMenu && navMenu && sidebar) {
        hamburgerMenu.addEventListener('click', () => {
            // Toggle 'open' class to show/hide navigation menu and sidebar
            navMenu.classList.toggle('open');
            sidebar.classList.toggle('open');
        });
    }

    // **Category Section Toggle**
    if (categoryToggle && categorySection) {
        categoryToggle.addEventListener('click', () => {
            // Toggle display between 'flex' and 'none' for category section
            categorySection.style.display = (categorySection.style.display === 'none' || categorySection.style.display === '') ? 'flex' : 'none';
        });
    }

    // **Sidebar Close Functionality**
    if (filtersClose) {
        filtersClose.addEventListener('click', () => {
            // Remove 'open' class to hide the sidebar
            sidebar.classList.remove('open');
        });
    }

    // **Logout Functionality**
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault(); // Prevent default link/button behavior
            try {
                const response = await fetch('/logout', { method: 'GET' });
                if (response.redirected) {
                    window.location.href = response.url; // Redirect after logout
                }
            } catch (error) {
                console.error('Error during logout:', error);
                alert('An error occurred while logging out.');
            }
        });
    }

    // **Cart Icon Toggle**
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            if (cartContainer) {
                // Toggle cart container visibility between 'block' and 'none'
                cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
            }
        });
    }

    // **View Cart Button**
    if (viewCartButton) {
        viewCartButton.addEventListener('click', (event) => {
            event.preventDefault(); // Prevent default behavior
            
            window.location.href = '/html/cart.html'; // Redirect to the cart page
        });
    }

    // **Sorting Functionality**
    // Trigger product fetching when sorting options change
    if (sortRating) {
        sortRating.addEventListener('change', fetchProducts);
    }
    if (sortPrice) {
        sortPrice.addEventListener('change', fetchProducts);
    }

    // **Apply Filters Button**
    if (applyFiltersButton) {
        applyFiltersButton.addEventListener('click', fetchProducts);
    }

    // **Filter by Selected Categories**
    if (filterBySelectedCategories) {
        filterBySelectedCategories.addEventListener('click', () => {
            const selectedCategories = [];
            document.querySelectorAll('.category-checkbox:checked').forEach(checkbox => {
                selectedCategories.push(checkbox.value);
            });
            fetchProductsBySelectedCategories(selectedCategories);
        });
    }

    // **Available Brands Toggle**
    if (availableBrandsToggle && availableBrands) {
        availableBrandsToggle.addEventListener('click', () => {
            availableBrands.style.display = availableBrands.style.display === 'none' ? 'block' : 'none';
        });
    }

    // **Search Input Functionality**
    if (searchInput) {
        searchInput.addEventListener('keyup', (event) => {
            if (event.key === "Enter") {
                fetchProducts(); // Fetch products when Enter key is pressed
            }
        });
    }

    // **Size Filter Functionality**
    if (sizeFilter) {
        sizeFilter.addEventListener('change', fetchProducts);
    }

    // **Load Initial Cart and Products**
    debugCookies(); // Log all cookies for debugging purposes
    let cart = loadCartFromCookies(); // Load cart data from cookies
    updateCart(cart); // Update cart UI based on loaded data

    // Fetch and render products if the product container exists
    if (document.getElementById('productContainer')) fetchProducts();
    if (availableBrands) fetchBrands();

    // **Event Delegation for Dynamic Elements**
    document.body.addEventListener('click', (event) => {
        if (event.target.matches('.filter-button')) {
            fetchProducts();
        } else if (event.target.matches('.brand-button')) {
            fetchProductsByBrand(event.target.dataset.brand);
        } else if (event.target.matches('.remove-button')) {
            removeFromCart(event.target.dataset.id, event.target.dataset.size);
        } else if (event.target.matches('.add-to-cart-button')) {
            const productId = event.target.dataset.id;
            const sizeSelector = event.target.closest('.product').querySelector('.size-select');
            if (sizeSelector) {
                addToCart(productId, sizeSelector.value);
            } else {
                console.error('Size selector not found for product', productId);
            }
        }
    });

    checkAdminStatus();

    // **Handle Page Show Event**
    window.addEventListener('pageshow', () => {
        let cart = loadCartFromCookies();
        updateCart(cart);
    });
});

/**
 * Logs all cookies accessible to the script for debugging purposes.
 */
function debugCookies() {
    console.log("All cookies visible to the script:", document.cookie);
}

/**
 * Fetches products from the server based on search, size, and sorting parameters.
 */
async function fetchProducts() {
    try {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = searchInput ? searchInput.value : '';
        const selectedSize = document.getElementById('sizeFilter') ? document.getElementById('sizeFilter').value : '';
        const sortByRating = document.getElementById('sortByRatingSelect') ? document.getElementById('sortByRatingSelect').value : '';
        const sortByPrice = document.getElementById('sortByPriceSelect') ? document.getElementById('sortByPriceSelect').value : '';

        let query = `search=${encodeURIComponent(searchQuery)}`;
        if (selectedSize) query += `&size=${encodeURIComponent(selectedSize)}`;
        if (sortByRating === 'ratingDesc') query += '&sortByRating=desc';
        else if (sortByRating === 'ratingAsc') query += '&sortByRating=asc';
        if (sortByPrice === 'priceDesc') query += '&sortByPrice=desc';
        else if (sortByPrice === 'priceAsc') query += '&sortByPrice=asc';

        const response = await fetch(`http://localhost:3000/api/products?${query}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        alert('An error occurred while fetching products.');
    }
}

/**
 * Fetches available brands from the server and populates the availableBrands element.
 */
async function fetchBrands() {
    const availableBrands = document.getElementById('availableBrands');
    if (!availableBrands) return; // Exit if the element doesn't exist

    try {
        const response = await fetch('http://localhost:3000/api/brands');
        if (!response.ok) throw new Error('Failed to fetch brands');
        const brands = await response.json();
        availableBrands.innerHTML = ''; // Clear previous brands
        for (const brand in brands) {
            const brandButton = document.createElement('button');
            brandButton.className = 'brand-button';
            brandButton.dataset.brand = brand;
            brandButton.innerHTML = `${brand}: ${brands[brand]}`; // Display brand name and count
            availableBrands.appendChild(brandButton);
        }
    } catch (error) {
        console.error('Error fetching brands:', error);
        alert('An error occurred while fetching brands.');
    }
}

/**
 * Fetches products filtered by a specific brand.
 * @param {string} brand - The brand name to filter products by.
 */
async function fetchProductsByBrand(brand) {
    try {
        const selectedSize = document.getElementById('sizeFilter') ? document.getElementById('sizeFilter').value : '';
        const query = `brand=${encodeURIComponent(brand)}` + (selectedSize ? `&size=${selectedSize}` : '');

        const response = await fetch(`http://localhost:3000/api/products?${query}`);
        if (!response.ok) throw new Error('Failed to fetch products by brand');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products by brand:', error);
        alert('An error occurred while fetching products by brand.');
    }
}

/**
 * Fetches products filtered by selected categories.
 * @param {Array} categories - An array of selected category names.
 */
async function fetchProductsBySelectedCategories(categories) {
    try {
        const searchInput = document.getElementById('searchInput');
        const searchQuery = searchInput ? searchInput.value : '';
        const selectedSize = document.getElementById('sizeFilter') ? document.getElementById('sizeFilter').value : '';

        let query = `search=${encodeURIComponent(searchQuery)}` + (selectedSize ? `&size=${selectedSize}` : '');
        if (categories.length > 0) query += `&categories=${categories.join(',')}`;

        const response = await fetch(`http://localhost:3000/api/products?${query}`);
        if (!response.ok) throw new Error('Failed to fetch products by categories');
        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error('Error fetching products by categories:', error);
        alert('An error occurred while fetching products by categories.');
    }
}

/**
 * Renders the fetched products into the product container.
 * @param {Array} products - An array of product objects to render.
 */
function renderProducts(products) {
    const productContainer = document.getElementById('productContainer');
    if (!productContainer) return; // Exit if the element doesn't exist

    productContainer.innerHTML = ''; // Clear previous products

    products.forEach(product => {
        // Filter sizes to only include those with available stock
        const availableSizes = product.sizes.filter(sizeObj => sizeObj.amount > 0);

        // Check if all sizes are out of stock
        const allSizesOutOfStock = availableSizes.length === 0;

        // Create a product div
        const productDiv = document.createElement('div');
        productDiv.className = 'product';

        // Add product HTML content
        productDiv.innerHTML = `
            <div class="image-container">
                <img src="${product.image}" alt="Image of ${product.brand} ${product.model}" />
            </div>
            <h3>${product.brand} - ${product.model}</h3>
            <p>${product.description}</p>
            <p>Price: $${product.price}</p>
            ${allSizesOutOfStock ? `
                <p class="out-of-stock">Out of Stock</p>
            ` : `
                <select class="size-select" data-id="${product._id}">
                    ${availableSizes.map(sizeObj => `<option value="${sizeObj.size}">${sizeObj.size}</option>`).join('')}
                </select>
                <button class="add-to-cart-button" data-id="${product._id}">Add to Cart</button>
            `}
            <div class="rating-display">
                Rating: ${product.averageRating ? product.averageRating.toFixed(1) + ' ☆' : 'No ratings yet'}
            </div>
            ${product.averageRating ? `<a href="/html/publicReviews.html?productId=${product._id}" class="view-reviews-link">View Detailed Reviews</a>` : ''}
        `;

        // Append the product div to the container
        productContainer.appendChild(productDiv);
    });
}

/**
 * Adds a product to the cart.
 * @param {string} productId - The ID of the product to add.
 * @param {string} selectedSize - The selected size for the product.
 */
async function addToCart(productId, selectedSize) {
    const username = getCookie('username');
    const userId = getCookie('userId');

    // Ensure the user is logged in
    if (username && userId) {
        try {
            const productResponse = await fetch(`/api/products/${productId}`);
            if (!productResponse.ok) throw new Error('Failed to fetch product details');
            const product = await productResponse.json();

            if (!selectedSize) {
                alert('Please select a size.');
                return;
            }

            // Create a cart item object
            let cartItem = {
                productId: product._id,
                size: selectedSize,
                quantity: 1,
                image: product.image,
                brand: product.brand,
                model: product.model,
                price: product.price
            };

            let cart = loadCartFromCookies(); // Load existing cart from cookies
            let existingItem = cart.find(item => item.productId === productId && item.size === selectedSize);

            if (existingItem) {
                existingItem.quantity += cartItem.quantity; // Increment quantity if it exists
            } else {
                cart.push(cartItem); // Add new item to cart
            }

            const addResponse = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cartItem),
                credentials: 'include' // Include cookies in the request
            });

            const data = await addResponse.json();
            if (!data.success) {
                alert(data.message);
                return;
            }

            // Fetch updated product data for all items in the cart
            const fetchProductPromises = data.cart.map(async item => {
                try {
                    const productDataResponse = await fetch(`/api/products/${item.productId}`);
                    if (!productDataResponse.ok) throw new Error('Failed to fetch product data');
                    const productData = await productDataResponse.json();
                    item.price = productData.price;
                    item.image = productData.image;
                    item.brand = productData.brand;
                    item.model = productData.model;
                    return item;
                } catch (error) {
                    console.error(`Failed to fetch product data for ${item.productId}:`, error);
                }
            });

            const updatedCart = await Promise.all(fetchProductPromises);
            saveCartToCookies(updatedCart);
            updateCart(updatedCart);
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Security Alert: Suspicious activity detected. To continue safely, please log out and log back in.');
            deleteCookie('cart');
            deleteCookie('userId');
    
            window.location.href = '/html/login.html';
            
        }
    } else {
        // If the user is not logged in, clear relevant cookies and redirect to login
        deleteCookie('cart');
        deleteCookie('userId');
        window.location.href = '/html/login.html'; // Redirect to login page
    }
}

/**
 * Removes a product from the cart.
 * @param {string} productId - The ID of the product to remove.
 * @param {string} size - The size of the product to remove.
 */
async function removeFromCart(productId, size) {
    try {
        const response = await fetch('/api/cart/remove', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, size }),
        });

        const data = await response.json();
        if (!data.success) throw new Error('Failed to remove item from cart');

        const fetchProductPromises = data.cart.map(async item => {
            try {
                const productResponse = await fetch(`/api/products/${item.productId}`);
                if (!productResponse.ok) throw new Error('Failed to fetch product data');
                const productData = await productResponse.json();
                item.price = productData.price;
                item.image = productData.image;
                item.brand = productData.brand;
                item.model = productData.model;
                return item;
            } catch (error) {
                console.error(`Failed to fetch product data for ${item.productId}:`, error);
            }
        });

        const updatedCart = await Promise.all(fetchProductPromises);
        saveCartToCookies(updatedCart);
        updateCart(updatedCart);
    } catch (error) {
        console.error('Error removing from cart:', error);
        alert('Security Alert: Suspicious activity detected. To continue safely, please log out and log back in.');
    }
}

/**
 * Saves the cart data to cookies.
 * @param {Array} cart - The cart data to save.
 */
function saveCartToCookies(cart) {
    try {
        const cartString = JSON.stringify(cart);
        setCookie('cart', cartString, 7); // Save cart for 7 days
    } catch (error) {
        console.error("Error saving cart to cookies:", error);
    }
}

/**
 * Updates the cart UI based on the cart data.
 * @param {Array} cartData - The current cart data.
 */
function updateCart(cartData = []) {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    cartItemsContainer.innerHTML = ''; // Clear existing cart items
    let totalPrice = 0;
    let itemCount = 0;

    // Iterate through each cart item to build the UI
    for (const item of cartData) {
        if (item.quantity) {
            itemCount += item.quantity;
            if (item.price) {
                totalPrice += item.quantity * item.price;
            }

            // Create a cart item div
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image || ''}" alt="Image of ${item.brand || 'Product'}" />
                <div>
                    <h4>${item.brand || 'Brand'} - ${item.model || 'Model'}</h4>
                    <p>Size: ${item.size}</p>
                    <span>Quantity: x${item.quantity}</span>
                    <p>Price: $${item.price ? item.price.toFixed(2) : 'Undefined'}</p>
                </div>
                <button class="remove-button" data-id="${item.productId}" data-size="${item.size}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        }
    }

    // Update total price and item count in the cart UI
    cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    cartCount.innerText = itemCount;

    // Toggle the visibility of the proceed button based on cart content
    const proceedButton = document.querySelector('.proceed-button');
    if (itemCount === 0) {
        cartTotalContainer.innerHTML = `<p class="cart-total">Empty Cart</p>`;
        if (proceedButton) proceedButton.style.display = 'none';
    } else {
        if (proceedButton) proceedButton.style.display = 'block';
    }
}

/**
 * Sets a cookie with specified parameters.
 * @param {string} name - The name of the cookie.
 * @param {string} value - The value to store in the cookie.
 * @param {number} days - The number of days until the cookie expires.
 * @param {boolean} secure - Whether to set the Secure flag.
 * @param {string} sameSite - The SameSite policy ('Lax', 'Strict', 'None').
 */
function setCookie(name, value, days, secure = false, sameSite = 'Lax') {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Calculate expiration date
    const expires = `; expires=${date.toUTCString()}`;
    const secureFlag = secure ? '; Secure' : ''; // Add Secure flag if true
    const sameSitePolicy = `; SameSite=${sameSite}`; // Add SameSite policy

    // Set the cookie with all specified attributes
    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; Path=/;${secureFlag}${sameSitePolicy}`;
}

/**
 * Retrieves the value of a specified cookie.
 * @param {string} name - The name of the cookie to retrieve.
 * @returns {string|null} - The value of the cookie or null if not found.
 */
function getCookie(name) {
    const nameEQ = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split(';');
    
    for (let i = 0; i < cookies.length; i++) {
        let c = cookies[i].trim();
        if (c.indexOf(nameEQ) == 0) {
            const value = c.substring(nameEQ.length);
            return decodeURIComponent(value);
        }
    }
    console.log(`Cookie not found: ${name}`);
    return null;
}

/**
 * Loads the cart data from cookies.
 * @returns {Array} - The cart data as an array of items.
 */
function loadCartFromCookies() {
    const cartData = getCookie('cart');
    if (cartData) {
        try {
            const decodedCartData = decodeURIComponent(cartData);
            return JSON.parse(decodedCartData);
        } catch (error) {
            console.error("Error parsing cart data:", error);
        }
    }
    return [];
}

/**
 * Deletes a specified cookie.
 * @param {string} name - The name of the cookie to delete.
 * @param {string} path - The path attribute of the cookie.
 */
function deleteCookie(name, path = '/') {
    // Set the cookie's Max-Age to a negative value to delete it
    document.cookie = `${name}=; Max-Age=-99999999; Path=${path};`;
    console.log(`Deleted cookie: ${name} on path: ${path}`);
}

/**
 * Checks if the user has admin privileges and toggles admin UI elements accordingly.
 */
async function checkAdminStatus() {
    try {
        const response = await fetch('/api/check-admin'); // Endpoint to verify admin status
        if (!response.ok) throw new Error('Failed to check admin status');
        const data = await response.json();

        if (data.isAdmin) {
            const adminButtons = document.getElementById('adminButtons');
            if (adminButtons) adminButtons.style.display = 'flex'; // Adjust based on CSS preferences

            // Add event listeners to the admin buttons
            const adminManagementButton = document.getElementById('adminManagementButton');
            const activityLogButton = document.getElementById('activityLogButton');

            if (adminManagementButton) {
                adminManagementButton.addEventListener('click', () => {
                    window.location.href = '/html/admin.html'; // Redirect to admin management page
                });
            }

            if (activityLogButton) {
                activityLogButton.addEventListener('click', () => {
                    window.location.href = '/html/activityLog.html'; // Redirect to activity log page
                });
            }
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}
