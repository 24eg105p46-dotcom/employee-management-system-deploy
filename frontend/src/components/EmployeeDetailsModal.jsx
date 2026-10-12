import { Modal } from 'react-bootstrap';
import Avatar from './Avatar.jsx';
import StatusBadge from './StatusBadge.jsx';
import { fmtDate, money, tenure } from '../utils';

export default function EmployeeDetailsModal({ emp, onHide, onEdit }) {
  return (
    <Modal show onHide={onHide} centered scrollable>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title as="h2" className="visually-hidden">Employee details</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <div className="detail-head">
          <Avatar emp={emp} large />
          <div>
            <h3>{emp.firstName} {emp.lastName}</h3>
            <div className="text-muted mb-1">{emp.jobTitle}</div>
            <StatusBadge status={emp.status} />
          </div>
        </div>
        <dl className="detail-grid mb-0">
          <div><dt>Employee ID</dt><dd>#{emp.id}</dd></div>
          <div><dt>Department</dt><dd>{emp.department ? emp.department.name : '—'}</dd></div>
          <div><dt>Email</dt><dd><a href={`mailto:${emp.email}`}>{emp.email}</a></dd></div>
          <div><dt>Phone</dt><dd>{emp.phone || '—'}</dd></div>
          <div><dt>Annual salary</dt><dd>{money(emp.salary)}</dd></div>
          <div><dt>Joined</dt><dd>{fmtDate(emp.hireDate)}</dd></div>
          <div><dt>Time with company</dt><dd>{tenure(emp.hireDate)}</dd></div>
          <div><dt>Office</dt><dd>{emp.department && emp.department.location ? emp.department.location : '—'}</dd></div>
          <div className="full"><dt>Address</dt><dd>{emp.address || '—'}</dd></div>
        </dl>
      </Modal.Body>
      <Modal.Footer>
        <button type="button" className="btn btn-light" onClick={onHide}>Close</button>
        <button type="button" className="btn btn-outline-accent" onClick={onEdit}>
          <i className="bi bi-pencil me-1" /> Edit
        </button>
      </Modal.Footer>
    </Modal>
  );
}
