const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch(
            "/api/auth/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            message.textContent = data.message;
            message.style.color = "red";
            return;
        }

        // Save JWT token
        localStorage.setItem("token", data.token);

        // Save user information
        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        message.textContent = "Login successful!";
        message.style.color = "green";

        // Redirect according to role
        if (data.user.role === "student") {
            window.location.href = "student.html";
        } else if (data.user.role === "faculty") {
            window.location.href = "faculty.html";
        }

    } catch (error) {

        console.error("Login Error:", error);

        message.textContent =
            "Unable to connect to server";

        message.style.color = "red";
    }
});