document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('logoutButton').addEventListener('click', function (event) {
        event.preventDefault();
        
        fetch('/logout', {
            method: 'GET',
        })
        .then(response => {
            if (response.redirected) {
                // Redirect to the login page after logout
                window.location.href = response.url;
            }
        })
        .catch(error => {
            console.error('Error during logout:', error);
        });
    });
});

document.addEventListener('DOMContentLoaded', debugCookies);

function debugCookies() {
    console.log("All cookies visible to the script:", document.cookie);
}

document.addEventListener('DOMContentLoaded', () => {
    let cart = loadCartFromCookies();
    console.log("Cart loaded from cookies:", cart);
    updateCart(cart);

    fetchProducts();
    fetchBrands();

    document.body.addEventListener('click', function(event) {
        if (event.target.matches('.category-button')) {
            fetchProductsByCategory(event.target.dataset.category, event.target);
        } else if (event.target.matches('.filter-button')) {
            fetchProducts();
        } else if (event.target.matches('.brand-button')) {
            fetchProductsByBrand(event.target.dataset.brand);
        } else if (event.target.matches('.remove-button')) {
            const productId = event.target.dataset.id;
            const size = event.target.dataset.size;
            removeFromCart(productId, size);
        } else if (event.target.matches('.add-to-cart-button')) {
            const productId = event.target.dataset.id;
            const sizeSelector = event.target.closest('.product').querySelector('.size-select');
            if (sizeSelector) {
                addToCart(productId, sizeSelector.value);
            } else {
                console.error('Size selector not found for product', productId);
                alert('Please select a size before adding to cart.');
            }
        }
    });

    document.getElementById('cartIcon').addEventListener('click', () => {
        cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
    });

    document.getElementById('showFilters').addEventListener('click', () => {
        sidebar.classList.add('open');
        showFilters.style.display = 'none';
        filtersClose.style.display = 'block';
    });

    document.getElementById('filtersClose').addEventListener('click', () => {
        sidebar.classList.remove('open');
        showFilters.style.display = 'block';
        filtersClose.style.display = 'none';
    });

    document.getElementById('availableBrandsToggle').addEventListener('click', () => {
        availableBrands.style.display = availableBrands.style.display === 'none' ? 'block' : 'none';
    });

    searchInput.addEventListener('keyup', function(event) {
        if (event.key === "Enter") {
            fetchProducts();
        }
    });

    priceRange.addEventListener('input', function(event) {
        fetchProducts();
    });

    document.getElementById('sizeFilter').addEventListener('change', () => {
        fetchProducts();
    });

    document.getElementById('viewCartButton').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = 'cart.html';
    });

    // Populate the size filter options dynamically
    const sizeFilter = document.getElementById('sizeFilter');
    const sizes = Array.from({ length: 25 }, (_, i) => 36 + i * 0.5);

    sizes.forEach(size => {
        const option = document.createElement('option');
        option.value = size;
        option.textContent = size;
        sizeFilter.appendChild(option);
    });

    updateCart(cart); // Ensure cart updates with the correct cart
});

const searchInput = document.getElementById('searchInput');
const priceRange = document.getElementById('priceRange');
const priceRangeValue = document.getElementById('priceRangeValue');
const productContainer = document.getElementById('productContainer');
const cartContainer = document.getElementById('cartContainer');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotalContainer = document.getElementById('cartTotal');
const cartIcon = document.getElementById('cartIcon');
const cartCount = document.getElementById('cartCount');
const availableBrands = document.getElementById('availableBrands');
const availableBrandsToggle = document.getElementById('availableBrandsToggle');
const sidebar = document.getElementById('sidebar');
const showFilters = document.getElementById('showFilters');
const filtersClose = document.getElementById('filtersClose');
let cart = loadCartFromCookies();
let activeCategoryButton = null;

function updatePriceValue() {
    priceRangeValue.textContent = priceRange.value;
}

function fetchProducts() {
    const searchQuery = searchInput.value;
    const maxPrice = priceRange.value;
    const selectedSize = document.getElementById('sizeFilter').value;
    const query = `search=${encodeURIComponent(searchQuery)}&maxPrice=${maxPrice}` + (selectedSize ? `&size=${selectedSize}` : '');

    fetch(`http://localhost:3000/api/products?${query}`)
        .then(response => response.json())
        .then(products => {
            productContainer.innerHTML = ''; // Clear previous results
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div class="image-container">
                        <img src="${product.image}" alt="Image of ${product.brand} ${product.model}" />
                    </div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <select class="size-select" data-id="${product._id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                    <button class="add-to-cart-button" data-id="${product._id}">Add to Cart</button>
                `;
                productContainer.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function fetchProductsByType(type) {
    const searchQuery = searchInput.value;
    const maxPrice = priceRange.value;
    const selectedSize = document.getElementById('sizeFilter').value;
    const query = `search=${encodeURIComponent(searchQuery)}&maxPrice=${maxPrice}&type=${type}` + (selectedSize ? `&size=${selectedSize}` : '');

    fetch(`http://localhost:3000/api/products?${query}`)
        .then(response => response.json())
        .then(products => {
            productContainer.innerHTML = ''; // Clear previous results
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div class="image-container">
                        <img src="${product.image}" alt="Image of ${product.brand} ${product.model}" />
                    </div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <select class="size-select" data-id="${product._id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                    <button class="add-to-cart-button" data-id="${product._id}">Add to Cart</button>
                `;
                productContainer.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function fetchProductsByCategory(category, button) {
    if (activeCategoryButton === button) {
        activeCategoryButton.classList.remove('active');
        activeCategoryButton = null;
        fetchProducts();
        return;
    }
    if (activeCategoryButton) {
        activeCategoryButton.classList.remove('active');
    }
    button.classList.add('active');
    activeCategoryButton = button;
    const selectedSize = document.getElementById('sizeFilter').value;
    const query = `category=${category}` + (selectedSize ? `&size=${selectedSize}` : '');

    fetch(`http://localhost:3000/api/products?${query}`)
        .then(response => response.json())
        .then(products => {
            productContainer.innerHTML = ''; // Clear previous results
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div class="image-container">
                        <img src="${product.image}" alt="Image of ${product.brand} ${product.model}" />
                    </div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <select class="size-select" data-id="${product._id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                    <button class="add-to-cart-button" data-id="${product._id}">Add to Cart</button>
                `;
                productContainer.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function fetchProductsByBrand(brand) {
    const selectedSize = document.getElementById('sizeFilter').value;
    const query = `brand=${encodeURIComponent(brand)}` + (selectedSize ? `&size=${selectedSize}` : '');

    fetch(`http://localhost:3000/api/products?${query}`)
        .then(response => response.json())
        .then(products => {
            productContainer.innerHTML = ''; // Clear previous results
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'product';
                productDiv.innerHTML = `
                    <div class="image-container">
                        <img src="${product.image}" alt="Image of ${product.brand} ${product.model}" />
                    </div>
                    <h3>${product.brand} - ${product.model}</h3>
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <select class="size-select" data-id="${product._id}">
                        ${product.sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
                    </select>
                    <button class="add-to-cart-button" data-id="${product._id}">Add to Cart</button>
                `;
                productContainer.appendChild(productDiv);
            });
        })
        .catch(error => {
            console.error('Error fetching products:', error);
        });
}

function fetchBrands() {
    fetch('http://localhost:3000/api/brands')
        .then(response => response.json())
        .then(brands => {
            availableBrands.innerHTML = ''; // Clear previous brands
            for (const brand in brands) {
                const brandDiv = document.createElement('button');
                brandDiv.className = 'brand-button';
                brandDiv.dataset.brand = brand;
                brandDiv.innerHTML = `${brand}: ${brands[brand]}`;
                availableBrands.appendChild(brandDiv);
            }
        })
        .catch(error => {
            console.error('Error fetching brands:', error);
        });
}

function addToCart(productId, selectedSize) {
    const username = getCookie('username');

    if (username) {
        fetch(`/api/products/${productId}`)
            .then(response => response.json())
            .then(product => {
                if (!selectedSize) {
                    alert('Please select a size.');
                    return;
                }

                // Check if the product was fetched successfully and has a price
                if (!product || !product.price) {
                    console.error('Failed to retrieve product details or price is undefined');
                    alert('Error: Unable to add product to cart.');
                    return;
                }

                let cartItem = {
                    productId: product._id,
                    size: selectedSize,
                    quantity: 1,
                    image: product.image,
                    brand: product.brand,
                    model: product.model,
                    price: product.price
                };

                // Load cart from cookie
                let cart = loadCartFromCookies();

                // Check if the product is already in the cart
                let existingItem = cart.find(item => item.productId === productId && item.size === selectedSize);
                if (existingItem) {
                    existingItem.quantity += cartItem.quantity;
                } else {
                    cart.push(cartItem);
                }

                // Save the updated cart to the database
                fetch('/api/cart/add', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cartItem),
                    credentials: 'include'
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to add to cart in the database');
                    }
                    return response.json();
                })
                .then(data => {
                    if (data.success) {
                        console.log('Product added to cart in the database successfully!');

                        // Re-fetch all product data to ensure price is correct (similar to removeFromCart)
                        const fetchProductPromises = data.cart.map(item => {
                            return fetch(`/api/products/${item.productId}`)
                                .then(response => response.json())
                                .then(product => {
                                    item.price = product.price;
                                    item.image = product.image;
                                    item.brand = product.brand;
                                    item.model = product.model;
                                    return item;
                                })
                                .catch(error => {
                                    console.error(`Failed to fetch product data for ${item.productId}:`, error);
                                });
                        });

                        Promise.all(fetchProductPromises).then((updatedCart) => {
                            // Save the updated cart to the cookie
                            saveCartToCookies(updatedCart);

                            // Update the UI to reflect the new cart state
                            updateCart(updatedCart);
                        });

                    } else {
                        console.error('Failed to add to cart in the database:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error adding to cart in the database:', error.message);
                });
            })
            .catch(error => {
                console.error('Product fetch error:', error);
                alert('Error: Product not found.');
            });
    } else {
        window.location.href = '/login';
    }
}
function saveCartToCookies(cart) {
    try {
        const cartString = JSON.stringify(cart);
        setCookie('cart', cartString, 7); // Assuming cookies are valid for 7 days
    } catch (error) {
        console.error("Error saving cart to cookies:", error);
    }
}

function setCookie(name, value, days, secure = true, sameSite = 'Lax') {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    const secureFlag = secure ? '; Secure' : '';
    const sameSitePolicy = `; SameSite=${sameSite}`;

    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; Path=/;${secureFlag}${sameSitePolicy}`;
}

function loadCartFromCookies() {
    const cartData = getCookie('cart');
    console.log("Raw cart data from cookie:", cartData);
    if (cartData) {
        try {
            const parsedCart = JSON.parse(cartData);
            console.log("Parsed cart data:", parsedCart);
            return parsedCart; // This should be an array of cart items
        } catch (error) {
            console.error("Error parsing cart data:", error);
        }
    }
    return []; // Return an empty array if no cart data is found or parsing fails
}

function updateCart(cartData = []) {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const cartCount = document.getElementById('cartCount');

    cartItemsContainer.innerHTML = ''; // Clear previous cart items
    let totalPrice = 0;
    let itemCount = 0;

    console.log("Updating cart UI with data:", cartData);

    for (const item of cartData) {
        if (item.quantity) {
            itemCount += item.quantity;
            if (item.price) {
                totalPrice += item.quantity * item.price;
            } else {
                console.warn(`Missing price for item: ${item.productId}, size: ${item.size}`);
            }

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image || ''}" alt="Image of ${item.brand || 'Product'}" />
                <div>
                    <h4>${item.brand || 'Brand'} - ${item.model || 'Model'}</h4>
                    <p>Size: ${item.size}</p>
                    <span>x${item.quantity}</span>
                    <p>Price: $${item.price ? item.price.toFixed(2) : 'Undefined'}</p>
                </div>
                <button class="remove-button" data-id="${item.productId}" data-size="${item.size}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        }
    }

    cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    cartCount.innerText = itemCount; // Ensure this updates the icon

    if (itemCount === 0) {
        cartTotalContainer.innerHTML = `<p class="cart-total">Empty Cart</p>`;
        document.querySelector('.proceed-button').style.display = 'none';
    } else {
        document.querySelector('.proceed-button').style.display = 'block';
    }
s}


function removeFromCart(productId, size) {
    fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId, size }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('Product removed from cart in the database successfully!');
            cart = data.cart;

            // Fetch the product data to ensure the price is correct
            const fetchProductPromises = cart.map(item => {
                return fetch(`/api/products/${item.productId}`)
                    .then(response => response.json())
                    .then(product => {
                        item.price = product.price;
                        item.image = product.image;  // Ensure the image is reassigned
                        item.brand = product.brand;  // Ensure the brand is reassigned
                        item.model = product.model;  // Ensure the model is reassigned
                        return item;
                    })
                    .catch(error => {
                        console.error(`Failed to fetch product data for ${item.productId}:`, error);
                    });
            });

            // Once all product data has been fetched and prices updated, update the UI
            Promise.all(fetchProductPromises).then(() => {
                saveCartToCookies(cart); // Save to cookies
                updateCart(cart); // Update UI
            });

        } else {
            console.error('Failed to remove from cart in the database:', data.message);
        }
    })
    .catch(error => {
        console.error('Error during removeFromCart:', error);
    });
}

function saveCartToCookies(cart) {
    try {
        const cartString = JSON.stringify(cart);
        setCookie('cart', cartString, 7); // Assuming cookies are valid for 7 days
    } catch (error) {
        console.error("Error saving cart to cookies:", error);
    }
}
function updateCart(cartData = []) {
    cartItemsContainer.innerHTML = ''; // Clear previous cart items
    let totalPrice = 0;
    let itemCount = 0;

    console.log("Updating cart UI with data:", cartData);

    for (const item of cartData) {
        if (item.quantity) {
            itemCount += item.quantity;
            if (item.price) {
                totalPrice += item.quantity * item.price;
            } else {
                console.warn(`Missing price for item: ${item.productId}, size: ${item.size}`);
            }

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image || ''}" alt="Image of ${item.brand || 'Product'}" />
                <div>
                    <h4>${item.brand || 'Brand'} - ${item.model || 'Model'}</h4>
                    <p>Size: ${item.size}</p>
                    <span>x${item.quantity}</span>
                    <p>Price: $${item.price ? item.price.toFixed(2) : 'Undefined'}</p>
                </div>
                <button class="remove-button" data-id="${item.productId}" data-size="${item.size}">&times;</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        }
    }

    cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    cartCount.innerText = itemCount; // Ensure this updates the icon

    if (itemCount === 0) {
        cartTotalContainer.innerHTML = `<p class="cart-total">Empty Cart</p>`;
        document.querySelector('.proceed-button').style.display = 'none';
    } else {
        document.querySelector('.proceed-button').style.display = 'block';
    }
}

function setCookie(name, value, days, secure = true, sameSite = 'Lax') {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `; expires=${date.toUTCString()}`;
    const secureFlag = secure ? '; Secure' : '';
    const sameSitePolicy = `; SameSite=${sameSite}`;

    document.cookie = `${name}=${encodeURIComponent(value)}${expires}; Path=/;${secureFlag}${sameSitePolicy}`;
}

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

function loadCartFromCookies() {
    const cartData = getCookie('cart');
    console.log("Raw cart data from cookie:", cartData);
    if (cartData) {
        try {
            const parsedCart = JSON.parse(cartData);
            console.log("Parsed cart data:", parsedCart);
            return parsedCart; // This should be an array of cart items
        } catch (error) {
            console.error("Error parsing cart data:", error);
        }
    }
    return []; // Return an empty array if no cart data is found or parsing fails
}

document.addEventListener('DOMContentLoaded', () => {
    let cart = loadCartFromCookies();
    console.log("Cart loaded from cookies:", cart);

    // Fetch detailed product information for each cart item
    const fetchProductPromises = cart.map(item => {
        return fetch(`/api/products/${item.productId}`)
            .then(response => response.json())
            .then(product => {
                item.price = product.price;
                item.image = product.image;
                item.brand = product.brand;
                item.model = product.model;
                return item;
            })
            .catch(error => {
                console.error(`Failed to fetch product data for ${item.productId}:`, error);
            });
    });

    Promise.all(fetchProductPromises).then(updatedCart => {
        // Save the updated cart to cookies and update UI
        saveCartToCookies(updatedCart);
        updateCart(updatedCart);
    });
});
