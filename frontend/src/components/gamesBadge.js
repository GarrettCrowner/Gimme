// client/src/components/gamesBadge.js
import { el } from "../utils/helpers.js";

const EMOJI = {
  sandy: "🏖️", poley: "🚩", barkie: "🌲",
  greenie: "🟢", splashy: "💧", birdie: "🐦", eagle: "🦅", stroke_play: "🎯"
};

/**
 * @param {String} gameType
 * @param {Number} count    - optional repeat count
 * @returns {HTMLElement}
 */
export function renderGamesBadge(gameType, count = null) {
  const badge = el("span", { className: "badge badge-gold" },
    `${EMOJI[gameType] || "⭐"} ${gameType}${count ? ` ×${count}` : ""}`
  );
  return badge;
}
