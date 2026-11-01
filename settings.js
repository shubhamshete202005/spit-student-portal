/* Settings page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "settings";
const V = {
  settings() {
    const T = localStorage.spit_theme;
    const row = (i, c, t, s, r) =>
        `<div class="row ${c}"><span class="ib" style="width:44px;height:44px">${ic(i)}</span><div class="f"><b>${t}</b><small>${s}</small></div>${r}</div>`,
      go = ic("chev2"),
      tg = (on) => `<div class="tg ${on ? "on" : ""}" role="switch"></div>`;
    return (
      hd("Settings", "Manage your profile, preferences and account settings.") +
      `<div class="grid g11" style="align-items:start"><div>
<div class="card" style="margin-bottom:16px"><div class="ch"><div><h2>Profile Information</h2><small style="color:var(--mut)">View and update your personal and academic details.</small></div><button class="btn sm" id="ep">${ic("pen")} Edit Profile</button></div><div style="display:flex;gap:22px;flex-wrap:wrap;align-items:center"><div class="av" style="width:120px;height:120px;font-size:38px">${av()}</div><div class="kv" style="flex:1;min-width:220px"><span>Name</span><b style="font-weight:400">${S.name}</b><span>Roll Number</span><b style="font-weight:400">${S.roll}</b><span>Program</span><b style="font-weight:400">${DB.program}</b><span>Batch</span><b style="font-weight:400">${S.batch}</b><span>Email</span><b style="font-weight:400" id="pe">${S.email}</b><span>Mobile Number</span><b style="font-weight:400" id="pm">${S.mobile}</b></div></div></div>
<div class="card" style="margin-bottom:16px"><h2>Account Settings</h2><small style="color:var(--mut)">Manage your login credentials and security options.</small>${row("lock", "b link", "Change Password", "Update your account password", go).replace('class="row', 'data-toast="Password change is handled by the server" class="row')}${row("shield", "g", "Two-Factor Authentication", "Add an extra layer of security", tg(0))}${row("monitor", "p link", "Active Sessions", "Manage your logged-in devices", go).replace('class="row', 'data-toast="Session list will load from the server" class="row')}</div>
<div class="card"><h2>Notification Preferences</h2><small style="color:var(--mut)">Choose what notifications you want to receive.</small>${row("bell", "b", "Email Notifications", "Receive important updates on your email", tg(1))}${row("phone", "b", "Browser Notifications", "Get notified on this device", tg(1))}${row("mail", "r link", "Notification Categories", "Select topics like academic, exams, notices, etc.", go).replace('class="row', 'data-toast="Categories coming soon" class="row')}</div></div>
<div><div class="card" style="margin-bottom:16px"><div class="ch"><div><h2>Academic Information</h2><small style="color:var(--mut)">Your current academic details.</small></div></div><div class="card t b"><div class="kv" style="grid-template-columns:120px 1fr"><span>Program</span><b style="font-weight:400">${DB.program}</b><span>Batch</span><b style="font-weight:400">${S.batch}</b><span>Current Semester</span><b style="font-weight:400">Semester ${rom(S.sem)}</b><span>Roll Number</span><b style="font-weight:400">${S.roll}</b><span>Department</span><b style="font-weight:400">${DB.dept}</b></div></div></div>
<div class="card" style="margin-bottom:16px"><h2>Preferences</h2><small style="color:var(--mut)">Customize your portal experience.</small>${row("palette", "p", "Appearance", "Choose your theme preference", `<div class="seg" id="th">${["light", "dark", "system"].map((t) => `<button data-th="${t}" class="${T == t ? "on" : ""}">${t[0].toUpperCase() + t.slice(1)}</button>`).join("")}</div>`)}${row("globe", "g", "Language", "Select your preferred language", "<select><option>English</option><option>हिन्दी</option><option>मराठी</option></select>")}${row("acc", "o link", "Accessibility", "Adjust font size and display settings", go).replace('class="row', 'data-toast="Use browser zoom (Ctrl +) for now" class="row')}</div>
<div class="card"><h2>Other Settings</h2><small style="color:var(--mut)">Additional options and support.</small>${row("file", "b link", "Download Documents", "Access and download important documents", go).replace('class="row', 'data-toast="Documents will load from the server" class="row')}${row("info", "p link", "Help & Support", "FAQs, user guides and contact information", go).replace('class="row', 'data-toast="Help centre coming soon" class="row')}${row("out", "r link", "Logout", "Sign out from your account", go).replace('class="row', 'data-out class="row')}</div></div></div>`
    );
  },
};
function route() {
  $("#v").innerHTML = V.settings();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if ((x = q("[data-th]"))) {
    setTheme(x.dataset.th);
    $$("#th button").forEach((b) => b.classList.toggle("on", b == x));
  } else if ((x = q(".tg"))) x.classList.toggle("on");
  else if ((x = q("#ep"))) {
    const ed = x.dataset.ed != "1";
    x.dataset.ed = ed ? 1 : 0;
    if (ed) {
      $("#pe").innerHTML = `<input class="in" id="ie" value="${S.email}">`;
      $("#pm").innerHTML = `<input class="in" id="im" value="${S.mobile}">`;
      x.innerHTML = ic("check") + " Save Changes";
    } else {
      S.email = $("#ie").value;
      S.mobile = $("#im").value;
      route();
      toast("Profile updated");
      // CHANGED FOR BACKEND INTEGRATION: persist the edit server-side.
      fetch("api/profile.php", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: S.email, mobile: S.mobile }),
      }).then((r) => r.json()).then((d) => {
        if (!d.ok) toast(d.error || "Could not save profile changes");
      });
    }
  }
});
shell(PAGE);
route();
