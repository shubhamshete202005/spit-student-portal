/* SPIT Student Portal — Login Logic
 * Authenticates against PHP backend at api/login.php.
 * Preserves original UX, styling, password toggle, and form validation.
 */
const $ = (s) => document.getElementById(s);

// Verify active session on load
(async () => {
  try {
    const sRes = await fetch("api/session.php", { cache: "no-store" });
    if (sRes.ok) {
      const sData = await sRes.json();
      if (sData.ok && sData.logged_in) {
        if (sData.role === "admin") {
          location.replace("admin.html");
        } else {
          sessionStorage.setItem("spit_uid", sData.user.roll_no);
          location.replace("dashboard.html");
        }
      }
    }
  } catch (err) {
    // Session check failure silently ignored so login form remains accessible
  }
})();

const form = $("loginForm"),
  msg = $("msg"),
  btn = $("loginBtn"),
  idIn = $("studentId"),
  pwIn = $("password");

function freshForm() {
  form.reset();
  clearErr();
  const saved = localStorage.getItem("spit_remember");
  idIn.value = saved || "";
  pwIn.value = "";
  $("remember").checked = !!saved;
  btn.disabled = false;
  btn.textContent = "Sign In";
}
freshForm();

function show(text, type) {
  msg.textContent = text;
  msg.className = "msg" + (type ? " " + type : "");
}

function clearErr() {
  show("");
  document
    .querySelectorAll(".form-group")
    .forEach((g) => g.classList.remove("invalid"));
}

[idIn, pwIn].forEach((i) => i.addEventListener("input", clearErr));

$("togglePw").onclick = (e) => {
  const hide = pwIn.type === "password";
  pwIn.type = hide ? "text" : "password";
  e.target.textContent = hide ? "Hide" : "Show";
  e.target.setAttribute("aria-label", hide ? "Hide password" : "Show password");
};

// Demo fill credentials
$("demoFill").onclick = () => {
  idIn.value = "MCA26001";
  pwIn.value = "spit@123";
  clearErr();
  btn.focus();
};

const adminFillBtn = $("demoFillAdmin");
if (adminFillBtn) {
  adminFillBtn.onclick = () => {
    idIn.value = "admin";
    pwIn.value = "Admin@123";
    clearErr();
    btn.focus();
  };
}

$("forgot").onclick = (e) => {
  e.preventDefault();
  show("Please contact the SPIT system administration to reset your password.", "info");
};

form.onsubmit = async (e) => {
  e.preventDefault();
  const id = idIn.value.trim();
  const pw = pwIn.value;

  if (!id || !pw) {
    show("Please enter your student ID/username and password.");
    (!id ? idIn : pwIn).parentNode
      .closest(".form-group")
      .classList.add("invalid");
    return;
  }

  btn.disabled = true;
  btn.textContent = "Signing in…";
  clearErr();

  let res, data;
  try {
    res = await fetch("api/login.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: id, password: pw }),
    });
  } catch (err) {
    show("Could not reach the server. Check that XAMPP Apache is running.");
    btn.disabled = false;
    btn.textContent = "Sign In";
    return;
  }

  try {
    data = await res.json();
  } catch (err) {
    show("Server returned an invalid response. Please check server logs.");
    btn.disabled = false;
    btn.textContent = "Sign In";
    return;
  }

  if (!res.ok || !data.ok) {
    show(data.error || "Incorrect credentials. Please verify your details.");
    document
      .querySelectorAll(".form-group")
      .forEach((g) => g.classList.add("invalid"));
    form.classList.remove("shake");
    void form.offsetWidth;
    form.classList.add("shake");
    pwIn.select();
    btn.disabled = false;
    btn.textContent = "Sign In";
    return;
  }

  // Handle remember me
  if ($("remember").checked) {
    localStorage.setItem("spit_remember", id);
  } else {
    localStorage.removeItem("spit_remember");
  }

  // Role-based redirection
  if (data.role === "admin") {
    sessionStorage.setItem("spit_admin", "1");
    sessionStorage.removeItem("spit_uid");
    show("Login successful! Redirecting to Administrator Dashboard…", "info");
    setTimeout(() => {
      location.href = data.redirect || "admin.html";
    }, 350);
  } else {
    sessionStorage.setItem("spit_uid", data.roll);
    sessionStorage.removeItem("spit_admin");
    show("Login successful! Redirecting to Dashboard…", "info");
    setTimeout(() => {
      location.href = data.redirect || "dashboard.html";
    }, 350);
  }
};
