import { isValidTransition, NotificationStatus, VALID_TRANSITIONS } from '../../src/notifications/state-machine/notification-states';

describe('Notification State Machine', () => {
  describe('isValidTransition', () => {
    it('should allow CREATED -> ENRICHED', () => {
      expect(isValidTransition(NotificationStatus.CREATED, NotificationStatus.ENRICHED)).toBe(true);
    });

    it('should allow ENRICHED -> ROUTED', () => {
      expect(isValidTransition(NotificationStatus.ENRICHED, NotificationStatus.ROUTED)).toBe(true);
    });

    it('should allow ROUTED -> SENT', () => {
      expect(isValidTransition(NotificationStatus.ROUTED, NotificationStatus.SENT)).toBe(true);
    });

    it('should allow SENT -> DELIVERED', () => {
      expect(isValidTransition(NotificationStatus.SENT, NotificationStatus.DELIVERED)).toBe(true);
    });

    it('should allow DELIVERED -> READ', () => {
      expect(isValidTransition(NotificationStatus.DELIVERED, NotificationStatus.READ)).toBe(true);
    });

    it('should allow FAILED -> DLQ', () => {
      expect(isValidTransition(NotificationStatus.FAILED, NotificationStatus.DLQ)).toBe(true);
    });

    it('should NOT allow CREATED -> DELIVERED', () => {
      expect(isValidTransition(NotificationStatus.CREATED, NotificationStatus.DELIVERED)).toBe(false);
    });

    it('should NOT allow DELIVERED -> CREATED', () => {
      expect(isValidTransition(NotificationStatus.DELIVERED, NotificationStatus.CREATED)).toBe(false);
    });

    it('should NOT allow READ -> any state', () => {
      expect(isValidTransition(NotificationStatus.READ, NotificationStatus.FAILED)).toBe(false);
      expect(isValidTransition(NotificationStatus.READ, NotificationStatus.DELIVERED)).toBe(false);
    });

    it('should NOT allow DLQ -> any state', () => {
      expect(isValidTransition(NotificationStatus.DLQ, NotificationStatus.RETRYING)).toBe(false);
    });

    it('should allow ROUTED -> CAPPED', () => {
      expect(isValidTransition(NotificationStatus.ROUTED, NotificationStatus.CAPPED)).toBe(true);
    });

    it('should allow ROUTED -> DND', () => {
      expect(isValidTransition(NotificationStatus.ROUTED, NotificationStatus.DND)).toBe(true);
    });
  });

  describe('VALID_TRANSITIONS completeness', () => {
    it('should have transitions defined for all states', () => {
      const allStates = Object.values(NotificationStatus);
      allStates.forEach(state => {
        expect(VALID_TRANSITIONS[state]).toBeDefined();
      });
    });
  });
});