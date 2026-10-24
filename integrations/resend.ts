/**
 * ==============================================================================
 * integrations/resend.ts - Resend Transactional Email with Mock Fallback
 * ==============================================================================
 * Provides clean transactional email notifications (welcome emails, alerts,
 * purchase receipts, reports) with zero configuration required.
 * ==============================================================================
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

export interface EmailResult {
  id: string;
  to: string | string[];
  status: 'sent' | 'mocked';
  isMock: boolean;
  timestamp: string;
}

export class ResendService {
  private apiKey?: string;
  private defaultFrom: string;
  private isMockMode: boolean;

  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.defaultFrom = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    this.isMockMode = 
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
      !this.apiKey || 
      this.apiKey === 'mock' ||
      this.apiKey.startsWith('mock_');
  }

  /**
   * Sends an email with automatic mock fallback
   */
  async send(options: EmailOptions): Promise<EmailResult> {
    const { to, subject, html, text, from = this.defaultFrom } = options;
    const now = new Date().toISOString();

    // 1. Mock Fallback
    if (this.isMockMode || !this.apiKey) {
      const mockId = `re_mock_${Math.random().toString(36).substring(2, 14)}`;
      const target = Array.isArray(to) ? to.join(', ') : to;
      
      console.log(`\x1b[35m[Resend MOCK EMAIL]\x1b[0m To: \x1b[33m${target}\x1b[0m`);
      console.log(`  └─ Subject: "${subject}" (ID: ${mockId})`);
      
      // Simulate realistic email delivery delay
      await new Promise(r => setTimeout(r, 220));

      return {
        id: mockId,
        to,
        status: 'mocked',
        isMock: true,
        timestamp: now
      };
    }

    // 2. Live Resend REST API
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from,
          to: Array.isArray(to) ? to : [to],
          subject,
          html: html || `<p>${text || subject}</p>`,
          text: text || subject
        })
      });

      if (!res.ok) {
        throw new Error(`Resend API returned status ${res.status}`);
      }

      const json = await res.json();
      return {
        id: json.id,
        to,
        status: 'sent',
        isMock: false,
        timestamp: now
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`\x1b[33m[Resend WARN]\x1b[0m Live email dispatch failed (${msg}). Simulating delivery.`);
      return {
        id: `re_mock_fallback_${Date.now()}`,
        to,
        status: 'mocked',
        isMock: true,
        timestamp: now
      };
    }
  }

  /**
   * Sends a pre-styled modern dark transactional receipt email for demo flows
   */
  async sendReceiptEmail(params: {
    to: string;
    customerName: string;
    items: Array<{ name: string; amount: number }>;
    totalAmount: number;
    currency?: string;
  }): Promise<EmailResult> {
    const { to, customerName, items, totalAmount, currency = 'USD' } = params;
    
    const itemsHtml = items.map(item => `
      <tr style="border-bottom: 1px solid #27272a;">
        <td style="padding: 12px 0; color: #e4e4e7;">${item.name}</td>
        <td style="padding: 12px 0; text-align: right; color: #a1a1aa;">$${item.amount.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 32px; border-radius: 12px; max-width: 540px; margin: auto;">
        <h2 style="color: #ffffff; margin-top: 0;">Payment Confirmation</h2>
        <p style="color: #a1a1aa;">Hello ${customerName}, your transaction was successfully processed in Judge Demo Mode.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="border-bottom: 2px solid #3f3f46; text-align: left; color: #71717a; font-size: 12px; text-transform: uppercase;">
              <th style="padding-bottom: 8px;">Description</th>
              <th style="padding-bottom: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding-top: 16px; font-weight: bold; color: #ffffff;">Total Billed</td>
              <td style="padding-top: 16px; font-weight: bold; text-align: right; color: #10b981;">$${totalAmount.toFixed(2)} ${currency}</td>
            </tr>
          </tfoot>
        </table>
        <p style="color: #71717a; font-size: 12px; margin-top: 24px; text-align: center;">HackathAll Fail-Safe Transaction Simulator</p>
      </div>
    `;

    return this.send({
      to,
      subject: `Receipt: $${totalAmount.toFixed(2)} Confirmation for ${customerName}`,
      html
    });
  }
}

// Singleton export
export const resend = new ResendService();
