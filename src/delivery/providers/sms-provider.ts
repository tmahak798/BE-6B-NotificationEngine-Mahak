// SMS Provider - Simulated for development
// In production this would use Twilio or MSG91
// We simulate delivery to avoid needing API keys for now

export interface SmsPayload {
  to: string;        // phone number e.g. +919876543210
  message: string;   // max 160 chars
  senderId?: string; // e.g. WLTHBR
}

// Simulates SMS delivery
// Returns success with a fake message ID
export async function sendSms(payload: SmsPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  // Validate phone number format
  if (!payload.to.startsWith('+')) {
    return { success: false, error: 'Phone number must include country code' };
  }

  // Validate SMS length
  if (payload.message.length > 160) {
    return { success: false, error: 'SMS exceeds 160 character limit' };
  }

  // Simulate network delay (100-300ms)
  await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));

  // Simulate 95% success rate (realistic for SMS providers)
  const isSuccess = Math.random() < 0.95;

  if (!isSuccess) {
    return { success: false, error: 'provider_timeout' };
  }

  const messageId = `SMS-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[SMS SENT] To: ${payload.to} | Message: ${payload.message}`);
  console.log(`[SMS] Message ID: ${messageId}`);

  return { success: true, messageId };
}