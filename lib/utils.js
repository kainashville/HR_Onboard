export function fmtDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function addDays(d, n) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function canActOnTask(task, userRole) {
  if (userRole === 'HR_ADMIN') return true;
  if (userRole === 'READ_ONLY_AUDITOR') return false;
  return task.ownerRole === userRole;
}

export function isOverdue(dueDate, status) {
  if (status === 'DONE' || status === 'NOT_APPLICABLE') return false;
  return dueDate < fmtDate(new Date());
}
