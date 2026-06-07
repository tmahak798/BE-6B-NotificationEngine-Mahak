import { renderTemplate, truncateSms } from '../../src/templates/engine/template-engine';
import { getTemplate } from '../../src/templates/definitions/templates';

describe('Template Engine', () => {
  describe('renderTemplate', () => {
    it('should render simple variables', () => {
      const result = renderTemplate('Hello {{name}}', { name: 'Rahul' });
      expect(result).toBe('Hello Rahul');
    });

    it('should render INR helper correctly', () => {
      const result = renderTemplate('Amount: {{inr amount}}', { amount: 125000 });
      expect(result).toContain('1,25,000');
    });

    it('should handle missing variables gracefully', () => {
      const result = renderTemplate('Hello {{name}}', {});
      expect(result).toBe('Hello ');
    });

    it('should handle truncate helper', () => {
      const longText = 'A'.repeat(200);
      const result = renderTemplate('{{truncate text 10}}', { text: longText });
      expect(result.length).toBeLessThanOrEqual(10);
    });
  });

  describe('truncateSms', () => {
    it('should not truncate messages under 160 chars', () => {
      const msg = 'Hello World';
      expect(truncateSms(msg)).toBe(msg);
    });

    it('should truncate messages over 160 chars', () => {
      const msg = 'A'.repeat(200);
      const result = truncateSms(msg);
      expect(result.length).toBeLessThanOrEqual(160);
      expect(result.endsWith('...')).toBe(true);
    });

    it('should truncate at exactly 160 chars', () => {
      const msg = 'A'.repeat(160);
      expect(truncateSms(msg)).toBe(msg);
    });
  });

  describe('getTemplate', () => {
    it('should return English template for RISK-001 SMS', () => {
      const template = getTemplate('RISK-001', 'sms', 'en');
      expect(template).not.toBeNull();
      expect(template).toContain('MARGIN CALL');
    });

    it('should return Hindi template for RISK-001 SMS', () => {
      const template = getTemplate('RISK-001', 'sms', 'hi');
      expect(template).not.toBeNull();
      expect(template).toContain('मार्जिन');
    });

    it('should fall back to English for unknown locale', () => {
      const template = getTemplate('RISK-001', 'sms', 'unknown');
      expect(template).not.toBeNull();
    });

    it('should return null for unknown event type', () => {
      const template = getTemplate('UNKNOWN-001', 'sms', 'en');
      expect(template).toBeNull();
    });

    it('should return push template for TXNX-001', () => {
      const template = getTemplate('TXNX-001', 'push', 'en');
      expect(template).not.toBeNull();
    });
  });
});