export const ROLES = {
  CITIZEN: 'citizen',
  HEAD_AUTHORITY: 'head_authority',
};

export const DEPARTMENTS = [
  'Head Authority',
  'Road Maintenance',
  'Drainage',
  'Garbage Management',
  'Streetlight Department',
];

export const ISSUE_STATUS = {
  REPORTED: 'reported',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
};

export const NAV_LINKS = {
  [ROLES.CITIZEN]: [
    { to: '/citizen/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { to: '/citizen/report', label: 'Report Issue', icon: 'PlusCircle' },
    { to: '/citizen/my-issues', label: 'My Issues', icon: 'ClipboardList' },
  ],
  [ROLES.HEAD_AUTHORITY]: [
    { to: '/head-authority/dashboard', label: 'Global Overview', icon: 'LayoutDashboard' },
    { to: '/head-authority/management', label: 'Issue Management', icon: 'ShieldCheck' },
    { to: '/head-authority/departments', label: 'Departments', icon: 'Users' },
  ],
};

export const MOCK_ISSUES = [
  {
    id: '1',
    title: 'Large pothole on Main St',
    description: 'A dangerous pothole is causing traffic issues.',
    image: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=1000',
    location: { lat: 12.9716, lng: 77.5946, address: 'Main St, Bangalore' },
    status: ISSUE_STATUS.REPORTED,
    department: 'Road Maintenance',
    issueType: 'Road Damage',
    aiConfidence: 'High',
    citizenId: 'citizen1',
    createdAt: '2024-02-01T10:00:00Z',
  },
  {
    id: '2',
    title: 'Broken streetlight near park',
    description: 'The streetlight has been out for three days.',
    image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?auto=format&fit=crop&q=80&w=1000',
    location: { lat: 12.9720, lng: 77.5950, address: 'Park Avenue, Bangalore' },
    status: ISSUE_STATUS.IN_PROGRESS,
    department: 'Road Maintenance',
    issueType: 'Electrical Issue',
    aiConfidence: 'Medium',
    citizenId: 'citizen1',
    createdAt: '2024-01-28T14:30:00Z',
  },
  {
    id: '3',
    title: 'Blocked drainage on 5th Cross',
    description: 'The drain is overflowing after the recent rains.',
    image: 'https://images.unsplash.com/photo-1599939571322-792a326991f2?auto=format&fit=crop&q=80&w=1000',
    location: { lat: 12.9710, lng: 77.5940, address: '5th Cross, Indiranagar' },
    status: ISSUE_STATUS.REPORTED,
    department: 'Road Maintenance',
    issueType: 'Drainage Issue',
    aiConfidence: 'High',
    citizenId: 'citizen2',
    createdAt: '2024-02-02T08:15:00Z',
  },
  {
    id: '4',
    title: 'Illegal garbage dumping',
    description: 'Someone is dumping waste in the vacant lot.',
    image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&q=80&w=1000',
    location: { lat: 12.9730, lng: 77.5960, address: 'Koramangala 4th Block' },
    status: ISSUE_STATUS.IN_PROGRESS,
    department: 'Road Maintenance',
    issueType: 'Sanitation Issue',
    aiConfidence: 'Medium',
    citizenId: 'citizen3',
    createdAt: '2024-01-30T16:45:00Z',
  },
];
