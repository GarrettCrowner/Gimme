// client/src/utils/router.js

import { renderLogin } from "../pages/login.js";
import { renderHome } from "../pages/home.js";
import { renderSetup } from "../pages/setup.js";
import { renderRound } from "../pages/round.js";
import { renderSettlement } from "../pages/settlement.js";
import { renderArtists } from "../pages/artists.js";
import { renderStats } from "../pages/stats.js";

const routes = {
  "/":           renderHome,
  "/login":      renderLogin,
  "/setup":      renderSetup,
  "/round":      renderRound,
  "/settlement": renderSettlement,
  "/artists":    renderArtists,
  "/stats":      renderStats,
};

function getApp() {
  return document.getElementById("app");
}

function navigate(path) {
  window.history.pushState({}, "", path);
  render(path);
}

function render(path) {
  const app = getApp();
  const renderFn = routes[path] ?? renderHome;
  app.innerHTML = "";
  renderFn(app, navigate);
}

function init() {
  // Handle back/forward
  window.addEventListener("popstate", () => render(window.location.pathname));
  // Initial render
  render(window.location.pathname);
}

export const router = { init, navigate };
