document.addEventListener("DOMContentLoaded", async () => {

    const navbar = document.getElementById("navbar");
    const footer = document.getElementById("footer");


    /* ================= NAVBAR ================= */

    if (navbar) {

        try {

            const response = await fetch("/components/navbar.html");

            if (!response.ok) {
                throw new Error("Navbar could not be loaded");
            }

            navbar.innerHTML = await response.text();

            /* Navbar load hone ke baad navbar.js run */
            if (typeof initNavbar === "function") {
                initNavbar();
            }

        } catch (error) {

            console.error("Navbar Error:", error);

        }

    }


    /* ================= FOOTER ================= */

    if (footer) {

        try {

            const response = await fetch("/components/footer.html");

            if (!response.ok) {
                throw new Error("Footer could not be loaded");
            }

            footer.innerHTML = await response.text();

        } catch (error) {

            console.error("Footer Error:", error);

        }

    }

});