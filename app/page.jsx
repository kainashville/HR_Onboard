'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { DEMO_USERS, ROLE_LABELS } from '@/lib/constants';

export default function LoginPage() {
  const [role, setRole] = useState('HR_ADMIN');
  const { dispatch, toast } = useApp();
  const router = useRouter();

  function handleSignIn() {
    dispatch({ type: 'LOGIN', role });
    toast(`Welcome, ${DEMO_USERS[role].name}!`, 'success');
    router.push('/dashboard');
  }

  return (
    <div className="login-screen d-flex align-items-center justify-content-center">
      <div className="login-card card p-4 w-100 mx-3">
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', color: '#0078d4' }}>
            <i className="bi bi-people-fill"></i>
          </div>
          <h5 className="fw-bold mt-2 mb-0">NABA Staff Lifecycle Platform</h5>
          <small className="text-muted">Onboarding &amp; Offboarding</small>
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Demo: Sign in as</label>
          <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
            {Object.entries(DEMO_USERS).map(([key, user]) => (
              <option key={key} value={key}>
                {user.name} — {ROLE_LABELS[key]}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary w-100 py-2 fw-semibold" onClick={handleSignIn}>
          <i className="bi bi-microsoft me-2"></i>Sign in with Microsoft Entra ID
        </button>
        <div className="text-center mt-3">
          <small className="text-muted">
            <i className="bi bi-shield-lock me-1"></i>Secured via OIDC · SSO · RBAC
          </small>
        </div>
      </div>
    </div>
  );
}
