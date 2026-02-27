'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';

export default function AuditPage() {
  const { state, toast } = useApp();
  const [filterAction, setFilterAction] = useState('');

  let logs = state.auditLog;
  if (filterAction) logs = logs.filter((l) => l.action === filterAction);

  function exportCSV() {
    const rows = [['Timestamp', 'Actor', 'Action', 'Entity Type', 'Entity ID', 'Detail']];
    state.auditLog.forEach((l) => rows.push([l.ts, l.actor, l.action, l.entityType, l.entityId, l.detail]));
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'audit-log.csv';
    a.click();
    toast('Exported audit-log.csv', 'success');
  }

  return (
    <>
      <div className="d-flex gap-2 mb-3 flex-wrap">
        <select
          className="form-select form-select-sm"
          style={{ width: 180 }}
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        >
          <option value="">All Actions</option>
          <option>CASE_CREATED</option>
          <option>TASK_UPDATED</option>
          <option>COMMENT_ADDED</option>
          <option>CASE_STATUS_CHANGED</option>
          <option>USER_LOGIN</option>
        </select>
        <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>
          <i className="bi bi-download me-1"></i>Export CSV
        </button>
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr><th>Timestamp</th><th>Actor</th><th>Action</th><th>Entity</th><th>Detail</th></tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr><td colSpan="5" className="text-center text-muted py-4">No audit events.</td></tr>
              ) : (
                logs.map((l, i) => (
                  <tr key={i} className="audit-row">
                    <td>{l.ts.replace('T', ' ').substring(0, 19)}</td>
                    <td>{l.actor}</td>
                    <td>
                      <span className="badge bg-secondary bg-opacity-10 text-dark">{l.action}</span>
                    </td>
                    <td>
                      {l.entityType}: <code>{l.entityId}</code>
                    </td>
                    <td className="text-muted">{l.detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
