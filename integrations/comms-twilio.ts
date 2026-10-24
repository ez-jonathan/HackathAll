/**
 * ==============================================================================
 * integrations/comms-twilio.ts - Twilio SMS & WhatsApp with Mock Fallback
 * ==============================================================================
 * Provides instant SMS and WhatsApp messaging triggers for user verification,
 * alert notifications, or AI status updates with zero setup required.
 * ==============================================================================
 */

export interface SMSOptions {
  to: string;
  body: string;
  from?: string;
}

export interface WhatsAppOptions {
  to: string;
  body: string;
}

export interface MessageResult {
  sid: string;
  to: string;
  status: 'sent' | 'delivered' | 'mocked';
  isMock: boolean;
  timestamp: string;
}

export class TwilioService {
  private accountSid?: string;
  private authToken?: string;
  private defaultFromNumber?: string;
  private isMockMode: boolean;

  constructor() {
    this.accountSid = process.env.TWILIO_ACCOUNT_SID;
    this.authToken = process.env.TWILIO_AUTH_TOKEN;
    this.defaultFromNumber = process.env.TWILIO_PHONE_NUMBER || '+15005550006';
    
    this.isMockMode = 
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
      !this.accountSid || 
      !this.authToken ||
      this.accountSid.startsWith('mock_');
  }

  /**
   * Sends an SMS message with fail-safe mock fallback
   */
  async sendSMS(options: SMSOptions): Promise<MessageResult> {
    const { to, body, from = this.defaultFromNumber } = options;
    const now = new Date().toISOString();

    // 1. Mock Fallback
    if (this.isMockMode || !this.accountSid || !this.authToken) {
      const mockSid = `SM_mock_${Math.random().toString(36).substring(2, 12)}`;
      console.log(`\x1b[32m[Twilio MOCK SMS]\x1b[0m To: \x1b[33m${to}\x1b[0m`);
      console.log(`  └─ Message: "${body}" (SID: ${mockSid})`);
      
      // Artificial sub-second delivery delay
      await new Promise(r => setTimeout(r, 200));

      return {
        sid: mockSid,
        to,
        status: 'delivered',
        isMock: true,
        timestamp: now
      };
    }

    // 2. Live Twilio API Request
    try {
      const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const authHeader = 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
      
      const formData = new URLSearchParams();
      formData.append('To', to);
      formData.append('From', from || '');
      formData.append('Body', body);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString()
      });

      if (!res.ok) {
        throw new Error(`Twilio API responded with ${res.status}: ${res.statusText}`);
      }

      const json = await res.json();
      return {
        sid: json.sid,
        to: json.to,
        status: json.status,
        isMock: false,
        timestamp: now
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`\x1b[33m[Twilio WARN]\x1b[0m Live SMS failed (${msg}). Falling back to simulated delivery.`);
      return {
        sid: `SM_mock_fallback_${Date.now()}`,
        to,
        status: 'mocked',
        isMock: true,
        timestamp: now
      };
    }
  }

  /**
   * Sends a WhatsApp message
   */
  async sendWhatsApp(options: WhatsAppOptions): Promise<MessageResult> {
    const formattedTo = options.to.startsWith('whatsapp:') ? options.to : `whatsapp:${options.to}`;
    return this.sendSMS({
      to: formattedTo,
      body: options.body,
      from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
    });
  }
}

// Singleton export
export const twilio = new TwilioService();
