const user = JSON.parse(localStorage.getItem("user"));

if (!user) {
  window.location.href = "/login.html";
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("username").textContent = user.username;
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/login.html";
  });

  fetchFiles(user.accountType);
});

async function fetchFiles(accountType) {
  const fileContainer = document.getElementById("file-container");
  fileContainer.innerHTML = "Loading files...";

  try {
    const response = await fetch(`${API_URL}/api/get-signed-urls`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountType }),
    });

    const data = await response.json();

    if (response.ok && data.success) {
      fileContainer.innerHTML = "";
      data.files.forEach((file) => {
        const fileElement = document.createElement("div");
        fileElement.innerHTML = `
          <a href="${file.url}" target="_blank">${file.name}</a>
        `;
        fileContainer.appendChild(fileElement);
      });
    } else {
      fileContainer.textContent = "Failed to load files.";
    }
  } catch (error) {
    fileContainer.textContent = "An error occurred. Please try again later.";
  }
}
