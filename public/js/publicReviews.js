document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    const cartContainer = document.getElementById('cartContainer');
    const cartIcon = document.getElementById('cartIcon');
    const viewCartButton = document.getElementById('viewCartButton');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    let isAdmin = false; // Flag to determine if the user is an admin

    window.onload = function() {
        const cartIcon = document.getElementById('cartIcon');
        const cartContainer = document.getElementById('cartContainer');

        // Toggle cart visibility on cart icon click
        cartIcon.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent other click events from firing
            cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none';
        });
    };

    // Ensure the cart starts hidden on page load
    if (cartContainer) cartContainer.style.display = 'none';

    // Load and update the cart on page load
    let cart = loadCartFromCookies();
    updateCartDisplay(cart);

    // Logout button functionality
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();
            try {
                const response = await fetch('/logout', { method: 'GET' });
                if (response.redirected) {
                    window.location.href = response.url; // Redirect on successful logout
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    }

    // Cart icon toggle
    if (cartIcon) {
        cartIcon.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent other click events from firing
            console.log("Cart icon clicked"); // Debugging line
            cartContainer.style.display = cartContainer.style.display === 'none' ? 'block' : 'none'; // Toggle cart visibility
            console.log("Cart container display:", cartContainer.style.display); // Debugging line
        });
    }

    // Hide cart when clicking outside of it
    document.addEventListener('click', (event) => {
        if (cartContainer && !cartContainer.contains(event.target) && event.target !== cartIcon) {
            cartContainer.style.display = 'none'; // Hide cart when clicking outside of it
        }
    });

    // View Cart button event
    if (viewCartButton) {
        viewCartButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/html/cart.html'; // Navigate to the cart page
        });
    }

    // Prevent cart from closing when clicking on the remove button
    document.body.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            event.stopPropagation(); // Prevent event from bubbling up
            const productId = event.target.getAttribute('data-id');
            const size = event.target.getAttribute('data-size');
            removeFromCart(productId, size); // Remove item from cart
        }
    });

    // Search button functionality
    if (searchButton) {
        searchButton.addEventListener('click', () => {
            const searchQuery = searchInput.value.trim();
            if (searchQuery) {
                fetchAndDisplayReviews({ title: searchQuery }); // Fetch reviews based on search query
            } else {
                fetchAndDisplayReviews(); // Fetch all reviews if search input is empty
            }
        });
    }

    // Validate user before fetching reviews
    validateUser();

    // **Function Definitions**
    async function validateUser() {
        try {
            const response = await fetch('/api/validate-user');
            const data = await response.json();

            if (data.isValid) {
                // Check if the logged-in user is an admin
                await checkAdminStatus();
                // Initialize reviews display after checking admin status
                fetchAndDisplayReviews();
            } else {
                window.location.href = '/html/login.html'; // Redirect to login if the user is not valid
            }
        } catch (error) {
            console.error('Error validating user:', error);
            window.location.href = '/html/login.html'; // Redirect to login in case of error
        }
    }

    async function checkAdminStatus() {
        try {
            const response = await fetch('/api/check-admin');
            const data = await response.json();
            isAdmin = data.isAdmin; // Set isAdmin flag
        } catch (error) {
            console.error('Error checking admin status:', error);
        }
    }

    async function fetchAndDisplayReviews(filters = {}) {
        const reviewsContainer = document.getElementById('reviewsContainer');
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('productId');
        if (productId) filters.productId = productId; // Add productId to filters if present in URL

        let query = new URLSearchParams(filters).toString();
        try {
            const response = await fetch(`/api/publicReviews?${query}`);
            const reviews = await response.json();
            reviewsContainer.innerHTML = ''; // Clear previous reviews
            reviews.forEach(submitReview => displayReview(submitReview)); // Display each review
        } catch (error) {
            console.error('Error fetching reviews:', error);
            reviewsContainer.innerHTML = '<p class="error-message">Error loading reviews.</p>';
        }
    }

    function displayReview(submitReview) {
        const overallRating = ((submitReview.comfort + submitReview.style + submitReview.durability + submitReview.materialQuality + submitReview.valueForMoney) / 5).toFixed(2);
        const reviewElement = document.createElement('div');
        reviewElement.classList.add('submitReview-item');
        reviewElement.innerHTML = `
            <h3>${submitReview.title}</h3>
            <p><strong>Overall Rating:</strong> ${overallRating}</p>
            <p><strong>Comfort:</strong> ${submitReview.comfort}</p>
            <p><strong>Style:</strong> ${submitReview.style}</p>
            <p><strong>Durability:</strong> ${submitReview.durability}</p>
            <p><strong>Material Quality:</strong> ${submitReview.materialQuality}</p>
            <p><strong>Value for Money:</strong> ${submitReview.valueForMoney}</p>
            <p><strong>Comments:</strong> ${submitReview.additionalComments || 'None'}</p>
            ${isAdmin ? `<button class="remove-submitReview-button" data-id="${submitReview._id}">Remove Review</button>` : ''}
        `;
        reviewsContainer.appendChild(reviewElement);

        // Add event listener to remove review button if the user is an admin
        if (isAdmin) {
            const removeButton = reviewElement.querySelector('.remove-submitReview-button');
            removeButton.addEventListener('click', () => {
                removeReview(submitReview._id);
            });
        }
    }

    async function removeReview(reviewId) {
        try {
            const response = await fetch(`/api/submitReview/${reviewId}`, { method: 'DELETE' });
            const data = await response.json();
            if (data.success) {
                fetchAndDisplayReviews(); // Refresh reviews after deletion
            } else {
                alert('Failed to remove review.');
            }
        } catch (error) {
            console.error('Error removing review:', error);
        }
    }

    function updateCartDisplay(cart) {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        let totalItems = 0;

        cartItemsContainer.innerHTML = '';

        cart.forEach(item => {
            totalItems += item.quantity;
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.brand} ${item.model}" />
                <div class="cart-item-details">
                    <h4>${item.brand} - ${item.model}</h4>
                    <p>Size: ${item.size}</p>
                    <p>Quantity: ${item.quantity}</p>
                    <p>Price: $${(item.price * item.quantity).toFixed(2)}</p>
                    <button class="remove-button" data-id="${item.productId}" data-size="${item.size}">&times;</button>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartCount.innerText = totalItems; // Update the cart count badge
    }

    // Remove an item from the cart
    function removeFromCart(productId, size) {
        let cart = loadCartFromCookies();
        const itemIndex = cart.findIndex(item => item.productId === productId && item.size === size);
        if (itemIndex !== -1) {
            if (cart[itemIndex].quantity > 1) {
                cart[itemIndex].quantity -= 1; // Decrease quantity if more than 1
            } else {
                cart.splice(itemIndex, 1); // Remove item if quantity is 1
            }
            saveCartToCookies(cart); // Save updated cart to cookies
            updateCartDisplay(cart); // Update the cart display
        }
    }
});
