const apiUrl = "${API_URL}"; // Replace with the actual API URL from the environment variable

document.addEventListener("DOMContentLoaded", async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("user-name").textContent = user.username;
    document.getElementById("user-email").textContent = user.phoneNumber;
    document.getElementById("user-account-type").textContent = user.accountType;

    try {
        const response = await fetch(`${apiUrl}/api/get-signed-urls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountType: user.accountType }),
        });

        const data = await response.json();

        const filesList = document.getElementById("files-list");
        if (data.success) {
            filesList.innerHTML = "";
            data.files.forEach((file) => {
                const fileLink = document.createElement("a");
                fileLink.href = file.url;
                fileLink.target = "_blank";
                fileLink.textContent = file.name;
                fileLink.style.display = "block";
                filesList.appendChild(fileLink);
            });
        } else {
            filesList.textContent = "Failed to fetch files. Please try again later.";
        }
    } catch (error) {
        document.getElementById("files-list").textContent =
            "An error occurred while fetching files. Please try again later.";
        console.error("Error fetching files:", error);
    }

    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
});
