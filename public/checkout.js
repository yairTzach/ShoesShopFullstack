document.addEventListener('DOMContentLoaded', () => {
    const checkoutCartItems = document.getElementById('checkoutCartItems');
    const checkoutCartTotal = document.getElementById('checkoutCartTotal');

    // Fetch cart data from cookies
    const cart = JSON.parse(getCookie('cart') || '{}');

    // Function to display checkout cart items and total price
    function displayCheckoutCartItems() {
        checkoutCartItems.innerHTML = ''; // Clear previous cart items
        let totalPrice = 0;

        for (const productId in cart) {
            const item = cart[productId];
            for (const size in item.sizes) {
                totalPrice += item.price * item.sizes[size];
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="Image of ${item.brand} ${item.model}" />
                    <div>
                        <h4>${item.brand} - ${item.model}</h4>
                        <p>Size: ${size}</p>
                        <span>x${item.sizes[size]}</span>
                        <p>Price: $${item.price}</p>
                    </div>
                `;
                checkoutCartItems.appendChild(cartItem);
            }
        }

        checkoutCartTotal.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    }

    // Display the checkout cart items on page load
    displayCheckoutCartItems();
});
