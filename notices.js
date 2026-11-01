/* Notices page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "notices";
N.q =
  new URLSearchParams(location.search).get("q") ||
  ""; /* set when the top-bar search is used on another page */
const V = {
  notices() {
    return (
      hd(
        "Notices",
        "Stay updated with the latest announcements, events and important information.",
        sel(["All Semesters", "Semester I"]),
      ) +
      `<div class="chips" id="ch">${["All Notices", ...Object.keys(CAT)]
        .map((k) => {
          const c = k == "All Notices" ? "b" : CAT[k][1];
          return `<button class="${c}" data-cat="${k.replace(" Notices", "")}">${ic(k == "All Notices" ? "menu" : CAT[k][0])}${k == "Examination" ? "Examinations" : k == "Placement" ? "Placements" : k == "Holiday" ? "Holidays" : k}</button>`;
        })
        .join("")}</div>
<div class="grid g2"><div class="card"><div class="ch"><h2>Latest Notices</h2><div class="search" style="max-width:260px">${ic("search")}<input id="nq" placeholder="Search notices..." value="${N.q}"></div></div><div id="nl"></div></div>
<div><div class="card" style="margin-bottom:16px"><h2 style="margin-bottom:12px">Important Updates</h2><div class="card t r" style="margin-bottom:12px"><b style="color:var(--tx)">Mid-Sem Exams</b><br><b>15 Nov 2026 – 18 Nov 2026</b><br><small>Check your exam schedule and hall allocation.</small></div><div class="card t g"><b style="color:var(--tx)">End-Sem Exams</b><br><b>22 Dec 2026 – 27 Dec 2026</b><br><small>Detailed timetable will be released soon.</small></div></div>
<div class="card"><h2 style="margin-bottom:8px">Quick Filters</h2>${Object.keys(
        CAT,
      )
        .map(
          (k) =>
            `<div class="row link ${CAT[k][1]}" data-cat="${k}"><span class="ib" style="width:36px;height:36px">${ic(CAT[k][0])}</span><div class="f"><b style="font-weight:500">${k} Notices</b></div>${ic("arrow")}</div>`,
        )
        .join("")}</div></div></div>`
    );
  },
};
function noticesList() {
  const q = N.q.toLowerCase(),
    l = DB.notices
      .map((n, i) => [n, i])
      .filter(
        ([n]) =>
          (N.cat == "All" || n[2] == N.cat) &&
          (n[0] + n[1]).toLowerCase().includes(q),
      );
  $("#nl").innerHTML = l.length
    ? l.map(([n, i]) => noticeRow(n, i)).join("")
    : `<div class="empty">No notices match. Try another category or search term.</div>`;
  $$("#ch button").forEach((b) =>
    b.classList.toggle("on", b.dataset.cat == N.cat),
  );
}
function route() {
  $("#v").innerHTML = V.notices();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
  noticesList();
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if ((x = q("[data-cat]"))) {
    N.cat = x.dataset.cat;
    noticesList();
  }
});
document.addEventListener("input", (e) => {
  if (e.target.id == "nq") {
    N.q = e.target.value;
    noticesList();
  }
});
shell(PAGE);
route();
