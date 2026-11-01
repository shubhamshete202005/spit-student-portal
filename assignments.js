/* Assignments page – view + page logic (shared helpers/shell are in main.js) */
const PAGE = "assignments";
let AS = "ongoing";
const V = {
  assignments() {
    return (
      hd(
        "Assignments",
        "View and submit your assignments for each subject.",
        SEM,
      ) +
      `<div class="tabs" style="max-width:520px">${[
        ["ongoing", "Ongoing"],
        ["submitted", "Submitted"],
        ["all", "All"],
      ]
        .map(
          (t) =>
            `<button data-at="${t[0]}" class="${AS == t[0] ? "on" : ""}">${t[1]}</button>`,
        )
        .join("")}</div><div class="grid g3" id="al"></div>`
    );
  },
};
function assignList() {
  const l = C.filter(
    (c) =>
      c[12] && (AS == "all" || (AS == "ongoing" ? c[11] < c[12] : c[11] > 0)),
  );
  $("#al").innerHTML = l.length
    ? l
        .map(
          (
            c,
          ) => `<div class="card as ${c[17]}"><div class="top2"><span class="ib" style="width:64px;height:64px">${ic(c[16], "big")}</span><div class="f"><small>${c[0]}</small><br><b style="font-size:16px">${c[1]}</b><br><small>${c[10]}</small></div><div style="text-align:right"><b style="font-size:18px">${c[11]} / ${c[12]}</b><br><small>Submitted</small></div></div>
<div class="nd"><span class="ib" style="--c:#5d6b8a;width:44px;height:44px">${ic("file")}</span><div><small>Next Due</small><br><b>${c[13]}</b><br><small>${c[14]}</small></div><div class="due">${ic("cal")}<div>${fd(c[15])}<br>11:59 PM</div></div></div><button class="btn" data-as="${c[0]}">View Assignments ${ic("arrow")}</button></div>`,
        )
        .join("")
    : `<div class="card empty" style="grid-column:1/-1">Nothing here yet.</div>`;
}
function openAssign(code) {
  const c = C.find((x) => x[0] == code);
  modal(
    `<div class="ch"><h2>${c[1]} – Assignments</h2><button class="bell" data-x>${ic("x")}</button></div>${Array.from(
      { length: c[12] },
      (_, i) => {
        const d = i < c[11];
        return `<div class="row"><span class="ib ${d ? "g" : "o"}" style="width:40px;height:40px">${ic(d ? "check" : "file")}</span><div class="f"><b>Assignment ${i + 1}</b><small>${d ? "Submitted" : "Pending"}</small></div>${d ? '<span class="tag g">Submitted</span>' : `<button class="btn pr sm" data-sub="${code}">Submit</button>`}</div>`;
      },
    ).join("")}`,
  );
}
function route() {
  $("#v").innerHTML = V.assignments();
  $("#sd").classList.remove("open");
  scrollTo(0, 0);
  assignList();
}
document.addEventListener("click", (e) => {
  const t = e.target,
    q = (s) => t.closest(s);
  let x;
  if ((x = q("[data-at]"))) {
    AS = x.dataset.at;
    $$("[data-at]").forEach((b) => b.classList.toggle("on", b == x));
    assignList();
  } else if ((x = q("[data-as]"))) openAssign(x.dataset.as);
  else if ((x = q("[data-sub]"))) {
    const c = C.find((y) => y[0] == x.dataset.sub);
    c[11]++;
    openAssign(c[0]);
    toast("Assignment marked as submitted");
    assignList();
    // CHANGED FOR BACKEND INTEGRATION: persist the submission server-side.
    fetch("api/assignment_submit.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subjectCode: c[0] }),
    }).then((r) => r.json()).then((d) => {
      if (!d.ok) toast(d.error || "Could not save submission");
    });
  }
});
shell(PAGE);
route();
