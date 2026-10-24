/**
 * ==============================================================================
 * integrations/index.ts - Sponsor API & Mock Fallback Central Hub
 * ==============================================================================
 * Plug-and-play sponsor integrations engineered with cascading mock fallbacks.
 *
 * Usage:
 *   import { elevenlabs, supabase, twilio, resend } from '@/integrations';
 *
 *   // Voice Synthesis (ElevenLabs)
 *   const { audioUrl } = await elevenlabs.synthesize({ text: "Hello judges!" });
 *
 *   // Database & Judge Session (Supabase)
 *   const session = supabase.getJudgeSession();
 *   const { data } = await supabase.select('transactions');
 *
 *   // Notifications (Twilio & Resend)
 *   await twilio.sendSMS({ to: '+15551234567', body: 'Trade executed' });
 *   await resend.send({ to: 'team@apex.io', subject: 'Demo Ready' });
 * ==============================================================================
 */

export * from './voice-elevenlabs.ts';
export * from './auth-db-supabase.ts';
export * from './comms-twilio.ts';
export * from './resend.ts';
