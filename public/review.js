document.addEventListener('DOMContentLoaded', () => {
    console.log('review.js is loaded and running');

    // Extract the image URL from the query string
    const urlParams = new URLSearchParams(window.location.search);
    const imageUrl = urlParams.get('imageUrl');

    // Load the image and other data
    loadReviewPage(imageUrl);

    // Generate stars for each rating category
    const categories = ['overallRating', 'comfort', 'style', 'durability', 'materialQuality', 'valueForMoney'];
    categories.forEach(category => generateStars(document.getElementById(category)));
});

function loadReviewPage(imageUrl) {
    const productImageElement = document.getElementById('productImage');
    productImageElement.src = imageUrl || 'default_image_url.png';
}

function saveRating(category, rating) {
    console.log(`Rating for ${category}: ${rating} stars`);
    // Add logic to save the rating for each category
}

function generateStars(container) {
    container.innerHTML = [...Array(5)].map((_, i) => 
        `<i class="fas fa-star" data-rating="${i + 1}"></i>`).join('');

    // Add event listener to handle star clicks
    container.querySelectorAll('.fa-star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = this.getAttribute('data-rating');
            saveRating(container.id, rating);
            updateSelectedStars(container, rating);
        });
    });
}

function updateSelectedStars(container, rating) {
    container.querySelectorAll('.fa-star').forEach((star, index) => {
        star.classList.toggle('selected', index < rating);
    });
}
