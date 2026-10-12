import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { api } from '../api';
import { useToast } from './Toasts.jsx';

export default function DepartmentFormModal({ dept, onHide, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState({
    name: dept?.name ?? '',
    location: dept?.location ?? '',
    description: dept?.description ?? '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setV((old) => ({ ...old, [name]: value }));
  const cls = (name) => `form-control ${errors[name] ? 'is-invalid' : ''}`;

  async function handleSubmit(ev) {
    ev.preventDefault();
    setServerError('');
    if (!v.name.trim()) {
      setErrors({ name: 'Enter a department name.' });
      return;
    }
    setErrors({});
    const payload = {
      name: v.name.trim(),
      location: v.location.trim() || null,
      description: v.description.trim() || null,
    };
    setSaving(true);
    try {
      if (dept) await api.put(`/api/departments/${dept.id}`, payload);
      else await api.post('/api/departments', payload);
      toast(dept ? 'Department updated' : `${payload.name} added`);
      onSaved();
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) setErrors(err.errors);
      else setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show onHide={onHide} centered>
      <form onSubmit={handleSubmit} noValidate>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="fs-5">{dept ? 'Edit department' : 'Add department'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          <div className="mb-3">
            <label className="form-label" htmlFor="deptName">Name</label>
            <input id="deptName" className={cls('name')} value={v.name} maxLength={100}
                   onChange={(e) => set('name', e.target.value)} />
            <div className="invalid-feedback">{errors.name}</div>
          </div>
          <div className="mb-3">
            <label className="form-label" htmlFor="deptLocation">
              Location <span className="text-muted fw-normal">(optional)</span>
            </label>
            <input id="deptLocation" className={cls('location')} value={v.location} maxLength={100}
                   onChange={(e) => set('location', e.target.value)} />
            <div className="invalid-feedback">{errors.location}</div>
          </div>
          <div>
            <label className="form-label" htmlFor="deptDescription">
              Description <span className="text-muted fw-normal">(optional)</span>
            </label>
            <textarea id="deptDescription" rows={2} className={cls('description')} value={v.description} maxLength={255}
                      onChange={(e) => set('description', e.target.value)} />
            <div className="invalid-feedback">{errors.description}</div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onHide}>Cancel</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>Save department</button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
