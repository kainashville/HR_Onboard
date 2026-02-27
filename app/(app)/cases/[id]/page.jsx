'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ROLE_LABELS, ALL_STATUSES } from '@/lib/constants';
import { fmtDate, canActOnTask, isOverdue } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';
import Modal from '@/components/Modal';

export default function CaseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { state, dispatch, toast } = useApp();
  const [editTask, setEditTask] = useState(null);
  const [modalStatus, setModalStatus] = useState('');
  const [modalComment, setModalComment] = useState('');
  const [modalFile, setModalFile] = useState(null);

  const c = state.cases.find((x) => x.id === id);
  if (!c) return <div className="alert alert-warning">Case not found.</div>;

  const today = fmtDate(new Date());
  const done = c.tasks.filter((t) => t.status === 'DONE').length;
  const pct = c.tasks.length ? Math.round((done / c.tasks.length) * 100) : 0;

  const phases = {};
  c.tasks.forEach((t) => {
    if (!phases[t.phase]) phases[t.phase] = [];
    phases[t.phase].push(t);
  });

  const canEdit = state.user.role !== 'READ_ONLY_AUDITOR';
  const isAdmin = ['HR_ADMIN', 'IT_ADMIN'].includes(state.user.role);

  function openEdit(task) {
    setEditTask(task);
    setModalStatus(task.status);
    setModalComment('');
    setModalFile(null);
  }

  function handleSave() {
    dispatch({
      type: 'UPDATE_TASK',
      caseId: c.id,
      taskId: editTask.id,
      status: modalStatus,
      comment: modalComment.trim() || null,
      fileName: modalFile?.name || null,
    });
    setEditTask(null);
    toast('Task updated!', 'success');
  }

  function handleClose() {
    dispatch({ type: 'CLOSE_CASE', caseId: c.id });
    toast('Case marked completed.', 'success');
  }

  function exportCSV() {
    const rows = [['Case ID', 'Person', 'Email', 'Task', 'Phase', 'Owner', 'Due', 'Status', 'Evidence']];
    c.tasks.forEach((t) =>
      rows.push([c.id, c.person.name, c.person.email, t.title, t.phase, t.ownerRole, t.dueDate, t.status, t.evidenceFiles.length ? 'Yes' : 'No'])
    );
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = `${c.id}-tasks.csv`;
    a.click();
    toast(`Exported ${c.id}-tasks.csv`, 'success');
  }

  return (
    <>
      <button className="btn btn-sm btn-link text-muted mb-3 ps-0" onClick={() => router.push('/cases')}>
        <i className="bi bi-arrow-left me-1"></i>Back to Cases
      </button>

      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <h5 className="fw-bold mb-0">
            {c.person.name}
            <span className={`badge ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'} ms-2`}>
              {c.type === 'ONBOARDING' ? 'Onboarding' : 'Offboarding'}
            </span>
          </h5>
          <div className="text-muted">
            {c.id} · {c.person.email} · {c.person.dept}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          {isAdmin && c.status === 'ACTIVE' && (
            <button className="btn btn-sm btn-success" onClick={handleClose}>
              <i className="bi bi-check2-all me-1"></i>Complete Case
            </button>
          )}
          <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>
            <i className="bi bi-download me-1"></i>Export CSV
          </button>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-auto">
          <strong>{c.type === 'ONBOARDING' ? 'Hire Date' : 'Last Day'}:</strong> {c.keyDate}
        </div>
        <div className="col-auto">
          <strong>Status:</strong> <span className="badge bg-secondary bg-opacity-25 text-dark">{c.status}</span>
        </div>
        <div className="col-auto">
          <strong>Initiated by:</strong> {c.initiatedBy}
        </div>
        <div className="col-auto">
          <strong>Progress:</strong> {done}/{c.tasks.length} ({pct}%)
        </div>
      </div>

      <div className="progress mb-4" style={{ height: 8 }}>
        <div
          className={`progress-bar ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'}`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>

      {Object.entries(phases).map(([phase, tasks]) => {
        const pDone = tasks.filter((t) => t.status === 'DONE').length;
        return (
          <div className="mb-4" key={phase}>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="badge-phase">{phase}</span>
              <small className="text-muted">{pDone}/{tasks.length} done</small>
            </div>
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead className="table-light">
                    <tr><th>Task</th><th>Owner</th><th>Due</th><th>Status</th><th>Evidence</th><th></th></tr>
                  </thead>
                  <tbody>
                    {tasks.map((t) => {
                      const ovd = isOverdue(t.dueDate, t.status);
                      const myTask = canActOnTask(t, state.user.role);
                      return (
                        <tr key={t.id} className={`task-row ${ovd ? 'overdue-row' : ''}`}>
                          <td className="ps-3">
                            <div className="fw-semibold">{t.title}</div>
                            {t.comments.length > 0 && (
                              <small className="text-muted">
                                <i className="bi bi-chat-dots me-1"></i>{t.comments.length} comment(s)
                              </small>
                            )}
                          </td>
                          <td>
                            <span className={`role-badge role-${t.ownerRole}`}>{ROLE_LABELS[t.ownerRole]}</span>
                          </td>
                          <td>
                            <small className={ovd ? 'text-danger fw-semibold' : ''}>
                              {t.dueDate}
                              {ovd && ' \u26A0'}
                            </small>
                            {t.requiresEvidence && (
                              <>
                                <br />
                                <span className="text-warning" style={{ fontSize: '.7rem' }}>
                                  <i className="bi bi-paperclip me-1"></i>Evidence req.
                                </span>
                              </>
                            )}
                          </td>
                          <td><StatusBadge status={t.status} /></td>
                          <td>
                            {t.evidenceFiles.length > 0 ? (
                              <small className="text-success">
                                <i className="bi bi-check-circle me-1"></i>{t.evidenceFiles.length} file(s)
                              </small>
                            ) : (
                              <small className="text-muted">—</small>
                            )}
                          </td>
                          <td className="text-end pe-3">
                            {myTask && canEdit && (
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openEdit(t)}>
                                <i className="bi bi-pencil-square"></i>
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      })}

      {editTask && (
        <Modal
          title={`Task: ${editTask.title}`}
          onClose={() => setEditTask(null)}
          footer={
            <button className="btn btn-primary" onClick={handleSave}>Save</button>
          }
        >
          <div className="mb-3">
            <label className="form-label fw-semibold">Status</label>
            <select className="form-select" value={modalStatus} onChange={(e) => setModalStatus(e.target.value)}>
              {ALL_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Add Comment</label>
            <textarea
              className="form-control"
              rows="2"
              placeholder="Optional comment…"
              value={modalComment}
              onChange={(e) => setModalComment(e.target.value)}
            ></textarea>
          </div>
          {editTask.requiresEvidence && (
            <div className="mb-3">
              <label className="form-label fw-semibold">Evidence File</label>
              <input className="form-control" type="file" onChange={(e) => setModalFile(e.target.files[0] || null)} />
              <small className="text-muted">Upload confirmation, screenshot, or document.</small>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
