document.addEventListener('DOMContentLoaded', () => {
    // Function to get the value of a cookie by its name
    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop().split(';').shift());
        return null; // Return null if the cookie is not found
    }

    // Check if the productId cookie exists, if not, redirect to the main page
    const productId = getCookie('productId');
    if (!productId) {
        window.location.href = '/main.html'; // Redirect to the main page if the productId cookie is missing
        return; // Stop further script execution
    }

    // Function to get a URL parameter value by its name
    function getParameterByName(name) {
        const url = new URL(window.location.href); // Create a new URL object
        return url.searchParams.get(name); // Get the value of the URL parameter
    }

    // Retrieve the shoe name and image from cookies
    const shoeName = getCookie('productTitle');
    const shoeImage = getCookie('productImage');

    console.log('Product Image:', shoeImage); // Log the decoded URL of the product image

    // Retrieve the rating from the URL parameter, default to 0 if not found
    const rating = parseFloat(getParameterByName('rating')) || 0;

    // Update the page with the shoe details
    if (shoeName) {
        document.getElementById('shoeName').textContent = shoeName; // Set the shoe name in the HTML
    }

    if (shoeImage) {
        document.getElementById('shoeImage').src = shoeImage; // Set the shoe image in the HTML
    }

    // Display the stars corresponding to the rating
    const starContainer = document.getElementById('starContainer'); // Get the star container element
    const ratingText = document.getElementById('ratingText'); // Get the rating text element
    const fullStars = Math.floor(rating); // Calculate the number of full stars
    const hasHalfStar = rating % 1 !== 0; // Determine if there is a half star

    // Add full stars to the container
    for (let i = 0; i < fullStars; i++) {
        starContainer.innerHTML += '<span class="star full"><i class="fas fa-star"></i></span>';
    }

    // Add a half star if applicable
    if (hasHalfStar) {
        starContainer.innerHTML += '<span class="star half"><i class="fas fa-star-half-alt"></i></span>';
    }

    // Add empty stars to make up a total of 5 stars
    const remainingStars = 5 - starContainer.children.length;
    for (let i = 0; i < remainingStars; i++) {
        starContainer.innerHTML += '<span class="star empty"><i class="far fa-star"></i></span>';
    }

    // Display the rating text, rounded to one decimal place
    ratingText.textContent = `${rating.toFixed(1)} out of 5 stars`;

    // Delete the cookies after retrieving the necessary data
    ['productTitle', 'productImage', 'productId'].forEach(deleteCookie);

    // Attach event listener to the return home button
    document.getElementById('returnHomeButton').addEventListener('click', clearCookiesAndReturnHome);
});

// Function to delete a cookie by name
function deleteCookie(name) {
    document.cookie = `${name}=; Max-Age=0; path=/;`; // Set the cookie's Max-Age to 0 to effectively delete it
}

// Function to clear specific cookies and redirect to the home page
function clearCookiesAndReturnHome() {
    ['productTitle', 'productImage', 'productId'].forEach(deleteCookie); // Delete relevant cookies
    window.location.href = '/main.html'; // Redirect to the main page
}
