// Load API URL from config.js
let apiUrl = "";
(async () => {
    try {
        const config = await fetch("/static/config.js");
        const text = await config.text();
        apiUrl = eval(text).API_URL; // Parse the API_URL variable
    } catch (error) {
        console.error("Error loading config.js:", error);
    }
})();

// Login form submission handler
document.getElementById("login-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("login-username").value;
    const password = document.getElementById("login-password").value;

    try {
        const response = await fetch(`${apiUrl}/api/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (data.success) {
            localStorage.setItem("user", JSON.stringify(data.user));
            window.location.href = "/";
        } else {
            document.getElementById("login-message").textContent =
                data.message || "Login failed. Please try again.";
        }
    } catch (error) {
        document.getElementById("login-message").textContent =
            "An error occurred. Please try again.";
        console.error("Error during login:", error);
    }
});
