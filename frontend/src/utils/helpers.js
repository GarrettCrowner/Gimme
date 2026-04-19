// client/src/utils/helpers.js

export function formatCurrency(amount) {
  const abs = Math.abs(amount).toFixed(2);
  return amount < 0 ? `-$${abs}` : `$${abs}`;
}

export function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString("en-US", {
    weekday: "short", month: "short", day: "numeric", year: "numeric",
  });
}

export function el(tag, attrs = {}, ...children) {
  const element = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === "className") element.className = val;
    else if (key.startsWith("on")) element.addEventListener(key.slice(2).toLowerCase(), val);
    else element.setAttribute(key, val);
  }
  for (const child of children) {
    if (typeof child === "string") element.appendChild(document.createTextNode(child));
    else if (child) element.appendChild(child);
  }
  return element;
}
