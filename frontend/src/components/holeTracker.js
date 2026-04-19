// client/src/components/holeTracker.js
// Standalone hole grid — shows score/special indicators, fires callback on tap
import { el } from "../utils/helpers.js";

/**
 * @param {Object} opts
 * @param {Number}   opts.totalHoles
 * @param {Number}   opts.activeHole
 * @param {Array}    opts.holeScores   - [{ hole_number }]
 * @param {Array}    opts.specials     - [{ hole_number }]
 * @param {Function} opts.onSelect     - (holeNumber) => void
 * @returns {HTMLElement}
 */
export function renderHoleTracker({ totalHoles, activeHole, holeScores, specials, onSelect }) {
  const grid = el("div", { className: "hole-grid" });

  for (let h = 1; h <= totalHoles; h++) {
    const hasScore   = holeScores.some(s => s.hole_number === h);
    const hasSpecial = specials.some(s => s.hole_number === h);

    const classes = [
      "hole-btn",
      h === activeHole ? "active"      : "",
      hasScore         ? "has-score"   : "",
      hasSpecial       ? "has-special" : "",
    ].filter(Boolean).join(" ");

    const btn = el("div", { className: classes }, String(h));
    btn.addEventListener("click", () => onSelect(h));
    grid.appendChild(btn);
  }

  return grid;
}
