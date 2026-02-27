'use client';

import { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { DEMO_USERS } from './constants';
import { TEMPLATES } from './templates';
import { fmtDate, addDays } from './utils';

const AppContext = createContext(null);

const initialState = {
  user: null,
  cases: [],
  auditLog: [],
  toasts: [],
};

let toastId = 0;

function buildCase(index, data) {
  const id = 'CASE-' + String(index + 1).padStart(3, '0');
  const tmpl = TEMPLATES[data.type];
  const keyDate = new Date(data.keyDate + 'T12:00:00');
  const tasks = [];
  let tid = 0;
  tmpl.phases.forEach((phase) => {
    phase.tasks.forEach((t) => {
      tasks.push({
        id: `${id}-T${String(++tid).padStart(2, '0')}`,
        caseId: id,
        title: t.title,
        phase: phase.name,
        ownerRole: t.ownerRole,
        dueDate: fmtDate(addDays(keyDate, t.dueDays)),
        status: 'NOT_STARTED',
        requiresEvidence: !!t.evidence,
        comments: [],
        evidenceFiles: [],
      });
    });
  });
  return { id, ...data, tasks, createdAt: data.createdAt || fmtDate(new Date()) };
}

function seedDemoData(state) {
  if (state.cases.length) return state;
  const today = new Date();

  const c1 = buildCase(0, {
    type: 'ONBOARDING',
    status: 'ACTIVE',
    person: { name: 'Alex Johnson', email: 'ajohnson@naba.org', dept: 'Finance', mgr: 'jrivera@naba.org', emptype: 'Full-Time' },
    keyDate: fmtDate(addDays(today, 7)),
    createdAt: fmtDate(addDays(today, -5)),
    initiatedBy: 'schen@naba.org',
  });
  c1.tasks[0].status = 'DONE';
  c1.tasks[1].status = 'DONE';
  c1.tasks[2].status = 'IN_PROGRESS';
  c1.tasks[6].status = 'DONE';
  c1.tasks[2].dueDate = fmtDate(addDays(today, -3));

  const c2 = buildCase(1, {
    type: 'OFFBOARDING',
    status: 'ACTIVE',
    person: { name: 'Morgan Lee', email: 'mlee@naba.org', dept: 'Operations', mgr: 'jrivera@naba.org', emptype: 'Full-Time' },
    keyDate: fmtDate(addDays(today, 14)),
    createdAt: fmtDate(addDays(today, -3)),
    initiatedBy: 'schen@naba.org',
  });
  c2.tasks[0].status = 'DONE';
  c2.tasks[1].status = 'DONE';
  c2.tasks[2].status = 'IN_PROGRESS';

  return { ...state, cases: [c1, c2] };
}

function makeAudit(actor, action, entityType, entityId, detail) {
  return { ts: new Date().toISOString(), actor, action, entityType, entityId, detail };
}

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN': {
      const { role } = action;
      const u = DEMO_USERS[role];
      const user = { ...u, role };
      let cases = [];
      let auditLog = [];
      try {
        const raw = localStorage.getItem('slp_state');
        if (raw) {
          const s = JSON.parse(raw);
          cases = s.cases || [];
          auditLog = s.auditLog || [];
        }
      } catch (e) {}
      const loginAudit = makeAudit(u.email, 'USER_LOGIN', 'Session', u.email, `Signed in as ${role}`);
      let newState = { ...state, user, cases, auditLog: [loginAudit, ...auditLog] };
      return seedDemoData(newState);
    }

    case 'LOGOUT':
      return { ...initialState };

    case 'ADD_CASE': {
      const newCase = buildCase(state.cases.length, action.data);
      const audit = makeAudit(
        state.user?.email || 'system',
        'CASE_CREATED',
        'LifecycleCase',
        newCase.id,
        `${action.data.type} case for ${action.data.person.name}`
      );
      return {
        ...state,
        cases: [...state.cases, newCase],
        auditLog: [audit, ...state.auditLog],
      };
    }

    case 'UPDATE_TASK': {
      const { caseId, taskId, status, comment, fileName } = action;
      const oldTask = state.cases.find((c) => c.id === caseId)?.tasks.find((t) => t.id === taskId);
      const newCases = state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return {
          ...c,
          tasks: c.tasks.map((t) => {
            if (t.id !== taskId) return t;
            const updated = { ...t };
            if (status) updated.status = status;
            if (comment) {
              updated.comments = [...t.comments, { author: state.user.name, text: comment, ts: new Date().toISOString() }];
            }
            if (fileName) {
              updated.evidenceFiles = [...t.evidenceFiles, { name: fileName, uploadedBy: state.user.name, ts: new Date().toISOString() }];
            }
            return updated;
          }),
        };
      });
      const newAudits = [];
      if (comment) {
        newAudits.push(makeAudit(state.user?.email, 'COMMENT_ADDED', 'TaskInstance', taskId, `"${comment.substring(0, 60)}"`));
      }
      if (fileName) {
        newAudits.push(makeAudit(state.user?.email, 'EVIDENCE_UPLOADED', 'TaskInstance', taskId, `File: ${fileName}`));
      }
      if (status && oldTask && oldTask.status !== status) {
        newAudits.push(makeAudit(state.user?.email, 'TASK_UPDATED', 'TaskInstance', taskId, `Status: ${oldTask.status} → ${status}`));
      }
      return { ...state, cases: newCases, auditLog: [...newAudits, ...state.auditLog] };
    }

    case 'CLOSE_CASE': {
      const newCases = state.cases.map((c) => (c.id === action.caseId ? { ...c, status: 'COMPLETED' } : c));
      const audit = makeAudit(state.user?.email, 'CASE_STATUS_CHANGED', 'LifecycleCase', action.caseId, 'ACTIVE → COMPLETED');
      return { ...state, cases: newCases, auditLog: [audit, ...state.auditLog] };
    }

    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, { id: ++toastId, msg: action.msg, toastType: action.toastType || 'info' }] };

    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    if (state.user) {
      try {
        localStorage.setItem('slp_state', JSON.stringify({ cases: state.cases, auditLog: state.auditLog }));
      } catch (e) {}
    }
  }, [state.cases, state.auditLog, state.user]);

  const toast = useCallback((msg, type = 'info') => {
    dispatch({ type: 'ADD_TOAST', msg, toastType: type });
  }, []);

  return <AppContext.Provider value={{ state, dispatch, toast }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
