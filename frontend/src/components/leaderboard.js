// client/src/components/leaderboard.js
// Reusable leaderboard component — used in round.js and settlement.js
import { el, formatCurrency } from "../utils/helpers.js";

const PLAYER_COLORS = ["#1a7a4a","#e8960c","#e03131","#1971c2","#7209b7","#f72585"];

/**
 * @param {Array}  entries  - [{ id, name, balance, specialsCount }]
 * @param {Array}  players  - round_players for color lookup
 * @returns {HTMLElement}
 */
export function renderLeaderboard(entries, players = []) {
  const list = el("ul", { className: "leaderboard" });

  entries.forEach((p, i) => {
    const row     = el("li",  { className: "leaderboard-row" });
    const rank    = el("span", { className: `leaderboard-rank${i < 3 ? ` rank-${i+1}` : ""}` }, `${i+1}`);
    const player  = players.find(pl => pl.id === p.id);
    const color   = player?.color || PLAYER_COLORS[i % PLAYER_COLORS.length];
    const avatar  = el("div",  { className: "leaderboard-avatar", style: `background:${color}` }, p.name[0]?.toUpperCase() || "?");
    const name    = el("span", { className: "leaderboard-name" }, p.name);
    const specials = el("span", { className: "leaderboard-specials" }, `${p.specialsCount}★`);
    const balance = el("span", {
      className: `leaderboard-balance ${p.balance >= 0 ? "text-green" : "text-red"}`
    }, formatCurrency(p.balance));

    row.append(rank, avatar, name, specials, balance);
    list.appendChild(row);
  });

  return list;
}
