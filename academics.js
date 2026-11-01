/* Academics page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "academics";
let ST = 1;
const V = {
  academics() {
    const sem = ST == 1,
      th = C.filter((c) => c[2] == "Theory"),
      lb = C.filter((c) => c[2] == "Lab"),
      nc = C.filter((c) => c[2] == "Non-Credit");
    const sum = (a) => a.reduce((x, c) => x + (+c[9] || 0), 0),
      tc = sum(th),
      lc = sum(lb),
      t = DB.semCredits;
    const stat = (c, i, l, v) =>
      `<div class="card t ${c} sc" style="cursor:default"><div class="ib">${ic(i)}</div><div class="fl"><small>${l}</small><b>${v}</b></div></div>`;
    return (
      hd(
        "Academics",
        "Explore your course structure, subjects and credits for your MCA program.",
        sel(["Session 2026 - 2028"]),
      ) +
      `<div class="tabs">${["I", "II", "III", "IV"].map((r, i) => `<button data-st="${i + 1}" class="${ST == i + 1 ? "on" : ""}">Semester ${r}</button>`).join("")}</div>` +
      (sem
        ? `
<div class="grid g5">${stat("b", "book", "Total Subjects", C.length)}${stat("g", "db", "Total Credits", t)}${stat("p", "grad", "Theory Subjects", th.length)}${stat("o", "flask", "Lab Subjects", lb.length)}${stat("r", "file", "Non-Credit Subject", nc.length)}</div>
<div class="grid g2"><div><div class="card"><h2 style="margin-bottom:14px">Semester I - Course Details</h2><div class="tw"><table><thead><tr><th rowspan=2>No.</th><th rowspan=2>Course Code</th><th rowspan=2>Course Name</th><th rowspan=2>Type</th><th class="c" colspan=3>Teaching Scheme</th><th class="c" colspan=3>Evaluation Scheme</th><th rowspan=2 class="c">Credits</th></tr><tr><th class="c">L</th><th class="c">T</th><th class="c">P</th><th class="c">SE</th><th class="c">TE</th><th class="c">C</th></tr></thead><tbody>${C.map(
            (c, i) =>
              `<tr><td>${i + 1}</td><td>${c[0]}</td><td>${c[1]}</td><td><span class="tag ${c[2] == "Theory" ? "b" : c[2] == "Lab" ? "g" : "r"}">${c[2]}</span></td>${c
                .slice(3, 10)
                .map((x) => `<td class="c">${x}</td>`)
                .join("")}</tr>`,
          ).join("")}</tbody></table></div>
<div class="note">${ic("info")}<div><b style="color:var(--tx)">Note:</b><ul><li>L: Lecture Hours per week</li><li>T: Tutorial Hours per week</li><li>P: Practical Hours per week</li><li>SE: Semester End Examination Marks</li><li>TE: Term End Examination Marks</li><li>C: Continuous Assessment Marks</li></ul></div></div></div></div>
<div><div class="card" style="margin-bottom:16px"><h2>Credit Summary</h2><div style="display:grid;place-items:center;margin:16px 0"><div class="ring" style="--p:100;background:conic-gradient(#1a6cff 0 ${(tc / t) * 100}%,#10a972 0 ${((tc + lc) / t) * 100}%,#ef4444 0)"><span>${t}<br><small style="font-size:13px;font-weight:400;color:var(--mut)">Credits</small></span></div></div>
<div class="lg"><span><i style="background:#1a6cff"></i>Theory Subjects</span><b>${tc}</b></div><div class="lg"><span><i style="background:#10a972"></i>Lab Subjects</span><b>${lc}</b></div><div class="lg"><span><i style="background:#ef4444"></i>Non-Credit</span><b>${nc.length}</b></div></div>
<div class="card"><h2 style="margin-bottom:8px">Quick Links</h2>${[
            ["cal", "b", "View Timetable", ""],
            ["file", "p", "View Assignments", "assignments"],
            ["file", "r", "View Exam Schedule", "exams"],
            ["bell", "o", "View Notices", "notices"],
          ]
            .map(
              (q) =>
                `<div class="row link ${q[1]}" ${q[3] ? `data-go="${q[3]}"` : 'data-toast="Timetable will be published soon"'}><span class="ib" style="width:36px;height:36px">${ic(q[0])}</span><div class="f"><b style="font-weight:500;color:var(--tx)">${q[2]}</b></div>${ic("arrow")}</div>`,
            )
            .join("")}</div></div></div>`
        : `<div class="card empty">${ic("book", "big")}<h2 style="margin:10px 0 6px;color:var(--tx)">Semester ${rom(ST)} courses aren’t available yet</h2>Course details appear here once the semester starts.</div>`)
    );
  },
};
function route() {
  $("#v").innerHTML = V.academics();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if ((x = q("[data-st]"))) {
    ST = +x.dataset.st;
    route();
  }
});
shell(PAGE);
route();
