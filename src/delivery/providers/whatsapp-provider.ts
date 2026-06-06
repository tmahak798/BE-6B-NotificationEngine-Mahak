// WhatsApp Provider - Simulated for development
// In production uses WhatsApp Cloud API

export interface WhatsAppPayload {
  to: string;        // phone number with country code
  message: string;
  templateName?: string;
}

export async function sendWhatsApp(payload: WhatsAppPayload): Promise<{
  success: boolean;
  messageId?: string;
  error?: string;
}> {
  if (!payload.to.startsWith('+')) {
    return { success: false, error: 'Phone number must include country code' };
  }

  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 100));

  // WhatsApp has ~92% delivery rate
  const isSuccess = Math.random() < 0.92;

  if (!isSuccess) {
    return { success: false, error: 'whatsapp_rate_limited' };
  }

  const messageId = `WA-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  console.log(`[WHATSAPP SENT] To: ${payload.to} | Message: ${payload.message}`);
  console.log(`[WHATSAPP] Message ID: ${messageId}`);

  return { success: true, messageId };
}