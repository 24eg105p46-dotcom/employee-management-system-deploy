import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { api } from '../api';
import { useToast } from './Toasts.jsx';

const today = () => new Date().toISOString().slice(0, 10);

const EMPTY = {
  firstName: '', lastName: '', email: '', phone: '', jobTitle: '',
  departmentId: '', salary: '', hireDate: today(), status: 'ACTIVE', address: '',
};

const fromEmployee = (e) => ({
  firstName: e.firstName ?? '',
  lastName: e.lastName ?? '',
  email: e.email ?? '',
  phone: e.phone ?? '',
  jobTitle: e.jobTitle ?? '',
  departmentId: e.department ? String(e.department.id) : '',
  salary: e.salary ?? '',
  hireDate: e.hireDate ?? '',
  status: e.status ?? 'ACTIVE',
  address: e.address ?? '',
});

function validate(v) {
  const errors = {};
  if (!v.firstName.trim()) errors.firstName = 'Enter a first name.';
  if (!v.lastName.trim()) errors.lastName = 'Enter a last name.';
  if (!/^\S+@\S+\.\S+$/.test(v.email.trim())) errors.email = 'Enter a valid email address.';
  if (!v.jobTitle.trim()) errors.jobTitle = 'Enter a job title.';
  if (v.salary === '' || Number(v.salary) < 0) errors.salary = 'Enter a salary of 0 or more.';
  if (!v.hireDate) errors.hireDate = 'Pick the hire date.';
  return errors;
}

export default function EmployeeFormModal({ emp, departments, onHide, onSaved }) {
  const toast = useToast();
  const [v, setV] = useState(emp ? fromEmployee(emp) : EMPTY);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setV((old) => ({ ...old, [name]: value }));
  const cls = (name, base = 'form-control') => `${base} ${errors[name] ? 'is-invalid' : ''}`;

  async function handleSubmit(ev) {
    ev.preventDefault();
    setServerError('');
    const found = validate(v);
    setErrors(found);
    if (Object.keys(found).length) return;

    const payload = {
      firstName: v.firstName.trim(),
      lastName: v.lastName.trim(),
      email: v.email.trim(),
      phone: v.phone.trim() || null,
      jobTitle: v.jobTitle.trim(),
      salary: Number(v.salary),
      hireDate: v.hireDate,
      status: v.status,
      address: v.address.trim() || null,
      department: v.departmentId ? { id: Number(v.departmentId) } : null,
    };

    setSaving(true);
    try {
      if (emp) await api.put(`/api/employees/${emp.id}`, payload);
      else await api.post('/api/employees', payload);
      toast(emp ? 'Changes saved' : `${payload.firstName} ${payload.lastName} added`);
      onSaved();
    } catch (err) {
      if (err.errors && Object.keys(err.errors).length) setErrors(err.errors);
      else setServerError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal show onHide={onHide} size="lg" scrollable fullscreen="sm-down">
      <form onSubmit={handleSubmit} noValidate className="d-flex flex-column" style={{ minHeight: 0, flex: 1 }}>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="fs-5">{emp ? 'Edit employee' : 'Add employee'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {serverError && <div className="alert alert-danger">{serverError}</div>}
          <div className="row g-3">
            <div className="col-sm-6">
              <label className="form-label" htmlFor="firstName">First name</label>
              <input id="firstName" className={cls('firstName')} value={v.firstName} maxLength={60}
                     onChange={(e) => set('firstName', e.target.value)} />
              <div className="invalid-feedback">{errors.firstName}</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="lastName">Last name</label>
              <input id="lastName" className={cls('lastName')} value={v.lastName} maxLength={60}
                     onChange={(e) => set('lastName', e.target.value)} />
              <div className="invalid-feedback">{errors.lastName}</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" type="email" className={cls('email')} value={v.email} maxLength={120}
                     onChange={(e) => set('email', e.target.value)} />
              <div className="invalid-feedback">{errors.email}</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="phone">
                Phone <span className="text-muted fw-normal">(optional)</span>
              </label>
              <input id="phone" type="tel" className={cls('phone')} value={v.phone} maxLength={20}
                     onChange={(e) => set('phone', e.target.value)} />
              <div className="invalid-feedback">{errors.phone}</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="jobTitle">Job title</label>
              <input id="jobTitle" className={cls('jobTitle')} value={v.jobTitle} maxLength={100}
                     onChange={(e) => set('jobTitle', e.target.value)} />
              <div className="invalid-feedback">{errors.jobTitle}</div>
            </div>
            <div className="col-sm-6">
              <label className="form-label" htmlFor="departmentId">Department</label>
              <select id="departmentId" className={cls('department', 'form-select')} value={v.departmentId}
                      onChange={(e) => set('departmentId', e.target.value)}>
                <option value="">No department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <div className="invalid-feedback">{errors.department}</div>
            </div>
            <div className="col-sm-4">
              <label className="form-label" htmlFor="salary">Annual salary (₹)</label>
              <input id="salary" type="number" min="0" step="1000" className={cls('salary')} value={v.salary}
                     onChange={(e) => set('salary', e.target.value)} />
              <div className="invalid-feedback">{errors.salary}</div>
            </div>
            <div className="col-sm-4">
              <label className="form-label" htmlFor="hireDate">Hire date</label>
              <input id="hireDate" type="date" className={cls('hireDate')} value={v.hireDate}
                     onChange={(e) => set('hireDate', e.target.value)} />
              <div className="invalid-feedback">{errors.hireDate}</div>
            </div>
            <div className="col-sm-4">
              <label className="form-label" htmlFor="status">Status</label>
              <select id="status" className="form-select" value={v.status} onChange={(e) => set('status', e.target.value)}>
                <option value="ACTIVE">Active</option>
                <option value="ON_LEAVE">On leave</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="address">
                Address <span className="text-muted fw-normal">(optional)</span>
              </label>
              <textarea id="address" rows={2} className={cls('address')} value={v.address} maxLength={255}
                        onChange={(e) => set('address', e.target.value)} />
              <div className="invalid-feedback">{errors.address}</div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-light" onClick={onHide}>Cancel</button>
          <button type="submit" className="btn btn-accent" disabled={saving}>
            {emp ? 'Save changes' : 'Add employee'}
          </button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}
