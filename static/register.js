const apiUrl = "${API_URL}"; // Replace with the actual API URL from the environment variable

// Register form submission handler
document.getElementById("register-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(document.getElementById("register-form"));
    const jsonFormData = Object.fromEntries(formData.entries());

    // Get the profile image file
    const profileImage = document.getElementById("register-profile-image").files[0];

    try {
        if (profileImage) {
            const preSignedUrlResponse = await fetch(`${apiUrl}/api/get-presigned-url`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ filename: profileImage.name, contentType: profileImage.type }),
            });

            const preSignedUrlData = await preSignedUrlResponse.json();

            if (preSignedUrlData.url) {
                await fetch(preSignedUrlData.url, {
                    method: "PUT",
                    headers: { "Content-Type": profileImage.type },
                    body: profileImage,
                });

                jsonFormData.profileImage = preSignedUrlData.url.split("?")[0];
            }
        }

        const response = await fetch(`${apiUrl}/api/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonFormData),
        });

        const data = await response.json();

        if (data.success) {
            window.location.href = "login.html";
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
