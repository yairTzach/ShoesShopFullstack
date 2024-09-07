document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');

    // Add event listener to the logout button if it exists
    if (logoutButton) {
        logoutButton.addEventListener('click', async (event) => {
            event.preventDefault();

            try {
                const response = await fetch('/logout', { method: 'GET' });
                if (response.redirected) {
                    window.location.href = response.url; // Redirect to the login page after logout
                }
            } catch (error) {
                console.error('Error during logout:', error);
            }
        });
    } else {
        console.warn('Logout button not found!');
    }

    const purchaseHistoryContainer = document.getElementById('purchaseHistory');

    // Fetch and display the purchase history
    fetchPurchaseHistory();

    // Function to fetch the purchase history from the server
    async function fetchPurchaseHistory() {
        try {
            const response = await fetch('/api/purchaseHistory');
            if (!response.ok) {
                if (response.status === 401) {
                    window.location.href = '/html/login.html'; // Redirect to login if unauthorized
                    return;
                }
                throw new Error('Failed to fetch purchase history');
            }
            const purchaseHistory = await response.json();
            displayPurchaseHistory(purchaseHistory);
        } catch (error) {
            console.error('Error fetching purchase history:', error);
            purchaseHistoryContainer.innerHTML = '<p>Error loading purchase history.</p>';
        }
    }

    // Function to display the fetched purchase history
    function displayPurchaseHistory(purchaseHistory) {
        if (purchaseHistory.length > 0) {
            purchaseHistory.forEach(purchase => {
                const purchaseCard = document.createElement('div');
                purchaseCard.className = 'purchase-card';

                const purchaseItem = document.createElement('div');
                purchaseItem.className = 'purchase-item';
                purchaseItem.innerHTML = `
                    <img src="${purchase.image}" alt="${purchase.name}">
                    <div class="order-info">
                        <h3>${purchase.name}</h3>
                        <p>Order Number: ${purchase._id}</p>
                        <p>Date: ${new Date(purchase.purchaseDate).toLocaleDateString()}</p>
                        <p>Price: $${purchase.price.toFixed(2)}</p>
                        <p>Quantity: ${purchase.quantity}</p>
                    </div>
                `;

                if (purchase.reviewSubmitted) {
                    const thankYouMessage = document.createElement('div');
                    thankYouMessage.className = 'submitReview-thank-you';
                    thankYouMessage.innerHTML = `
                        <p><i class="fas fa-check-circle"></i> Thank you for your review!</p>
                    `;
                    purchaseItem.appendChild(thankYouMessage);
                } else {
                    const reviewButton = document.createElement('button');
                    reviewButton.className = 'leave-submitReview-button';
                    reviewButton.innerText = 'Add a review';
                    reviewButton.addEventListener('click', () => {
                        setCookie('productTitle', purchase.name, 1);
                        setCookie('productImage', purchase.image, 1);
                        setCookie('productId', purchase.productId, 1);
                        setCookie('orderNumber', purchase._id, 1);
                        window.location.href = 'submitReview.html';
                    });
                    purchaseItem.appendChild(reviewButton);
                }

                purchaseCard.appendChild(purchaseItem);
                purchaseHistoryContainer.appendChild(purchaseCard);
            });
        } else {
            purchaseHistoryContainer.innerHTML = '<p>No purchase history found.</p>';
        }
    }

    // Utility function to set a cookie with a specified name, value, and expiration in days
    function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
    }
});
