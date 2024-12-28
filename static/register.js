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

// Register form submission handler
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", document.getElementById("register-username").value);
    formData.append("phone_number", document.getElementById("register-phone").value);
    formData.append("country", document.getElementById("register-country").value);
    formData.append("state", document.getElementById("register-state").value);
    formData.append("city", document.getElementById("register-city").value);
    formData.append("zip_code", document.getElementById("register-zip").value);
    formData.append("password", document.getElementById("register-password").value);
    formData.append("account_type", document.getElementById("register-account-type").value);

    const profileImage = document.getElementById("register-profile-image").files[0];
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
                "Registration successful! Redirecting...";
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
