document.addEventListener('DOMContentLoaded', () => {
    const cartItemsContainer = document.getElementById('cartItems');
    const cartTotalContainer = document.getElementById('cartTotal');

    if (!cartItemsContainer || !cartTotalContainer) {
        return;
    }

    // Fetch cart data from cookies
    const cart = loadCartFromCookies();

    // Function to display cart items and total price
    function displayCartItems() {
        cartItemsContainer.innerHTML = ''; // Clear previous cart items
        let totalPrice = 0;
        let itemCount = 0;

        cart.forEach((item, index) => {
            itemCount += item.quantity;
            totalPrice += item.price * item.quantity;

            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <input type="checkbox" class="cart-checkbox" data-index="${index}" checked />
                <img src="${item.image}" alt="Image of ${item.brand} ${item.model}" />
                <div>
                    <h4>${item.brand} - ${item.model}</h4>
                    <p>Size: ${item.size}</p>
                    <div class="quantity-control">
                        <button class="decrease-quantity" data-index="${index}">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity" data-index="${index}">+</button>
                    </div>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
            `;
            cartItemsContainer.appendChild(cartItem);
        });

        cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;

        attachEventListeners(); // Attach event listeners after elements are rendered
    }

    // Function to attach event listeners
    function attachEventListeners() {
        // Attach event listeners for increase/decrease buttons
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                increaseQuantity(index);
            });
        });

        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const index = this.getAttribute('data-index');
                decreaseQuantity(index);
            });
        });

        // Attach event listeners for checkboxes
        document.querySelectorAll('.cart-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', updateTotalPrice);
        });

        // Attach event listener to "Proceed to Checkout" button
        const proceedToCheckoutButton = document.getElementById('proceedToCheckoutButton');
        if (proceedToCheckoutButton) {
            proceedToCheckoutButton.addEventListener('click', function() {
                saveSelectedItemsToCookie();
            });
        } else {
            console.error('Proceed to Checkout button not found.');
        }
    }

    // Function to increase quantity
    function increaseQuantity(index) {
        cart[index].quantity += 1;
        saveCartToCookies(cart);
        displayCartItems();
    }

    // Function to decrease quantity
    function decreaseQuantity(index) {
        if (cart[index].quantity > 1) {
            cart[index].quantity -= 1;
        } else {
            cart.splice(index, 1); // Remove the item if quantity is zero
        }
        saveCartToCookies(cart);
        displayCartItems();
    }

    // Function to update total price based on selected items
    function updateTotalPrice() {
        let totalPrice = 0;
        document.querySelectorAll('.cart-checkbox:checked').forEach(checkbox => {
            const index = checkbox.getAttribute('data-index');
            totalPrice += cart[index].price * cart[index].quantity;
        });
        cartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    }

    // Function to save selected items to a cookie for checkout
    function saveSelectedItemsToCookie() {
        const selectedItems = [];
        document.querySelectorAll('.cart-checkbox:checked').forEach(checkbox => {
            const index = checkbox.getAttribute('data-index');
            selectedItems.push(cart[index]);
        });
        document.cookie = `selectedItems=${encodeURIComponent(JSON.stringify(selectedItems))}; path=/;`;
    }

    // Display the cart items on page load
    displayCartItems();
});

// Function to get cookie by name
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

// Function to load the cart from cookies
function loadCartFromCookies() {
    const cartData = getCookie('cart');
    if (cartData) {
        try {
            return JSON.parse(cartData);
        } catch (error) {
            console.error("Error parsing cart data:", error);
        }
    }
    return [];
}

// Function to save the cart to cookies
function saveCartToCookies(cart) {
    document.cookie = `cart=${encodeURIComponent(JSON.stringify(cart))}; path=/;`;
}
