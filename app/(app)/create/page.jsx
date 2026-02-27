'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { fmtDate, addDays } from '@/lib/utils';

const STEPS = ['Type', 'Employee', 'Dates', 'Review'];

function StepIndicator({ current }) {
  return (
    <div className="step-indicator mb-4 text-center">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const cls = n < current ? 'done' : n === current ? 'current' : '';
        return (
          <span key={i}>
            <span className={`step ${cls}`}>{n < current ? '\u2713' : n}</span>
            {i < STEPS.length - 1 && <span className={`step-line ${n < current ? 'done' : ''}`}></span>}
          </span>
        );
      })}
    </div>
  );
}

export default function CreatePage() {
  const router = useRouter();
  const { state, dispatch, toast } = useApp();
  const [step, setStep] = useState(1);
  const [caseType, setCaseType] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(''); // '' = none, 'MANUAL' = override
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [dept, setDept] = useState('');
  const [mgr, setMgr] = useState('');
  const [emptype, setEmptype] = useState('Full-Time');
  const [keyDate, setKeyDate] = useState('');

  // Build list of onboarded employees (from ONBOARDING cases, no active offboarding for them)
  const onboardedPeople = state.cases
    .filter((c) => c.type === 'ONBOARDING')
    .map((c) => c.person)
    .filter((p, i, arr) => arr.findIndex((x) => x.email === p.email) === i) // dedupe
    .filter((p) => {
      // Exclude anyone who already has an active offboarding case
      return !state.cases.some(
        (c) => c.type === 'OFFBOARDING' && c.status === 'ACTIVE' && c.person.email === p.email
      );
    });

  function selectType(type) {
    setCaseType(type);
    // Reset employee fields when switching type
    setSelectedPerson('');
    setName('');
    setEmail('');
    setDept('');
    setMgr('');
    setEmptype('Full-Time');
  }

  function handleSelectPerson(val) {
    setSelectedPerson(val);
    if (val === 'MANUAL' || val === '') {
      setName('');
      setEmail('');
      setDept('');
      setMgr('');
      setEmptype('Full-Time');
    } else {
      const person = onboardedPeople.find((p) => p.email === val);
      if (person) {
        setName(person.name);
        setEmail(person.email);
        setDept(person.dept || '');
        setMgr(person.mgr || '');
        setEmptype(person.emptype || 'Full-Time');
      }
    }
  }

  function next() {
    if (step === 1 && !caseType) return;
    if (step === 2) {
      if (!name || !email) {
        toast('Name and email are required.', 'danger');
        return;
      }
      if (!keyDate) {
        const isOnb = caseType === 'ONBOARDING';
        setKeyDate(fmtDate(addDays(new Date(), isOnb ? 14 : 7)));
      }
    }
    setStep(step + 1);
  }

  function back() {
    setStep(step - 1);
  }

  function handleCreate() {
    const nextId = 'CASE-' + String(state.cases.length + 1).padStart(3, '0');
    dispatch({
      type: 'ADD_CASE',
      data: {
        type: caseType,
        status: 'ACTIVE',
        person: { name, email, dept, mgr, emptype },
        keyDate: keyDate || fmtDate(addDays(new Date(), caseType === 'ONBOARDING' ? 14 : 7)),
        initiatedBy: state.user.email,
      },
    });
    toast(`Case ${nextId} created!`, 'success');
    router.push(`/cases/${nextId}`);
  }

  const tmpl = caseType ? TEMPLATES[caseType] : null;
  const taskCount = tmpl ? tmpl.phases.reduce((a, p) => a + p.tasks.length, 0) : 0;
  const isOnb = caseType === 'ONBOARDING';
  const defaultDate = fmtDate(addDays(new Date(), isOnb ? 14 : 7));

  return (
    <div className="card border-0 shadow-sm" style={{ maxWidth: 680, margin: 'auto' }}>
      <div className="card-body p-4">
        <StepIndicator current={step} />

        {/* Step 1 - Type */}
        {step === 1 && (
          <div>
            <h6 className="fw-bold mb-3">Step 1 — Case Type</h6>
            <div className="row g-3">
              <div className="col-6">
                <div
                  className={`card border-2 p-3 text-center h-100 ${caseType === 'ONBOARDING' ? 'border-primary' : 'border-secondary'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectType('ONBOARDING')}
                >
                  <i className="bi bi-person-plus-fill fs-2 text-primary mb-2"></i>
                  <div className="fw-semibold">New Hire Onboarding</div>
                  <small className="text-muted">Pre-hire → Day 1+</small>
                </div>
              </div>
              <div className="col-6">
                <div
                  className={`card border-2 p-3 text-center h-100 ${caseType === 'OFFBOARDING' ? 'border-danger' : 'border-secondary'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectType('OFFBOARDING')}
                >
                  <i className="bi bi-person-dash-fill fs-2 text-danger mb-2"></i>
                  <div className="fw-semibold">Employee Offboarding</div>
                  <small className="text-muted">Notice → Closeout</small>
                </div>
              </div>
            </div>
            <div className="d-flex justify-content-end mt-4">
              <button className="btn btn-primary" onClick={next} disabled={!caseType}>
                Next <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 2 - Employee */}
        {step === 2 && (
          <div>
            <h6 className="fw-bold mb-3">Step 2 — Employee Info</h6>

            {/* Offboarding: select from onboarded employees or enter manually */}
            {caseType === 'OFFBOARDING' && (
              <div className="mb-3">
                <label className="form-label fw-semibold">Select Employee</label>
                <select
                  className="form-select"
                  value={selectedPerson}
                  onChange={(e) => handleSelectPerson(e.target.value)}
                >
                  <option value="">— Choose an onboarded employee —</option>
                  {onboardedPeople.map((p) => (
                    <option key={p.email} value={p.email}>
                      {p.name} — {p.email} ({p.dept || 'No dept'})
                    </option>
                  ))}
                  <option value="MANUAL">Enter manually (not in list)</option>
                </select>
                {selectedPerson === '' && (
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Showing employees from onboarding cases. Select &quot;Enter manually&quot; for someone not listed.
                  </small>
                )}
              </div>
            )}

            {/* Show form fields: always for onboarding, or when a person is selected/manual for offboarding */}
            {(caseType === 'ONBOARDING' || selectedPerson) && (
              <>
                <div className="mb-3">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-control"
                    placeholder="Jane Smith"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    readOnly={caseType === 'OFFBOARDING' && selectedPerson !== 'MANUAL'}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Work Email *</label>
                  <input
                    className="form-control"
                    placeholder="jsmith@naba.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    readOnly={caseType === 'OFFBOARDING' && selectedPerson !== 'MANUAL'}
                  />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col">
                    <label className="form-label">Department</label>
                    <input className="form-control" placeholder="Finance" value={dept} onChange={(e) => setDept(e.target.value)} />
                  </div>
                  <div className="col">
                    <label className="form-label">Manager Email</label>
                    <input className="form-control" placeholder="manager@naba.org" value={mgr} onChange={(e) => setMgr(e.target.value)} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Employment Type</label>
                  <select className="form-select" value={emptype} onChange={(e) => setEmptype(e.target.value)}>
                    <option>Full-Time</option>
                    <option>Part-Time</option>
                    <option>Contractor</option>
                  </select>
                </div>

                {caseType === 'OFFBOARDING' && selectedPerson !== 'MANUAL' && (
                  <div className="alert alert-secondary py-2" style={{ fontSize: '.8rem' }}>
                    <i className="bi bi-lock me-1"></i>
                    Name and email are pre-filled from the onboarding record. Dept, manager, and type can be updated if changed.
                  </div>
                )}
              </>
            )}

            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={back}>
                <i className="bi bi-arrow-left me-1"></i>Back
              </button>
              <button
                className="btn btn-primary"
                onClick={next}
                disabled={caseType === 'OFFBOARDING' && !selectedPerson}
              >
                Next <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Dates */}
        {step === 3 && (
          <div>
            <h6 className="fw-bold mb-3">Step 3 — Key Dates</h6>
            <div className="mb-3">
              <label className="form-label">{isOnb ? 'Hire / Start Date' : 'Last Working Day'} *</label>
              <input
                className="form-control"
                type="date"
                value={keyDate || defaultDate}
                onChange={(e) => setKeyDate(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={back}>
                <i className="bi bi-arrow-left me-1"></i>Back
              </button>
              <button className="btn btn-primary" onClick={next}>
                Review <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {/* Step 4 - Review */}
        {step === 4 && (
          <div>
            <h6 className="fw-bold mb-3">Step 4 — Review &amp; Create</h6>
            <table className="table table-sm table-borderless mb-3">
              <tbody>
                <tr><th>Type</th><td>{isOnb ? 'New Hire Onboarding' : 'Employee Offboarding'}</td></tr>
                <tr><th>Employee</th><td>{name} &lt;{email}&gt;</td></tr>
                <tr><th>Department</th><td>{dept || '—'}</td></tr>
                <tr><th>Manager</th><td>{mgr || '—'}</td></tr>
                <tr><th>Template</th><td>{tmpl?.name}</td></tr>
                <tr><th>{isOnb ? 'Hire Date' : 'Last Day'}</th><td>{keyDate || defaultDate}</td></tr>
              </tbody>
            </table>
            <div className="alert alert-info py-2">
              <i className="bi bi-info-circle me-2"></i>
              Will create <strong>{taskCount} tasks</strong> across <strong>{tmpl?.phases.length} phases</strong>:{' '}
              {tmpl?.phases.map((p) => p.name).join(' → ')}
            </div>
            <div className="d-flex justify-content-between mt-4">
              <button className="btn btn-outline-secondary" onClick={back}>
                <i className="bi bi-arrow-left me-1"></i>Back
              </button>
              <button className="btn btn-success" onClick={handleCreate}>
                <i className="bi bi-check-circle me-1"></i>Create Case
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
