import { TICKET_PRIORITY, PRIORITY_SLA } from '../constants/status';

/**
 * Validates ticket / complaint form inputs
 * @param {Object} input - { title, description, category }
 * @returns {{ isValid: boolean, errors: string[] }}
 */
export function validateComplaintInput(input = {}) {
  const errors = [];
  const title = (input.title || '').trim();
  const description = (input.description || '').trim();
  const category = (input.category || '').trim();

  if (!title) {
    errors.push('Title is required');
  } else if (title.length < 5) {
    errors.push('Title must be at least 5 characters long');
  }

  if (!description) {
    errors.push('Description is required');
  } else if (description.length < 10) {
    errors.push('Description must be at least 10 characters long');
  }

  if (!category) {
    errors.push('Category is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculates remaining SLA hours and breach status
 * @param {string} priority - Ticket priority (e.g., P1 - Critical, P2 - High, P1_CRITICAL, etc.)
 * @param {string|Date} createdAt - ISO string or Date object
 * @param {Date} [currentTime=new Date()] - Reference timestamp for deterministic testing
 * @returns {{ slaHours: number, targetDeadline: string, remainingHours: number, isBreached: boolean }}
 */
export function calculateSlaTarget(priority, createdAt, currentTime = new Date()) {
  let slaHours = PRIORITY_SLA[priority];
  if (slaHours === undefined) {
    const p = String(priority || '').toUpperCase();
    if (p.includes('P1') || p.includes('CRITICAL')) {
      slaHours = 4;
    } else if (p.includes('P2') || p.includes('HIGH')) {
      slaHours = 12;
    } else if (p.includes('P3') || p.includes('MODERATE') || p.includes('MEDIUM')) {
      slaHours = 24;
    } else {
      slaHours = 48;
    }
  }

  const createdDate = new Date(createdAt);
  const targetDeadline = new Date(createdDate.getTime() + slaHours * 60 * 60 * 1000);
  const now = new Date(currentTime);

  const diffMs = targetDeadline.getTime() - now.getTime();
  const remainingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  const isBreached = remainingHours <= 0;

  return {
    slaHours,
    targetDeadline: targetDeadline.toISOString(),
    remainingHours,
    isBreached,
  };
}

/**
 * Generates and validates a deterministic ticket token number: ^TKN-[0-9]{6}$
 * @returns {string} Token formatted as TKN-XXXXXX
 */
export function generateTokenNumber() {
  const randomSixDigits = Math.floor(100000 + Math.random() * 900000);
  const token = `TKN-${randomSixDigits}`;
  const tokenRegex = /^TKN-[0-9]{6}$/;
  if (!tokenRegex.test(token)) {
    throw new Error(`Generated token ${token} failed format validation`);
  }
  return token;
}

/**
 * Filters tickets deterministically by search query, status, and priority
 * @param {Array} tickets - Array of complaint / ticket objects
 * @param {Object} filters - { searchQuery, statusFilter, priorityFilter }
 * @returns {Array} Filtered tickets
 */
export function filterTickets(
  tickets = [],
  { searchQuery = '', statusFilter = 'ALL', priorityFilter = 'ALL' } = {}
) {
  return tickets.filter((ticket) => {
    // 1. Status Filter
    if (statusFilter && statusFilter.toUpperCase() !== 'ALL') {
      const ticketStatus = (ticket.status || '').toUpperCase();
      const targetStatus = statusFilter.toUpperCase();
      if (ticketStatus !== targetStatus) return false;
    }

    // 2. Priority Filter
    if (priorityFilter && priorityFilter.toUpperCase() !== 'ALL') {
      const ticketPriority = (ticket.priority || '').toUpperCase();
      const targetPriority = priorityFilter.toUpperCase();
      if (!ticketPriority.includes(targetPriority) && ticketPriority !== targetPriority) return false;
    }

    // 3. Search Query
    if (searchQuery && searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase().trim();
      const matchTitle = (ticket.title || '').toLowerCase().includes(query);
      const matchDesc = (ticket.description || '').toLowerCase().includes(query);
      const matchToken = (ticket.tokenNumber || '').toLowerCase().includes(query);
      const matchTicketId = (ticket.ticketId || '').toLowerCase().includes(query);
      const matchCategory = (ticket.category || '').toLowerCase().includes(query);
      const matchFlat = (
        ticket.location?.flatNo ||
        ticket.resident?.flatNo ||
        ''
      ).toLowerCase().includes(query);
      const matchTech = (
        ticket.technician?.name ||
        ticket.technician_name ||
        ''
      ).toLowerCase().includes(query);

      return (
        matchTitle ||
        matchDesc ||
        matchToken ||
        matchTicketId ||
        matchCategory ||
        matchFlat ||
        matchTech
      );
    }

    return true;
  });
}

/**
 * Checks if a ticket can be cancelled by resident (status is Pending and created within 24 hours)
 * @param {Object} ticket
 * @param {Date} [currentTime=new Date()]
 * @returns {boolean}
 */
export function canCancelTicket(ticket, currentTime = new Date()) {
  if (!ticket) return false;
  const status = (ticket.status || '').toLowerCase();
  if (status !== 'pending') return false;

  const createdTime = ticket.createdAt?.seconds
    ? ticket.createdAt.seconds * 1000
    : new Date(ticket.createdAt).getTime();

  if (isNaN(createdTime)) return false;
  const now = new Date(currentTime).getTime();
  const diffHours = (now - createdTime) / (1000 * 60 * 60);
  return diffHours >= 0 && diffHours < 24;
}

