const token = localStorage.getItem("token");
const userData = localStorage.getItem("user");

function formatDate(dateString) {
    return String(dateString)
        .slice(0, 10)
        .split("-")
        .reverse()
        .join("/");
}

// Check login
if (!token || !userData) {
    window.location.href = "index.html";
}

const user = JSON.parse(userData);

// Check faculty role
if (user.role !== "faculty") {
    window.location.href = "index.html";
}

// Welcome message
document.getElementById("welcomeMessage").textContent =
    `Welcome, ${user.name}`;

const headers = {
    "Authorization": `Bearer ${token}`
};


// =========================
// Load Courses
// =========================

async function loadCourses(search = "") {

    try {

        let url = "/api/courses";

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
            container.innerHTML = `<p>${data.message}</p>`;
            return;
        }

        if (data.courses.length === 0) {
            container.innerHTML = "<p>No courses found.</p>";
            return;
        }

        container.innerHTML = data.courses.map(course => `

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

                <div class="course-actions">

                    <button
                        class="edit-btn"
                        onclick="editCourse(${course.id})"
                    >
                        Edit
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteCourse(${course.id})"
                    >
                        Delete
                    </button>

                </div>

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


// =========================
// Add Course
// =========================

document
    .getElementById("courseForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const course_code =
            document.getElementById("course_code")
                .value.trim();

        const course_name =
            document.getElementById("course_name")
                .value.trim();

        const description =
            document.getElementById("description")
                .value.trim();

        const instructor =
            document.getElementById("instructor")
                .value.trim();

        const credits =
            document.getElementById("credits")
                .value;

        try {

            const response = await fetch(
                "/api/courses",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        course_code,
                        course_name,
                        description,
                        instructor,
                        credits
                    })
                }
            );

            const data = await response.json();

            const message =
                document.getElementById(
                    "courseFormMessage"
                );

            if (!response.ok) {

                message.textContent =
                    data.message;

                message.style.color = "red";

                return;
            }

            message.textContent =
                data.message;

            message.style.color = "green";

            document
                .getElementById("courseForm")
                .reset();

            loadCourses();

        } catch (error) {

            console.error(error);

            document.getElementById(
                "courseFormMessage"
            ).textContent =
                "Unable to add course";

            document.getElementById(
                "courseFormMessage"
            ).style.color = "red";
        }

    });


// =========================
// Edit Course - Open Modal
// =========================

async function editCourse(courseId) {

    try {

        const response = await fetch(
            "/api/courses",
            {
                headers
            }
        );

        const data = await response.json();

        if (!response.ok) {
            alert(data.message);
            return;
        }

        const course = data.courses.find(
            course => course.id === courseId
        );

        if (!course) {
            alert("Course not found");
            return;
        }

        // Fill modal fields
        document.getElementById("editCourseId").value =
            course.id;

        document.getElementById("edit_course_code").value =
            course.course_code;

        document.getElementById("edit_course_name").value =
            course.course_name;

        document.getElementById("edit_description").value =
            course.description || "";

        document.getElementById("edit_instructor").value =
            course.instructor;

        document.getElementById("edit_credits").value =
            course.credits;

        // Clear previous message
        document.getElementById("editMessage").textContent = "";

        // Show modal
        document.getElementById("editModal").style.display =
            "flex";

    } catch (error) {

        console.error(error);

        alert("Unable to load course");
    }
}


// =========================
// Update Course
// =========================

document
    .getElementById("editCourseForm")
    .addEventListener("submit", async (event) => {

        event.preventDefault();

        const courseId =
            document.getElementById("editCourseId").value;

        const course_code =
            document.getElementById("edit_course_code")
                .value.trim();

        const course_name =
            document.getElementById("edit_course_name")
                .value.trim();

        const description =
            document.getElementById("edit_description")
                .value.trim();

        const instructor =
            document.getElementById("edit_instructor")
                .value.trim();

        const credits =
            document.getElementById("edit_credits")
                .value;

        try {

            const response = await fetch(
                `/api/courses/${courseId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },

                    body: JSON.stringify({
                        course_code,
                        course_name,
                        description,
                        instructor,
                        credits
                    })
                }
            );

            const data = await response.json();

            const message =
                document.getElementById("editMessage");

            if (!response.ok) {

                message.textContent =
                    data.message;

                message.style.color = "red";

                return;
            }

            message.textContent =
                data.message;

            message.style.color = "green";

            setTimeout(() => {

                document.getElementById("editModal")
                    .style.display = "none";

                loadCourses();

            }, 700);

        } catch (error) {

            console.error(error);

            document.getElementById(
                "editMessage"
            ).textContent =
                "Unable to update course";

            document.getElementById(
                "editMessage"
            ).style.color = "red";
        }

    });


// =========================
// Close Edit Modal
// =========================

document
    .getElementById("closeModalBtn")
    .addEventListener("click", () => {

        document.getElementById("editModal")
            .style.display = "none";

    });


document
    .getElementById("cancelEditBtn")
    .addEventListener("click", () => {

        document.getElementById("editModal")
            .style.display = "none";

    });


// =========================
// Delete Course
// =========================

async function deleteCourse(courseId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this course?"
        );

    if (!confirmDelete) return;

    try {

        const response = await fetch(
            `/api/courses/${courseId}`,
            {
                method: "DELETE",
                headers
            }
        );

        const data = await response.json();

        if (!response.ok) {

            alert(data.message);

            return;
        }

        alert(data.message);

        loadCourses();

    } catch (error) {

        console.error(error);

        alert("Unable to delete course");
    }
}


// =========================
// Search
// =========================

document
    .getElementById("searchBtn")
    .addEventListener("click", () => {

        const search =
            document.getElementById(
                "courseSearch"
            ).value.trim();

        loadCourses(search);
    });


// Search with Enter
document
    .getElementById("courseSearch")
    .addEventListener("keydown", (event) => {

        if (event.key === "Enter") {

            loadCourses(
                event.target.value.trim()
            );
        }
    });


// =========================
// Load All Enrollments
// =========================

async function loadEnrollments() {

    try {

        const response = await fetch(
            "/api/enrollments",
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
                "<p>No student enrollments yet.</p>";

            return;
        }

        container.innerHTML = `

            <div style="overflow-x:auto;">

                <table class="enrollment-table">

                    <thead>

                        <tr>
                            <th>Student Name</th>
                            <th>Enrollment Number</th>
                            <th>Email</th>
                            <th>Course</th>
                            <th>Code</th>
                            <th>Date</th>
                        </tr>

                    </thead>

                    <tbody>

                        ${data.enrollments.map(
                            enrollment => `

                            <tr>

                                <td>
                                    ${enrollment.student_name}
                                </td>

                                <td>
                                    ${enrollment.student_enrollment_number}
                                </td>

                                <td>
                                    ${enrollment.student_email}
                                </td>

                                <td>
                                    ${enrollment.course_name}
                                </td>

                                <td>
                                    ${enrollment.course_code}
                                </td>

                                <td>
                                    ${formatDate(enrollment.enrollment_date)}
                                </td>

                            </tr>

                        `
                        ).join("")}

                    </tbody>

                </table>

            </div>

        `;

    } catch (error) {

        console.error(error);
    }
}


// =========================
// Logout
// =========================

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        window.location.href = "index.html";
    });


// =========================
// Initial Loading
// =========================

loadCourses();
loadEnrollments();