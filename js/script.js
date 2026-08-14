/* =========================================
   FAQ ACCORDION
========================================= */

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {

    const question = item.querySelector(".faq-question");
    const answer = item.querySelector(".faq-answer");

    question.addEventListener("click", () => {

        const isActive = item.classList.contains("active");

        faqItems.forEach((otherItem) => {

            otherItem.classList.remove("active");

            const otherAnswer =
                otherItem.querySelector(".faq-answer");

            otherAnswer.style.maxHeight = null;

        });


        if (!isActive) {

            item.classList.add("active");

            answer.style.maxHeight =
                answer.scrollHeight + "px";

        }

    });

});


/* =========================================
   PRODUCT SLIDER
========================================= */

const productsTrack =
    document.querySelector(".products-track");

const productCards =
    document.querySelectorAll(".products-track .product-card");

const productPrev =
    document.querySelector(".product-prev");

const productNext =
    document.querySelector(".product-next");

const sliderDots =
    document.querySelector(".slider-dots");


if (
    productsTrack &&
    productCards.length &&
    productPrev &&
    productNext &&
    sliderDots
) {

    let currentSlide = 0;


    function getCardsPerView() {

        if (window.innerWidth <= 650) {
            return 1;
        }

        if (window.innerWidth <= 950) {
            return 2;
        }

        return 3;
    }


    function getTotalSlides() {

        return Math.ceil(
            productCards.length /
            getCardsPerView()
        );

    }


    function createDots() {

        sliderDots.innerHTML = "";

        const totalSlides =
            getTotalSlides();

        for (
            let i = 0;
            i < totalSlides;
            i++
        ) {

            const dot =
                document.createElement("button");

            dot.className = "slider-dot";

            dot.setAttribute(
                "aria-label",
                `Go to product slide ${i + 1}`
            );

            dot.addEventListener(
                "click",
                () => {

                    currentSlide = i;

                    updateSlider();

                }
            );

            sliderDots.appendChild(dot);

        }

    }


    function updateSlider() {

        const cardsPerView =
            getCardsPerView();

        const totalSlides =
            getTotalSlides();

        if (
            currentSlide >= totalSlides
        ) {

            currentSlide =
                totalSlides - 1;

        }

        if (currentSlide < 0) {

            currentSlide = 0;

        }


        const cardWidth =
            productCards[0].offsetWidth;

        const gap =
            parseFloat(
                getComputedStyle(
                    productsTrack
                ).gap
            );


        const moveAmount =
            currentSlide *
            cardsPerView *
            (cardWidth + gap);


        productsTrack.style.transform =
            `translateX(-${moveAmount}px)`;


        productPrev.disabled =
            currentSlide === 0;

        productNext.disabled =
            currentSlide ===
            totalSlides - 1;


        const dots =
            sliderDots.querySelectorAll(
                ".slider-dot"
            );

        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentSlide
                );

            }
        );

    }


    productNext.addEventListener(
        "click",
        () => {

            if (
                currentSlide <
                getTotalSlides() - 1
            ) {

                currentSlide++;

                updateSlider();

            }

        }
    );


    productPrev.addEventListener(
        "click",
        () => {

            if (currentSlide > 0) {

                currentSlide--;

                updateSlider();

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            createDots();

            updateSlider();

        }
    );


    createDots();

    updateSlider();

}
