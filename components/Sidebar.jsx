'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: '/cases', icon: 'bi-folder2-open', label: 'Cases' },
  { href: '/create', icon: 'bi-plus-circle', label: 'New Case', roles: ['HR_ADMIN', 'MANAGER'] },
  { href: '/audit', icon: 'bi-journal-text', label: 'Audit Log' },
  { href: '/admin', icon: 'bi-gear', label: 'Admin', roles: ['HR_ADMIN'] },
];

export default function Sidebar() {
  const { state, dispatch } = useApp();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = state;

  function handleSignOut() {
    dispatch({ type: 'LOGOUT' });
    router.push('/');
  }

  return (
    <nav id="sidebar">
      <div className="brand">
        <i className="bi bi-people-fill me-2"></i>
        <span className="brand-text">Staff Lifecycle</span>
      </div>
      <ul className="nav flex-column mt-2">
        {NAV_ITEMS.map((item) => {
          if (item.roles && !item.roles.includes(user.role)) return null;
          const isActive = pathname === item.href || (item.href === '/cases' && pathname.startsWith('/cases/'));
          return (
            <li className="nav-item" key={item.href}>
              <a
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => router.push(item.href)}
              >
                <i className={`bi ${item.icon} me-2`}></i>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ul>
      <div className="sidebar-user-panel p-3" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <div className="d-flex align-items-center" style={{ color: '#b0bec5', fontSize: '.8rem' }}>
          <i className="bi bi-person-circle me-2" style={{ fontSize: '1.3rem' }}></i>
          <div>
            <div className="fw-semibold text-white" style={{ fontSize: '.8rem' }}>{user.name}</div>
            <div className={`role-badge role-${user.role}`}>{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <button className="btn btn-sm btn-outline-secondary w-100 mt-2" onClick={handleSignOut}>
          <i className="bi bi-box-arrow-left me-1"></i>Sign Out
        </button>
      </div>
    </nav>
  );
}
