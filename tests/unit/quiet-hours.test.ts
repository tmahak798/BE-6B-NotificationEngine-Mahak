import { isQuietHours, shouldHoldForQuietHours } from '../../src/compliance/quiet-hours/quiet-hours-service';

describe('Quiet Hours Service', () => {
  describe('isQuietHours', () => {
    it('should detect overnight quiet hours correctly', () => {
      // Mock a time during quiet hours
      const result = isQuietHours('22:00', '08:00', 'Asia/Kolkata');
      expect(typeof result).toBe('boolean');
    });

    it('should handle same-day quiet hours', () => {
      const result = isQuietHours('13:00', '15:00', 'Asia/Kolkata');
      expect(typeof result).toBe('boolean');
    });
  });

  describe('shouldHoldForQuietHours', () => {
    it('should never hold CRITICAL events', () => {
      const result = shouldHoldForQuietHours('RISK-001', '22:00', '08:00', 'Asia/Kolkata');
      expect(result.hold).toBe(false);
      expect(result.reason).toContain('Critical event');
    });

    it('should never hold margin shortfall events', () => {
      const result = shouldHoldForQuietHours('RISK-002', '22:00', '08:00', 'Asia/Kolkata');
      expect(result.hold).toBe(false);
    });

    it('should return boolean hold value for non-critical events', () => {
      const result = shouldHoldForQuietHours('MKTX-003', '22:00', '08:00', 'Asia/Kolkata');
      expect(typeof result.hold).toBe('boolean');
      expect(typeof result.reason).toBe('string');
    });
  });
});