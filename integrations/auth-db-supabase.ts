/**
 * ==============================================================================
 * integrations/auth-db-supabase.ts - Supabase CRUD & Judge Auth Wrapper
 * ==============================================================================
 * Instant database queries and session handling with 1-click Judge Mode.
 * If SUPABASE_URL / SUPABASE_ANON_KEY are missing or NEXT_PUBLIC_MOCK_MODE=true,
 * it operates against an in-memory/JSON-backed reactive mock database hydrated
 * from `data/seed.json`.
 * ==============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

export interface UserSession {
  id: string;
  email: string;
  name: string;
  role: string;
  avatarUrl: string;
  isJudge: boolean;
  accessToken: string;
}

export interface QueryResult<T> {
  data: T[] | null;
  error: string | null;
  count: number;
  isMock: boolean;
}

export interface SingleResult<T> {
  data: T | null;
  error: string | null;
  isMock: boolean;
}

export class SupabaseService {
  private url?: string;
  private anonKey?: string;
  private isMockMode: boolean;
  private mockStore: Record<string, any[]> = {};

  constructor() {
    this.url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    this.isMockMode = 
      process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || 
      !this.url || 
      !this.anonKey ||
      this.url.includes('placeholder') ||
      this.anonKey.includes('placeholder');

    this.initializeMockStore();
  }

  /**
   * Initializes mock tables from data/seed.json if available
   */
  private initializeMockStore() {
    try {
      const seedPath = path.resolve(process.cwd(), 'data', 'seed.json');
      if (fs.existsSync(seedPath)) {
        const raw = fs.readFileSync(seedPath, 'utf-8');
        const seed = JSON.parse(raw);
        this.mockStore['transactions'] = seed.fintech?.transactions || [];
        this.mockStore['accounts'] = seed.fintech?.accounts || [];
        this.mockStore['vitals'] = seed.health?.timeSeries || [];
        this.mockStore['alerts'] = seed.health?.aiClinicalAlerts || [];
        this.mockStore['traces'] = seed.agent?.recentTraces || [];
        this.mockStore['messages'] = seed.agent?.sampleConversation || [];
        return;
      }
    } catch {
      // Fallback to default in-memory tables
    }

    this.mockStore['transactions'] = [
      { id: 'tx_1', merchant: 'Anthropic API', amount: 142.50, type: 'debit', status: 'completed' },
      { id: 'tx_2', merchant: 'Stripe Payout', amount: 4850.00, type: 'credit', status: 'completed' }
    ];
  }

  /**
   * Returns a 1-click VIP Judge session to bypass all login/signup screens
   */
  getJudgeSession(): UserSession {
    return {
      id: 'usr_demo_judge_2026',
      email: 'judge.sarah@apexventures.io',
      name: 'Dr. Sarah Lin',
      role: 'Principal Judge & Hackathon Evaluator',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isJudge: true,
      accessToken: 'demo_judge_bearer_token_bypass_active'
    };
  }

  /**
   * Universal SELECT query with automatic mock fallback
   */
  async select<T = any>(table: string, filter?: (item: T) => boolean): Promise<QueryResult<T>> {
    if (this.isMockMode || !this.url || !this.anonKey) {
      console.log(`\x1b[36m[Supabase MOCK]\x1b[0m SELECT FROM "${table}"`);
      let rows: T[] = (this.mockStore[table] || []) as T[];
      if (filter) {
        rows = rows.filter(filter);
      }
      return {
        data: rows,
        error: null,
        count: rows.length,
        isMock: true
      };
    }

    try {
      const endpoint = `${this.url.replace(/\/$/, '')}/rest/v1/${table}?select=*`;
      const res = await fetch(endpoint, {
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error(`Supabase query failed with status ${res.status}`);
      }

      const data = await res.json();
      return {
        data,
        error: null,
        count: Array.isArray(data) ? data.length : 1,
        isMock: false
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`\x1b[33m[Supabase WARN]\x1b[0m Live query on "${table}" failed (${msg}). Returning mock rows.`);
      const rows = (this.mockStore[table] || []) as T[];
      return {
        data: rows,
        error: null,
        count: rows.length,
        isMock: true
      };
    }
  }

  /**
   * Universal INSERT query with automatic mock fallback
   */
  async insert<T = any>(table: string, record: Partial<T>): Promise<SingleResult<T>> {
    const enrichedRecord = {
      id: `mock_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      ...record
    } as unknown as T;

    if (this.isMockMode || !this.url || !this.anonKey) {
      console.log(`\x1b[36m[Supabase MOCK]\x1b[0m INSERT INTO "${table}":`, record);
      if (!this.mockStore[table]) {
        this.mockStore[table] = [];
      }
      this.mockStore[table].unshift(enrichedRecord);
      return {
        data: enrichedRecord,
        error: null,
        isMock: true
      };
    }

    try {
      const endpoint = `${this.url.replace(/\/$/, '')}/rest/v1/${table}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'apikey': this.anonKey,
          'Authorization': `Bearer ${this.anonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify(record)
      });

      if (!res.ok) {
        throw new Error(`Supabase insert failed: ${res.status}`);
      }

      const result = await res.json();
      return {
        data: Array.isArray(result) ? result[0] : result,
        error: null,
        isMock: false
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`\x1b[33m[Supabase WARN]\x1b[0m Live insert failed (${msg}). Saving to mock state.`);
      if (!this.mockStore[table]) this.mockStore[table] = [];
      this.mockStore[table].unshift(enrichedRecord);
      return {
        data: enrichedRecord,
        error: null,
        isMock: true
      };
    }
  }
}

// Singleton export
export const supabase = new SupabaseService();
