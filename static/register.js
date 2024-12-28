document.getElementById("register-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const formData = new FormData(document.getElementById("register-form"));
  const userData = {
    username: formData.get("username"),
    password: formData.get("password"),
    phoneNumber: formData.get("phone_number"),
    country: formData.get("country"),
    state: formData.get("state"),
    city: formData.get("city"),
    zipCode: formData.get("zip_code"),
    accountType: formData.get("account_type"),
  };
  const profileImage = formData.get("profile_image");
  const errorElement = document.getElementById("register-error");

  if (Object.values(userData).some((value) => !value)) {
    errorElement.textContent = "Please fill in all required fields.";
    return;
  }

  try {
    // Handle profile image upload (optional)
    if (profileImage && profileImage.size > 0) {
      const presignedUrlResponse = await fetch(`${API_URL}/api/get-presigned-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: profileImage.name, contentType: profileImage.type }),
      });
      const { url } = await presignedUrlResponse.json();

      await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": profileImage.type },
        body: profileImage,
      });

      userData.profileImage = url.split("?")[0]; // Use the S3 URL without query parameters
    }

    // Register the user
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      window.location.href = "/login.html";
    } else {
      errorElement.textContent = data.message || "Registration failed. Please try again.";
    }
  } catch (error) {
    errorElement.textContent = "An error occurred. Please try again later.";
  }
});
