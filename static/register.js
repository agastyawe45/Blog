// Load API URL from config.js
let apiUrl = "";
(async () => {
    try {
        const config = await fetch("/static/config.js");
        const text = await config.text();
        apiUrl = eval(text).API_URL; // Parse the API_URL variable from config.js
    } catch (error) {
        console.error("Error loading config.js:", error);
    }
})();

// Register form submission handler
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value;
    const phoneNumber = document.getElementById("register-phone").value;
    const country = document.getElementById("register-country").value;
    const state = document.getElementById("register-state").value;
    const city = document.getElementById("register-city").value;
    const zipCode = document.getElementById("register-zip").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const accountType = document.getElementById("register-account-type").checked ? "Premium" : "Standard";
    const profileImage = document.getElementById("register-profile-image").files[0];

    // Validate passwords
    if (password !== confirmPassword) {
        document.getElementById("register-message").textContent =
            "Passwords do not match. Please try again.";
        return;
    }

    const formData = new FormData();
    formData.append("username", username);
    formData.append("phone_number", phoneNumber);
    formData.append("country", country);
    formData.append("state", state);
    formData.append("city", city);
    formData.append("zip_code", zipCode);
    formData.append("password", password);
    formData.append("account_type", accountType);

    if (profileImage) {
        formData.append("profile_image", profileImage);
    }

    try {
        const response = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json();

        if (data.success) {
            document.getElementById("register-message").textContent =
                "Registration successful! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } else {
            document.getElementById("register-message").textContent =
                data.message || "Registration failed. Please try again.";
        }
    } catch (error) {
        document.getElementById("register-message").textContent =
            "An error occurred. Please try again.";
        console.error("Error during registration:", error);
    }
});
