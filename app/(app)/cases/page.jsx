'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { fmtDate } from '@/lib/utils';

export default function CasesPage() {
  const { state } = useApp();
  const router = useRouter();
  const [filter, setFilter] = useState('ALL');

  const canCreate = ['HR_ADMIN', 'MANAGER'].includes(state.user.role);

  let cases = state.cases;
  if (filter === 'ONBOARDING') cases = cases.filter((c) => c.type === 'ONBOARDING');
  else if (filter === 'OFFBOARDING') cases = cases.filter((c) => c.type === 'OFFBOARDING');
  else if (filter === 'ACTIVE') cases = cases.filter((c) => c.status === 'ACTIVE');

  const today = fmtDate(new Date());

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          {['ALL', 'ONBOARDING', 'OFFBOARDING', 'ACTIVE'].map((f) => (
            <button
              key={f}
              className={`btn btn-sm btn-outline-secondary ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        {canCreate && (
          <button className="btn btn-sm btn-primary" onClick={() => router.push('/create')}>
            <i className="bi bi-plus me-1"></i>New Case
          </button>
        )}
      </div>

      {cases.length === 0 ? (
        <div className="alert alert-secondary">No cases found.</div>
      ) : (
        <div className="row g-3">
          {cases.map((c) => {
            const done = c.tasks.filter((t) => t.status === 'DONE').length;
            const pct = c.tasks.length ? Math.round((done / c.tasks.length) * 100) : 0;
            const ovd = c.tasks.filter(
              (t) => t.dueDate < today && t.status !== 'DONE' && t.status !== 'NOT_APPLICABLE'
            ).length;
            return (
              <div className="col-md-6 col-lg-4" key={c.id}>
                <div className="case-card p-3" onClick={() => router.push(`/cases/${c.id}`)}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div className="fw-bold">{c.person.name}</div>
                      <small className="text-muted">{c.person.email}</small>
                    </div>
                    <span className={`badge ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'}`}>
                      {c.type === 'ONBOARDING' ? 'Onboarding' : 'Offboarding'}
                    </span>
                  </div>
                  <div className="text-muted mb-2" style={{ fontSize: '.8rem' }}>
                    {c.id} · {c.person.dept} · {c.person.emptype}
                  </div>
                  <div className="progress mb-1">
                    <div
                      className={`progress-bar ${c.type === 'ONBOARDING' ? 'bg-primary' : 'bg-danger'}`}
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mt-1">
                    <small className="text-muted">
                      {done}/{c.tasks.length} tasks · {pct}%
                    </small>
                    {ovd > 0 && (
                      <small className="text-danger">
                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                        {ovd} overdue
                      </small>
                    )}
                  </div>
                  <div className="mt-2 d-flex justify-content-between align-items-center">
                    <span className="badge bg-secondary bg-opacity-10 text-secondary">{c.status}</span>
                    <small className="text-muted">
                      {c.type === 'ONBOARDING' ? 'Hire' : 'Last day'}: {c.keyDate}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
