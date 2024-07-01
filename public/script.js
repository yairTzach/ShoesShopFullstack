document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginError = document.getElementById('login-error');
    const registerError = document.getElementById('register-error');

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                alert('Login successful');
            } else {
                loginError.textContent = result.message;
            }
        } catch (error) {
            loginError.textContent = 'An error occurred. Please try again.';
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

            const result = await response.json();

            if (response.ok) {
                alert('Registration successful. Good luck!');
            } else {
                registerError.textContent = result.message;
            }
        } catch (error) {
            registerError.textContent = 'An error occurred. Please try again.';
        }
    });
});
