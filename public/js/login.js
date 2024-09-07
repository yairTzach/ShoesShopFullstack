document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form'); // Get the login form element

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault(); // Prevent the default form submission behavior

        const formData = new FormData(loginForm); // Collect form data
        const data = Object.fromEntries(formData.entries()); // Convert form data to an object

        try {
            // Send the login request to the server
            const response = await fetch('http://localhost:3000/login', { // Explicitly using http://
                method: 'POST', // Use POST method
                headers: { 'Content-Type': 'application/json' }, // Set content type to JSON
                body: JSON.stringify(data), // Convert data object to JSON string
                redirect: 'follow' // Follow any redirect responses automatically
            });

            if (response.redirected) {
                let redirectUrl = response.url;

                // Ensure the redirect URL uses http instead of https
                if (redirectUrl.startsWith('https://localhost')) {
                    redirectUrl = redirectUrl.replace('https://', 'http://');
                }

                // Redirect to the correct URL
                window.location.href = redirectUrl;
            } else if (!response.ok) {
                // Handle unsuccessful login attempt
                let result;
                try {
                    result = await response.json(); // Attempt to parse the response as JSON
                } catch (jsonError) {
                    console.error('Error parsing JSON:', jsonError);
                    result = { message: 'Login failed. Please try again.' }; // Fallback error message
                }
                alert(result.message || 'Login failed. Please try again.'); // Show error message to user
                console.error('Login failed:', result.message); // Log the error
            } else {
                // If the response is successful but not redirected (this is unlikely, but handled just in case)
                const result = await response.json();
                alert(result.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            // Handle any network or other unexpected errors
            alert('An error occurred. Please try again.');
            console.error('Login error:', error);
        }
    });
});
