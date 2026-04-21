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
    const [stats, rounds, friends, bestRounds, season, h2h] = await Promise.all([
      api.get("/rounds/stats/me"),
      api.get("/rounds"),
      api.get("/friends"),
      api.get("/rounds/stats/best-rounds"),
      api.get("/rounds/stats/season"),
      api.get("/rounds/stats/h2h"),
    ]);

    app.innerHTML = "";
    const wrap = el("div", { className: "page" });
    wrap.appendChild(el("h1", {}, "📊 Stats"));

    // ── Top stat cards ──
    const grid = el("div", { className: "stat-grid", style: "margin-bottom:0.875rem" });

    const totalEarnings = parseFloat(stats.totalEarnings);
    const earningsCard  = el("div", { className: "stat-card" });
    earningsCard.appendChild(el("div", {
      className: `stat-value ${totalEarnings >= 0 ? "text-green" : "text-red"}`
    }, formatCurrency(totalEarnings)));
    earningsCard.appendChild(el("div", { className: "stat-label" }, "All-time earnings"));
    grid.appendChild(earningsCard);

    const roundsCard = el("div", { className: "stat-card" });
    roundsCard.appendChild(el("div", { className: "stat-value" }, String(stats.totalRounds)));
    roundsCard.appendChild(el("div", { className: "stat-label" }, "Rounds played"));
    grid.appendChild(roundsCard);

    const totalSpecials = stats.specialsCounts?.reduce((s, x) => s + parseInt(x.count), 0) || 0;
    const specialsCard = el("div", { className: "stat-card" });
    specialsCard.appendChild(el("div", { className: "stat-value text-green" }, String(totalSpecials)));
    specialsCard.appendChild(el("div", { className: "stat-label" }, "Specials earned"));
    grid.appendChild(specialsCard);

    wrap.appendChild(grid);

    // ── Season leaderboard ──
    if (season.leaderboard?.length > 1) {
      const seasonCard = el("div", { className: "card" });
      seasonCard.appendChild(el("h2", {}, `🏆 ${season.year} Season`));
      season.leaderboard.forEach((p, i) => {
        const row = el("div", { className: "flex-between", style: "padding:0.6rem 0;border-bottom:1px solid var(--border)" });
        const left = el("div", { className: "flex gap-sm", style: "align-items:center" });
        const rank = el("span", { style: "width:1.5rem;font-weight:700;color:var(--text-muted)" }, `${i + 1}`);
        const avatar = el("div", {
          className: "leaderboard-avatar",
          style: `background:hsl(${(i * 67) % 360}, 55%, 40%)`
        }, p.name[0].toUpperCase());
        const nameEl = el("span", { className: "font-bold" }, p.name);
        const meta = el("span", { className: "text-muted text-sm" }, ` · ${p.rounds_played} rounds`);
        left.append(rank, avatar, nameEl, meta);
        const earnings = parseFloat(p.season_earnings);
        row.appendChild(left);
        row.appendChild(el("span", {
          className: `font-bold ${earnings >= 0 ? "text-green" : "text-red"}`
        }, formatCurrency(earnings)));
        seasonCard.appendChild(row);
      });
      wrap.appendChild(seasonCard);
    }

    // ── Head-to-head ──
    if (h2h?.length) {
      const h2hCard = el("div", { className: "card" });
      h2hCard.appendChild(el("h2", {}, "⚔️ Head-to-Head"));
      h2h.forEach(record => {
        const row = el("div", { style: "padding:0.75rem 0;border-bottom:1px solid var(--border)" });
        const top = el("div", { className: "flex-between", style: "margin-bottom:0.3rem" });
        top.appendChild(el("span", { className: "font-bold" }, record.friend.name));
        const net = parseFloat(record.netEarnings);
        top.appendChild(el("span", {
          className: `font-bold ${net >= 0 ? "text-green" : "text-red"}`
        }, formatCurrency(net)));
        row.appendChild(top);

        const bottom = el("div", { className: "flex gap-sm", style: "align-items:center" });
        bottom.appendChild(el("span", { className: "text-muted text-sm" }, `${record.rounds} rounds together`));
        bottom.appendChild(el("span", { style: "font-size:0.8rem;color:var(--green);font-weight:600" }, `${record.wins}W`));
        bottom.appendChild(el("span", { style: "font-size:0.8rem;color:var(--text-muted)" }, `-`));
        bottom.appendChild(el("span", { style: "font-size:0.8rem;color:#e03131;font-weight:600" }, `${record.losses}L`));
        const ties = record.rounds - record.wins - record.losses;
        if (ties > 0) {
          bottom.appendChild(el("span", { style: "font-size:0.8rem;color:var(--text-muted)" }, `-`));
          bottom.appendChild(el("span", { style: "font-size:0.8rem;color:var(--text-muted);font-weight:600" }, `${ties}T`));
        }
        row.appendChild(bottom);
        h2hCard.appendChild(row);
      });
      wrap.appendChild(h2hCard);
    }

    // ── Best rounds ──
    if (bestRounds?.length) {
      const bestCard = el("div", { className: "card" });
      bestCard.appendChild(el("h2", {}, "🥇 Best Rounds"));
      bestRounds.forEach((r, i) => {
        const row = el("div", {
          className: "round-card",
          style: "margin-bottom:0.5rem;padding:0.75rem 1rem;cursor:pointer"
        });
        const top = el("div", { className: "flex-between" });
        const nameEl = el("div", { className: "round-card-title" }, r.name || "Untitled Round");
        const net = parseFloat(r.net_earnings);
        top.appendChild(nameEl);
        top.appendChild(el("span", {
          className: `font-bold ${net >= 0 ? "text-green" : "text-red"}`
        }, formatCurrency(net)));
        row.appendChild(top);
        const meta = el("div", { className: "round-card-meta" });
        meta.appendChild(el("span", {}, r.course_name || "—"));
        meta.appendChild(el("span", { className: "text-muted text-sm" }, ` · ${formatDate(r.completed_at)}`));
        row.appendChild(meta);
        row.addEventListener("click", () => navigate(`/settlement?id=${r.id}`));
        bestCard.appendChild(row);
      });
      wrap.appendChild(bestCard);
    }

    // ── Specials breakdown ──
    if (stats.specialsCounts?.length) {
      const specCard = el("div", { className: "card" });
      specCard.appendChild(el("h2", {}, "Specials Earned"));
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

    // ── Crew / add friends ──
    const friendsCard = el("div", { className: "card" });
    friendsCard.appendChild(el("h2", {}, "Your Crew"));
    if (friends.length) {
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
      friendsCard.appendChild(el("hr", { className: "divider" }));
    } else {
      friendsCard.appendChild(el("p", { className: "text-muted text-sm", style: "margin-bottom:0.75rem" }, "Add friends to track rounds together."));
    }
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
