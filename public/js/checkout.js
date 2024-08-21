document.addEventListener('DOMContentLoaded', () => {
    const checkoutCartItemsContainer = document.getElementById('checkoutCartItems');
    const checkoutCartTotalContainer = document.getElementById('checkoutCartTotal');
    const paymentForm = document.getElementById('paymentForm');

    if (!checkoutCartItemsContainer || !checkoutCartTotalContainer) {
        console.error('Checkout cart items container or checkout cart total container not found.');
        return;
    }

    // Fetch selected items from cookies
    const selectedItems = JSON.parse(getCookie('selectedItems') || '[]');

    // Function to display cart items and total price on checkout page
    function displayCheckoutCartItems() {
        checkoutCartItemsContainer.innerHTML = ''; // Clear previous cart items
        let totalPrice = 0;

        selectedItems.forEach(item => {
            totalPrice += item.price * item.quantity;

            const checkoutCartItem = document.createElement('div');
            checkoutCartItem.className = 'cart-item';
            checkoutCartItem.innerHTML = `
                <img src="${item.image}" alt="Image of ${item.brand} ${item.model}" />
                <div>
                    <h4>${item.brand} - ${item.model}</h4>
                    <p>Size: ${item.size}</p>
                    <span>x${item.quantity}</span>
                    <p>Price: $${item.price.toFixed(2)}</p>
                </div>
            `;
            checkoutCartItemsContainer.appendChild(checkoutCartItem);
        });

        checkoutCartTotalContainer.innerHTML = `<p class="cart-total">Total Price: $${totalPrice.toFixed(2)}</p>`;
    }

    // Display the selected cart items on checkout page load
    displayCheckoutCartItems();

    // Handle form submission for payment
    paymentForm.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        try {
            // Send the selected items to the server to save them as purchase history
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ purchases: selectedItems })
            });

            if (response.ok) {
                // Clear the cart cookie after successful checkout
                document.cookie = 'cart=; Max-Age=0; path=/;';
                document.cookie = 'selectedItems=; Max-Age=0; path=/;';
                window.location.href = 'thankyou.html'; // Redirect to thank you page
            } else {
                console.error('Checkout failed:', await response.text());
            }
        } catch (error) {
            console.error('Error during checkout:', error);
        }
    });
});

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}
