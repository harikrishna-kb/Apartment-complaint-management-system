import { describe, it, expect } from 'vitest';
import {
  validateComplaintInput,
  calculateSlaTarget,
  generateTokenNumber,
  filterTickets,
  canCancelTicket,
} from './businessLogic';
import { matchesTechnician } from '../services/complaintService';
import { TICKET_PRIORITY } from '../constants/status';

describe('Pure Business Logic Test Suite', () => {
  describe('validateComplaintInput', () => {
    it('should validate complete valid inputs successfully', () => {
      const result = validateComplaintInput({
        title: 'Water pipe leakage',
        description: 'Water is leaking continuously from main kitchen valve',
        category: 'Plumbing',
      });
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors when title is missing or too short', () => {
      const missing = validateComplaintInput({
        title: '',
        description: 'Valid description that has more than 10 characters',
        category: 'Plumbing',
      });
      expect(missing.isValid).toBe(false);
      expect(missing.errors).toContain('Title is required');

      const tooShort = validateComplaintInput({
        title: 'Leak',
        description: 'Valid description that has more than 10 characters',
        category: 'Plumbing',
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors).toContain('Title must be at least 5 characters long');
    });

    it('should return errors when description is missing or too short', () => {
      const missing = validateComplaintInput({
        title: 'Elevator Stalled',
        description: '',
        category: 'Elevator',
      });
      expect(missing.isValid).toBe(false);
      expect(missing.errors).toContain('Description is required');

      const tooShort = validateComplaintInput({
        title: 'Elevator Stalled',
        description: 'Broken',
        category: 'Elevator',
      });
      expect(tooShort.isValid).toBe(false);
      expect(tooShort.errors).toContain('Description must be at least 10 characters long');
    });

    it('should return error when category is missing', () => {
      const result = validateComplaintInput({
        title: 'Door hinges squeaking',
        description: 'Main entrance security door hinges require lubrication',
        category: '',
      });
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Category is required');
    });
  });

  describe('calculateSlaTarget', () => {
    const baseCreated = '2026-10-07T10:00:00.000Z';

    it('should calculate accurate SLA hours and deadline for P1_CRITICAL (4h)', () => {
      // 2 hours after creation -> remaining: 2.00 hours, not breached
      const twoHoursLater = '2026-10-07T12:00:00.000Z';
      const result = calculateSlaTarget(TICKET_PRIORITY.P1_CRITICAL, baseCreated, twoHoursLater);

      expect(result.slaHours).toBe(4);
      expect(result.targetDeadline).toBe('2026-10-07T14:00:00.000Z');
      expect(result.remainingHours).toBe(2);
      expect(result.isBreached).toBe(false);
    });

    it('should flag SLA breach when current time exceeds deadline', () => {
      // 5 hours after creation -> remaining: -1.00 hours, breached
      const fiveHoursLater = '2026-10-07T15:00:00.000Z';
      const result = calculateSlaTarget(TICKET_PRIORITY.P1_CRITICAL, baseCreated, fiveHoursLater);

      expect(result.slaHours).toBe(4);
      expect(result.remainingHours).toBe(-1);
      expect(result.isBreached).toBe(true);
    });

    it('should calculate accurate SLA for P2_HIGH (12h) and P3_MEDIUM (24h)', () => {
      const p2 = calculateSlaTarget(TICKET_PRIORITY.P2_HIGH, baseCreated, baseCreated);
      expect(p2.slaHours).toBe(12);
      expect(p2.remainingHours).toBe(12);

      const p3 = calculateSlaTarget(TICKET_PRIORITY.P3_MEDIUM, baseCreated, baseCreated);
      expect(p3.slaHours).toBe(24);
      expect(p3.remainingHours).toBe(24);
    });
  });

  describe('generateTokenNumber', () => {
    it('should generate valid token matching ^TKN-[0-9]{6}$', () => {
      const tokenRegex = /^TKN-[0-9]{6}$/;
      for (let i = 0; i < 20; i++) {
        const token = generateTokenNumber();
        expect(token).toMatch(tokenRegex);
      }
    });
  });

  describe('filterTickets', () => {
    const sampleTickets = [
      {
        id: '1',
        ticketId: 'CMS-101',
        tokenNumber: 'TKN-111111',
        title: 'Kitchen pipe burst',
        description: 'Water spraying in kitchen',
        category: 'Plumbing',
        status: 'PENDING',
        priority: 'P1_CRITICAL',
        location: { flatNo: 'A-101' },
      },
      {
        id: '2',
        ticketId: 'CMS-102',
        tokenNumber: 'TKN-222222',
        title: 'Corridor light flickering',
        description: 'Bulb on 4th floor flickering',
        category: 'Electrical',
        status: 'ASSIGNED',
        priority: 'P3_MEDIUM',
        location: { flatNo: 'B-402' },
        technician: { name: 'Ramesh Sharma' },
      },
      {
        id: '3',
        ticketId: 'CMS-103',
        tokenNumber: 'TKN-333333',
        title: 'Elevator door stuck',
        description: 'Lift B door does not open on 2nd floor',
        category: 'Elevator',
        status: 'RESOLVED',
        priority: 'P1_CRITICAL',
        location: { flatNo: 'Lift B' },
      },
    ];

    it('should filter by status accurately', () => {
      const pending = filterTickets(sampleTickets, { statusFilter: 'PENDING' });
      expect(pending).toHaveLength(1);
      expect(pending[0].ticketId).toBe('CMS-101');

      const resolved = filterTickets(sampleTickets, { statusFilter: 'RESOLVED' });
      expect(resolved).toHaveLength(1);
      expect(resolved[0].ticketId).toBe('CMS-103');
    });

    it('should filter by priority accurately', () => {
      const critical = filterTickets(sampleTickets, { priorityFilter: 'P1_CRITICAL' });
      expect(critical).toHaveLength(2);
      expect(critical.map((t) => t.ticketId)).toEqual(['CMS-101', 'CMS-103']);
    });

    it('should search across title, description, flat number, and technician name', () => {
      const byDesc = filterTickets(sampleTickets, { searchQuery: 'spraying' });
      expect(byDesc).toHaveLength(1);
      expect(byDesc[0].ticketId).toBe('CMS-101');

      const byFlat = filterTickets(sampleTickets, { searchQuery: 'B-402' });
      expect(byFlat).toHaveLength(1);
      expect(byFlat[0].ticketId).toBe('CMS-102');

      const byTech = filterTickets(sampleTickets, { searchQuery: 'Ramesh' });
      expect(byTech).toHaveLength(1);
      expect(byTech[0].ticketId).toBe('CMS-102');

      const byToken = filterTickets(sampleTickets, { searchQuery: 'TKN-333333' });
      expect(byToken).toHaveLength(1);
      expect(byToken[0].ticketId).toBe('CMS-103');
    });

    it('should return all tickets when no filters provided', () => {
      const all = filterTickets(sampleTickets);
      expect(all).toHaveLength(3);
    });
  });

  describe('canCancelTicket', () => {
    const fixedNow = new Date('2026-10-07T12:00:00Z');

    it('should allow cancellation when status is Pending and created within 24 hours', () => {
      const recentTicket = {
        status: 'Pending',
        createdAt: '2026-10-07T08:00:00Z', // 4 hours ago
      };
      expect(canCancelTicket(recentTicket, fixedNow)).toBe(true);
    });

    it('should deny cancellation when status is Pending but created more than 24 hours ago', () => {
      const oldTicket = {
        status: 'Pending',
        createdAt: '2026-10-06T10:00:00Z', // 26 hours ago
      };
      expect(canCancelTicket(oldTicket, fixedNow)).toBe(false);
    });

    it('should deny cancellation when ticket status is Assigned or Resolved even within 24 hours', () => {
      const assignedTicket = {
        status: 'Assigned',
        createdAt: '2026-10-07T11:00:00Z', // 1 hour ago
      };
      expect(canCancelTicket(assignedTicket, fixedNow)).toBe(false);

      const resolvedTicket = {
        status: 'Resolved',
        createdAt: '2026-10-07T11:00:00Z',
      };
      expect(canCancelTicket(resolvedTicket, fixedNow)).toBe(false);
    });
  });

  describe('matchesTechnician', () => {
    const ticketForVikram = {
      technician: {
        uid: 'tech_user_003',
        name: 'Vikram Singh',
        email: 'vikram@tech.com',
      },
      technician_id: 'tech_user_003',
      technician_name: 'Vikram Singh',
      technician_email: 'vikram@tech.com',
    };

    it('matches technician by direct UID', () => {
      expect(matchesTechnician(ticketForVikram, { userId: 'tech_user_003' })).toBe(true);
    });

    it('matches technician by email and name', () => {
      expect(matchesTechnician(ticketForVikram, { userEmail: 'vikram@tech.com' })).toBe(true);
      expect(matchesTechnician(ticketForVikram, { userName: 'Vikram Singh' })).toBe(true);
    });

    it('does not match a different technician', () => {
      expect(matchesTechnician(ticketForVikram, { userId: 'tech_user_001', userEmail: 'ramesh@tech.com' })).toBe(false);
    });
  });
});

