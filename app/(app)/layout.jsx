'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/lib/store';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';

export default function AppLayout({ children }) {
  const { state } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!state.user) {
      router.push('/');
    }
  }, [state.user, router]);

  if (!state.user) return null;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div id="main" style={{ flex: 1 }}>
        <Topbar />
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}
