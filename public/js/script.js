document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    // Clear previous errors after initializing the variables
    loginError.textContent = '';  // Clear previous login errors
    registerError.textContent = '';  // Clear previous registration errors

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());
    
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                redirect: 'follow'  // This allows fetch to follow redirects
            });
    
            if (response.redirected) {
                window.location.href = response.url; // Redirects manually if fetch was redirected
            } else if (!response.ok) {
                const text = await response.text();
                console.error('Login failed:', text);
                loginError.textContent = 'Login failed. Please try again.';
            } else {
                const result = await response.json();
                loginError.textContent = result.message || 'Login failed. Please try again.';
            }
        } catch (error) {
            loginError.textContent = 'An error occurred. Please try again.';
            console.error('Login error:', error);
        }
    });
    

    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        if (data.password !== data.repeatPassword) {
            registerError.textContent = 'Passwords do not match.';
            return;
        }

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Registration failed:', text);
                registerError.textContent = 'Registration failed. Please try again.';
                return;
            }

            const result = await response.json();
            if (result.success) {
                alert('Registration successful. Good luck!');
            } else {
                registerError.textContent = result.message || 'Registration failed. Please try again.';
            }
        } catch (error) {
            registerError.textContent = 'An error occurred. Please try again.';
            console.error('Registration error:', error);
        }
    });

    // Helper function to set a cookie
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "; expires=" + date.toUTCString();
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }
});
