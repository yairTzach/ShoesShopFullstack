document.addEventListener('DOMContentLoaded', () => {
    // Function to retrieve the value of a cookie by its name
    function getCookie(name) {
        const nameEQ = encodeURIComponent(name) + "="; // Encodes the cookie name to handle special characters
        const ca = document.cookie.split(';'); // Splits all cookies into an array
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1); // Trim leading spaces
            if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length)); // Return the cookie value if found
        }
        return null; // Return null if the cookie is not found
    }

    // Function to delete a cookie by name
    function deleteCookie(name, path = '/') {
        document.cookie = `${name}=; Max-Age=-99999999; Path=${path};`;
        console.log(`Deleted cookie: ${name} on path: ${path}`);
    }

    // Check if necessary cookies are present
    const productTitle = getCookie('productTitle');
    const productImage = getCookie('productImage');
    const productId = getCookie('productId');
    const orderNumber = getCookie('orderNumber');

    // Redirect if any required cookies are missing
    if (!productTitle || !productImage || !productId || !orderNumber) {
        alert("You cannot access the submitReview page directly. Please navigate from your purchase history.");
        window.location.href = 'purchaseHistory.html';
        return;
    }

    const userName = getCookie('userName'); // Retrieve the user's name from a cookie, if available

    // Update the page content with the retrieved cookie values
    document.querySelector('h1').textContent = `Submit a Review for ${productTitle}`;
    document.getElementById('productImage').src = productImage;
    if (userName) document.getElementById('userNameDisplay').textContent = `Review by: ${userName}`;

    // Add click event listeners to the star rating elements
    document.querySelectorAll('.rating-container i').forEach(star => {
        star.addEventListener('click', function handleStarClick(event) {
            const starContainer = event.currentTarget.parentElement;
            const ratingValue = parseInt(event.currentTarget.dataset.value, 10);
            starContainer.dataset.value = ratingValue;

            // Update the visual appearance of the stars
            Array.from(starContainer.children).forEach(star => {
                star.classList.toggle('selected', parseInt(star.dataset.value, 10) <= ratingValue);
            });
        });
    });

    // Add a click event listener to the submit button
    document.getElementById('submitReview').addEventListener('click', async (event) => {
        event.preventDefault(); // Prevent the default form submission behavior
        const submitButton = event.target;
        submitButton.disabled = true; // Disable the submit button to prevent multiple submissions

        // Get the rating values from the star containers, defaulting to 0 if not selected
        const comfort = parseInt(document.getElementById('comfort').dataset.value, 10) || 0;
        const style = parseInt(document.getElementById('style').dataset.value, 10) || 0;
        const durability = parseInt(document.getElementById('durability').dataset.value, 10) || 0;
        const materialQuality = parseInt(document.getElementById('materialQuality').dataset.value, 10) || 0;
        const valueForMoney = parseInt(document.getElementById('valueForMoney').dataset.value, 10) || 0;
        const overallRating = (comfort + style + durability + materialQuality + valueForMoney) / 5;

        const additionalComments = document.getElementById('additionalComments').value;

        // Construct the review object with the gathered data
        const submitReview = {
            productId,
            title: productTitle,
            userName,
            comfort,
            style,
            durability,
            materialQuality,
            valueForMoney,
            overallRating,
            additionalComments,
            orderNumber,
        };

        try {
            // Send the review data to the server using a POST request
            const response = await fetch('/api/submit-submitReview', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitReview),
            });

            if (response.ok) {
                document.cookie = `reviewSubmitted=true; path=/; max-age=3600`; // Set a cookie to indicate the review was submitted (expires in 1 hour)
                window.location.href = `/html/thankYouReview.html?rating=${overallRating}`;
                deleteCookie('orderNumber'); // Delete the order number cookie after submission
            } else {
                const errorData = await response.json();
                console.error('Error submitting review:', errorData);
                alert('Error submitting review: ' + errorData.message);
            }
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Error submitting review.');
        } finally {
            submitButton.disabled = false; // Re-enable the submit button after the request is complete
        }
    });
});
