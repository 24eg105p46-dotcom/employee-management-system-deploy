import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useInterval } from '../hooks/useInterval';
import { fmtDate } from '../utils';
import Avatar from '../components/Avatar.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import EmployeeFormModal from '../components/EmployeeFormModal.jsx';
import EmployeeDetailsModal from '../components/EmployeeDetailsModal.jsx';
import { useToast } from '../components/Toasts.jsx';

export default function Employees() {
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [form, setForm] = useState(null);       // { emp } when the add/edit dialog is open
  const [details, setDetails] = useState(null); // employee shown in the details dialog
  const [toDelete, setToDelete] = useState(null);

  const modalOpen = !!(form || details || toDelete);

  // Fetch employees (search aware) + departments
  const load = useCallback(async () => {
    try {
      const kw = keyword.trim();
      const [emps, depts] = await Promise.all([
        kw ? api.get(`/api/employees/search?keyword=${encodeURIComponent(kw)}`) : api.get('/api/employees'),
        api.get('/api/departments'),
      ]);
      setEmployees(emps);
      setDepartments(depts);
      setLoaded(true);
    } catch (err) {
      if (!err.network) toast(err.message, 'error');
    }
  }, [keyword, toast]);

  // Search as you type (300 ms debounce; the first load is immediate)
  const firstRun = useRef(true);
  useEffect(() => {
    const delay = firstRun.current ? 0 : 300;
    firstRun.current = false;
    const t = setTimeout(load, delay);
    return () => clearTimeout(t);
  }, [load]);

  // Live refresh, paused while a dialog is open so typing is never interrupted
  useInterval(load, 10000, modalOpen);

  async function showDetails(id) {
    try {
      setDetails(await api.get(`/api/employees/${id}`));
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  // Arriving from the dashboard / departments page
  useEffect(() => {
    const st = location.state;
    if (!st) return;
    if (st.openNew) setForm({ emp: null });
    if (st.viewId) showDetails(st.viewId);
    if (st.dept) setDeptFilter(String(st.dept));
    navigate(location.pathname, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function confirmDelete() {
    try {
      await api.del(`/api/employees/${toDelete.id}`);
      toast(`${toDelete.firstName} ${toDelete.lastName} deleted`);
      setToDelete(null);
      load();
    } catch (err) {
      setToDelete(null);
      toast(err.message, 'error');
    }
  }

  const list = employees.filter(
    (e) =>
      (!deptFilter || (e.department && String(e.department.id) === deptFilter)) &&
      (!statusFilter || e.status === statusFilter)
  );
  const filtered = keyword || deptFilter || statusFilter;

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Employees</h1>
          <p className="text-muted mb-0">
            {loaded ? `${list.length} ${list.length === 1 ? 'employee' : 'employees'}${filtered ? ' found' : ' in total'}` : '\u00a0'}
          </p>
        </div>
        <button className="btn btn-accent" onClick={() => setForm({ emp: null })}>
          <i className="bi bi-person-plus me-1" /> Add employee
        </button>
      </div>

      <div className="panel p-0">
        <div className="toolbar">
          <div className="search-box">
            <i className="bi bi-search" />
            <input type="search" className="form-control" value={keyword}
                   placeholder="Search by name, email, job title or department"
                   aria-label="Search employees" onChange={(e) => setKeyword(e.target.value)} />
          </div>
          <select className="form-select" value={deptFilter} aria-label="Filter by department"
                  onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All departments</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select className="form-select" value={statusFilter} aria-label="Filter by status"
                  onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">Any status</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_LEAVE">On leave</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0 emp-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th className="d-none d-md-table-cell">Department</th>
                <th className="d-none d-lg-table-cell">Job title</th>
                <th>Status</th>
                <th className="d-none d-xl-table-cell">Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((e) => (
                <tr key={e.id}>
                  <td>
                    <div className="emp-cell">
                      <Avatar emp={e} />
                      <div>
                        <div className="n">{e.firstName} {e.lastName}</div>
                        <div className="e">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="d-none d-md-table-cell">
                    {e.department ? e.department.name : <span className="text-muted">—</span>}
                  </td>
                  <td className="d-none d-lg-table-cell">{e.jobTitle}</td>
                  <td><StatusBadge status={e.status} /></td>
                  <td className="d-none d-xl-table-cell">{fmtDate(e.hireDate)}</td>
                  <td className="text-end row-actions">
                    <button className="icon-btn" title="View details" aria-label={`View ${e.firstName}`}
                            onClick={() => showDetails(e.id)}><i className="bi bi-eye" /></button>
                    <button className="icon-btn" title="Edit" aria-label={`Edit ${e.firstName}`}
                            onClick={() => setForm({ emp: e })}><i className="bi bi-pencil" /></button>
                    <button className="icon-btn danger" title="Delete" aria-label={`Delete ${e.firstName}`}
                            onClick={() => setToDelete(e)}><i className="bi bi-trash3" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loaded && list.length === 0 && (
          <div className="empty">
            <i className="bi bi-person-x" />
            <div className="fw-semibold">No employees match</div>
            <div className="text-muted small">Try a different search or clear the filters.</div>
          </div>
        )}
      </div>

      {form && (
        <EmployeeFormModal
          emp={form.emp}
          departments={departments}
          onHide={() => setForm(null)}
          onSaved={() => { setForm(null); load(); }}
        />
      )}

      {details && (
        <EmployeeDetailsModal
          emp={details}
          onHide={() => setDetails(null)}
          onEdit={() => { setForm({ emp: details }); setDetails(null); }}
        />
      )}

      <ConfirmModal
        show={!!toDelete}
        title={toDelete ? `Delete ${toDelete.firstName} ${toDelete.lastName}?` : ''}
        text="This removes the employee record permanently."
        onConfirm={confirmDelete}
        onHide={() => setToDelete(null)}
      />
    </section>
  );
}
