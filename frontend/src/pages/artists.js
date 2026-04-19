// client/src/pages/artists.js
// NOTE: This page is a placeholder for the concert crew feature
// (tracked artists, upcoming shows, who's seen them live).
// It is intentionally left as a stub here since the primary focus
// of the current build is the golf skins tracker. The data model
// (tracked_artists, user_shows) would need to be added to the DB schema.

import { el } from "../utils/helpers.js";

export function renderArtists(app, navigate) {
  app.innerHTML = "";
  const wrap = el("div", { className: "page" });
  wrap.appendChild(el("h1", {}, "🎵 Our Artists"));

  const card = el("div", { className: "card" });
  card.appendChild(el("div", { className: "empty-state" }));

  const icon = el("div", { className: "empty-icon" }, "🚧");
  const msg  = el("p", { style: "font-weight:600;margin-bottom:0.4rem" }, "Coming Soon");
  const sub  = el("p", { className: "text-muted text-sm" }, "Track artists your crew loves, see upcoming tour dates, and log who's seen them live.");

  card.querySelector(".empty-state").appendChild(icon);
  card.querySelector(".empty-state").appendChild(msg);
  card.querySelector(".empty-state").appendChild(sub);
  wrap.appendChild(card);
  app.appendChild(wrap);
}
