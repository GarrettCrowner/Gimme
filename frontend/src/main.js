import { router } from "./utils/router.js";
import { renderNavbar } from "./components/navbar.js";
import { renderTabBar } from "./components/tabBar.js";
import { setupPWA } from "./utils/pwa.js";

renderNavbar();
renderTabBar(router.navigate);
router.init();

// Set up push notifications if user is logged in
if (localStorage.getItem("token")) {
  setupPWA().catch(() => {});
}

// Also set up after login
window.addEventListener("user-logged-in", () => {
  setupPWA().catch(() => {});
});
