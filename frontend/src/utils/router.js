// frontend/src/utils/router.js

import { renderLogin }      from "../pages/login.js";
import { renderHome }       from "../pages/home.js";
import { renderSetup }      from "../pages/setup.js";
import { renderRound }      from "../pages/round.js";
import { renderSettlement } from "../pages/settlement.js";
import { renderStats }      from "../pages/stats.js";

const routes = {
  "/":           renderHome,
  "/login":      renderLogin,
  "/setup":      renderSetup,
  "/round":      renderRound,
  "/settlement": renderSettlement,
  "/stats":      renderStats,
};

function getApp() {
  return document.getElementById("app");
}

function navigate(path) {
  window.history.pushState({}, "", path);
  render(window.location.pathname);
}

function render(path) {
  const app = getApp();
  // Strip trailing slash (except root) for consistent matching
  const normalized = path.length > 1 ? path.replace(/\/$/, "") : path;
  const renderFn = routes[normalized] ?? renderHome;
  app.innerHTML = "";
  renderFn(app, navigate);
}

function init() {
  // Handle back/forward browser buttons
  window.addEventListener("popstate", () => render(window.location.pathname));
  // Initial render — works correctly whether it's a fresh load, hard reload,
  // or direct navigation to /round?id=1, /settlement?id=2, etc.
  render(window.location.pathname);
}

export const router = { init, navigate };
