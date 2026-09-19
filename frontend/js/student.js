const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");


// Check login
if (!token || !userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);


// Make sure user is a student
if (user.role !== "student") {
    window.location.href = "index.html";
}


// Welcome message
document.getElementById("welcomeMessage").textContent =
    `Welcome, ${user.name}`;


// API headers
const headers = {
    "Authorization": `Bearer ${token}`
};


// Load courses
async function loadCourses(search = "") {

    try {

        let url =
            "http://localhost:5000/api/courses";

        if (search) {
            url += `?search=${encodeURIComponent(search)}`;
        }

        const response = await fetch(url, {
            headers
        });

        const data = await response.json();

        const container =
            document.getElementById("coursesContainer");

        if (!response.ok) {
            container.innerHTML =
                `<p>${data.message}</p>`;
            return;
        }

        if (data.courses.length === 0) {

            container.innerHTML =
                "<p>No courses found.</p>";

            return;
        }


        container.innerHTML =
            data.courses.map(course => `

                <div class="course-card">

                    <div class="course-code">
                        ${course.course_code}
                    </div>

                    <h3>
                        ${course.course_name}
                    </h3>

                    <p>
                        <strong>Instructor:</strong>
                        ${course.instructor}
                    </p>

                    <p>
                        <strong>Credits:</strong>
                        ${course.credits}
                    </p>

                    <p>
                        ${course.description || ""}
                    </p>

                    <button
                        class="enroll-btn"
                        onclick="enrollCourse(${course.id})"
                    >
                        Enroll
                    </button>

                </div>

            `).join("");

    } catch (error) {

        console.error(error);

        document.getElementById(
            "coursesContainer"
        ).innerHTML =
            "<p>Unable to load courses.</p>";
    }
}


// Enroll in course
async function enrollCourse(courseId) {

    try {

        const response = await fetch(
            "http://localhost:5000/api/enrollments",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },

                body: JSON.stringify({
                    course_id: courseId
                })
            }
        );

        const data = await response.json();

        const message =
            document.getElementById("courseMessage");


        if (!response.ok) {

            message.textContent =
                data.message;

            message.style.color = "red";

            return;
        }


        message.textContent =
            data.message;

        message.style.color = "green";


        // Refresh enrollments
        loadMyEnrollments();

    } catch (error) {

        console.error(error);

    }
}


// Load student's enrollments
async function loadMyEnrollments() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/enrollments/my",
            {
                headers
            }
        );

        const data = await response.json();

        const container =
            document.getElementById(
                "enrollmentsContainer"
            );


        if (!response.ok) {

            container.innerHTML =
                `<p>${data.message}</p>`;

            return;
        }


        if (data.enrollments.length === 0) {

            container.innerHTML =
                "<p>You have not enrolled in any course yet.</p>";

            return;
        }


        container.innerHTML =
            data.enrollments.map(enrollment => `

                <div class="enrollment-card">

                    <h3>
                        ${enrollment.course_name}
                    </h3>

                    <p>
                        <strong>Code:</strong>
                        ${enrollment.course_code}
                    </p>

                    <p>
                        <strong>Instructor:</strong>
                        ${enrollment.instructor}
                    </p>

                    <p>
                        <strong>Credits:</strong>
                        ${enrollment.credits}
                    </p>

                    <p>
                        <strong>Enrollment Date:</strong>
                        ${enrollment.enrollment_date}
                    </p>

                </div>

            `).join("");

    } catch (error) {

        console.error(error);

    }
}


// Search
document
    .getElementById("searchBtn")
    .addEventListener("click", () => {

        const search =
            document.getElementById(
                "courseSearch"
            ).value.trim();

        loadCourses(search);
    });


// Search when pressing Enter
document
    .getElementById("courseSearch")
    .addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            loadCourses(
                event.target.value.trim()
            );
        }
    });


// Logout
document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    });


// Initial loading
loadCourses();
loadMyEnrollments();