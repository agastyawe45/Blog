// Load API URL from config.js
let apiUrl = "";
(async () => {
    try {
        const config = await fetch("/static/config.js");
        const text = await config.text();
        apiUrl = eval(text).API_URL; // Parse the API_URL variable
        console.log("API URL loaded:", apiUrl);
    } catch (error) {
        console.error("Error loading config.js:", error);
    }
})();

// Display user details on the home page
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("welcome-message").textContent = `Welcome, ${user.username}!`;
        document.getElementById("user-details").innerHTML = `
            <p><strong>Phone:</strong> ${user.phone_number}</p>
            <p><strong>Country:</strong> ${user.country}</p>
            <p><strong>State:</strong> ${user.state}</p>
            <p><strong>City:</strong> ${user.city}</p>
            <p><strong>Zip Code:</strong> ${user.zip_code}</p>
            <p><strong>Account Type:</strong> ${user.account_type}</p>
        `;
    } else {
        window.location.href = "/login"; // Redirect to login page if user is not logged in
    }
});

// Logout handler
document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
});

// Fetch and display files for regular and premium users
const fetchFiles = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.error("User not logged in");
        return;
    }

    try {
        // Make an API call to fetch files based on the user account type
        const response = await fetch(`${apiUrl}/api/get-signed-urls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountType: user.account_type }),
        });

        const data = await response.json();

        if (data.success) {
            // Populate the file list on the page
            const fileList = document.getElementById("file-list");
            fileList.innerHTML = "";

            data.files.forEach((file) => {
                const listItem = document.createElement("li");
                const link = document.createElement("a");
                link.href = file.url;
                link.textContent = file.name;
                link.target = "_blank"; // Open the link in a new tab
                listItem.appendChild(link);
                fileList.appendChild(listItem);
            });
        } else {
            console.error("Error fetching files:", data.message);
            document.getElementById("file-error").textContent = data.message;
        }
    } catch (error) {
        console.error("Error during file fetching:", error);
        document.getElementById("file-error").textContent = "Failed to load files. Please try again later.";
    }
};

// Load files on page load
document.addEventListener("DOMContentLoaded", fetchFiles);
