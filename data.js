/* SPIT Student Portal — Data Bootstrap & Shared Icons
 * Dynamically populated from MySQL via api/bootstrap.php for the authenticated student.
 */

// Presentation icons map (verbatim from original frontend)
const P = {
  home: "M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z",
  book: "M2 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H2zM22 4h-7a3 3 0 0 0-3 3v14a2 2 0 0 1 2-2h8z",
  cal: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  file: "M6 2h9l5 5v15H6zM14 2v6h6M9 13h8M9 17h8",
  bell: "M6 16v-5a6 6 0 0 1 12 0v5l2 2H4zM10 21h4",
  gear: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12l2-1-2-4-2 1-2-1-1-2H9L8 7 6 8 4 7l-2 4 2 1v2l-2 1 2 4 2-1 2 1 1 2h4l1-2 2-1 2 1 2-4-2-1z",
  search: "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-5-5",
  arrow: "M5 12h14M13 6l6 6-6 6",
  chart: "M5 21V10M12 21V3M19 21v-7",
  trend: "M3 17l6-6 4 4 8-8",
  flask: "M9 3h6M10 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-6-10V3",
  grad: "M2 9l10-5 10 5-10 5zM6 11v5c3 3 9 3 12 0v-5",
  check: "M5 12l5 5 9-10",
  alert: "M12 8v5M12 17h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  users:
    "M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a6 6 0 0 1 3 6",
  shield: "M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  out: "M9 21H4V3h5M16 17l5-5-5-5M21 12H9",
  globe:
    "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  db: "M4 6c0-2 16-2 16 0v12c0 2-16 2-16 0zM4 12c0 2 16 2 16 0",
  code: "M8 7l-5 5 5 5M16 7l5 5-5 5",
  menu: "M3 6h18M3 12h18M3 18h18",
  chev: "M6 9l6 6 6-6",
  chev2: "M9 6l6 6-6 6",
  left: "M15 6l-6 6 6 6",
  brief: "M3 7h18v13H3zM9 7V4h6v3",
  pen: "M4 20l4-1 11-11-3-3L5 16zM14 6l3 3",
  mega: "M3 11v3l12 5V6zM15 9a3 3 0 0 1 0 6M6 14l1 6h3l-1-5",
  info: "M12 11v5M12 8h.01M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z",
  x: "M6 6l12 12M18 6L6 18",
  pi: "M5 7h14M9 7v12M15 7v10a2 2 0 0 0 2 2",
  cam: "M4 8h4l2-3h4l2 3h4v12H4zM12 17a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  dl: "M12 4v12M7 11l5 5 5-5M5 20h14",
  monitor: "M3 4h18v12H3zM8 21h8M12 16v5",
  acc: "M12 5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 8l7 1 7-1M12 9v6l-3 6M12 15l3 6",
  palette:
    "M12 3a9 9 0 1 0 0 18c2 0 2-2 1-3s0-3 2-3h3a3 3 0 0 0 3-3c0-5-4-9-9-9z",
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  phone: "M7 3h10v18H7zM11 18h2",
};

const ic = (n, c = "") =>
  `<svg class="i ${c}" viewBox="0 0 24 24"><path d="${P[n]}"/></svg>`;

const LOGO = `<svg viewBox="0 0 48 48" width="44" height="44" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M24 3v5M21 8h6l2 5H19zM13 13h22v6H13zM10 19h28M12 22v16M18 22v16M24 22v16M30 22v16M36 22v16M8 38h32M5 42h38"/></svg>`;

function bldg(bg = true) {
  let w = "";
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 9; c++)
      w += `<rect x="${58 + c * 24}" y="${142 + r * 27}" width="12" height="15"/>`;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b2f78"/><stop offset="1" stop-color="#7fb2f0"/></linearGradient></defs>${bg ? '<rect width="400" height="300" fill="url(#sk)"/>' : ""}<g fill="${bg ? "#ece8df" : "none"}" stroke="${bg ? "none" : "#8fb0ee"}"><rect x="260" y="70" width="70" height="180"/><rect x="40" y="130" width="290" height="120"/></g><g fill="${bg ? "#6f8db8" : "none"}" stroke="${bg ? "none" : "#8fb0ee"}">${w}</g><text x="295" y="105" fill="#1a3a8a" font-size="16" font-weight="800" transform="rotate(-8 295 105)" text-anchor="middle">SPIT</text>${bg ? '<g fill="#2f7a3a"><circle cx="120" cy="215" r="26"/><circle cx="190" cy="205" r="30"/><circle cx="30" cy="190" r="34"/></g><rect y="250" width="400" height="50" fill="#1d4a2a"/>' : ""}</svg>`;
}

// Global data objects dynamically loaded from MySQL
var STUDENTS = window.STUDENTS || {};
var DB = window.DB || { courses: [], upcoming: [], exams: [], notices: [] };

// If not yet initialized by api/bootstrap.php, fetch synchronously
if (typeof STUDENTS === "undefined" || !STUDENTS || Object.keys(STUDENTS).length === 0) {
  try {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "api/bootstrap.php", false); // Synchronous fetch ensures main.js has globals ready
    xhr.send(null);
    if (xhr.status === 200) {
      new Function(xhr.responseText)();
      if (window.STUDENTS) STUDENTS = window.STUDENTS;
      if (window.DB) DB = window.DB;
    } else if (xhr.status === 401) {
      sessionStorage.removeItem("spit_uid");
      if (!location.pathname.endsWith("login.html")) {
        location.replace("login.html");
      }
    }
  } catch (err) {
    console.error("Error loading bootstrap data from server:", err);
  }
}
