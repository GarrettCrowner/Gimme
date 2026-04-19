// client/src/components/settlementTable.js
import { el, formatCurrency } from "../utils/helpers.js";

/**
 * @param {Array} settlements - [{ fromName, toName, amount }]
 * @returns {HTMLElement}
 */
export function renderSettlementTable(settlements) {
  if (!settlements.length) {
    const empty = el("p", { className: "text-muted text-center", style: "padding:1rem 0" }, "All square — no payments needed! 🎉");
    return empty;
  }

  const table = el("table", { className: "settlement-table" });
  const thead = el("thead");
  const hrow  = el("tr");
  ["From", "", "To", "Amount"].forEach(h => hrow.appendChild(el("th", {}, h)));
  thead.appendChild(hrow);
  table.appendChild(thead);

  const tbody = el("tbody");
  settlements.forEach(s => {
    const row = el("tr");
    row.appendChild(el("td", { className: "font-bold" }, s.fromName || s.from_guest || "Guest"));
    row.appendChild(el("td", { className: "settlement-arrow" }, "→"));
    row.appendChild(el("td", {}, s.toName || s.to_guest || "Guest"));
    row.appendChild(el("td", { className: "settlement-amount" }, formatCurrency(s.amount)));
    tbody.appendChild(row);
  });
  table.appendChild(tbody);
  return table;
}
