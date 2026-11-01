/* Attendance page – same existing UI, populated from the live MySQL API. */
const PAGE = "attendance";
const col = (p) => (p >= 75 ? "g" : p >= 65 ? "o" : "r");

const V = {
  attendance(records, overall) {
    const a = records.map((r) => ({
      code: r.subject_code || "—",
      name: r.subject_name || "—",
      faculty: r.faculty || "—",
      n: Number(r.classes_conducted) || 0,
      a: Number(r.classes_attended) || 0,
      p: Number(r.percentage) || 0,
    }));
    const A = Number(overall.classes_attended) || 0;
    const T = Number(overall.classes_conducted) || 0;
    const o = Number(overall.percentage) || 0;
    const ok = a.filter((r) => r.p >= 75).length;
    return (
      hd(
        "Attendance",
        "Track your class attendance and ensure you meet the minimum requirements.",
        SEM + AY,
      ) +
      `
<div class="grid g4"><div class="card" style="display:flex;gap:18px;align-items:center"><div class="ring" style="--p:${o}"><span>${o}%</span></div><div style="flex:1"><h2 style="margin-bottom:8px">Overall Attendance</h2><div class="lg"><span>Classes Attended</span><b>${A}</b></div><div class="lg"><span>Total Classes</span><b>${T}</b></div></div></div>
<div class="card t ${o >= 75 ? "g" : "r"} sc" style="cursor:default"><div class="ib">${ic(o >= 75 ? "check" : "alert", "big")}</div><div class="fl"><small><b style="font-size:16px">${o >= 75 ? "You are on track" : "Attendance is low"}</b></small><span>Your overall attendance is ${o >= 75 ? "above" : "below"} the required 75%.</span></div></div>
<div class="card t o sc" style="cursor:default"><div class="ib">${ic("users", "big")}</div><div class="fl"><small><b style="font-size:16px">Subjects On Track</b></small><b>${ok} / ${a.length}</b><span>Subjects have attendance ≥ 75%.</span></div></div>
<div class="card t r sc" style="cursor:default"><div class="ib">${ic("alert", "big")}</div><div class="fl"><small><b style="font-size:16px">Subjects Below 75%</b></small><b>${a.length - ok} / ${a.length}</b><span>Please improve your attendance to avoid academic issues.</span></div></div></div>
<div class="card" style="margin-bottom:16px"><div class="ch"><h2>Subject-wise Attendance (Semester I)</h2><a data-toast="Detailed records coming soon">View Detailed Records ${ic("arrow")}</a></div><div class="tw"><table><thead><tr><th>No.</th><th>Subject Code</th><th>Subject Name</th><th>Faculty</th><th class="c">Classes Conducted</th><th class="c">Classes Attended</th><th>Attendance</th><th>Status</th></tr></thead><tbody>${a
        .map((r, i) => {
          const k = col(r.p);
          return `<tr><td>${i + 1}</td><td>${r.code}</td><td>${r.name}</td><td>${r.faculty}</td><td class="c">${r.n}</td><td class="c">${r.a}</td><td><div class="pc ${k}"><b>${r.p}%</b><div class="bar"><i style="width:${r.p}%"></i></div></div></td><td><span class="tag ${k}">${r.p >= 75 ? "On Track" : r.p >= 65 ? "Below 75%" : "Below 65%"}</span></td></tr>`;
        })
        .join("")}</tbody></table></div></div>
<div class="card"><div class="ch"><h2 style="display:flex;gap:10px;align-items:center"><span class="ib b" style="width:38px;height:38px">${ic("info")}</span>Attendance Policy & Guidelines</h2></div><div class="grid g4" style="margin:0">${[
        ["g", "check", "≥ 75%", "You are eligible to appear for the End Semester Examination."],
        ["o", "alert", "65% – 75%", "You need to visit the respective faculty to check what is the punishment (if applicable)."],
        ["r", "alert", "50% – 65%", "Fine of ₹2,000 per subject to be eligible to attend the End Semester Examination."],
        ["r", "x", "< 50%", "Fine of ₹5,000 per subject to be eligible to attend the End Semester Examination."],
      ]
        .map((p) => `<div class="card t ${p[0]} sc" style="cursor:default;align-items:flex-start"><div class="ib" style="width:42px;height:42px;border-radius:50%">${ic(p[1])}</div><div class="fl"><b style="font-size:19px">${p[2]}</b><span>${p[3]}</span></div></div>`)
        .join("")}</div></div>`
    );
  },
};

async function route() {
  const view = $("#v");
  view.innerHTML = '<div class="card">Loading attendance from the database…</div>';
  $("#sd").classList.remove("open");
  try {
    const response = await fetch("api/attendance.php", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok || !data.ok || !Array.isArray(data.records) || !data.overall) {
      throw new Error(data.error || "The attendance API returned an invalid response.");
    }
    view.innerHTML = V.attendance(data.records, data.overall);
  } catch (error) {
    console.error("Failed to load live attendance:", error);
    view.innerHTML = '<div class="card"><h2>Could not load attendance</h2><p>Please check your login and MySQL connection, then refresh this page.</p></div>';
  }
  scrollTo(0, 0);
}

shell(PAGE);
route();
