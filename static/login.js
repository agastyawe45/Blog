document.getElementById("login-form").addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const errorElement = document.getElementById("login-error");

  if (!username || !password) {
    errorElement.textContent = "Please fill in all required fields.";
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = "/home.html";
    } else {
      errorElement.textContent = data.message || "Invalid username or password.";
    }
  } catch (error) {
    errorElement.textContent = "An error occurred. Please try again later.";
  }
});
