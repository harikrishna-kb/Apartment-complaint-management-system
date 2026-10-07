export const TICKET_STATUS = {
  PENDING: 'Pending',
  ASSIGNED: 'Assigned',
  IN_PROGRESS: 'In-Progress',
  RESOLVED: 'Resolved',
  CANCELLED: 'Cancelled',
};

export const TICKET_PRIORITY = {
  P1_CRITICAL: 'P1 - Critical',
  P2_HIGH: 'P2 - High',
  P3_MODERATE: 'P3 - Moderate',
  P3_MEDIUM: 'P3 - Moderate',
  P4_LOW: 'P4 - Low',
};

export const PRIORITY_SLA = {
  [TICKET_PRIORITY.P1_CRITICAL]: 4,   // 4 Hours SLA window
  [TICKET_PRIORITY.P2_HIGH]: 12,      // 12 Hours SLA window
  [TICKET_PRIORITY.P3_MODERATE]: 24,  // 24 Hours SLA window
  [TICKET_PRIORITY.P3_MEDIUM]: 24,    // 24 Hours SLA window
  [TICKET_PRIORITY.P4_LOW]: 48,       // 48 Hours SLA window
};

export const DEFAULT_COST_ESTIMATES = {
  'Plumbing': '₹350 (Parts/Labor)',
  'Electrical': '₹250 (Parts)',
  'HVAC & Lift': 'Society AMC Covered',
  'Structural': 'Society Covered',
  'Security': 'Society Covered',
};
