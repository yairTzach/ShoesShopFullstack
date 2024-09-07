// Function to retrieve a cookie by its name
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);  // Remove leading spaces
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);  // Return cookie value
    }
    return null;  // Return null if the cookie is not found
}

// Variable to store the full activity log data
let fullActivityLog = [];

// Function to load the activity log from the server
async function loadActivityLog() {
    try {
        const response = await fetch('/admin/activity-log');  // Request the activity log from the server
        const activityLog = await response.json();  // Parse the response as JSON
        fullActivityLog = activityLog;  // Store the full activity log in the global variable
        displayActivityLog(activityLog);  // Display the log in the table
    } catch (error) {
        console.error('Error loading activity log:', error);  // Log any errors to the console
    }
}

// Function to display the activity log in a table
function displayActivityLog(activityLog) {
    const tableBody = document.getElementById('activityLogTable');
    tableBody.innerHTML = '';  // Clear existing rows in the table

    activityLog.forEach((activity, main) => {
        const row = document.createElement('tr');

        const indexCell = document.createElement('th');
        indexCell.scope = 'row';
        indexCell.textContent = main + 1;  // Row number (1-based index)

        const usernameCell = document.createElement('td');
        usernameCell.textContent = activity.username;  // Display the username

        const datetimeCell = document.createElement('td');
        datetimeCell.textContent = new Date(activity.datetime).toLocaleString();  // Convert datetime to a readable format

        const typeCell = document.createElement('td');
        typeCell.textContent = activity.type;  // Display the type of activity

        // Append cells to the row
        row.appendChild(indexCell);
        row.appendChild(usernameCell);
        row.appendChild(datetimeCell);
        row.appendChild(typeCell);

        // Append the row to the table body
        tableBody.appendChild(row);
    });
}

// Function to filter the activity log based on the username prefix
function filterActivityLog() {
    const prefix = document.getElementById('usernameFilter').value.toLowerCase();  // Get the filter value in lowercase
    const filteredLog = fullActivityLog.filter(activity => activity.username.toLowerCase().startsWith(prefix));  // Filter the log
    displayActivityLog(filteredLog);  // Display the filtered log
}

// Load the activity log when the window is fully loaded
window.onload = loadActivityLog;

// Add an event listener to the filter button to trigger filtering
document.getElementById('filterButton').addEventListener('click', filterActivityLog);

// Add an event listener to the logout button to handle logout functionality
document.getElementById('logoutButton').addEventListener('click', async function (event) {
    event.preventDefault();
    try {
        const response = await fetch('/logout', { method: 'GET' });
        if (response.redirected) {
            window.location.href = response.url;  // Redirect to the login page after logout
        }
    } catch (error) {
        console.error('Error during logout:', error);  // Log any errors to the console
    }
});

// Add an event listener to the admin management button to navigate to the admin page
document.getElementById('adminManagementButton').addEventListener('click', function() {
    window.location.href = '/html/admin.html';  // Navigate to the admin management page
});
