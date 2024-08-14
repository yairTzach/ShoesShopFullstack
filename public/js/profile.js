const User = require("../../models/User");

document.addEventListener('DOMContentLoaded', () => {
    console.log('profile.js is loaded and running');

    // Load user profile data
    loadUserProfile();

    // Load purchase history with a manual order added
    loadPurchaseHistory();
});

function loadUserProfile() {
    const userProfile = {
        email: User.email,
        address: '123 Main St',
        phoneNumber: '555-1234'
    };

    document.getElementById('email').value = userProfile.email;
    document.getElementById('address').value = userProfile.address;
    document.getElementById('phoneNumber').value = userProfile.phoneNumber;
}

function toggleEdit(fieldId) {
    const inputField = document.getElementById(fieldId);
    inputField.disabled = !inputField.disabled;
    if (!inputField.disabled) {
        inputField.focus();
        document.getElementById('saveButton').style.display = 'block';
    }
}

function saveProfile() {
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const phoneNumber = document.getElementById('phoneNumber').value;

    console.log('Profile updated with:', { email, address, phoneNumber });
    alert('Profile updated successfully!');

    document.getElementById('email').disabled = true;
    document.getElementById('address').disabled = true;
    document.getElementById('phoneNumber').disabled = true;

    document.getElementById('saveButton').style.display = 'none';
}

function loadPurchaseHistory() {
    const purchaseHistory = [
        { id: 1, name: 'Nike Air Force 1', image: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/b7d9211c-26e7-431a-ac24-b0540fb3c00f/air-force-1-07-shoes-rWtqPn.png' },
        { id: 2, name: 'Adidas Ultraboost', image: 'https://assets.adidas.com/images/h_840,f_auto,q_auto,fl_lossy,c_fill,g_auto/f5373115e0784e498914b402b059200d_9366/Ultraboost_1.0_Shoes_Grey_ID9674_01_standard.jpg' },
        { id: 3, name: 'Converse Chuck Taylor', image: 'https://www.converse.com/dw/image/v2/BCZC_PRD/on/demandware.static/-/Sites-cnv-master-catalog/default/dw3931bb17/images/a_107/M9160_A_107X1.jpg?sw=964' },
        { id: 4, name: 'Puma Suede Classic', image: 'https://images.puma.com/image/upload/f_auto,q_auto,b_rgb:fafafa,w_900,h_900/global/374915/01/sv01/fnd/PNA/fmt/png/Suede-Classic-XXI-Sneakers' } // Manual order added for testing
    ];

    const purchaseHistoryContainer = document.getElementById('purchaseHistory');
    purchaseHistoryContainer.innerHTML = '';

    purchaseHistory.forEach(purchase => {
        const purchaseItem = document.createElement('div');
        purchaseItem.className = 'purchase-item';
        purchaseItem.innerHTML = `
            <div style="display: flex; align-items: center;">
                <img src="${purchase.image}" alt="${purchase.name}" style="width: 100px; margin-right: 20px;">
                <h3>${purchase.name}</h3>
            </div>
            <button class="leave-review-button" onclick="goToReviewPage(${purchase.id})" style="background-color: black; color: white; border: none; padding: 10px; border-radius: 5px; cursor: pointer;">Leave a Review</button>
        `;
        purchaseHistoryContainer.appendChild(purchaseItem);
    });
}

function goToReviewPage(purchaseId) {
    // Redirect to the review page with the specific purchase ID
    window.location.href = `review.html?purchaseId=${purchaseId}`;
}
