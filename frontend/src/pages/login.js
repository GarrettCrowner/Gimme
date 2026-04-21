// client/src/pages/login.js
import { api } from "../api/client.js";
import { el } from "../utils/helpers.js";

export async function renderLogin(app, navigate) {
  app.innerHTML = "";

  let isRegister = false;
  let error      = "";

  function render() {
    app.innerHTML = "";
    const wrap = el("div", { className: "page", style: "max-width:400px;margin:0 auto" });
    wrap.appendChild(el("h1", {}, isRegister ? "Create Account" : "Sign In"));

    if (error) wrap.appendChild(el("div", { className: "card text-red", style: "margin-bottom:1rem" }, error));

    const card = el("div", { className: "card" });

    let nameInput;
    if (isRegister) {
      nameInput = el("input", { type: "text", placeholder: "Your name", style: "margin-bottom:0.5rem" });
      card.appendChild(nameInput);
    }

    const emailInput    = el("input", { type: "email",    placeholder: "Email",    style: "margin-bottom:0.5rem" });
    const passwordInput = el("input", { type: "password", placeholder: "Password", style: "margin-bottom:1rem" });

    card.appendChild(emailInput);
    card.appendChild(passwordInput);

    const submitBtn = el("button", { className: "btn-primary", style: "width:100%" }, isRegister ? "Create Account" : "Sign In");
    submitBtn.addEventListener("click", async () => {
      error = "";
      try {
        let data;
        if (isRegister) {
          data = await api.post("/auth/register", { name: nameInput.value, email: emailInput.value, password: passwordInput.value });
        } else {
          data = await api.post("/auth/login", { email: emailInput.value, password: passwordInput.value });
        }
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new CustomEvent("user-logged-in"));
        navigate("/");
      } catch (err) { error = err.message; render(); }
    });
    card.appendChild(submitBtn);

    const toggle = el("p", { className: "text-muted text-center mt-md", style: "cursor:pointer" }, isRegister ? "Already have an account? Sign in" : "No account? Create one");
    toggle.addEventListener("click", () => { isRegister = !isRegister; error = ""; render(); });
    card.appendChild(toggle);

    wrap.appendChild(card);
    app.appendChild(wrap);
  }

  render();
}
