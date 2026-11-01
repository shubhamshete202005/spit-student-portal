/* Exams & Results page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "exams";
let ET = "marks",
  CM = [2026, 10];
const V = {
  exams() {
    const m = S.mid;
    return (
      hd(
        "Exams & Results",
        "Check your exam schedule, view marks and track your performance.",
        SEM + AY,
      ) +
      `
<div class="grid g3"><div class="card t r sc" style="cursor:default"><div class="ib">${ic("file", "big")}</div><div class="fl"><small><b style="font-size:16px">In-Semester Evaluation</b></small><span>Based on assignments, quizzes and other class components.</span></div></div>
<div class="card t b sc" style="cursor:default"><div class="ib">${ic("pen", "big")}</div><div class="fl"><small><b style="font-size:16px">Mid-Semester Examination</b></small><b style="font-size:17px">15 Nov – 18 Nov 2026</b><span>As per the academic calendar.</span></div></div>
<div class="card t g sc" style="cursor:default"><div class="ib">${ic("file", "big")}</div><div class="fl"><small><b style="font-size:16px">End-Semester Examination</b></small><b style="font-size:17px">22 Dec 2026 – 27 Dec 2026</b><span>As per the academic calendar.</span></div></div></div>
<div class="tabs" style="max-width:520px">${[
        ["marks", "Marks Overview"],
        ["detailed", "Detailed Results"],
        ["sched", "Exam Schedule"],
      ]
        .map(
          (t) =>
            `<button data-et="${t[0]}" class="${ET == t[0] ? "on" : ""}">${t[1]}</button>`,
        )
        .join("")}</div>
<div class="grid g2"><div class="card">${
        ET == "marks"
          ? `<h2 style="margin-bottom:14px">Semester I - Marks (Provisional)</h2><div class="tw"><table><thead><tr><th>No.</th><th>Subject Code</th><th>Subject Name</th><th class="c">In-Sem (20)</th><th class="c">Mid-Sem (30)</th><th class="c">End-Sem (50/100)</th><th class="c">Total</th><th>Status</th></tr></thead><tbody>${C.map((c, i) => {
              const inVal = S.inSem[i] ?? "-";
              const midVal = (m && m[i] !== undefined && m[i] !== null) ? m[i] : "-";
              const endVal = (S.endSem && S.endSem[i] !== undefined && S.endSem[i] !== null) ? S.endSem[i] : "-";
              const totVal = (S.total && S.total[i] !== undefined && S.total[i] !== null) ? S.total[i] : (endVal !== "-" && inVal !== "-" && midVal !== "-" ? (Number(inVal) + Number(midVal) + Number(endVal)) : (endVal !== "-" ? endVal : "-"));
              const isPass = (totVal !== "-" && Number(totVal) >= 40);
              const isFail = (totVal !== "-" && Number(totVal) < 40);
              const statusBadge = isPass ? '<span class="tag g">Passed</span>' : (isFail ? '<span class="tag r">Failed</span>' : '<span class="tag b">In Progress</span>');
              return `<tr><td>${i + 1}</td><td>${c[0]}</td><td>${c[1]}</td><td class="c">${inVal}</td><td class="c">${midVal}</td><td class="c"><b>${endVal}</b></td><td class="c"><b>${totVal}</b></td><td>${statusBadge}</td></tr>`;
            }).join("")}</tbody></table></div><div class="note">${ic("info")}<div><b style="color:var(--tx)">Note:</b><ul style="columns:1"><li>In-Semester marks are based on assignments, quizzes and other class components.</li><li>Mid-Semester Examination: 15 Nov 2026 – 18 Nov 2026.</li><li>End-Semester Examination: 22 Dec 2026 – 27 Dec 2026.</li><li>Marks shown are provisional and subject to change.</li><li>Passing threshold: Minimum 40% required.</li></ul></div></div>`
          : (ET == "detailed"
              ? `<h2 style="margin-bottom:14px">Official Exam Results & Performance</h2><div class="tw"><table><thead><tr><th>Subject Code</th><th>Subject Name</th><th>Exam Component</th><th class="c">Marks Obtained</th><th class="c">Max Marks</th><th class="c">Percentage</th><th>Status</th></tr></thead><tbody>${(S.results && S.results.length > 0) ? S.results.map(r => {
                  const isPass = (r.status === 'Pass' || r.status === 'Passed' || r.percentage >= 40);
                  return `<tr><td><b>${r.subject_code}</b></td><td>${r.subject_name}</td><td><span class="tag b">${r.exam_type}</span></td><td class="c"><b>${r.marks_obtained}</b></td><td class="c">${r.max_marks}</td><td class="c"><b>${r.percentage}%</b></td><td><span class="tag ${isPass ? 'g' : 'r'}">${isPass ? 'Passed' : 'Failed'}</span></td></tr>`;
                }).join("") : '<tr><td colspan="7" style="text-align:center;padding:18px;color:var(--mut)">No detailed exam results recorded yet.</td></tr>'}</tbody></table></div><div class="note">${ic("info")}<div><b style="color:var(--tx)">Official Rule:</b> Evaluation verified by SPIT Examination Controller. Passing threshold: &ge; 40%.</div></div>`
              : `<h2 style="margin-bottom:14px">Mid-Semester Exam Schedule</h2><div class="tw"><table><thead><tr><th>Date</th><th>Subject</th><th>Time</th><th>Venue</th></tr></thead><tbody>${DB.exams.map((e) => `<tr><td>${fd(e[0])}</td><td>${e[1]} – ${e[2]}</td><td>${e[3]}</td><td>${e[4]}</td></tr>`).join("")}</tbody></table></div>`
            )
      }</div>
<div><div class="card" style="margin-bottom:16px"><div class="ch"><h2>Exam Calendar (AY 2026 - 27)</h2></div><div id="cal"></div></div>
<div class="card"><h2 style="margin-bottom:12px">Quick Links</h2><div class="grid g11" style="margin:0">${[
        ["b", "file", "View Exam Schedule", "sched"],
        ["g", "chart", "View Detailed Results", "detailed"],
        ["p", "chart", "Performance Analytics", ""],
        ["o", "file", "Download Grade Card", ""],
      ]
        .map(
          (q) =>
            `<div class="card t ${q[0]} sc" ${q[3] ? `data-et2="${q[3]}"` : 'data-toast="Available after results are published"'} style="padding:14px"><div class="ib" style="width:42px;height:42px">${ic(q[1])}</div><div class="fl"><b style="font-size:14px;font-weight:500">${q[2]}</b></div></div>`,
        )
        .join("")}</div></div></div></div>`
    );
  },
};
function drawCal() {
  const [y, m] = CM,
    f = new Date(y, m, 1).getDay(),
    n = new Date(y, m + 1, 0).getDate();
  $("#cal").innerHTML =
    `<div class="cn"><button data-cm="-1">${ic("left")}</button>${new Date(y, m).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}<button data-cm="1">${ic("chev2")}</button></div><div class="cal">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<span class="h">${d}</span>`).join("")}${"<span></span>".repeat(f)}${Array.from(
      { length: n },
      (_, i) => {
        const d = i + 1,
          x = y == 2026 && m == 10 && d >= 15 && d <= 18;
        return `<span class="${x ? "x" : ""}">${d}</span>`;
      },
    ).join(
      "",
    )}</div><div style="margin-top:12px;color:var(--mut);font-size:13px;display:grid;gap:6px"><span><i class="tag b" style="padding:0 6px">&nbsp;</i> Mid-Sem Exams · 15 – 18 Nov 2026</span><span><i class="tag g" style="padding:0 6px">&nbsp;</i> End-Sem Exams · 22 – 27 Dec 2026</span></div>`;
}
function route() {
  $("#v").innerHTML = V.exams();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
  drawCal();
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if ((x = q("[data-et]"))) {
    ET = x.dataset.et;
    route();
  } else if ((x = q("[data-et2]"))) {
    ET = x.dataset.et2;
    route();
  } else if ((x = q("[data-cm]"))) {
    CM[1] += +x.dataset.cm;
    if (CM[1] > 11) {
      CM = [CM[0] + 1, 0];
    }
    if (CM[1] < 0) {
      CM = [CM[0] - 1, 11];
    }
    drawCal();
  }
});
shell(PAGE);
route();
