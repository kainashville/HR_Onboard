'use client';

import { useEffect } from 'react';

export default function Modal({ title, children, footer, onClose }) {
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card shadow" style={{ minWidth: 400, maxWidth: 560, width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="card-header d-flex justify-content-between align-items-center">
          <strong>{title}</strong>
          <button className="btn-close" onClick={onClose}></button>
        </div>
        <div className="card-body">{children}</div>
        {footer && <div className="card-footer text-end">{footer}</div>}
      </div>
    </div>
  );
}
