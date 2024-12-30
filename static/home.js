// Display user details on the home page
document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
        document.getElementById("welcome-message").textContent = `Welcome, ${user.username}!`;
        document.getElementById("user-details").innerHTML = `
            <p><strong>Phone:</strong> ${user.phone_number}</p>
            <p><strong>Country:</strong> ${user.country}</p>
            <p><strong>State:</strong> ${user.state}</p>
            <p><strong>City:</strong> ${user.city}</p>
            <p><strong>Zip Code:</strong> ${user.zip_code}</p>
            <p><strong>Account Type:</strong> ${user.account_type}</p>
        `;
    } else {
        window.location.href = "/login";
    }
});

// Logout handler
document.getElementById("logout-button").addEventListener("click", () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
});

// Fetch and display files for regular and premium users
const fetchFiles = async () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        console.error("User not logged in");
        return;
    }

    try {
        const response = await fetch(`/api/get-signed-urls`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ accountType: user.account_type }),
        });

        const data = await response.json();

        if (data.success) {
            const fileList = document.getElementById("file-list");
            fileList.innerHTML = "";

            data.files.forEach((file) => {
                const listItem = document.createElement("li");
                const link = document.createElement("a");
                link.href = file.url;
                link.textContent = file.name;
                link.target = "_blank";
                listItem.appendChild(link);
                fileList.appendChild(listItem);
            });
        } else {
            console.error("Error fetching files:", data.message);
        }
    } catch (error) {
        console.error("Error during file fetching:", error);
    }
};

// Load files on page load
document.addEventListener("DOMContentLoaded", fetchFiles);
