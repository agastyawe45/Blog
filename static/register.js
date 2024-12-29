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

    const username = document.getElementById("register-username").value.trim();
    const phoneNumber = document.getElementById("register-phone").value.trim();
    const country = document.getElementById("register-country").value.trim();
    const state = document.getElementById("register-state").value.trim();
    const city = document.getElementById("register-city").value.trim();
    const zipCode = document.getElementById("register-zip").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const confirmPassword = document.getElementById("register-confirm-password").value.trim();
    const accountType = document.getElementById("register-account-type").checked ? "Premium" : "Standard";
    const profileImage = document.getElementById("register-profile-image").files[0];

    // Validate passwords
    if (password !== confirmPassword) {
        document.getElementById("register-message").textContent =
            "Passwords do not match. Please try again.";
        return;
    }

    // Display loading message
    document.getElementById("register-message").textContent = "Processing your registration...";

    try {
        // Prepare user details
        const userDetails = {
            username,
            password,
            phone_number: phoneNumber,
            country,
            state,
            city,
            zip_code: zipCode,
            account_type: accountType,
        };

        let profileImageUrl = null;

        // Handle profile image upload if provided
        if (profileImage) {
            const filename = `${username}_profile.${profileImage.name.split('.').pop()}`;
            const presignedUrlResponse = await fetch(`${apiUrl}/api/get-presigned-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileName: filename, fileType: profileImage.type }),
            });

            if (!presignedUrlResponse.ok) {
                throw new Error("Failed to generate pre-signed URL.");
            }

            const presignedUrlData = await presignedUrlResponse.json();

            const uploadResponse = await fetch(presignedUrlData.url, {
                method: "PUT",
                body: profileImage,
                headers: { "Content-Type": profileImage.type },
            });

            if (uploadResponse.ok) {
                profileImageUrl = presignedUrlData.url.split("?")[0]; // URL without query parameters
            } else {
                throw new Error("Failed to upload profile image.");
            }
        }

        // Add profile image URL to user details
        if (profileImageUrl) {
            userDetails.profile_image = profileImageUrl;
        }

        // Send registration request
        const registrationResponse = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userDetails),
        });

        const registrationData = await registrationResponse.json();

        if (registrationResponse.ok && registrationData.success) {
            document.getElementById("register-message").textContent =
                "Registration successful! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } else {
            document.getElementById("register-message").textContent =
                registrationData.message || "Registration failed. Please try again.";
        }
    } catch (error) {
        console.error("Error during registration:", error);
        document.getElementById("register-message").textContent =
            "An error occurred. Please try again.";
    }
});
