import { useState } from 'react';
import { Modal } from 'react-bootstrap';

export default function ConfirmModal({ show, title, text, confirmLabel = 'Delete', onConfirm, onHide }) {
  const [busy, setBusy] = useState(false);

  async function handleConfirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Body className="text-center p-4">
        <div className="confirm-icon"><i className="bi bi-trash3" /></div>
        <h2 className="fs-5 mb-2">{title}</h2>
        <p className="text-muted mb-4">{text}</p>
        <div className="d-flex gap-2 justify-content-center">
          <button type="button" className="btn btn-light" onClick={onHide}>Keep</button>
          <button type="button" className="btn btn-danger" onClick={handleConfirm} disabled={busy}>{confirmLabel}</button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
