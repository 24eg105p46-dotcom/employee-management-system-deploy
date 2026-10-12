import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useInterval } from '../hooks/useInterval';
import ConfirmModal from '../components/ConfirmModal.jsx';
import DepartmentFormModal from '../components/DepartmentFormModal.jsx';
import { useToast } from '../components/Toasts.jsx';

export default function Departments() {
  const toast = useToast();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(null);       // { dept } when the dialog is open
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    try {
      setDepartments(await api.get('/api/departments'));
      setLoaded(true);
    } catch (err) {
      if (!err.network) toast(err.message, 'error');
    }
  }, [toast]);

  useEffect(() => { load(); }, [load]);
  useInterval(load, 10000, !!(form || toDelete));

  async function confirmDelete() {
    try {
      await api.del(`/api/departments/${toDelete.id}`);
      toast(`${toDelete.name} deleted`);
      setToDelete(null);
      load();
    } catch (err) {
      setToDelete(null);
      toast(err.message, 'error'); // e.g. department still has employees
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Departments</h1>
          <p className="text-muted mb-0">Organise your teams and see who sits where.</p>
        </div>
        <button className="btn btn-accent" onClick={() => setForm({ dept: null })}>
          <i className="bi bi-plus-lg me-1" /> Add department
        </button>
      </div>

      <div className="row g-3">
        {departments.map((d) => (
          <div className="col-12 col-md-6 col-xl-4" key={d.id}>
            <div className="panel dept-card">
              <div className="top">
                <div>
                  <h2>{d.name}</h2>
                  <div className="loc"><i className="bi bi-geo-alt" /> {d.location || 'No location set'}</div>
                </div>
                <div className="text-nowrap">
                  <button className="icon-btn" title="Edit department" aria-label={`Edit ${d.name}`}
                          onClick={() => setForm({ dept: d })}><i className="bi bi-pencil" /></button>
                  <button className="icon-btn danger" title="Delete department" aria-label={`Delete ${d.name}`}
                          onClick={() => setToDelete(d)}><i className="bi bi-trash3" /></button>
                </div>
              </div>
              <div className="desc">{d.description || 'No description yet.'}</div>
              <div className="foot">
                <span className="count-chip">
                  {d.employeeCount} {d.employeeCount === 1 ? 'employee' : 'employees'}
                </span>
                <button className="btn btn-sm btn-outline-accent"
                        onClick={() => navigate('/employees', { state: { dept: d.id } })}>View team</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {loaded && departments.length === 0 && (
        <div className="panel empty">
          <i className="bi bi-diagram-3" />
          <div className="fw-semibold">No departments yet</div>
          <div className="text-muted small">Create one to start assigning employees.</div>
        </div>
      )}

      {form && (
        <DepartmentFormModal
          dept={form.dept}
          onHide={() => setForm(null)}
          onSaved={() => { setForm(null); load(); }}
        />
      )}

      <ConfirmModal
        show={!!toDelete}
        title={toDelete ? `Delete ${toDelete.name}?` : ''}
        text="Departments that still have employees cannot be deleted."
        onConfirm={confirmDelete}
        onHide={() => setToDelete(null)}
      />
    </section>
  );
}
