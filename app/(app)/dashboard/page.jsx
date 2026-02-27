'use client';

import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { canActOnTask, fmtDate, isOverdue } from '@/lib/utils';
import StatusBadge from '@/components/StatusBadge';

export default function DashboardPage() {
  const { state } = useApp();
  const router = useRouter();
  const { user, cases } = state;

  const allTasks = cases.flatMap((c) => c.tasks);
  const myTasks = allTasks.filter((t) => canActOnTask(t, user.role) && t.status !== 'DONE' && t.status !== 'NOT_APPLICABLE');
  const today = fmtDate(new Date());
  const overdue = myTasks.filter((t) => t.dueDate < today);
  const activeCases = cases.filter((c) => c.status === 'ACTIVE');
  const totalDone = allTasks.filter((t) => t.status === 'DONE').length;

  const stats = [
    { icon: 'bi-folder2-open', label: 'Active Cases', val: activeCases.length, color: 'primary' },
    { icon: 'bi-list-check', label: 'My Open Tasks', val: myTasks.length, color: 'info' },
    { icon: 'bi-exclamation-triangle-fill', label: 'Overdue', val: overdue.length, color: 'danger' },
    { icon: 'bi-check-circle-fill', label: 'Total Done', val: totalDone, color: 'success' },
  ];

  return (
    <>
      <div className="row g-3 mb-4">
        {stats.map((s) => (
          <div className="col-6 col-lg-3" key={s.label}>
            <div className="card stat-card">
              <div className="card-body d-flex align-items-center gap-3">
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center bg-${s.color} bg-opacity-10`}
                  style={{ width: 46, height: 46 }}
                >
                  <i className={`bi ${s.icon} text-${s.color}`} style={{ fontSize: '1.3rem' }}></i>
                </div>
                <div>
                  <div className={`stat-num text-${s.color}`}>{s.val}</div>
                  <div className="text-muted">{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-lg-7">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold border-bottom">My Open Tasks</div>
            <div className="card-body p-0">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr><th>Task</th><th>Case</th><th>Due</th><th>Status</th><th></th></tr>
                </thead>
                <tbody>
                  {myTasks.length === 0 ? (
                    <tr><td colSpan="5" className="text-center text-muted py-4">No open tasks for your role.</td></tr>
                  ) : (
                    myTasks.slice(0, 8).map((t) => {
                      const ovd = isOverdue(t.dueDate, t.status);
                      return (
                        <tr key={t.id} className={`task-row ${ovd ? 'overdue-row' : ''}`}>
                          <td className="ps-3">{t.title}</td>
                          <td><small className="text-muted">{t.caseId}</small></td>
                          <td><small className={ovd ? 'text-danger fw-semibold' : ''}>{t.dueDate}</small></td>
                          <td><StatusBadge status={t.status} /></td>
                          <td>
                            <button
                              className="btn btn-xs btn-outline-primary"
                              style={{ fontSize: '.75rem', padding: '2px 8px' }}
                              onClick={() => router.push(`/cases/${t.caseId}`)}
                            >
                              Update
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-lg-5">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white fw-semibold border-bottom">Recent Cases</div>
            <div className="card-body p-0">
              {cases.length === 0 ? (
                <div className="p-3 text-muted">No cases yet.</div>
              ) : (
                cases.slice(0, 5).map((c) => {
                  const done = c.tasks.filter((t) => t.status === 'DONE').length;
                  const pct = c.tasks.length ? Math.round((done / c.tasks.length) * 100) : 0;
                  return (
                    <div
                      key={c.id}
                      className="px-3 py-2 border-bottom"
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/cases/${c.id}`)}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{c.person.name}</strong>
                          <small className="text-muted ms-1">{c.id}</small>
                        </div>
                        <span className={`badge ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'} bg-opacity-75`}>
                          {c.type === 'ONBOARDING' ? 'ONB' : 'OFF'}
                        </span>
                      </div>
                      <div className="progress mt-1">
                        <div
                          className={`progress-bar ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'}`}
                          style={{ width: `${pct}%` }}
                        ></div>
                      </div>
                      <small className="text-muted">{pct}% complete · {c.status}</small>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
