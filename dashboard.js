/* Dashboard page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "dashboard";
/* stat card helper (dashboard only) */
const sc = (c, i, l, v, s, go) =>
  `<div class="card t ${c} sc" data-go="${go}"><div class="ib">${ic(i, "big")}</div><div class="fl"><small>${l}</small><b>${v}</b><span>${s}</span></div><span class="go">${ic("arrow")}</span></div>`;
const V = {
  dashboard() {
    const a = att(),
      A = a.reduce((x, y) => x + y.a, 0),
      T = a.reduce((x, y) => x + y.n, 0);
    return `<div class="hd"><div><h1>Welcome back, ${S.name.split(" ")[0]}!</h1><p class="sub">Here’s a quick overview of your academic journey.</p></div><div class="sel">${SEM}${AY}</div></div>
<div class="grid g3">${sc("b", "book", "Current Semester", "Semester " + rom(S.sem), "MCA (" + S.batch.replace(/ /g, "") + ")", "academics")}${sc("g", "chart", "Attendance", pct(A, T) + "%", "Classes Attended: " + A + " / " + T, "attendance")}${sc("p", "trend", "CGPA", S.cgpa, "(Available after Semester I)", "exams")}</div>
<div class="card" style="margin-bottom:16px"><div class="ch"><h2>Quick Access</h2><a data-go="academics">View All ${ic("arrow")}</a></div><div class="grid g5 qa" style="margin:0">${[
      ["b", "cal", "View<br>Timetable", ""],
      ["r", "book", "Subject<br>Details", "academics"],
      ["g", "chart", "Attendance<br>Details", "attendance"],
      ["p", "file", "Exams &<br>Results", "exams"],
      ["o", "bell", "Notices", "notices"],
    ]
      .map(
        (q) =>
          `<a class="${q[0]}" ${q[3] ? `data-go="${q[3]}"` : 'data-toast="Timetable will be published soon"'}>${ic(q[1], "big")}<div><span>${q[2]}</span><span class="go">${ic("arrow")}</span></div></a>`,
      )
      .join("")}</div></div>
<div class="grid g11"><div class="card"><div class="ch"><h2>Upcoming (Next 7 Days)</h2><a data-go="exams">View All ${ic("arrow")}</a></div>${DB.upcoming.map((u) => `<div class="row"><div class="dt"><b>${fd(u[0], { day: "2-digit" })}</b>${fd(u[0], { month: "short" }).toUpperCase()}</div><div class="f"><b>${u[1]}</b><small>${u[2]}</small></div><div style="text-align:right"><span class="tag ${u[5]}">${u[3]}</span><br><small>${u[4]}</small></div></div>`).join("")}</div>
<div class="card"><div class="ch"><h2>Recent Notices</h2><a data-go="notices">View All ${ic("arrow")}</a></div>${DB.notices
      .slice(0, 3)
      .map((n, i) => noticeRow(n, i))
      .join("")}</div></div>`;
  },
};
function route() {
  $("#v").innerHTML = V.dashboard();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
}
shell(PAGE);
route();
