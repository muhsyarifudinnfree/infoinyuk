import "toastify-js/src/toastify.css";
import "leaflet/dist/leaflet.css";
import "../styles/styles.css";

import App from "./pages/app";
import { getAccessToken } from "./utils/auth";
import { generateNavigationAuthenticated, generateNavigationUnauthenticated } from "./components/templates";
import useToast from "./utils/toast";

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector(".dropdown [role='button']"),
    navigationDrawer: document.querySelector(".dropdown-content"),
  });

  // Function to update navbar based on authentication status
  const updateNavbar = () => {
    const navigationDrawer = document.querySelector(".dropdown-content");
    if (navigationDrawer) {
      navigationDrawer.innerHTML = getAccessToken()
        ? generateNavigationAuthenticated()
        : generateNavigationUnauthenticated();
      // Re-attach event listeners to navigation links
      navigationDrawer.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          navigationDrawer.classList.add("hidden");
          document
            .querySelector(".dropdown [role='button']")
            .setAttribute("aria-expanded", "false");
        });
      });
    }
  };

  // Initial navbar and page setup
  try {
    updateNavbar();
    const initialUrl = getActiveRoute();
    if (getAccessToken() && ['/', '/login', '/register'].includes(initialUrl)) {
      useToast("Anda sudah login, dialihkan ke Home", "info");
    }
    await app.renderPage();
  } catch (error) {
    console.error("Initial page load error:", error);
    document.querySelector("#main-content").innerHTML = `
      <div class="alert alert-error shadow-lg animate-fade-in" role="alert">
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Gagal memuat halaman. Silakan coba lagi nanti.</span>
        </div>
      </div>
    `;
  }

  window.addEventListener("hashchange", async () => {
    try {
      const url = getActiveRoute();
      if (getAccessToken() && ['/', '/login', '/register'].includes(url)) {
        useToast("Anda sudah login, dialihkan ke Home", "info");
      }
      await app.renderPage();
      updateNavbar(); // Update navbar on hash change
    } catch (error) {
      console.error("Page load error on hash change:", error);
    }
  });

  // Function to get active route from hash
  function getActiveRoute() {
    return window.location.hash.slice(1) || '/';
  }
});