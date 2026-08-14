function initNavbar() {

    const menuBtn = document.getElementById("menu-btn");
    const navLinks = document.getElementById("main-navigation");
    const navbar = document.querySelector(".navbar");


    if (!menuBtn || !navLinks || !navbar) {
        return;
    }


    /* =====================================================
       MOBILE HAMBURGER
       ===================================================== */

    menuBtn.addEventListener("click", function (event) {

        event.stopPropagation();

        const isOpen = navLinks.classList.toggle("active");

        menuBtn.setAttribute(
            "aria-expanded",
            isOpen ? "true" : "false"
        );


        const icon = menuBtn.querySelector("i");

        if (icon) {

            if (isOpen) {

                icon.classList.remove("fa-bars");
                icon.classList.add("fa-xmark");

                menuBtn.setAttribute(
                    "aria-label",
                    "Close navigation menu"
                );

            } else {

                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-bars");

                menuBtn.setAttribute(
                    "aria-label",
                    "Open navigation menu"
                );

            }

        }

    });


    /* =====================================================
       CLOSE MENU AFTER CLICKING LINK
       ===================================================== */

    const navItems = navLinks.querySelectorAll("a");

    navItems.forEach(function (link) {

        link.addEventListener("click", function () {

            closeMobileMenu();

        });

    });


    /* =====================================================
       CLICK OUTSIDE MENU
       ===================================================== */

    document.addEventListener("click", function (event) {

        if (
            navLinks.classList.contains("active") &&
            !navLinks.contains(event.target) &&
            !menuBtn.contains(event.target)
        ) {

            closeMobileMenu();

        }

    });


    /* =====================================================
       ESC KEY
       ===================================================== */

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            closeMobileMenu();

        }

    });


    /* =====================================================
       SCROLL NAVBAR
       DOWN = HIDE
       UP = SHOW
       ===================================================== */

    let lastScrollY = window.scrollY;

    window.addEventListener(
        "scroll",
        function () {

            const currentScrollY = window.scrollY;


            /* Top of page */

            if (currentScrollY <= 10) {

                navbar.classList.remove("navbar-hidden");

                lastScrollY = currentScrollY;

                return;
            }


            /* Scrolling DOWN */

            if (currentScrollY > lastScrollY) {

                navbar.classList.add("navbar-hidden");

                /* Mobile menu close */

                closeMobileMenu();

            }


            /* Scrolling UP */

            else if (currentScrollY < lastScrollY) {

                navbar.classList.remove("navbar-hidden");

            }


            lastScrollY = currentScrollY;

        },
        {
            passive: true
        }
    );


    /* =====================================================
       CLOSE MOBILE MENU
       ===================================================== */

    function closeMobileMenu() {

        navLinks.classList.remove("active");

        menuBtn.setAttribute(
            "aria-expanded",
            "false"
        );


        const icon = menuBtn.querySelector("i");

        if (icon) {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }


        menuBtn.setAttribute(
            "aria-label",
            "Open navigation menu"
        );

    }

}