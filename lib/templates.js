export const TEMPLATES = {
  ONBOARDING: {
    name: 'New Hire Onboarding v1',
    phases: [
      {
        name: 'Pre-Hire Actions',
        tasks: [
          { title: 'Draft offer letter', ownerRole: 'HR_ADMIN', dueDays: -14, evidence: true },
          { title: 'Approve offer letter', ownerRole: 'HR_ADMIN', dueDays: -12 },
          { title: 'Extend offer to candidate', ownerRole: 'HR_ADMIN', dueDays: -10 },
          { title: 'Background check consent obtained', ownerRole: 'HR_ADMIN', dueDays: -10, evidence: true },
          { title: 'Run background check', ownerRole: 'HR_ADMIN', dueDays: -7, evidence: true },
          { title: 'Confirm background check results', ownerRole: 'HR_ADMIN', dueDays: -5 },
          { title: 'Order computer + equipment', ownerRole: 'IT_ADMIN', dueDays: -10 },
          { title: 'Prepare platform access list', ownerRole: 'IT_ADMIN', dueDays: -5 },
        ],
      },
      {
        name: 'Post Offer Acceptance',
        tasks: [
          { title: 'Offer accepted — confirm start date', ownerRole: 'HR_ADMIN', dueDays: -7 },
          { title: 'Initiate HRIS onboarding record', ownerRole: 'HR_ADMIN', dueDays: -5 },
          { title: 'Employee completes onboarding paperwork', ownerRole: 'TASK_OWNER', dueDays: -3, evidence: true },
          { title: 'I-9 verification (Section 1 + Section 2)', ownerRole: 'HR_ADMIN', dueDays: 1, evidence: true },
          { title: 'Notify payroll of new hire', ownerRole: 'HR_ADMIN', dueDays: -5 },
          { title: 'Set up benefit accruals in payroll system', ownerRole: 'FINANCE_ADMIN', dueDays: 1 },
          { title: 'Schedule tech setup call with employee', ownerRole: 'IT_ADMIN', dueDays: -2 },
          { title: 'Provision Entra ID account + email', ownerRole: 'IT_ADMIN', dueDays: -3, evidence: true },
          { title: 'Grant platform/application access', ownerRole: 'IT_ADMIN', dueDays: 0 },
        ],
      },
      {
        name: 'Day One + Onward',
        tasks: [
          { title: 'Send welcome email to team', ownerRole: 'MANAGER', dueDays: 0 },
          { title: 'Assign onboarding buddy', ownerRole: 'MANAGER', dueDays: 0 },
          { title: 'Conduct Day 1 orientation', ownerRole: 'HR_ADMIN', dueDays: 1 },
          { title: '30-day check-in with employee', ownerRole: 'MANAGER', dueDays: 30 },
          { title: '90-day performance check-in', ownerRole: 'MANAGER', dueDays: 90 },
        ],
      },
    ],
  },
  OFFBOARDING: {
    name: 'Employee Offboarding v1',
    phases: [
      {
        name: 'Notice + Planning',
        tasks: [
          { title: 'Employee submits resignation notice', ownerRole: 'MANAGER', dueDays: 0 },
          { title: 'Confirm last working day', ownerRole: 'HR_ADMIN', dueDays: 1 },
          { title: 'Notify payroll of termination', ownerRole: 'HR_ADMIN', dueDays: 2 },
          { title: 'Notify CMIT/IT team of termination date', ownerRole: 'IT_ADMIN', dueDays: 2 },
          { title: 'Schedule exit interview', ownerRole: 'HR_ADMIN', dueDays: 3 },
          { title: 'Prepare separation letter', ownerRole: 'HR_ADMIN', dueDays: 3, evidence: true },
          { title: 'PTO payout plan confirmed', ownerRole: 'FINANCE_ADMIN', dueDays: 5 },
        ],
      },
      {
        name: 'Access Termination + Data',
        tasks: [
          { title: 'Set access cut-off datetime (Eastern)', ownerRole: 'IT_ADMIN', dueDays: -1, evidence: true },
          { title: 'Disable Entra ID account / block sign-in', ownerRole: 'IT_ADMIN', dueDays: -1 },
          { title: 'Revoke all active sessions + refresh tokens', ownerRole: 'IT_ADMIN', dueDays: -1 },
          { title: 'Remove from distribution groups', ownerRole: 'IT_ADMIN', dueDays: 0 },
          { title: 'Set mailbox auto-reply (out-of-office)', ownerRole: 'IT_ADMIN', dueDays: -1 },
          { title: 'Convert mailbox to shared OR set forwarding', ownerRole: 'IT_ADMIN', dueDays: 0 },
          { title: 'Request mirroring of OneDrive + emails', ownerRole: 'MANAGER', dueDays: -2, evidence: true },
          { title: 'Remove / adjust M365 licenses', ownerRole: 'IT_ADMIN', dueDays: 1 },
        ],
      },
      {
        name: 'Equipment + Closeout',
        tasks: [
          { title: 'Plan equipment collection (in-person or shipping box)', ownerRole: 'IT_ADMIN', dueDays: -5 },
          { title: 'Shipping box sent to employee', ownerRole: 'IT_ADMIN', dueDays: -3, evidence: true },
          { title: 'Equipment returned + received', ownerRole: 'IT_ADMIN', dueDays: 5, evidence: true },
          { title: 'Conduct exit interview', ownerRole: 'HR_ADMIN', dueDays: -1 },
          { title: 'Final paycheck processed', ownerRole: 'FINANCE_ADMIN', dueDays: 7 },
          { title: 'Remove from org chart + HR records updated', ownerRole: 'HR_ADMIN', dueDays: 1 },
          { title: 'Close lifecycle case', ownerRole: 'HR_ADMIN', dueDays: 7 },
        ],
      },
    ],
  },
};
