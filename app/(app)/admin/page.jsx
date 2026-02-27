'use client';

import { useState } from 'react';
import { useApp } from '@/lib/store';
import { TEMPLATES } from '@/lib/templates';
import { ROLE_LABELS } from '@/lib/constants';

function TemplatesTab() {
  return (
    <>
      {Object.entries(TEMPLATES).map(([type, tmpl], idx) => (
        <div key={type}>
          {idx > 0 && <hr />}
          <div className="mb-4">
            <h6 className="fw-bold">
              {tmpl.name} <span className="badge bg-primary bg-opacity-10 text-primary ms-2">{type}</span>
            </h6>
            {tmpl.phases.map((p) => (
              <div className="mb-2" key={p.name}>
                <div className="badge-phase mb-1">{p.name}</div>
                <ul className="list-unstyled ps-3 mb-0">
                  {p.tasks.map((t) => (
                    <li className="mb-1" key={t.title}>
                      <span className={`role-badge role-${t.ownerRole} me-2`}>{ROLE_LABELS[t.ownerRole]}</span>
                      {t.title}{' '}
                      <small className="text-muted">
                        (day {t.dueDays >= 0 ? '+' + t.dueDays : t.dueDays}
                        {t.evidence ? ' · evidence' : ''})
                      </small>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function RBACTab() {
  const roles = [
    { role: 'HR_ADMIN', perms: 'Manage templates, start/close all cases, view all', entra: 'Staff.HRAdmin' },
    { role: 'IT_ADMIN', perms: 'IT tasks, identity actions (if Graph enabled)', entra: 'Staff.ITAdmin' },
    { role: 'FINANCE_ADMIN', perms: 'Finance tasks, payroll steps', entra: 'Staff.FinanceAdmin' },
    { role: 'MANAGER', perms: 'Initiate cases for direct reports, manager tasks', entra: 'Staff.Manager' },
    { role: 'TASK_OWNER', perms: 'Update assigned tasks only', entra: 'Staff.TaskOwner' },
    { role: 'READ_ONLY_AUDITOR', perms: 'Read-only: cases + audit trail', entra: 'Staff.Auditor' },
  ];
  return (
    <>
      <h6 className="fw-bold mb-3">Role Definitions (Entra App Roles)</h6>
      <table className="table table-bordered table-sm">
        <thead className="table-light">
          <tr><th>Role</th><th>Permissions</th><th>Entra App Role Value</th></tr>
        </thead>
        <tbody>
          {roles.map((r) => (
            <tr key={r.role}>
              <td><span className={`role-badge role-${r.role}`}>{r.role}</span></td>
              <td>{r.perms}</td>
              <td><code>{r.entra}</code></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="alert alert-info mt-3 py-2">
        <i className="bi bi-info-circle me-2"></i>In production: configure these as App Roles in Entra app registration and assign users/groups.
      </div>
    </>
  );
}

function SLATab() {
  const { toast } = useApp();
  return (
    <>
      <h6 className="fw-bold mb-3">SLA &amp; Reminder Settings</h6>
      <div className="row g-3 mb-3">
        <div className="col-md-6">
          <label className="form-label">Reminder days before due</label>
          <input className="form-control" defaultValue="7, 3, 1" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Overdue digest: notify</label>
          <select className="form-select">
            <option>HR_ADMIN only</option>
            <option>HR_ADMIN + Manager</option>
          </select>
        </div>
        <div className="col-md-6">
          <label className="form-label">Default task SLA (days)</label>
          <input className="form-control" type="number" defaultValue="5" />
        </div>
        <div className="col-md-6">
          <label className="form-label">Escalation: notify after (days overdue)</label>
          <input className="form-control" type="number" defaultValue="2" />
        </div>
      </div>
      <div className="alert alert-warning py-2">
        <i className="bi bi-envelope me-2"></i>Email notifications via Microsoft Graph sendMail or SMTP (configure <code>NOTIFICATION_PROVIDER</code> env var).
      </div>
      <button className="btn btn-primary btn-sm" onClick={() => toast('Settings saved (demo).', 'success')}>
        Save Settings
      </button>
    </>
  );
}

function ExportTab() {
  const { state, toast } = useApp();

  function exportAllCases() {
    const rows = [['Case ID', 'Type', 'Person', 'Email', 'Dept', 'Status', 'Key Date', 'Progress']];
    state.cases.forEach((c) => {
      const done = c.tasks.filter((t) => t.status === 'DONE').length;
      rows.push([c.id, c.type, c.person.name, c.person.email, c.person.dept, c.status, c.keyDate, `${done}/${c.tasks.length}`]);
    });
    const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'all-cases.csv';
    a.click();
    toast('Exported all-cases.csv', 'success');
  }

  function exportAudit() {
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
      <h6 className="fw-bold mb-3">Exports</h6>
      <div className="list-group">
        <button className="list-group-item list-group-item-action" onClick={exportAllCases}>
          <i className="bi bi-file-earmark-spreadsheet me-2 text-success"></i>Export All Cases (CSV)
        </button>
        <button className="list-group-item list-group-item-action" onClick={exportAudit}>
          <i className="bi bi-journal-text me-2 text-primary"></i>Export Audit Log (CSV)
        </button>
      </div>
    </>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState('templates');

  const tabs = [
    { key: 'templates', label: 'Templates' },
    { key: 'rbac', label: 'RBAC Mapping' },
    { key: 'sla', label: 'SLA / Reminders' },
    { key: 'export', label: 'Export' },
  ];

  return (
    <>
      <ul className="nav nav-tabs mb-0">
        {tabs.map((t) => (
          <li className="nav-item" key={t.key}>
            <a
              className={`nav-link ${tab === t.key ? 'active' : ''}`}
              style={{ cursor: 'pointer' }}
              onClick={() => setTab(t.key)}
            >
              {t.label}
            </a>
          </li>
        ))}
      </ul>
      <div className="bg-white border border-top-0 rounded-bottom p-4 shadow-sm">
        {tab === 'templates' && <TemplatesTab />}
        {tab === 'rbac' && <RBACTab />}
        {tab === 'sla' && <SLATab />}
        {tab === 'export' && <ExportTab />}
      </div>
    </>
  );
}
