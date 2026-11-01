/**
 * SPIT Portal — Administrator Dashboard Logic
 * Connects administrator interface to MySQL endpoints:
 * - api/admin_students.php
 * - api/subjects.php
 * - api/save_marks.php
 * - api/admin_results.php
 * - api/logout.php
 */

(() => {
  const $ = (id) => document.getElementById(id);

  let studentsList = [];
  let subjectsList = [];
  let resultsList = [];

  // 1. Session verification & authentication guard
  async function checkAdminSession() {
    try {
      const res = await fetch("api/session.php", { cache: "no-store" });
      if (!res.ok) {
        location.replace("login.html");
        return false;
      }
      const data = await res.json();
      if (!data.ok || !data.logged_in || data.role !== "admin") {
        location.replace("login.html");
        return false;
      }
      return true;
    } catch (err) {
      location.replace("login.html");
      return false;
    }
  }

  // 2. Alert message helper
  function showAlert(msg, isSuccess = true) {
    const box = $("markAlert");
    if (!box) return;
    box.textContent = msg;
    box.className = "alert-box " + (isSuccess ? "success" : "error");
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function clearAlert() {
    const box = $("markAlert");
    if (!box) return;
    box.textContent = "";
    box.className = "alert-box";
  }

  // 3. Load students list
  async function loadStudents() {
    try {
      const res = await fetch("api/admin_students.php", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      studentsList = data.students || [];

      // Update dropdowns
      const sel = $("selStudent");
      const filter = $("filterStudent");
      sel.innerHTML = '<option value="">-- Select Student --</option>';
      filter.innerHTML = '<option value="0">All Students</option>';

      studentsList.forEach((st) => {
        const opt = document.createElement("option");
        opt.value = st.student_id;
        opt.textContent = `${st.roll_no} — ${st.full_name}`;
        sel.appendChild(opt);

        const fOpt = document.createElement("option");
        fOpt.value = st.student_id;
        fOpt.textContent = `${st.roll_no} — ${st.full_name}`;
        filter.appendChild(fOpt);
      });

      // Update table
      const tbody = $("studentsTableBody");
      tbody.innerHTML = studentsList.map((st) => `
        <tr>
          <td><b>${st.roll_no}</b></td>
          <td>${st.full_name}</td>
          <td>${st.email}</td>
          <td>${st.mobile || '—'}</td>
          <td>${st.batch}</td>
          <td>Semester ${st.semester}</td>
          <td>${st.program}</td>
          <td>${st.department}</td>
        </tr>
      `).join("");

      $("statTotalStudents").textContent = (data.total_count !== undefined) ? data.total_count : ((data.count !== undefined) ? data.count : studentsList.length);
      $("studentCountBadge").textContent = `${(data.total_count !== undefined) ? data.total_count : ((data.count !== undefined) ? data.count : studentsList.length)} Students`;
    } catch (err) {
      console.error("Failed loading students:", err);
    }
  }

  // 4. Load subjects list
  async function loadSubjects() {
    try {
      const res = await fetch("api/subjects.php", { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      subjectsList = data.subjects || [];

      // Update dropdowns
      const sel = $("selSubject");
      const filter = $("filterSubject");
      sel.innerHTML = '<option value="">-- Select Subject --</option>';
      filter.innerHTML = '<option value="0">All Subjects</option>';

      subjectsList.forEach((sub) => {
        const opt = document.createElement("option");
        opt.value = sub.subject_id;
        opt.textContent = `${sub.subject_code} — ${sub.subject_name} (${sub.type})`;
        sel.appendChild(opt);

        const fOpt = document.createElement("option");
        fOpt.value = sub.subject_id;
        fOpt.textContent = `${sub.subject_code} — ${sub.subject_name}`;
        filter.appendChild(fOpt);
      });

      // Update table
      const tbody = $("subjectsTableBody");
      tbody.innerHTML = subjectsList.map((sub) => `
        <tr>
          <td><b>${sub.subject_code}</b></td>
          <td>${sub.subject_name}</td>
          <td><span class="tag ${sub.type === 'Theory' ? 'b' : (sub.type === 'Lab' ? 'g' : 'r')}">${sub.type}</span></td>
          <td>${sub.credits}</td>
          <td>${sub.faculty}</td>
        </tr>
      `).join("");

      $("statTotalSubjects").textContent = subjectsList.length;
      $("subjectCountBadge").textContent = `${subjectsList.length} Subjects`;
    } catch (err) {
      console.error("Failed loading subjects:", err);
    }
  }

  // 5. Load recorded marks and results
  async function loadResults() {
    try {
      const studentId = $("filterStudent") ? $("filterStudent").value : 0;
      const subjectId = $("filterSubject") ? $("filterSubject").value : 0;

      let url = "api/admin_results.php?";
      if (studentId > 0) url += `student_id=${studentId}&`;
      if (subjectId > 0) url += `subject_id=${subjectId}&`;

      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error);

      resultsList = data.results || [];
      const tbody = $("resultsTableBody");

      if (resultsList.length === 0) {
        tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:24px;color:var(--mut)">No marks records found for this filter.</td></tr>';
      } else {
        tbody.innerHTML = resultsList.map((r, i) => {
          const isPassed = (r.status === 'Pass' || r.status === 'Passed');
          return `
            <tr>
              <td>${i + 1}</td>
              <td><b>${r.roll_no}</b><br><small style="color:var(--mut)">${r.full_name}</small></td>
              <td><b>${r.subject_code}</b></td>
              <td>${r.subject_name}</td>
              <td><span class="tag b">${r.exam_type}</span></td>
              <td class="c"><b>${r.marks_obtained}</b></td>
              <td class="c">${r.max_marks}</td>
              <td class="c"><b>${r.percentage}%</b></td>
              <td><span class="tag ${isPassed ? 'g' : 'r'}">${isPassed ? 'Passed' : 'Failed'}</span></td>
              <td><small style="color:var(--mut)">${r.updated_at || '—'}</small></td>
              <td class="c">
                <button type="button" class="btn-secondary edit-mark-btn"
                  data-sid="${r.student_id}"
                  data-subid="${r.subject_id}"
                  data-etype="${r.exam_type}"
                  data-max="${r.max_marks}"
                  data-obt="${r.marks_obtained}"
                  style="padding:4px 8px;font-size:12px">Edit</button>
              </td>
            </tr>
          `;
        }).join("");

        // Attach edit button listeners
        document.querySelectorAll(".edit-mark-btn").forEach((b) => {
          b.addEventListener("click", () => {
            $("selStudent").value = b.dataset.sid;
            $("selSubject").value = b.dataset.subid;
            $("selExamType").value = b.dataset.etype;
            $("inMaxMarks").value = b.dataset.max;
            $("inMarksObtained").value = b.dataset.obt;
            showAlert(`Loaded marks for editing: ${b.dataset.etype} (${b.dataset.obt}/${b.dataset.max}). Adjust values and click Save Marks to update.`, true);
            $("marks-section").scrollIntoView({ behavior: "smooth" });
          });
        });
      }

      $("statTotalMarks").textContent = data.count || resultsList.length;
      $("statPassRate").textContent = (data.summary ? data.summary.pass_percentage : 0) + "%";
    } catch (err) {
      console.error("Failed loading results:", err);
    }
  }

  // 6. Form submission: Save or update marks
  $("marksForm").onsubmit = async (e) => {
    e.preventDefault();
    clearAlert();

    const studentId = parseInt($("selStudent").value, 10);
    const subjectId = parseInt($("selSubject").value, 10);
    const examType  = $("selExamType").value.trim();
    const maxMarks  = parseFloat($("inMaxMarks").value);
    const marksObt  = parseFloat($("inMarksObtained").value);

    if (!studentId || !subjectId) {
      showAlert("Please select both a student and a subject.", false);
      return;
    }

    if (isNaN(marksObt) || marksObt < 0) {
      showAlert("Please enter a non-negative marks obtained score.", false);
      return;
    }

    if (isNaN(maxMarks) || maxMarks <= 0) {
      showAlert("Maximum marks must be greater than zero.", false);
      return;
    }

    if (marksObt > maxMarks) {
      showAlert(`Marks obtained (${marksObt}) cannot exceed maximum marks (${maxMarks}).`, false);
      return;
    }

    const saveBtn = $("btnSaveMarks");
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving to MySQL…";

    try {
      const res = await fetch("api/save_marks.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: studentId,
          subject_id: subjectId,
          exam_type: examType,
          marks_obtained: marksObt,
          max_marks: maxMarks
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        showAlert(data.error || "Failed to save marks.", false);
      } else {
        const actionVerb = (data.action === "updated") ? "updated" : "saved";
        showAlert(`Success! Marks ${actionVerb} for ${data.student.roll_no} (${data.subject.subject_code}): ${data.record.marks_obtained} / ${data.record.max_marks} (${data.record.percentage}% — ${data.record.status}).`, true);
        await loadResults();
      }
    } catch (err) {
      showAlert("Network error connecting to api/save_marks.php.", false);
    } finally {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M5 12l5 5 9-10"/></svg> Save Marks to MySQL';
    }
  };

  // 7. Exam type auto-adjusts max marks
  $("selExamType").onchange = (e) => {
    const val = e.target.value;
    if (val === "In-Sem") {
      $("inMaxMarks").value = 20;
    } else if (val === "Mid-Sem") {
      $("inMaxMarks").value = 30;
    } else if (val === "End-Sem" || val === "Total") {
      $("inMaxMarks").value = 100;
    }
  };

  // 8. Quick fill demo: 85 out of 100 for MC501
  $("btnDemo85").onclick = () => {
    // Find MCA26001
    const mca = studentsList.find((s) => s.roll_no === "MCA26001");
    if (mca) $("selStudent").value = mca.student_id;

    // Find MC501
    const mc501 = subjectsList.find((s) => s.subject_code === "MC501");
    if (mc501) $("selSubject").value = mc501.subject_id;

    $("selExamType").value = "End-Sem";
    $("inMaxMarks").value = 100;
    $("inMarksObtained").value = 85;

    showAlert("Filled mandatory demo scenario: Student MCA26001, MC501 (Data Structures), End-Sem, 85 / 100. Click 'Save Marks to MySQL' to persist.", true);
  };

  // 9. Reset form
  $("btnResetForm").onclick = () => {
    $("marksForm").reset();
    $("inMaxMarks").value = 100;
    clearAlert();
  };

  // 10. Filter handlers
  $("filterStudent").onchange = loadResults;
  $("filterSubject").onchange = loadResults;

  // 11. Burger sidebar toggle
  if ($("bg")) {
    $("bg").onclick = () => {
      $("sd").classList.toggle("open");
    };
  }

  // 12. Add Student Modal handlers
  const addModal = $("addStudentModal");
  const addForm  = $("addStudentForm");
  const addAlert = $("addStudentAlert");

  function showAddStudentAlert(msg, isSuccess = false) {
    if (!addAlert) return;
    addAlert.textContent = msg;
    addAlert.className = "alert-box " + (isSuccess ? "success" : "error");
  }

  function clearAddStudentAlert() {
    if (!addAlert) return;
    addAlert.textContent = "";
    addAlert.className = "alert-box";
  }

  function openAddStudentModal() {
    clearAddStudentAlert();
    if (addForm) {
      addForm.reset();
      $("newBatch").value = "2026 - 2028";
      $("newSemester").value = "1";
    }
    if (addModal) {
      addModal.classList.add("show");
      $("newRollNo").focus();
    }
  }

  function closeAddStudentModal() {
    if (addModal) {
      addModal.classList.remove("show");
    }
    clearAddStudentAlert();
    if (addForm) {
      addForm.reset();
    }
  }

  if ($("btnOpenAddStudent")) {
    $("btnOpenAddStudent").onclick = openAddStudentModal;
  }
  if ($("btnCloseAddStudentModal")) {
    $("btnCloseAddStudentModal").onclick = closeAddStudentModal;
  }
  if ($("btnCancelAddStudent")) {
    $("btnCancelAddStudent").onclick = closeAddStudentModal;
  }

  // Click outside to close modal
  if (addModal) {
    addModal.addEventListener("click", (e) => {
      if (e.target === addModal) {
        closeAddStudentModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && addModal && addModal.classList.contains("show")) {
      closeAddStudentModal();
    }
  });

  // Handle Add Student form submission
  if (addForm) {
    addForm.onsubmit = async (e) => {
      e.preventDefault();
      clearAddStudentAlert();

      const rollNo   = $("newRollNo").value.trim().toUpperCase();
      const fullName = $("newFullName").value.trim();
      const email    = $("newEmail").value.trim();
      const mobile   = $("newMobile").value.trim();
      const batch    = $("newBatch").value.trim() || "2026 - 2028";
      const semester = parseInt($("newSemester").value, 10) || 1;
      const password = $("newPassword").value;

      // Client validation
      if (!rollNo || !fullName || !email || !password) {
        showAddStudentAlert("Please fill in all required fields (*).", false);
        return;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAddStudentAlert("Please enter a valid email address.", false);
        return;
      }

      if (semester < 1 || semester > 8) {
        showAddStudentAlert("Semester must be between 1 and 8.", false);
        return;
      }

      const submitBtn = $("btnSubmitAddStudent");
      submitBtn.disabled = true;
      submitBtn.textContent = "Creating Student…";

      try {
        const res = await fetch("api/admin_students.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roll_no: rollNo,
            full_name: fullName,
            email: email,
            mobile: mobile,
            batch: batch,
            semester: semester,
            password: password
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.ok) {
          showAddStudentAlert(data.error || "Failed to create student account.", false);
        } else {
          // Success: close modal, display banner, refresh list and count
          closeAddStudentModal();
          showAlert(`Success! Student ${data.student.roll_no} (${data.student.full_name}) created successfully. Linked login account is active.`, true);
          await loadStudents();
        }
      } catch (err) {
        showAddStudentAlert("Network error connecting to api/admin_students.php.", false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<svg class="i" viewBox="0 0 24 24" style="width:16px;height:16px"><path d="M12 5v14M5 12h14"/></svg> Create Student';
      }
    };
  }

  // 13. Logout handler
  $("adminLogoutBtn").onclick = async () => {
    try {
      await fetch("api/logout.php", { method: "POST" });
    } catch (e) {}
    sessionStorage.clear();
    location.replace("login.html");
  };

  // 13. Initialization
  (async () => {
    const isAuthed = await checkAdminSession();
    if (isAuthed) {
      await Promise.all([loadStudents(), loadSubjects()]);
      await loadResults();
    }
  })();
})();
