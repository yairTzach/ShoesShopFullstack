document.addEventListener('DOMContentLoaded', async () => {
    // Retrieve username and userId from cookies
    const username = getCookie('username');
    const userId = getCookie('userId');

    // Check if the user is logged in, if not, redirect to the main or login page
    if (!username || !userId) {
        window.location.href = '/html/main.html'; // Adjust the path to your main or login page
        return;
    }

    // Get references to important elements on the page
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');
    const paymentForm = document.getElementById('paymentForm');

    // If any of the necessary elements are missing, exit the script
    if (!cartItemsContainer || !cartTotalContainer || !paymentForm) {
        return;
    }

    // Load the cart data from cookies
    const cart = loadCartFromCookies();

    // Fetch product details for each item in the cart from the database
    const productDetails = await Promise.all(cart.map(item => fetchProductById(item.productId)));

    // Function to display cart items and total price
    function displayCartItems() {
        cartItemsContainer.innerHTML = ''; // Clear previous cart items
        let totalPrice = 0;

        // Loop through each item in the cart and create the HTML structure for it
        cart.forEach((item, index) => {
            // Fetch the corresponding product detail
            const productDetail = productDetails[index];
            const itemPrice = item.price !== undefined ? item.price : 0;
            totalPrice += itemPrice * item.quantity;

            // Create the HTML structure for each cart item
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <h3 style="font-size: 1.8rem; text-align: center; margin-bottom: 10px;">${item.brand} - ${item.model}</h3>
                <div style="display: flex; align-items: center;">
                    <div style="display: flex; align-items: center; margin-left: 0px;">
                        <button class="decrease-quantity" data-index="${index}" style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; margin-right: 20px; background-color: white; border: none; cursor: pointer;">-</button>
                        <img src="${item.image}" alt="Image of ${item.brand} ${item.model}" style="width: 250px; height: auto; object-fit: cover; margin-right: 20px;" />
                        <button class="increase-quantity" data-index="${index}" style="font-size: 1.5rem; width: 40px; height: 40px; border-radius: 50%; margin-right: 20px; background-color: white; border: none; cursor: pointer;">+</button>
                    </div>
                    <div style="width: 250px; height: auto; background-color: white; padding: 10px; margin-left: 120px; border-radius: 10px; text-align: center;">
                        <p style="color: black; font-size: 1rem;">${productDetail ? productDetail.description : 'Description not available'}</p>
                    </div>
                    <div style="width: 150px; height: auto; background-color: white; padding: 10px; border-radius: 10px; text-align: center; margin-left: 300px;">
                        <p style="color: black; font-size: 1rem;">Size: ${item.size}</p>
                        <p style="color: black; font-size: 1rem;">Quantity: ${item.quantity}</p>
                        <p style="color: black; font-size: 1rem;">Price: ${itemPrice.toFixed(2)}$</p>
                        <input type="checkbox" class="cart-checkbox styled-checkbox" data-index="${index}" checked style="transform: scale(1.5); cursor: pointer;" />
                    </div>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        // Update the total price display
        cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: ${totalPrice.toFixed(2)}$</p>`;

        // Attach event listeners to the newly created elements
        attachEventListeners();
    }

    // Function to fetch product details by product ID from the server
    async function fetchProductById(productId) {
        try {
            const response = await fetch(`/api/products/${productId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch product details');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product details:', error);
            return null; // Return null if there's an error
        }
    }

    // Function to attach event listeners to the increase, decrease buttons, and checkboxes
    function attachEventListeners() {
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                increaseQuantity(index);
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function () {
                const index = this.getAttribute('data-index');
                decreaseQuantity(index);
            });
        });

        document.querySelectorAll('.cart-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateTotalPrice);
        });

        // Handle payment form submission
        paymentForm.addEventListener('submit', async function (event) {
            event.preventDefault(); // Prevent default form submission

            // Ensure all payment fields are filled
            if (!paymentForm.checkValidity()) {
                alert('Please fill in all the payment details.');
            } else {
                try {
                    // Finalize the purchase and update purchase history
                    const response = await fetch('/api/cart/purchase', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (!response.ok) {
                        throw new Error('Failed to complete the purchase');
                    }

                } catch (error) {
                    console.error('Error during purchase process:', error);
                }
                window.location.href = '/html/thankYou.html'; // Redirect to the thank you page
                clearCartCookies(); // Clear the cart cookies after purchase
            }
        });
    }

    // Function to increase the quantity of a cart item
    async function increaseQuantity(index) {
        const item = cart[index];
        const response = await updateCartInBackend(item.productId, item.size, 1); // Increment by 1
    
        if (response.success) {
            cart[index].quantity += 1;
            saveCartToCookies(cart);
            displayCartItems();
        } else {
            console.error('Failed to increase quantity:', response.message);
        }
    }
    
    // Function to decrease the quantity of a cart item
    async function decreaseQuantity(index) {
        const item = cart[index];
        const response = await updateCartInBackend(item.productId, item.size, -1); // Decrement by 1
    
        if (response.success) {
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
            } else {
                cart.splice(index, 1); // Remove the item if quantity is zero
            }
            saveCartToCookies(cart);
            displayCartItems();
        } else {
            console.error('Failed to decrease quantity:', response.message);
        }
    }
    
    // Function to update the total price based on selected items
    function updateTotalPrice() {
        let totalPrice = 0;
        document.querySelectorAll('.cart-checkbox:checked').forEach(checkbox => {
            const index = checkbox.getAttribute('data-index');
            totalPrice += cart[index].price * cart[index].quantity;
        });
        cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    }

    // Function to clear the cart cookies after purchase
    function clearCartCookies() {
        document.cookie = 'cart=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    }

    // Display the cart items on page load
    displayCartItems();
});

// Function to get a cookie value by its name
function getCookie(name) {
    const encodedName = encodeURIComponent(name) + "=";
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
        cookie = cookie.trim();
        if (cookie.indexOf(encodedName) === 0) {
            const cookieValue = cookie.substring(encodedName.length, cookie.length);
            return decodeURIComponent(cookieValue);
        }
    }
    return null;
}

// Function to update the cart in the backend server
async function updateCartInBackend(productId, size, quantityChange) {
    try {
        const response = await fetch('/api/cart/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: productId,
                size: size,
                quantity: quantityChange
            })
        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message); // Alert the user if there's an error, such as insufficient stock
        }

        return result;
    } catch (error) {
        console.error('Error updating cart in backend:', error);
        return { success: false, message: error.message };
    }
}

// Function to load the cart from cookies
function loadCartFromCookies() {
    const cartData = getCookie('cart');
    if (cartData) {
        try {
            return JSON.parse(cartData); // Parse the cart data from JSON string
        } catch (error) {
            console.error("Error parsing cart data:", error);
        }
    }
    return [];
}

// Function to save the cart data to cookies
function saveCartToCookies(cart) {
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(cart))}; path=/;`;
}
