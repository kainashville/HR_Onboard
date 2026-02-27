'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { ROLE_LABELS } from '@/lib/constants';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/cases': 'Cases',
  '/create': 'New Case',
  '/audit': 'Audit Log',
  '/admin': 'Admin Console',
};

export default function Topbar() {
  const { state } = useApp();
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState('');

  const title = pathname.startsWith('/cases/') && pathname !== '/cases'
    ? 'Case Detail'
    : PAGE_TITLES[pathname] || '';

  function handleSearch(q) {
    setQuery(q);
    if (!q.trim()) return;
    const ql = q.toLowerCase();
    const found = state.cases.filter(
      (c) =>
        c.id.toLowerCase().includes(ql) ||
        c.person.name.toLowerCase().includes(ql) ||
        c.person.email.toLowerCase().includes(ql)
    );
    if (found.length === 1) {
      setQuery('');
      router.push(`/cases/${found[0].id}`);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && query.trim()) {
      const ql = query.toLowerCase();
      const found = state.cases.filter(
        (c) =>
          c.id.toLowerCase().includes(ql) ||
          c.person.name.toLowerCase().includes(ql) ||
          c.person.email.toLowerCase().includes(ql)
      );
      if (found.length >= 1) {
        setQuery('');
        router.push(found.length === 1 ? `/cases/${found[0].id}` : '/cases');
      }
    }
  }

  return (
    <div id="topbar" className="d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center gap-2">
        <h6 className="mb-0 fw-bold text-dark">{title}</h6>
      </div>
      <div className="d-flex align-items-center gap-3">
        <input
          type="search"
          className="form-control form-control-sm"
          placeholder="Search cases / people…"
          style={{ width: 220 }}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <span className="text-muted" style={{ fontSize: '.8rem' }}>
          {state.user.name} · {ROLE_LABELS[state.user.role]}
        </span>
      </div>
    </div>
  );
}
