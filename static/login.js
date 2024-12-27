const apiUrl = "${API_URL}"; // Replace with the actual API URL from the environment variable

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
            window.location.href = "home.html";
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
