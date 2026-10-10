/* People Desk - Employee Management System front end
   Talks to the Spring Boot REST API at /api/... */
(() => {
  'use strict';

  const REFRESH_MS = 10000; // live refresh interval

  // ---------- tiny helpers ----------
  const $ = (id) => document.getElementById(id);
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const money = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  const STATUS = { ACTIVE: 'Active', ON_LEAVE: 'On leave', INACTIVE: 'Inactive' };
  const STATUS_COLOR = { ACTIVE: 'var(--moss)', ON_LEAVE: 'var(--saffron)', INACTIVE: 'var(--brick)' };
  const AVATAR_COLORS = ['#0d7c7a', '#3b6fb0', '#8a5fb5', '#c0643a', '#4f8a3f', '#b0486b', '#5b6b8c', '#a07a1c'];

  function parseDate(s) { // 'YYYY-MM-DD' -> local Date (avoids timezone shifts)
    if (!s) return null;
    const [y, m, d] = s.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  const fmtDate = (s) => { const d = parseDate(s); return d ? d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'; };
  function tenure(s) {
    const d = parseDate(s); if (!d) return '—';
    let months = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
    if (new Date().getDate() < d.getDate()) months--;
    if (months < 1) return 'Less than a month';
    const y = Math.floor(months / 12), m = months % 12;
    return [y ? `${y} yr${y > 1 ? 's' : ''}` : '', m ? `${m} mo` : ''].filter(Boolean).join(' ');
  }
  function relDate(s) {
    const d = parseDate(s); if (!d) return '';
    const days = Math.round((new Date().setHours(0, 0, 0, 0) - d) / 86400000);
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 31) return `${days} days ago`;
    return fmtDate(s);
  }
  const initials = (e) => ((e.firstName || '?')[0] + (e.lastName || '')[0]).toUpperCase();
  const avatarColor = (e) => AVATAR_COLORS[((e.id || 0) + (e.firstName || '').length) % AVATAR_COLORS.length];
  const avatar = (e, cls = '') => `<span class="avatar ${cls}" style="background:${avatarColor(e)}">${esc(initials(e))}</span>`;
  const statusBadge = (s) => `<span class="status-badge status-${esc(s)}">${esc(STATUS[s] || s)}</span>`;
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  // ---------- REST client ----------
  async function request(method, url, body) {
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: body ? { 'Content-Type': 'application/json' } : {},
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e) {
      throw { message: 'Cannot reach the server. Check that the application is running.', network: true };
    }
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw { message: data.message || `Request failed (${res.status})`, errors: data.errors, status: res.status };
    return data;
  }
  const api = {
    get: (u) => request('GET', u),
    post: (u, b) => request('POST', u, b),
    put: (u, b) => request('PUT', u, b),
    del: (u) => request('DELETE', u),
  };

  // ---------- UI feedback ----------
  function toast(message, type = 'success') {
    const el = document.createElement('div');
    const color = type === 'success' ? 'text-bg-success' : 'text-bg-danger';
    el.className = `toast align-items-center border-0 ${color}`;
    el.setAttribute('role', 'status');
    el.innerHTML = `<div class="d-flex"><div class="toast-body">${esc(message)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>`;
    $('toasts').appendChild(el);
    const t = new bootstrap.Toast(el, { delay: 3500 });
    el.addEventListener('hidden.bs.toast', () => el.remove());
    t.show();
  }

  const modal = (id) => bootstrap.Modal.getOrCreateInstance($(id));
  const anyModalOpen = () => !!document.querySelector('.modal.show');

  function confirmDelete(title, text, onOk) {
    $('confirmTitle').textContent = title;
    $('confirmText').textContent = text;
    const btn = $('confirmOkBtn');
    const fresh = btn.cloneNode(true); // drop old listeners
    btn.replaceWith(fresh);
    fresh.addEventListener('click', async () => {
      fresh.disabled = true;
      try { await onOk(); modal('confirmModal').hide(); }
      catch (e) { modal('confirmModal').hide(); toast(e.message, 'error'); }
      finally { fresh.disabled = false; }
    });
    modal('confirmModal').show();
  }

  function clearErrors(form) {
    form.classList.remove('was-validated');
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
  }
  function showServerErrors(form, errBox, err) {
    errBox.classList.add('d-none');
    const fields = err.errors || {};
    let shown = false;
    for (const [name, msg] of Object.entries(fields)) {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) continue;
      input.classList.add('is-invalid');
      const fb = input.parentElement.querySelector('.invalid-feedback');
      if (fb) fb.textContent = msg;
      shown = true;
    }
    if (!shown) { errBox.textContent = err.message; errBox.classList.remove('d-none'); }
  }

  // ---------- state ----------
  const state = {
    view: 'dashboard',
    employees: [],
    departments: [],
    keyword: '',
    deptFilter: '',
    statusFilter: '',
    lastSync: null,
    online: true,
  };

  // ---------- navigation ----------
  function showView(name) {
    if (!['dashboard', 'employees', 'departments'].includes(name)) name = 'dashboard';
    state.view = name;
    document.querySelectorAll('.view').forEach((v) => v.classList.toggle('d-none', v.id !== `view-${name}`));
    document.querySelectorAll('#mainNav .nav-link').forEach((a) => a.classList.toggle('active', a.dataset.view === name));
    const drawer = bootstrap.Offcanvas.getInstance($('sidebar'));
    if (drawer) drawer.hide();
    refresh();
  }
  window.addEventListener('hashchange', () => showView(location.hash.slice(1)));

  // ---------- data loading ----------
  async function loadDepartments() {
    state.departments = await api.get('/api/departments');
    // fill selects, keeping current choices
    const keepFilter = $('filterDept').value;
    $('filterDept').innerHTML = '<option value="">All departments</option>' +
      state.departments.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    $('filterDept').value = state.departments.some((d) => String(d.id) === keepFilter) ? keepFilter : '';
    state.deptFilter = $('filterDept').value;
    const keepForm = $('departmentId').value;
    $('departmentId').innerHTML = '<option value="">No department</option>' +
      state.departments.map((d) => `<option value="${d.id}">${esc(d.name)}</option>`).join('');
    $('departmentId').value = keepForm;
  }

  async function loadEmployees() {
    const kw = state.keyword.trim();
    state.employees = kw ? await api.get('/api/employees/search?keyword=' + encodeURIComponent(kw)) : await api.get('/api/employees');
  }

  async function refresh() {
    try {
      if (state.view === 'dashboard') {
        const stats = await api.get('/api/dashboard/stats');
        renderDashboard(stats);
      } else if (state.view === 'employees') {
        await Promise.all([loadDepartments(), loadEmployees()]);
        renderEmployees();
      } else {
        await loadDepartments();
        renderDepartments();
      }
      setOnline(true);
    } catch (e) {
      setOnline(false);
      if (!e.network) toast(e.message, 'error');
    }
  }

  function setOnline(ok) {
    state.online = ok;
    if (ok) state.lastSync = Date.now();
    paintLive();
  }
  function paintLive() {
    const pill = $('livePill');
    pill.classList.toggle('offline', !state.online);
    if (!state.online) { $('liveText').textContent = 'Offline – retrying'; return; }
    if (!state.lastSync) { $('liveText').textContent = 'Connecting…'; return; }
    const s = Math.max(0, Math.round((Date.now() - state.lastSync) / 1000));
    $('liveText').textContent = s < 3 ? 'Live · just now' : `Live · updated ${s}s ago`;
  }

  // ---------- DASHBOARD ----------
  function renderDashboard(s) {
    $('statTotal').textContent = s.totalEmployees;
    $('statDepts').textContent = s.totalDepartments;
    $('statAvg').textContent = money(s.averageSalary);

    const total = s.totalEmployees || 1;
    const parts = [
      ['ACTIVE', s.activeEmployees], ['ON_LEAVE', s.onLeaveEmployees], ['INACTIVE', s.inactiveEmployees],
    ];
    $('statusBar').innerHTML = parts.map(([k, n]) => `<span style="width:${(n / total) * 100}%;background:${STATUS_COLOR[k]}"></span>`).join('');
    $('statusLegend').innerHTML = parts.map(([k, n]) =>
      `<li><span class="swatch" style="background:${STATUS_COLOR[k]}"></span>${STATUS[k]} <strong>${n}</strong></li>`).join('');

    const rows = s.employeesByDepartment || [];
    const max = Math.max(1, ...rows.map((r) => r.count));
    $('deptBars').innerHTML = rows.length
      ? rows.map((r) => `<div class="dept-row"><div class="name" title="${esc(r.department)}">${esc(r.department)}</div>
          <div class="track"><div class="fill" style="width:${(r.count / max) * 100}%"></div></div>
          <div class="num">${r.count}</div></div>`).join('')
      : '<div class="text-muted">No departments yet.</div>';

    const recent = s.recentHires || [];
    $('recentHires').innerHTML = recent.length
      ? recent.map((e) => `<li data-id="${e.id}" tabindex="0">${avatar(e)}
          <div class="who"><div class="n">${esc(e.firstName)} ${esc(e.lastName)}</div>
          <div class="t">${esc(e.jobTitle)}${e.department ? ' · ' + esc(e.department.name) : ''}</div></div>
          <div class="when">${esc(relDate(e.hireDate))}</div></li>`).join('')
      : '<li class="text-muted">No employees yet.</li>';
  }

  // ---------- EMPLOYEES ----------
  function visibleEmployees() {
    return state.employees.filter((e) =>
      (!state.deptFilter || (e.department && String(e.department.id) === state.deptFilter)) &&
      (!state.statusFilter || e.status === state.statusFilter));
  }

  function renderEmployees() {
    const list = visibleEmployees();
    $('empCountText').textContent = `${list.length} ${list.length === 1 ? 'employee' : 'employees'}` +
      (state.keyword || state.deptFilter || state.statusFilter ? ' found' : ' in total');
    $('empEmpty').classList.toggle('d-none', list.length > 0);
    $('empBody').innerHTML = list.map((e) => `
      <tr data-id="${e.id}">
        <td><div class="emp-cell">${avatar(e)}<div><div class="n">${esc(e.firstName)} ${esc(e.lastName)}</div><div class="e">${esc(e.email)}</div></div></div></td>
        <td class="d-none d-md-table-cell">${e.department ? esc(e.department.name) : '<span class="text-muted">—</span>'}</td>
        <td class="d-none d-lg-table-cell">${esc(e.jobTitle)}</td>
        <td>${statusBadge(e.status)}</td>
        <td class="d-none d-xl-table-cell">${esc(fmtDate(e.hireDate))}</td>
        <td class="text-end row-actions">
          <button class="icon-btn" data-act="view" title="View details" aria-label="View ${esc(e.firstName)}"><i class="bi bi-eye"></i></button>
          <button class="icon-btn" data-act="edit" title="Edit" aria-label="Edit ${esc(e.firstName)}"><i class="bi bi-pencil"></i></button>
          <button class="icon-btn danger" data-act="delete" title="Delete" aria-label="Delete ${esc(e.firstName)}"><i class="bi bi-trash3"></i></button>
        </td>
      </tr>`).join('');
  }

  function openEmployeeForm(emp) {
    const form = $('employeeForm');
    form.reset(); clearErrors(form);
    $('employeeFormError').classList.add('d-none');
    $('employeeModalTitle').textContent = emp ? 'Edit employee' : 'Add employee';
    $('employeeSaveBtn').textContent = emp ? 'Save changes' : 'Add employee';
    $('empId').value = emp ? emp.id : '';
    if (emp) {
      ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'salary', 'hireDate', 'status', 'address']
        .forEach((f) => { $(f).value = emp[f] ?? ''; });
      $('departmentId').value = emp.department ? emp.department.id : '';
    } else {
      $('hireDate').value = new Date().toISOString().slice(0, 10);
      $('status').value = 'ACTIVE';
    }
    modal('employeeModal').show();
  }

  async function ensureDepartmentsLoaded() {
    if (!state.departments.length) { try { await loadDepartments(); } catch (_) { /* shown elsewhere */ } }
  }

  async function showDetails(id) {
    try {
      const e = await api.get('/api/employees/' + id);
      $('detailsBody').innerHTML = `
        <div class="detail-head">${avatar(e, 'lg')}
          <div><h3>${esc(e.firstName)} ${esc(e.lastName)}</h3>
          <div class="text-muted mb-1">${esc(e.jobTitle)}</div>${statusBadge(e.status)}</div></div>
        <dl class="detail-grid mb-0">
          <div><dt>Employee ID</dt><dd>#${e.id}</dd></div>
          <div><dt>Department</dt><dd>${e.department ? esc(e.department.name) : '—'}</dd></div>
          <div><dt>Email</dt><dd><a href="mailto:${esc(e.email)}">${esc(e.email)}</a></dd></div>
          <div><dt>Phone</dt><dd>${e.phone ? esc(e.phone) : '—'}</dd></div>
          <div><dt>Annual salary</dt><dd>${esc(money(e.salary))}</dd></div>
          <div><dt>Joined</dt><dd>${esc(fmtDate(e.hireDate))}</dd></div>
          <div><dt>Time with company</dt><dd>${esc(tenure(e.hireDate))}</dd></div>
          <div><dt>Office</dt><dd>${e.department && e.department.location ? esc(e.department.location) : '—'}</dd></div>
          <div class="full"><dt>Address</dt><dd>${e.address ? esc(e.address) : '—'}</dd></div>
        </dl>`;
      $('detailsEditBtn').onclick = async () => {
        await ensureDepartmentsLoaded();
        $('detailsModal').addEventListener('hidden.bs.modal', () => openEmployeeForm(e), { once: true });
        modal('detailsModal').hide();
      };
      modal('detailsModal').show();
    } catch (err) { toast(err.message, 'error'); }
  }

  // ---------- DEPARTMENTS ----------
  function renderDepartments() {
    $('deptEmpty').classList.toggle('d-none', state.departments.length > 0);
    $('deptGrid').innerHTML = state.departments.map((d) => `
      <div class="col-12 col-md-6 col-xl-4" data-id="${d.id}">
        <div class="panel dept-card">
          <div class="top">
            <div><h2>${esc(d.name)}</h2><div class="loc"><i class="bi bi-geo-alt"></i> ${d.location ? esc(d.location) : 'No location set'}</div></div>
            <div class="text-nowrap">
              <button class="icon-btn" data-act="edit" title="Edit department" aria-label="Edit ${esc(d.name)}"><i class="bi bi-pencil"></i></button>
              <button class="icon-btn danger" data-act="delete" title="Delete department" aria-label="Delete ${esc(d.name)}"><i class="bi bi-trash3"></i></button>
            </div>
          </div>
          <div class="desc">${d.description ? esc(d.description) : 'No description yet.'}</div>
          <div class="foot">
            <span class="count-chip">${d.employeeCount} ${d.employeeCount === 1 ? 'employee' : 'employees'}</span>
            <button class="btn btn-sm btn-outline-accent" data-act="members">View team</button>
          </div>
        </div>
      </div>`).join('');
  }

  function openDeptForm(dept) {
    const form = $('deptForm');
    form.reset(); clearErrors(form);
    $('deptFormError').classList.add('d-none');
    $('deptModalTitle').textContent = dept ? 'Edit department' : 'Add department';
    $('deptId').value = dept ? dept.id : '';
    $('deptName').value = dept ? dept.name : '';
    $('deptLocation').value = dept ? dept.location ?? '' : '';
    $('deptDescription').value = dept ? dept.description ?? '' : '';
    modal('deptModal').show();
  }

  // ---------- event wiring ----------
  function wire() {
    $('addEmployeeBtn').addEventListener('click', async () => { await ensureDepartmentsLoaded(); openEmployeeForm(null); });
    $('dashAddBtn').addEventListener('click', async () => {
      await ensureDepartmentsLoaded();
      openEmployeeForm(null);
    });
    $('addDeptBtn').addEventListener('click', () => openDeptForm(null));

    // search + filters
    $('searchInput').addEventListener('input', debounce(async (ev) => {
      state.keyword = ev.target.value;
      try { await loadEmployees(); renderEmployees(); } catch (e) { toast(e.message, 'error'); }
    }, 300));
    $('filterDept').addEventListener('change', (ev) => { state.deptFilter = ev.target.value; renderEmployees(); });
    $('filterStatus').addEventListener('change', (ev) => { state.statusFilter = ev.target.value; renderEmployees(); });

    // employee table actions
    $('empBody').addEventListener('click', async (ev) => {
      const btn = ev.target.closest('button[data-act]'); if (!btn) return;
      const id = Number(btn.closest('tr').dataset.id);
      const emp = state.employees.find((e) => e.id === id);
      if (btn.dataset.act === 'view') showDetails(id);
      if (btn.dataset.act === 'edit') { await ensureDepartmentsLoaded(); openEmployeeForm(emp); }
      if (btn.dataset.act === 'delete') {
        confirmDelete(`Delete ${emp.firstName} ${emp.lastName}?`, 'This removes the employee record permanently.', async () => {
          await api.del('/api/employees/' + id);
          toast(`${emp.firstName} ${emp.lastName} deleted`);
          await loadEmployees(); renderEmployees();
        });
      }
    });

    // dashboard recent hires -> details
    $('recentHires').addEventListener('click', (ev) => { const li = ev.target.closest('li[data-id]'); if (li) showDetails(li.dataset.id); });
    $('recentHires').addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { const li = ev.target.closest('li[data-id]'); if (li) showDetails(li.dataset.id); } });

    // department card actions
    $('deptGrid').addEventListener('click', (ev) => {
      const btn = ev.target.closest('[data-act]'); if (!btn) return;
      const id = Number(btn.closest('[data-id]').dataset.id);
      const dept = state.departments.find((d) => d.id === id);
      if (btn.dataset.act === 'edit') openDeptForm(dept);
      if (btn.dataset.act === 'members') {
        state.deptFilter = String(id); $('filterDept').value = String(id);
        state.statusFilter = ''; $('filterStatus').value = '';
        state.keyword = ''; $('searchInput').value = '';
        location.hash = '#employees';
      }
      if (btn.dataset.act === 'delete') {
        confirmDelete(`Delete ${dept.name}?`, 'Departments that still have employees cannot be deleted.', async () => {
          await api.del('/api/departments/' + id);
          toast(`${dept.name} deleted`);
          await loadDepartments(); renderDepartments();
        });
      }
    });

    // employee form submit (create or update)
    $('employeeForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const form = ev.target;
      form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      form.classList.remove('was-validated');
      const id = $('empId').value;
      const deptId = $('departmentId').value;
      const payload = {
        firstName: $('firstName').value.trim(),
        lastName: $('lastName').value.trim(),
        email: $('email').value.trim(),
        phone: $('phone').value.trim() || null,
        jobTitle: $('jobTitle').value.trim(),
        salary: Number($('salary').value),
        hireDate: $('hireDate').value,
        status: $('status').value,
        address: $('address').value.trim() || null,
        department: deptId ? { id: Number(deptId) } : null,
      };
      const btn = $('employeeSaveBtn'); btn.disabled = true;
      try {
        if (id) await api.put('/api/employees/' + id, payload); else await api.post('/api/employees', payload);
        modal('employeeModal').hide();
        toast(id ? 'Changes saved' : `${payload.firstName} ${payload.lastName} added`);
        refresh();
      } catch (e) {
        showServerErrors(form, $('employeeFormError'), e);
      } finally { btn.disabled = false; }
    });

    // department form submit
    $('deptForm').addEventListener('submit', async (ev) => {
      ev.preventDefault();
      const form = ev.target;
      form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
      if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
      form.classList.remove('was-validated');
      const id = $('deptId').value;
      const payload = {
        name: $('deptName').value.trim(),
        location: $('deptLocation').value.trim() || null,
        description: $('deptDescription').value.trim() || null,
      };
      const btn = $('deptSaveBtn'); btn.disabled = true;
      try {
        if (id) await api.put('/api/departments/' + id, payload); else await api.post('/api/departments', payload);
        modal('deptModal').hide();
        toast(id ? 'Department updated' : `${payload.name} added`);
        refresh();
      } catch (e) {
        showServerErrors(form, $('deptFormError'), e);
      } finally { btn.disabled = false; }
    });
  }

  // ---------- boot ----------
  wire();
  showView(location.hash.slice(1) || 'dashboard');

  // Live updates: poll the API, but never while someone is typing in a dialog.
  setInterval(() => { if (!document.hidden && !anyModalOpen()) refresh(); }, REFRESH_MS);
  setInterval(paintLive, 1000);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
})();
