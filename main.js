/* SPIT Student Portal – common JS: session guard, helpers, shell (sidebar + top bar), theme, shared handlers.
   Loaded after data.js on every portal page (everything except login). */
const U = sessionStorage.getItem("spit_uid"),
  S = STUDENTS[U];
if (!S) location.replace("login.html");
const $ = (s, e = document) => e.querySelector(s),
  $$ = (s, e = document) => [...e.querySelectorAll(s)];
const C = DB.courses,
  rom = (n) => ["", "I", "II", "III", "IV"][n],
  pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);
const fd = (d, o = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(d).toLocaleDateString("en-GB", o);
const cond = (c) => (c[2] == "Lab" ? 24 : 36),
  ini = S.name
    .split(" ")
    .map((x) => x[0])
    .join("");
const av = () => (S.photo ? `<img src="${S.photo}" alt="">` : ini);
const CAT = {
  Academic: ["grad", "p"],
  Examination: ["file", "r"],
  Event: ["cal", "g"],
  Placement: ["brief", "o"],
  Holiday: ["cal", "o"],
  Other: ["info", "b"],
};
const NAV = [
  ["dashboard", "Dashboard", "home"],
  ["academics", "Academics", "book"],
  ["attendance", "Attendance", "cal"],
  ["assignments", "Assignments", "file"],
  ["exams", "Exams & Results", "file"],
  ["notices", "Notices", "bell"],
  ["settings", "Settings", "gear"],
];
/* page file names (one HTML file per page) */
const ROUTES = {
  dashboard: "dashboard.html",
  academics: "academics.html",
  attendance: "attendance.html",
  assignments: "assignments.html",
  exams: "exams-results.html",
  notices: "notices.html",
  settings: "settings.html",
};
const N = { cat: "All", q: "" };
const att = () =>
  C.map((c, i) => {
    const n = cond(c),
      a = S.att[i];
    return { c, n, a, p: pct(a, n) };
  });
const hd = (t, s, r = "") =>
  `<div class="bc">${ic("home")}${ic("chev2")}${t}</div><div class="hd"><div><h1>${t}</h1><p class="sub">${s}</p></div><div class="sel">${r}</div></div>`;
const sel = (a, i = 0) =>
  `<select>${a.map((x, j) => `<option${j == i ? " selected" : ""}>${x}</option>`).join("")}</select>`;
const SEM = sel(["Semester I", "Semester II", "Semester III", "Semester IV"]),
  AY = sel(["AY 2026-27", "AY 2027-28"]);
const toast = (m) => {
  const t = $("#ts");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(t.h);
  t.h = setTimeout(() => t.classList.remove("show"), 2200);
};
const modal = (h) => {
  $("#md").innerHTML = `<div>${h}</div>`;
  $("#md").classList.add("show");
};
const noticeRow = (n, i) => {
  const [k, c] = CAT[n[2]];
  return `<div class="row link" data-n="${i}"><span class="ni ${c}">${ic(n[2] == "Event" ? "mega" : k)}</span><div class="f"><b>${n[0]}</b><small>${n[1]}</small></div><span class="tag ${c}">${n[2]}</span><small style="min-width:80px;text-align:right">${fd(n[3])}</small></div>`;
};
function shell(page) {
  const th = localStorage.spit_theme || "light";
  setTheme(th);
  $("#app").innerHTML =
    `<aside class="side" id="sd"><div class="brand">${LOGO}<div><b>SPIT</b><small>Student Portal</small></div></div><nav class="nav">${NAV.map((n) => `<a href="${ROUTES[n[0]]}" data-r="${n[0]}"${n[0] == page ? ' class="on"' : ""}>${ic(n[2])}${n[1]}</a>`).join("")}</nav><div class="sart">${bldg(false)}</div><div class="sfoot">SARDAR PATEL<br>INSTITUTE OF TECHNOLOGY</div></aside>
<div class="main"><header class="top"><button class="burger" id="bg" aria-label="Menu">${ic("menu")}</button><div class="search">${ic("search")}<input id="gs" placeholder="Search for subjects, notices, etc..."></div><button class="bell" id="bl" aria-label="Notifications">${ic("bell")}<u></u></button>
<div class="user" id="us"><div class="av">${av()}</div><div><b>${S.name}</b><small>MCA (${S.batch.replace(/ /g, "")})</small></div>${ic("chev")}<div class="menu" id="mn"><a data-go="settings">${ic("user")}Profile</a><a data-out>${ic("out")}Logout</a></div></div></header><main class="pg" id="v"></main></div><div class="md" id="md"></div><div class="toast" id="ts"></div>`;
}
function setTheme(t) {
  localStorage.spit_theme = t;
  document.documentElement.dataset.theme =
    t == "system"
      ? matchMedia("(prefers-color-scheme:dark)").matches
        ? "dark"
        : "light"
      : t;
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if (!q("#us")) $("#mn").classList.remove("show");
  if (q("[data-out]")) {
    // CHANGED FOR BACKEND INTEGRATION: also end the server session, not
    // just the client-side flag, so the session can't be reused.
    fetch("api/logout.php", { method: "POST" }).finally(() => {
      sessionStorage.removeItem("spit_uid");
      location.replace("login.html");
    });
  } else if ((x = q("[data-go]"))) {
    location.href = ROUTES[x.dataset.go];
  } else if ((x = q("[data-toast]"))) {
    toast(x.dataset.toast);
  } else if (q("#bg")) $("#sd").classList.toggle("open");
  else if (q("#us")) $("#mn").classList.toggle("show");
  else if (q("#bl")) {
    $("#bl u").remove();
    location.href = ROUTES.notices;
  } else if ((x = q("[data-n]"))) {
    const n = DB.notices[x.dataset.n],
      c = CAT[n[2]][1];
    modal(
      `<div class="ch"><span class="tag ${c}">${n[2]}</span><button class="bell" data-x>${ic("x")}</button></div><h2>${n[0]}</h2><small style="color:var(--mut)">${fd(n[3])}</small><p style="margin-top:14px;line-height:1.7">${n[1]}</p>`,
    );
  } else if (q("[data-x]") || t.id == "md") $("#md").classList.remove("show");
});
document.addEventListener("keydown", (e) => {
  if (e.target.id == "gs" && e.key == "Enter") {
    N.q = e.target.value;
    N.cat = "All";
    PAGE == "notices"
      ? route()
      : (location.href = ROUTES.notices + "?q=" + encodeURIComponent(N.q));
    e.target.value = "";
  }
  if (e.key == "Escape") $("#md").classList.remove("show");
});
