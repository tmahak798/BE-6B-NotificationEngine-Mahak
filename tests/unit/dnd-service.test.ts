import { shouldSendDespiteDnd, classifyMessage, MessageClassification } from '../../src/compliance/dnd/dnd-service';

describe('DND Service', () => {
  describe('classifyMessage', () => {
    it('should classify margin call as TRANSACTIONAL', () => {
      expect(classifyMessage('RISK-001')).toBe(MessageClassification.TRANSACTIONAL);
    });

    it('should classify buy order as TRANSACTIONAL', () => {
      expect(classifyMessage('TXNX-001')).toBe(MessageClassification.TRANSACTIONAL);
    });

    it('should classify SIP step-up reminder as PROMOTIONAL', () => {
      expect(classifyMessage('SIPX-004')).toBe(MessageClassification.PROMOTIONAL);
    });

    it('should classify market open as PROMOTIONAL', () => {
      expect(classifyMessage('MKTX-003')).toBe(MessageClassification.PROMOTIONAL);
    });
  });

  describe('shouldSendDespiteDnd', () => {
    it('should allow SMS for non-DND user', () => {
      const result = shouldSendDespiteDnd('MKTX-003', 'not_registered', 'sms');
      expect(result.allowed).toBe(true);
    });

    it('should block promotional SMS for DND user', () => {
      const result = shouldSendDespiteDnd('MKTX-003', 'registered', 'sms');
      expect(result.allowed).toBe(false);
    });

    it('should allow critical event SMS even for DND user', () => {
      const result = shouldSendDespiteDnd('RISK-001', 'registered', 'sms');
      expect(result.allowed).toBe(true);
    });

    it('should allow transactional SMS for DND user', () => {
      const result = shouldSendDespiteDnd('TXNX-001', 'registered', 'sms');
      expect(result.allowed).toBe(true);
    });

    it('should allow push notifications regardless of DND', () => {
      const result = shouldSendDespiteDnd('MKTX-003', 'registered', 'push');
      expect(result.allowed).toBe(true);
    });

    it('should allow email regardless of DND', () => {
      const result = shouldSendDespiteDnd('SIPX-004', 'registered', 'email');
      expect(result.allowed).toBe(true);
    });
  });
});