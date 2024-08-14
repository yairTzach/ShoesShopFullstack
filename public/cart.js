
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "; expires=" + date.toUTCString();
    document.cookie = name + "=" + (value || "") + expires + "; path=/"; // Set path to root
    console.log(`Cookie Set: ${name} = ${value}`); // Log cookie set
}


function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) {
            console.log(`Cookie Retrieved: ${name} = ${c.substring(nameEQ.length, c.length)}`); // Log cookie retrieval
            return c.substring(nameEQ.length, c.length);
        }
    }
    console.log(`Cookie Not Found: ${name}`);
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
    console.log(`Cookie Erased: ${name}`);
}

function loadCartFromCookies() {
    const cookieValue = getCookie('cart');
    if (cookieValue) {
        Object.assign(cart, JSON.parse(cookieValue));
        console.log('Cart Loaded from Cookies:', cart);
    } else {
        console.log('No Cart Data in Cookies');
    }
}


function saveCartToCookies() {
    setCookie('cart', JSON.stringify(cart), 7); // Save for 7 days
    console.log('Cart Saved to Cookies:', cart);
}

// Assuming you already have the addToCart, removeFromCart, and updateCart functions in place

// Example of calling saveCartToCookies after updating the cart
function addToCart(productId) {
    fetch(`http://localhost:3000/api/products`)
        .then(response => response.json())
        .then(products => {
            const product = products.find(product => product.id === parseInt(productId));
            if (product) {
                const selectedSize = document.querySelector(`.size-select[data-id="${productId}"]`).value;
                if (!selectedSize) {
                    alert('Please select a size.');
                    return;
                }
                if (cart[productId]) {
                    if (cart[productId].sizes[selectedSize]) {
                        cart[productId].sizes[selectedSize]++;
                    } else {
                        cart[productId].sizes[selectedSize] = 1;
                    }
                } else {
                    cart[productId] = { ...product, sizes: { [selectedSize]: 1 } };
                }
                saveCartToCookies(); // Save cart to cookies
                updateCart();
            }
        })
        .catch(error => {
            console.error('Error adding to cart:', error);
        });
}