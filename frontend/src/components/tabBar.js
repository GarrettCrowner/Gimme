// client/src/components/tabBar.js

const TABS = [
  { path: "/",       icon: "🏠", label: "Home"    },
  { path: "/setup",  icon: "⛳", label: "New Round" },
  { path: "/stats",  icon: "📊", label: "Stats"   },
];

export function renderTabBar(navigate) {
  const bar = document.createElement("nav");
  bar.className = "tab-bar";

  function update() {
    bar.innerHTML = "";
    TABS.forEach(tab => {
      const item = document.createElement("div");
      item.className = "tab-bar-item" + (window.location.pathname === tab.path ? " active" : "");
      item.innerHTML = `<span class="tab-icon">${tab.icon}</span><span>${tab.label}</span>`;
      item.addEventListener("click", () => navigate(tab.path));
      bar.appendChild(item);
    });
  }

  update();
  window.addEventListener("popstate", update);
  document.body.appendChild(bar);
}
