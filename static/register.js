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

// Function to upload profile image using a pre-signed URL
const uploadProfileImage = async (url, file) => {
    try {
        const response = await fetch(url, {
            method: "PUT",
            headers: {
                "Content-Type": file.type,
            },
            body: file,
        });

        if (!response.ok) {
            throw new Error(`Image upload failed with status ${response.status}`);
        }

        console.log("Image uploaded successfully");
        return true;
    } catch (error) {
        console.error("Error uploading image:", error);
        return false;
    }
};

// Register form submission handler
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    // Collect form data
    const username = document.getElementById("register-username").value;
    const phoneNumber = document.getElementById("register-phone").value;
    const country = document.getElementById("register-country").value;
    const state = document.getElementById("register-state").value;
    const city = document.getElementById("register-city").value;
    const zipCode = document.getElementById("register-zip").value;
    const password = document.getElementById("register-password").value;
    const confirmPassword = document.getElementById("register-confirm-password").value;
    const accountType = document.getElementById("register-account-type").checked ? "Premium" : "Standard";
    const fileInput = document.getElementById("register-profile-image");

    // Validate passwords
    if (password !== confirmPassword) {
        document.getElementById("register-message").textContent =
            "Passwords do not match. Please try again.";
        return;
    }

    let profileImageUrl = null;

    // Upload profile image if present
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const filename = `profile_images/${username}/${file.name}`;

        try {
            // Generate pre-signed URL
            const presignedResponse = await fetch(`${apiUrl}/api/get-presigned-url`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ filename, contentType: file.type }),
            });

            if (!presignedResponse.ok) {
                throw new Error("Failed to generate pre-signed URL");
            }

            const presignedData = await presignedResponse.json();
            if (presignedData.url) {
                console.log("Uploading profile image...");
                const uploadSuccess = await uploadProfileImage(presignedData.url, file);
                if (uploadSuccess) {
                    profileImageUrl = presignedData.url.split("?")[0]; // Use the S3 object URL
                }
            }
        } catch (error) {
            console.error("Error during pre-signed URL generation or upload:", error);
            document.getElementById("register-message").textContent =
                "Error uploading profile image. Please try again.";
            return;
        }
    }

    // Prepare form data for registration
    const formData = {
        username,
        phoneNumber,
        country,
        state,
        city,
        zipCode,
        password,
        accountType,
        profileImage: profileImageUrl,
    };

    try {
        // Send registration request
        const response = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
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
            "An error occurred during registration. Please try again.";
        console.error("Error during registration:", error);
    }
});
