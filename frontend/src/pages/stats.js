// client/src/pages/stats.js
import { api } from "../api/client.js";
import { el, formatCurrency, formatDate } from "../utils/helpers.js";

const SPECIAL_EMOJI = {
  sandy: "🏖️", poley: "🚩", barkie: "🌲",
  greenie: "🟢", splashy: "💧", birdie: "🐦", eagle: "🦅",
};

export async function renderStats(app, navigate) {
  app.innerHTML = `<div class="page flex-center"><div class="spinner"></div></div>`;

  const token = localStorage.getItem("token");
  if (!token) { navigate("/login"); return; }

  try {
    const [stats, rounds, friends] = await Promise.all([
      api.get("/rounds/stats/me"),
      api.get("/rounds"),
      api.get("/friends"),
    ]);

    app.innerHTML = "";
    const wrap = el("div", { className: "page" });
    wrap.appendChild(el("h1", {}, "📊 Stats"));

    // ── Top stat cards ──
    const grid = el("div", { className: "stat-grid", style: "margin-bottom:0.875rem" });

    const totalEarnings = parseFloat(stats.totalEarnings);
    const earningsCard  = el("div", { className: "stat-card" });
    const earningsVal   = el("div", {
      className: `stat-value ${totalEarnings >= 0 ? "text-green" : "text-red"}`
    }, formatCurrency(totalEarnings));
    earningsCard.appendChild(earningsVal);
    earningsCard.appendChild(el("div", { className: "stat-label" }, "All-time earnings"));
    grid.appendChild(earningsCard);

    const roundsCard = el("div", { className: "stat-card" });
    roundsCard.appendChild(el("div", { className: "stat-value" }, String(stats.totalRounds)));
    roundsCard.appendChild(el("div", { className: "stat-label" }, "Rounds played"));
    grid.appendChild(roundsCard);

    wrap.appendChild(grid);

    // ── Specials breakdown ──
    if (stats.specialsCounts?.length) {
      const specCard = el("div", { className: "card" });
      specCard.appendChild(el("h2", {}, "Specials Earned"));

      const totalSpecials = stats.specialsCounts.reduce((sum, s) => sum + parseInt(s.count), 0);
      const totalEl = el("div", { className: "flex-between", style: "margin-bottom:0.75rem" });
      totalEl.appendChild(el("span", { className: "font-bold" }, "Total"));
      totalEl.appendChild(el("span", { className: "font-bold text-green" }, String(totalSpecials)));
      specCard.appendChild(totalEl);
      specCard.appendChild(el("hr", { className: "divider" }));

      stats.specialsCounts.forEach(s => {
        const row = el("div", { className: "flex-between", style: "padding:0.5rem 0;border-bottom:1px solid var(--border)" });
        const left = el("div", { className: "flex gap-sm", style: "align-items:center" });
        left.appendChild(el("span", { style: "font-size:1.2rem" }, SPECIAL_EMOJI[s.game_type] || "⭐"));
        left.appendChild(el("span", {}, s.game_type.charAt(0).toUpperCase() + s.game_type.slice(1)));
        row.appendChild(left);
        row.appendChild(el("span", { className: "font-bold" }, s.count));
        specCard.appendChild(row);
      });
      wrap.appendChild(specCard);
    }

    // ── Friends leaderboard ──
    if (friends.length) {
      const friendsCard = el("div", { className: "card" });
      friendsCard.appendChild(el("h2", {}, "Your Crew"));

      // Fetch stats for each friend
      const friendStats = await Promise.allSettled(
        friends.map(f => api.get(`/rounds/stats/me`)) // placeholder — shows current user's stats per friend
      );

      friends.forEach((f, i) => {
        const row = el("div", { className: "flex-between", style: "padding:0.6rem 0;border-bottom:1px solid var(--border)" });
        const left = el("div", { className: "flex gap-sm", style: "align-items:center" });
        const avatar = el("div", {
          className: "leaderboard-avatar",
          style: `background:hsl(${(i * 67) % 360}, 55%, 40%)`
        }, f.name[0].toUpperCase());
        left.appendChild(avatar);
        left.appendChild(el("span", { className: "font-bold" }, f.name));
        row.appendChild(left);
        row.appendChild(el("span", { className: "text-muted text-sm" }, f.email));
        friendsCard.appendChild(row);
      });

      // Add friend
      friendsCard.appendChild(el("hr", { className: "divider" }));
      const addRow = el("div", { className: "flex gap-sm", style: "margin-top:0.5rem" });
      const emailInput = el("input", { type: "email", placeholder: "Friend's email" });
      const addBtn = el("button", { className: "btn-outline btn-sm", style: "white-space:nowrap" }, "+ Add");
      addBtn.addEventListener("click", async () => {
        try {
          await api.post("/friends", { email: emailInput.value.trim() });
          renderStats(app, navigate);
        } catch (err) { alert(err.message); }
      });
      addRow.appendChild(emailInput);
      addRow.appendChild(addBtn);
      friendsCard.appendChild(addRow);
      wrap.appendChild(friendsCard);
    } else {
      // No friends yet
      const friendsCard = el("div", { className: "card" });
      friendsCard.appendChild(el("h2", {}, "Your Crew"));
      friendsCard.appendChild(el("p", { className: "text-muted text-sm", style: "margin-bottom:0.75rem" }, "Add friends to track rounds together."));
      const addRow = el("div", { className: "flex gap-sm" });
      const emailInput = el("input", { type: "email", placeholder: "Friend's email" });
      const addBtn = el("button", { className: "btn-outline btn-sm", style: "white-space:nowrap" }, "+ Add");
      addBtn.addEventListener("click", async () => {
        try {
          await api.post("/friends", { email: emailInput.value.trim() });
          renderStats(app, navigate);
        } catch (err) { alert(err.message); }
      });
      addRow.appendChild(emailInput);
      addRow.appendChild(addBtn);
      friendsCard.appendChild(addRow);
      wrap.appendChild(friendsCard);
    }

    // ── Recent rounds ──
    const completedRounds = rounds.filter(r => r.status === "completed").slice(0, 5);
    if (completedRounds.length) {
      const recentCard = el("div", { className: "card" });
      recentCard.appendChild(el("h2", {}, "Recent Rounds"));
      completedRounds.forEach(r => {
        const row = el("div", {
          className: "round-card",
          style: "margin-bottom:0.5rem;padding:0.75rem 1rem"
        });
        row.appendChild(el("div", { className: "round-card-title" }, r.name || "Untitled Round"));
        const meta = el("div", { className: "round-card-meta flex-between" });
        meta.appendChild(el("span", {}, r.course_name || "—"));
        meta.appendChild(el("span", {}, formatDate(r.completed_at || r.created_at)));
        row.appendChild(meta);
        row.addEventListener("click", () => navigate(`/settlement?id=${r.id}`));
        recentCard.appendChild(row);
      });
      wrap.appendChild(recentCard);
    }

    app.appendChild(wrap);
  } catch (err) {
    app.innerHTML = `<div class="page"><div class="card text-red">Failed to load stats: ${err.message}</div></div>`;
  }
}
