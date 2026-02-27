'use client';

import { useEffect } from 'react';
import { useApp } from '@/lib/store';

export default function ToastContainer() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    if (state.toasts.length === 0) return;
    const latest = state.toasts[state.toasts.length - 1];
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', id: latest.id });
    }, 3500);
    return () => clearTimeout(timer);
  }, [state.toasts, dispatch]);

  return (
    <div id="toast-container">
      {state.toasts.map((t) => {
        const icon = t.toastType === 'success' ? 'check-circle' : t.toastType === 'danger' ? 'exclamation-triangle' : 'info-circle';
        return (
          <div
            key={t.id}
            className={`alert alert-${t.toastType} py-2 px-3 shadow mb-2`}
            style={{ minWidth: 220, animation: 'fadeIn .2s' }}
          >
            <i className={`bi bi-${icon} me-2`}></i>
            {t.msg}
          </div>
        );
      })}
    </div>
  );
}
