// Load API URL from config.js
let apiUrl = "";
(async () => {
    try {
        const config = await fetch("/static/config.js");
        const text = await config.text();
        apiUrl = eval(text).API_URL; // Parse the API_URL variable from config.js
        console.log("API URL loaded:", apiUrl);
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

    const messageElement = document.getElementById("register-message");

    // Clear any previous messages
    messageElement.textContent = "";

    // Validate passwords
    if (password !== confirmPassword) {
        messageElement.textContent = "Passwords do not match. Please try again.";
        return;
    }

    try {
        // Prepare user details
        const userDetails = {
            username: username,
            password: password,
            phone_number: phoneNumber,
            country: country,
            state: state,
            city: city,
            zip_code: zipCode,
            account_type: accountType,
        };

        let profileImageUrl = null;

        // Handle profile image upload if provided
        if (profileImage) {
            const filename = `${username}_profile.${profileImage.name.split('.').pop()}`;
            console.log("Generating pre-signed URL...");

            const presignedUrlResponse = await fetch(`${apiUrl}/api/get-presigned-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename, contentType: profileImage.type }),
            });

            const presignedUrlData = await presignedUrlResponse.json();
            console.log("Pre-signed URL response:", presignedUrlData);

            if (!presignedUrlResponse.ok) {
                throw new Error(presignedUrlData.error || "Failed to generate pre-signed URL.");
            }

            console.log("Uploading profile image...");
            const uploadResponse = await fetch(presignedUrlData.url, {
                method: "PUT",
                body: profileImage,
                headers: { "Content-Type": profileImage.type },
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload profile image.");
            }

            profileImageUrl = presignedUrlData.url.split("?")[0]; // URL without query parameters
            console.log("Profile image uploaded successfully:", profileImageUrl);
        }

        // Add profile image URL to user details
        if (profileImageUrl) {
            userDetails.profile_image = profileImageUrl;
        }

        // Send registration request
        console.log("Registering user...");
        const registrationResponse = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userDetails),
        });

        const registrationData = await registrationResponse.json();
        console.log("Registration response:", registrationData);

        if (registrationResponse.ok && registrationData.success) {
            messageElement.textContent = "Registration successful! Redirecting to login...";
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000);
        } else {
            throw new Error(registrationData.message || "Registration failed. Please try again.");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        messageElement.textContent = error.message || "An error occurred. Please try again.";
    }
});
