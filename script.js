// Unit photo popup
document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("photoModal");
    const gallery = document.getElementById("photoModalGallery");
    const title = document.getElementById("photoModalTitle");

    if (!modal || !gallery || !title) return;

    const closeModal = () => {
        modal.classList.remove("is-open");
        modal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        gallery.innerHTML = "";
    };

    const openModal = (card) => {
        const unitName = card.querySelector(".property-name")?.textContent.trim() || "Unit";
        const images = [...card.querySelectorAll("img")]
            .map(img => ({
                src: img.getAttribute("src"),
                alt: img.getAttribute("alt") || unitName
            }))
            .filter(item =>
                item.src &&
                !item.src.startsWith("YOUR-") &&
                !item.src.startsWith("data:")
            );

        title.textContent = `${unitName} — Photos`;

        if (!images.length) {
            gallery.innerHTML = `<div class="photo-modal-empty">Wala pang actual photos na naka-attach sa unit na ito.</div>`;
        } else {
            gallery.innerHTML = images.map((image, index) => `
                <figure>
                    <img src="${image.src}" alt="${image.alt}" loading="lazy">
                    <figcaption>${image.alt}</figcaption>
                </figure>
            `).join("");
        }

        modal.classList.add("is-open");
        modal.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    };

    document.querySelectorAll(".unit-card").forEach(card => {
        card.addEventListener("click", (event) => {
            // Don't interfere with normal links/buttons inside a card.
            if (event.target.closest("a, button")) return;
            openModal(card);
        });

        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openModal(card);
            }
        });
    });

    modal.addEventListener("click", (event) => {
        if (event.target.matches("[data-close-modal]")) {
            closeModal();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && modal.classList.contains("is-open")) {
            closeModal();
        }
    });
});

// Site viewing booking form
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("siteViewingForm");
    if (!form) return;

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xkjwkeor";
    const FALLBACK_EMAIL = "marimar08.antelland@gmail.com";
    const FACEBOOK_PAGE_URL = "https://www.facebook.com/profile.php?id=61592254354464";

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const submitBtn = form.querySelector(".form-submit");
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "SENDING...";
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        let sentToFormspree = false;

        // Try sending the booking details to Formspree (goes to email inbox).
        try {
            const response = await fetch(FORMSPREE_ENDPOINT, {
                method: "POST",
                headers: { "Accept": "application/json" },
                body: formData
            });
            sentToFormspree = response.ok;
        } catch (err) {
            sentToFormspree = false;
        }

        // Safety net: if Formspree fails (e.g. monthly limit reached, offline),
        // fall back to opening the visitor's email app with the details pre-filled
        // so no booking gets lost.
        if (!sentToFormspree) {
            const subject = encodeURIComponent("New Site Viewing Booking Request");
            const bodyLines = [
                `Full Name: ${data.fullName || ""}`,
                `Contact Number: ${data.contactNumber || ""}`,
                `Location: ${data.location || ""}`,
                `Preferred Pick-up Point: ${data.pickupPoint || ""}`,
                `Pax: ${data.pax || ""}`,
                `Preferred Time: ${data.preferredTime || ""}`
            ];
            const body = encodeURIComponent(bodyLines.join("\n"));
            window.location.href = `mailto:${FALLBACK_EMAIL}?subject=${subject}&body=${body}`;
        }

        // Always continue to the Facebook Page so the visitor can message directly.
        window.open(FACEBOOK_PAGE_URL, "_blank", "noopener");

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "SUBMIT & MESSAGE US ON FACEBOOK";
        }
        form.reset();
    });
});

// Hero image carousel (Business Card / Team Photo / Hero Image)
document.addEventListener("DOMContentLoaded", () => {
    const carousel = document.getElementById("heroCarousel");
    if (!carousel) return;

    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(document.querySelectorAll(".hero-dot"));
    const prevBtn = document.getElementById("heroPrev");
    const nextBtn = document.getElementById("heroNext");
    let current = 0;
    let autoplayTimer = null;

    function goToSlide(index) {
        slides[current].classList.remove("is-active");
        dots[current]?.classList.remove("is-active");
        current = (index + slides.length) % slides.length;
        slides[current].classList.add("is-active");
        dots[current]?.classList.add("is-active");
    }

    function startAutoplay() {
        stopAutoplay();
        autoplayTimer = setInterval(() => goToSlide(current + 1), 6000);
    }

    function stopAutoplay() {
        if (autoplayTimer) clearInterval(autoplayTimer);
    }

    prevBtn?.addEventListener("click", () => {
        goToSlide(current - 1);
        startAutoplay();
    });

    nextBtn?.addEventListener("click", () => {
        goToSlide(current + 1);
        startAutoplay();
    });

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            goToSlide(parseInt(dot.dataset.slide, 10));
            startAutoplay();
        });
    });

    // Touch swipe support
    let touchStartX = 0;
    carousel.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carousel.addEventListener("touchend", (e) => {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchEndX - touchStartX;
        if (Math.abs(diff) > 40) {
            if (diff < 0) {
                goToSlide(current + 1);
            } else {
                goToSlide(current - 1);
            }
            startAutoplay();
        }
    }, { passive: true });

    startAutoplay();
});

// Animated Property Value Progression chart
document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelectorAll(".value-bar");
    if (!bars.length) return;

    bars.forEach((bar) => {
        const target = bar.dataset.target || "0";
        bar.style.setProperty("--bar-height", target + "%");
    });

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        bars.forEach((bar) => observer.observe(bar));
    } else {
        bars.forEach((bar) => bar.classList.add("is-visible"));
    }
});

// Strategic Road Access — entrance animation
document.addEventListener("DOMContentLoaded", () => {
    const flows = document.querySelectorAll(".route-flow");
    if (!flows.length) return;

    if ("IntersectionObserver" in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("is-visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.2 });

        flows.forEach((flow) => observer.observe(flow));
    } else {
        flows.forEach((flow) => flow.classList.add("is-visible"));
    }
});
