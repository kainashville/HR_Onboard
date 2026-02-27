export const ROLE_LABELS = {
  HR_ADMIN: 'HR Admin',
  IT_ADMIN: 'IT Admin',
  FINANCE_ADMIN: 'Finance Admin',
  MANAGER: 'Manager',
  TASK_OWNER: 'Task Owner',
  READ_ONLY_AUDITOR: 'Auditor',
};

export const DEMO_USERS = {
  HR_ADMIN:          { name: 'Sarah Chen',    email: 'schen@naba.org' },
  IT_ADMIN:          { name: 'Marcus Webb',   email: 'mwebb@naba.org' },
  MANAGER:           { name: 'Jamie Rivera',  email: 'jrivera@naba.org' },
  FINANCE_ADMIN:     { name: 'Pat Nguyen',    email: 'pnguyen@naba.org' },
  TASK_OWNER:        { name: 'Taylor Brooks', email: 'tbrooks@naba.org' },
  READ_ONLY_AUDITOR: { name: 'Auditor',       email: 'auditor@naba.org' },
};

export const STATUS_CONFIG = {
  NOT_STARTED:    { color: 'secondary', label: 'Not Started' },
  IN_PROGRESS:    { color: 'primary',   label: 'In Progress' },
  BLOCKED:        { color: 'danger',    label: 'Blocked' },
  DONE:           { color: 'success',   label: 'Done' },
  NOT_APPLICABLE: { color: 'secondary', label: 'N/A' },
};

export const ALL_STATUSES = ['NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'NOT_APPLICABLE'];
