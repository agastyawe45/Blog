// Load API URL from config.json
let apiUrl = "";

(async () => {
    try {
        const config = await fetch("/static/config.json");
        const json = await config.json();
        apiUrl = json.API_URL;

        console.log("API URL loaded:", apiUrl);
    } catch (error) {
        console.error("Error loading config.json:", error);
        alert("Failed to load configuration. Please try again later.");
    }
})();

// Function to upload profile image using the pre-signed URL
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
            throw new Error(`Upload failed with status ${response.status}`);
        }

        console.log("Image uploaded successfully");
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error; // Re-throw error for caller to handle
    }
};

// Event listener for the registration form
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("register-username").value.trim();
    const phoneNumber = document.getElementById("register-phone").value.trim();
    const country = document.getElementById("register-country").value.trim();
    const state = document.getElementById("register-state").value.trim();
    const city = document.getElementById("register-city").value.trim();
    const zipCode = document.getElementById("register-zip").value.trim();
    const password = document.getElementById("register-password").value.trim();
    const accountType = document.getElementById("register-account-type").value.trim();
    const fileInput = document.getElementById("register-profile-image");

    // Validate required fields
    if (!username || !phoneNumber || !country || !state || !city || !zipCode || !password || !accountType) {
        alert("Please fill in all required fields.");
        return;
    }

    let profileImageUrl = null;

    try {
        // If a profile image is selected, upload it first
        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const filename = `profile_images/${username}/${file.name}`;

            console.log("Generating pre-signed URL...");
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
                await uploadProfileImage(presignedData.url, file);
                profileImageUrl = presignedData.url.split("?")[0]; // Use the base URL for the uploaded image
            }
        }

        console.log("Submitting registration form...");

        // Send the registration data to the server
        const registrationResponse = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username,
                phoneNumber,
                country,
                state,
                city,
                zipCode,
                password,
                accountType,
                profileImage: profileImageUrl,
            }),
        });

        const registrationData = await registrationResponse.json();

        if (registrationResponse.ok && registrationData.success) {
            alert("Registration successful!");
            window.location.href = "/login"; // Redirect to login page
        } else {
            throw new Error(registrationData.message || "Registration failed");
        }
    } catch (error) {
        console.error("Error during registration:", error);
        alert(error.message || "An unexpected error occurred. Please try again.");
    }
});
