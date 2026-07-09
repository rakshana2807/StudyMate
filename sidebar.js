// ======================================
// StudyMate — Sidebar, Hamburger Menu,
// Overlay & Theme Toggle (shared across pages)
// ======================================

(function () {

    const sidebar   = document.getElementById("sidebar");
    const hamburger = document.getElementById("hamburgerBtn");
    const overlay   = document.getElementById("overlay");

    // ======================================
    // Open / Close Sidebar
    // ======================================

    function openSidebar() {

        if (!sidebar) return;

        sidebar.classList.add("open");

        if (hamburger) {
            hamburger.classList.add("open");
            hamburger.setAttribute("aria-expanded", "true");
        }

        if (overlay) {
            overlay.classList.add("active");
            overlay.setAttribute("aria-hidden", "false");
        }

        // Move focus into the sidebar for keyboard users
        const firstLink = sidebar.querySelector("a, button");
        if (firstLink) firstLink.focus();

    }

    function closeSidebar() {

        if (!sidebar) return;

        const wasOpen = sidebar.classList.contains("open");

        sidebar.classList.remove("open");

        if (hamburger) {
            hamburger.classList.remove("open");
            hamburger.setAttribute("aria-expanded", "false");
        }

        if (overlay) {
            overlay.classList.remove("active");
            overlay.setAttribute("aria-hidden", "true");
        }

        // Return focus to the hamburger button so keyboard users
        // don't lose their place
        if (wasOpen && hamburger) hamburger.focus();

    }

    function toggleSidebar() {

        if (!sidebar) return;

        if (sidebar.classList.contains("open")) {
            closeSidebar();
        } else {
            openSidebar();
        }

    }

    // Hamburger button toggles the sidebar
    if (hamburger) {
        hamburger.addEventListener("click", toggleSidebar);
    }

    // Clicking the dark overlay closes the sidebar
    if (overlay) {
        overlay.addEventListener("click", closeSidebar);
    }

    // Escape key closes the sidebar (keyboard accessibility)
    document.addEventListener("keydown", (e) => {

        if (e.key === "Escape") closeSidebar();

    });

    // Tapping a nav link on mobile should close the sidebar
    if (sidebar) {

        sidebar.querySelectorAll("nav a").forEach(link => {

            link.addEventListener("click", () => {

                if (window.innerWidth <= 900) closeSidebar();

            });

        });

    }

    // If the viewport grows back to desktop size, make sure the
    // mobile drawer state doesn't linger
    window.addEventListener("resize", () => {

        if (window.innerWidth > 900) closeSidebar();

    });

    // ======================================
    // Theme Toggle (Light / Dark Mode)
    // Persisted with Local Storage
    // ======================================

    const themeToggleBtn = document.getElementById("themeToggleBtn");
    const root = document.documentElement;

    function applyTheme(theme) {

        if (theme === "dark") {
            root.setAttribute("data-theme", "dark");
        } else {
            root.removeAttribute("data-theme");
        }

        if (themeToggleBtn) {

            themeToggleBtn.innerHTML = theme === "dark"
                ? '<i class="fa-solid fa-sun"></i><span>Light Mode</span>'
                : '<i class="fa-solid fa-moon"></i><span>Dark Mode</span>';

            themeToggleBtn.setAttribute(
                "aria-pressed",
                theme === "dark" ? "true" : "false"
            );

        }

    }

    // Load saved theme (defaults to light)
    const savedTheme = localStorage.getItem("theme") || "light";
    applyTheme(savedTheme);

    if (themeToggleBtn) {

        themeToggleBtn.addEventListener("click", () => {

            const current = root.getAttribute("data-theme") === "dark"
                ? "dark"
                : "light";

            const next = current === "dark" ? "light" : "dark";

            localStorage.setItem("theme", next);

            applyTheme(next);

        });

    }

})();