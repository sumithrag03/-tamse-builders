/* ==========================================
   TAMSE BUILDERS
   MAIN JAVASCRIPT
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    /* ==========================================
       1. BASIC ELEMENTS
    ========================================== */

    const header = document.querySelector(".site-header");
    const mainNav = document.querySelector(".main-nav");

    const navLinks = document.querySelectorAll(
        '.main-nav a[href^="#"]'
    );

    const sections = document.querySelectorAll(
        "section[id]"
    );


    /* ==========================================
       2. STICKY HEADER
    ========================================== */

    function updateHeader() {

        if (!header) {
            return;
        }

        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    }

    window.addEventListener(
        "scroll",
        updateHeader,
        { passive: true }
    );

    updateHeader();


    /* ==========================================
       3. ACTIVE NAVBAR
       
       Home
       About
       Services
       Why Tamse
       Projects
       Contact
    ========================================== */

    function updateActiveNavigation() {

        if (!navLinks.length || !sections.length) {
            return;
        }

        const headerHeight = header
            ? header.offsetHeight
            : 72;

        /*
            Position used to decide which section
            is currently visible.
        */

        const scrollPosition =
            window.scrollY + headerHeight + 120;

        let activeSection = "home";


        sections.forEach(function (section) {

            const sectionTop =
                section.offsetTop;

            const sectionBottom =
                sectionTop + section.offsetHeight;


            if (
                scrollPosition >= sectionTop &&
                scrollPosition < sectionBottom
            ) {
                activeSection =
                    section.id;
            }

        });


        /*
            At the very top of the page,
            HOME must always be active.
        */

        if (window.scrollY <= 50) {
            activeSection = "home";
        }


        /*
            Remove active from every link.
        */

        navLinks.forEach(function (link) {

            link.classList.remove("active");

            link.removeAttribute("aria-current");

        });


        /*
            Add active to the correct link.
        */

        const activeLink =
            document.querySelector(
                '.main-nav a[href="#' +
                activeSection +
                '"]'
            );


        if (activeLink) {

            activeLink.classList.add("active");

            activeLink.setAttribute(
                "aria-current",
                "page"
            );

        }

    }


    /*
        Run while scrolling.
    */

    window.addEventListener(
        "scroll",
        updateActiveNavigation,
        { passive: true }
    );


    /*
        Run after resizing.
    */

    window.addEventListener(
        "resize",
        updateActiveNavigation
    );


    /*
        Initial state.
    */

    updateActiveNavigation();


    /* ==========================================
       4. NAVBAR CLICK / SMOOTH SCROLL
    ========================================== */

    navLinks.forEach(function (link) {

        link.addEventListener(
            "click",
            function (event) {

                const targetId =
                    this.getAttribute("href");


                if (
                    !targetId ||
                    targetId === "#"
                ) {
                    return;
                }


                const target =
                    document.querySelector(
                        targetId
                    );


                if (!target) {
                    return;
                }


                event.preventDefault();


                const headerHeight =
                    header
                        ? header.offsetHeight
                        : 72;


                const targetPosition =
                    target.getBoundingClientRect().top +
                    window.scrollY -
                    headerHeight;


                /*
                    Immediately change the
                    active underline when clicked.
                */

                navLinks.forEach(function (navLink) {

                    navLink.classList.remove(
                        "active"
                    );

                    navLink.removeAttribute(
                        "aria-current"
                    );

                });


                this.classList.add("active");

                this.setAttribute(
                    "aria-current",
                    "page"
                );


                /*
                    Smooth scroll.
                */

                window.scrollTo({

                    top: Math.max(
                        0,
                        targetPosition
                    ),

                    behavior: "smooth"

                });

            }
        );

    });


    /* ==========================================
       5. PROJECT FILTER
    ========================================== */

    const filterButtons =
        document.querySelectorAll(
            ".project-filter-btn"
        );


    const projectCards =
        document.querySelectorAll(
            ".project-card"
        );


    if (
        filterButtons.length &&
        projectCards.length
    ) {

        filterButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const filter =
                        this.getAttribute(
                            "data-filter"
                        );


                    /*
                        Update filter button.
                    */

                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                            btn.setAttribute(
                                "aria-pressed",
                                "false"
                            );

                        }
                    );


                    this.classList.add(
                        "active"
                    );


                    this.setAttribute(
                        "aria-pressed",
                        "true"
                    );


                    /*
                        Filter cards.
                    */

                    projectCards.forEach(
                        function (card) {

                            const status =
                                card.getAttribute(
                                    "data-status"
                                );


                            if (
                                filter === "all" ||
                                status === filter
                            ) {

                                card.style.display =
                                    "";

                                card.classList.remove(
                                    "is-hidden"
                                );

                            } else {

                                card.style.display =
                                    "none";

                                card.classList.add(
                                    "is-hidden"
                                );

                            }

                        }
                    );

                }
            );

        });

    }


    /* ==========================================
       6. PROJECT IMAGE GALLERY
    ========================================== */

    const projectModal =
        document.getElementById(
            "projectModal"
        );


    const modalImage =
        document.getElementById(
            "modalProjectImage"
        );


    const modalTitle =
        document.getElementById(
            "modalProjectTitle"
        );


    const closeButton =
        document.querySelector(
            ".project-modal-close"
        );


    const nextButton =
        document.querySelector(
            ".project-modal-arrow.next"
        );


    const previousButton =
        document.querySelector(
            ".project-modal-arrow.prev"
        );


    const viewButtons =
        document.querySelectorAll(
            ".view-project-btn"
        );


    /*
        Store every project's images.
    */

    const projects = [];


    viewButtons.forEach(
        function (button, index) {

            /*
                IMPORTANT:

                Your HTML uses:

                data-images="image1|image2|image3..."

                NOT:

                data-image
            */

            const imagesString =
                button.getAttribute(
                    "data-images"
                );


            const title =
                button.getAttribute(
                    "data-title"
                ) ||
                "TAMSE Builders Project";


            if (!imagesString) {

                console.warn(
                    "No data-images found for project:",
                    index + 1
                );

                return;

            }


            /*
                Convert:

                image1|image2|image3

                into:

                [
                    "image1",
                    "image2",
                    "image3"
                ]
            */

            const images =
                imagesString
                    .split("|")
                    .map(function (image) {
                        return image.trim();
                    })
                    .filter(Boolean);


            projects.push({

                index: index,

                title: title,

                images: images

            });

        }
    );


    /*
        Current project and image.
    */

    let currentProjectIndex = 0;

    let currentImageIndex = 0;


    /* ==========================================
       7. UPDATE PROJECT IMAGE
    ========================================== */

    function updateProjectModal() {

        if (
            !projectModal ||
            !modalImage ||
            !projects.length
        ) {
            return;
        }


        const project =
            projects[currentProjectIndex];


        if (!project) {
            return;
        }


        const image =
            project.images[
                currentImageIndex
            ];


        if (!image) {
            return;
        }


        /*
            Change image.
        */

        modalImage.src = image;


        modalImage.alt =
            project.title;


        /*
            Change title.
        */

        if (modalTitle) {

            modalTitle.textContent =
                project.title;

        }

    }


    /* ==========================================
       8. OPEN PROJECT
    ========================================== */

    function openProject(projectIndex) {

        if (
            !projectModal ||
            !projects.length
        ) {
            return;
        }


        if (
            projectIndex < 0 ||
            projectIndex >= projects.length
        ) {
            return;
        }


        currentProjectIndex =
            projectIndex;


        /*
            Start from first image.
        */

        currentImageIndex = 0;


        updateProjectModal();


        /*
            Show modal.
        */

        projectModal.classList.add(
            "show"
        );


        projectModal.setAttribute(
            "aria-hidden",
            "false"
        );


        document.body.classList.add(
            "modal-open"
        );

    }


    /* ==========================================
       9. CLOSE PROJECT
    ========================================== */

    function closeProjectModal() {

        if (!projectModal) {
            return;
        }


        projectModal.classList.remove(
            "show"
        );


        projectModal.setAttribute(
            "aria-hidden",
            "true"
        );


        document.body.classList.remove(
            "modal-open"
        );

    }


    /* ==========================================
       10. VIEW PROJECT BUTTONS
    ========================================== */

    viewButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    /*
                        data-project-index
                        is already present in HTML.
                    */

                    const projectIndex =
                        parseInt(
                            this.getAttribute(
                                "data-project-index"
                            ),
                            10
                        );


                    /*
                        Find matching project.
                    */

                    const projectPosition =
                        projects.findIndex(
                            function (project) {

                                return (
                                    project.index ===
                                    projectIndex
                                );

                            }
                        );


                    if (
                        projectPosition === -1
                    ) {

                        console.error(
                            "Project not found:",
                            projectIndex
                        );

                        return;

                    }


                    openProject(
                        projectPosition
                    );

                }
            );

        }
    );


    /* ==========================================
       11. NEXT IMAGE
    ========================================== */

    function showNextImage() {

        if (!projects.length) {
            return;
        }


        const project =
            projects[currentProjectIndex];


        if (
            !project ||
            !project.images.length
        ) {
            return;
        }


        currentImageIndex++;


        if (
            currentImageIndex >=
            project.images.length
        ) {

            currentImageIndex = 0;

        }


        updateProjectModal();

    }


    /* ==========================================
       12. PREVIOUS IMAGE
    ========================================== */

    function showPreviousImage() {

        if (!projects.length) {
            return;
        }


        const project =
            projects[currentProjectIndex];


        if (
            !project ||
            !project.images.length
        ) {
            return;
        }


        currentImageIndex--;


        if (
            currentImageIndex < 0
        ) {

            currentImageIndex =
                project.images.length - 1;

        }


        updateProjectModal();

    }


    /* ==========================================
       13. NEXT ARROW
    ========================================== */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                showNextImage();

            }
        );

    }


    /* ==========================================
       14. PREVIOUS ARROW
    ========================================== */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                showPreviousImage();

            }
        );

    }


    /* ==========================================
       15. CLOSE BUTTON
    ========================================== */

    if (closeButton) {

        closeButton.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

                closeProjectModal();

            }
        );

    }


    /* ==========================================
       16. CLICK OUTSIDE MODAL
    ========================================== */

    if (projectModal) {

        projectModal.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    projectModal
                ) {

                    closeProjectModal();

                }

            }
        );

    }


    /* ==========================================
       17. KEYBOARD CONTROLS
    ========================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                !projectModal ||
                !projectModal.classList.contains(
                    "show"
                )
            ) {
                return;
            }


            /*
                ESC = close
            */

            if (
                event.key === "Escape"
            ) {

                closeProjectModal();

                return;

            }


            /*
                RIGHT ARROW = next image
            */

            if (
                event.key === "ArrowRight"
            ) {

                showNextImage();

            }


            /*
                LEFT ARROW = previous image
            */

            if (
                event.key === "ArrowLeft"
            ) {

                showPreviousImage();

            }

        }
    );

/* ==========================================
   18. CONTACT FORM
   Backend API: POST /api/enquiry
========================================== */

const contactForm =
    document.getElementById("contactForm");

const formMessage =
    document.getElementById("formMessage");

const contactSubmit =
    document.getElementById("contactSubmit");


/*
    Backend API URL

    Local development:
    http://localhost:5000/api/enquiry

    If your frontend and backend are deployed
    separately, change this URL later.
*/
const CONTACT_API_URL =
    "http://localhost:5000/api/enquiry";


if (contactForm) {

    contactForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            /* ==========================================
               GET FORM FIELDS
            ========================================== */

            const fullName =
                document.getElementById("fullName");

            const email =
                document.getElementById("email");

            const phone =
                document.getElementById("phone");

            const projectType =
                document.getElementById("projectType");

            const budget =
                document.getElementById("budget");

            const location =
                document.getElementById("location");

            const message =
                document.getElementById("message");


            /* ==========================================
               CLEAR PREVIOUS MESSAGE
            ========================================== */

            if (formMessage) {

                formMessage.textContent = "";

                formMessage.className =
                    "form-message";

            }


            /* ==========================================
               NAME VALIDATION
            ========================================== */

            if (
                !fullName ||
                !fullName.value.trim()
            ) {

                showFormError(
                    "Please enter your full name."
                );

                if (fullName) {
                    fullName.focus();
                }

                return;
            }


            /* ==========================================
               EMAIL VALIDATION
            ========================================== */

            if (
                !email ||
                !email.value.trim()
            ) {

                showFormError(
                    "Please enter your email address."
                );

                if (email) {
                    email.focus();
                }

                return;
            }


            /* ==========================================
               EMAIL FORMAT VALIDATION
            ========================================== */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (
                !emailPattern.test(
                    email.value.trim()
                )
            ) {

                showFormError(
                    "Please enter a valid email address."
                );

                email.focus();

                return;
            }


            /* ==========================================
               PHONE VALIDATION
            ========================================== */

            if (
                !phone ||
                !phone.value.trim()
            ) {

                showFormError(
                    "Please enter your phone number."
                );

                if (phone) {
                    phone.focus();
                }

                return;
            }


            /* ==========================================
               PROJECT TYPE VALIDATION
            ========================================== */

            if (
                !projectType ||
                !projectType.value.trim()
            ) {

                showFormError(
                    "Please select your project type."
                );

                if (projectType) {
                    projectType.focus();
                }

                return;
            }


            /* ==========================================
               LOCATION VALIDATION
            ========================================== */

            if (
                !location ||
                !location.value.trim()
            ) {

                showFormError(
                    "Please enter your project location."
                );

                if (location) {
                    location.focus();
                }

                return;
            }


            /* ==========================================
               MESSAGE VALIDATION
            ========================================== */

            if (
                !message ||
                !message.value.trim()
            ) {

                showFormError(
                    "Please enter your project details."
                );

                if (message) {
                    message.focus();
                }

                return;
            }


            /* ==========================================
               PREPARE ENQUIRY DATA
               
               IMPORTANT:
               Backend expects "name", not "fullName".
            ========================================== */

            const enquiryData = {

                name:
                    fullName.value.trim(),

                phone:
                    phone.value.trim(),

                email:
                    email.value.trim(),

                projectType:
                    projectType.value.trim(),

                budget:
                    budget
                        ? budget.value.trim()
                        : "",

                location:
                    location.value.trim(),

                message:
                    message.value.trim()

            };


            console.log(
                "TAMSE enquiry data:",
                enquiryData
            );


            /* ==========================================
               DISABLE SUBMIT BUTTON
            ========================================== */

            if (contactSubmit) {

                contactSubmit.disabled =
                    true;

                contactSubmit.dataset.originalText =
                    contactSubmit.textContent;

                contactSubmit.textContent =
                    "Sending...";

            }


            /* ==========================================
               SHOW SENDING MESSAGE
            ========================================== */

            if (formMessage) {

                formMessage.textContent =
                    "Sending your enquiry...";

                formMessage.className =
                    "form-message";

            }


            /* ==========================================
               SEND DATA TO BACKEND
            ========================================== */

            try {

                const response =
                    await fetch(
                        CONTACT_API_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify(
                                    enquiryData
                                )
                        }
                    );


                /* ==========================================
                   READ BACKEND RESPONSE
                ========================================== */

                let result = null;

                try {

                    result =
                        await response.json();

                } catch (jsonError) {

                    console.warn(
                        "Backend did not return JSON:",
                        jsonError
                    );

                }


                /* ==========================================
                   HANDLE BACKEND ERROR
                ========================================== */

                if (!response.ok) {

                    const errorMessage =
                        result &&
                        result.message
                            ? result.message
                            : "Unable to submit your enquiry. Please try again.";

                    throw new Error(
                        errorMessage
                    );

                }


                /* ==========================================
                   SUCCESS
                   
                   Only show success AFTER backend
                   confirms that the request succeeded.
                ========================================== */

                if (formMessage) {

                    formMessage.textContent =
                        result &&
                        result.message
                            ? result.message
                            : "Thank you! Your enquiry has been submitted successfully.";

                    formMessage.className =
                        "form-message success";

                }


                /* ==========================================
                   RESET FORM ONLY AFTER SUCCESS
                ========================================== */

                contactForm.reset();


                console.log(
                    "✅ TAMSE enquiry submitted successfully."
                );


            } catch (error) {

                console.error(
                    "❌ TAMSE enquiry submission error:",
                    error
                );


                /* ==========================================
                   SHOW REAL ERROR
                   
                   Do NOT show fake success.
                ========================================== */

                if (formMessage) {

                    formMessage.textContent =
                        error &&
                        error.message
                            ? error.message
                            : "Something went wrong. Please try again.";

                    formMessage.className =
                        "form-message error";

                }

            } finally {

                /* ==========================================
                   RESTORE SUBMIT BUTTON
                ========================================== */

                if (contactSubmit) {

                    contactSubmit.disabled =
                        false;

                    contactSubmit.textContent =
                        contactSubmit.dataset.originalText ||
                        "Send Enquiry";

                }

            }

        }
    );

}


/* ==========================================
   CONTACT FORM ERROR HELPER
========================================== */

function showFormError(text) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        text;


    formMessage.className =
        "form-message error";

}



    /* ==========================================
       19. CURRENT YEAR
    ========================================== */

    const currentYear =
        document.getElementById(
            "currentYear"
        );


    if (currentYear) {

        currentYear.textContent =
            new Date().getFullYear();

    }


    /* ==========================================
       20. SCROLL REVEAL
    ========================================== */

    const revealElements =
        document.querySelectorAll(
            ".reveal, " +
            ".service-card, " +
            ".project-card, " +
            ".why-tamse-card"
        );


    if (
        revealElements.length &&
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "visible"
                                );


                                revealObserver.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },
                {
                    threshold: 0.12
                }
            );


        revealElements.forEach(
            function (element) {

                revealObserver.observe(
                    element
                );

            }
        );

    }


    /* ==========================================
       21. EMPTY LINKS
    ========================================== */

    document.querySelectorAll(
        'a[href="#"]'
    ).forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                }
            );

        }
    );


    /* ==========================================
       22. FINAL INITIALIZATION
    ========================================== */

    updateHeader();

    updateActiveNavigation();


    console.log(
        "TAMSE Builders website loaded successfully."
    );


    console.log(
        "Projects found:",
        projects.length
    );


});