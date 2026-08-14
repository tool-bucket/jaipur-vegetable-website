/* =========================================================
   FRESHJAIPUR CONTACT FORM
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    const contactForm =
        document.getElementById("contactForm");


    const message =
        document.getElementById("contactMessage");


    const messageCount =
        document.getElementById("messageCount");


    const formSuccess =
        document.getElementById("formSuccess");


    /* =====================================================
       MESSAGE CHARACTER COUNTER
       ===================================================== */

    if (message && messageCount) {

        message.addEventListener("input", function () {

            messageCount.textContent =
                message.value.length;

        });

    }


    /* =====================================================
       FORM SUBMIT
       ===================================================== */

    if (contactForm) {

        contactForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                /* Browser validation */

                if (!contactForm.checkValidity()) {

                    contactForm.reportValidity();

                    return;

                }


                /* Show success message */

                if (formSuccess) {

                    formSuccess.classList.add("show");

                }


                /*
                 * Form backend is not connected yet.
                 *
                 * Later we can connect this form with:
                 *
                 * Formspree
                 * Web3Forms
                 * EmailJS
                 * Custom backend
                 *
                 */


                /* Reset form */

                contactForm.reset();


                /* Reset counter */

                if (messageCount) {

                    messageCount.textContent = "0";

                }

            }
        );

    }

});