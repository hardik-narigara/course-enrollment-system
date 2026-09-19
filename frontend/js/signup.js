const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

const studentIdGroup =
    document.getElementById("studentIdGroup");

const facultyIdGroup =
    document.getElementById("facultyIdGroup");

const registrationCodeGroup =
    document.getElementById("registrationCodeGroup");

const studentId =
    document.getElementById("student_id");

const facultyId =
    document.getElementById("faculty_id");

const registrationCode =
    document.getElementById("registration_code");

const roleInputs =
    document.querySelectorAll('input[name="role"]');


// Change fields according to role
roleInputs.forEach((radio) => {

    radio.addEventListener("change", () => {

        const role =
            document.querySelector(
                'input[name="role"]:checked'
            ).value;

        if (role === "student") {

            studentIdGroup.style.display = "block";

            facultyIdGroup.style.display = "none";

            registrationCodeGroup.style.display = "none";

            studentId.required = true;

            facultyId.required = false;

            registrationCode.required = false;

        } else {

            studentIdGroup.style.display = "none";

            facultyIdGroup.style.display = "block";

            registrationCodeGroup.style.display = "block";

            studentId.required = false;

            facultyId.required = true;

            registrationCode.required = true;
        }
    });
});


// Signup
signupForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const role =
        document.querySelector(
            'input[name="role"]:checked'
        ).value;

    const name =
        document.getElementById("name").value.trim();

    const email =
        document.getElementById("email").value.trim();

    const password =
        document.getElementById("password").value;

    const confirm_password =
        document.getElementById("confirm_password").value;


    if (password !== confirm_password) {

        message.textContent =
            "Passwords do not match";

        message.style.color = "red";

        return;
    }


    let url;
    let body;


    if (role === "student") {

        url =
            "/api/auth/signup/student";

        body = {
            student_id: studentId.value.trim(),
            name,
            email,
            password,
            confirm_password
        };

    } else {

        url =
            "/api/auth/signup/faculty";

        body = {
            faculty_id: facultyId.value.trim(),
            name,
            email,
            password,
            confirm_password,
            registration_code:
                registrationCode.value
        };
    }


    try {

        const response = await fetch(url, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(body)

        });


        const data =
            await response.json();


        if (!response.ok) {

            message.textContent =
                data.message;

            message.style.color = "red";

            return;
        }


        message.textContent =
            data.message;

        message.style.color = "green";


        // Redirect to login
        setTimeout(() => {

            window.location.href =
                "index.html";

        }, 1200);


    } catch (error) {

        console.error(
            "Signup Error:",
            error
        );

        message.textContent =
            "Unable to connect to server";

        message.style.color = "red";
    }

});