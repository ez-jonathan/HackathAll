#!/usr/bin/env node

/**
 * ==============================================================================
 * scripts/seed-demo-data.ts - Synthetic Data Hydrator for Hackathons
 * ==============================================================================
 * Generates realistic, human-readable, domain-rich synthetic demo data:
 *   - Fintech & Neobank transactions, balances, and cashflow
 *   - HealthTech patient vitals, sleep telemetry, and clinical insights
 *   - AI Copilot execution traces, tool calls, and conversation history
 *   - VIP Judge Profile & Workspace metadata
 *
 * Saves output to:
 *   - `data/seed.json` (Server-side & API fallback)
 *   - `public/mock/seed.json` (Client-side Next.js fetch fallback)
 *
 * Usage:
 *   npx tsx scripts/seed-demo-data.ts
 *   node --experimental-strip-types scripts/seed-demo-data.ts
 *   npm run seed
 * ==============================================================================
 */

import * as fs from 'fs';
import * as path from 'path';

// ANSI colors for clean CLI reporting
const c = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  bold: '\x1b[1m',
  dim: '\x1b[2m'
};

interface SeedData {
  generatedAt: string;
  version: string;
  user: JudgeProfile;
  fintech: FintechDataset;
  health: HealthDataset;
  agent: AgentDataset;
}

interface JudgeProfile {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  email: string;
  isJudge: boolean;
  demoBypassToken: string;
}

interface FintechTransaction {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'debit' | 'credit';
  status: 'completed' | 'pending';
  date: string;
  isoDate: string;
  icon: string;
  note?: string;
}

interface FintechDataset {
  overview: {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpenses: number;
    savingsRatePct: number;
    currency: string;
  };
  accounts: Array<{
    id: string;
    name: string;
    type: string;
    balance: number;
    last4: string;
  }>;
  transactions: FintechTransaction[];
}

interface VitalMetric {
  timestamp: string;
  heartRate: number;
  hrv: number;
  bloodOxygen: number;
  stressScore: number;
}

interface HealthDataset {
  patient: {
    id: string;
    fullName: string;
    age: number;
    bloodType: string;
    sleepScore: number;
    recoveryStatus: 'Optimal' | 'Strained' | 'Resting';
  };
  liveVitals: {
    heartRateBpm: number;
    hrvMs: number;
    oxygenSaturationPct: number;
    bodyTempCelsius: number;
    respiratoryRateRpm: number;
  };
  timeSeries: VitalMetric[];
  aiClinicalAlerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'alert';
    title: string;
    description: string;
    timestamp: string;
  }>;
}

interface AgentTrace {
  id: string;
  task: string;
  status: 'success' | 'running' | 'failed';
  durationMs: number;
  tokensUsed: number;
  model: string;
  toolsCalled: string[];
  timestamp: string;
}

interface AgentDataset {
  copilotState: {
    status: 'idle' | 'listening' | 'executing';
    activeModel: string;
    autonomousMode: boolean;
    totalTasksCompleted: number;
  };
  recentTraces: AgentTrace[];
  sampleConversation: Array<{
    id: string;
    sender: 'user' | 'assistant';
    text: string;
    timestamp: string;
    structuredOutput?: Record<string, unknown>;
  }>;
}

// Helper: Format relative dates
function getRelativeDate(daysAgo: number, hoursAgo = 0): { dateStr: string; isoStr: string } {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(d.getHours() - hoursAgo);
  
  const options: Intl.DateTimeFormatOptions = { 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return {
    dateStr: d.toLocaleDateString('en-US', options),
    isoStr: d.toISOString()
  };
}

function generateSeedData(): SeedData {
  const t0 = getRelativeDate(0, 1);
  const t1 = getRelativeDate(0, 4);
  const t2 = getRelativeDate(1, 2);
  const t3 = getRelativeDate(1, 8);
  const t4 = getRelativeDate(2, 5);
  const t5 = getRelativeDate(3, 3);
  const t6 = getRelativeDate(4, 7);

  // 1. VIP Judge Profile
  const user: JudgeProfile = {
    id: 'usr_demo_judge_01',
    name: 'Dr. Sarah Lin',
    role: 'Lead Judge & Principal Architect',
    company: 'Apex Horizon Ventures',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'judge.sarah@apexventures.io',
    isJudge: true,
    demoBypassToken: 'demo_bypass_session_valid_2026'
  };

  // 2. Realistic Fintech Dataset
  const transactions: FintechTransaction[] = [
    {
      id: 'tx_9841',
      merchant: 'Anthropic Claude API',
      category: 'Software & Infrastructure',
      amount: 142.50,
      type: 'debit',
      status: 'completed',
      date: t0.dateStr,
      isoDate: t0.isoStr,
      icon: 'Cpu',
      note: 'Automated Agent Tier Billing'
    },
    {
      id: 'tx_9840',
      merchant: 'Stripe Merchant Payout',
      category: 'Revenue',
      amount: 4850.00,
      type: 'credit',
      status: 'completed',
      date: t1.dateStr,
      isoDate: t1.isoStr,
      icon: 'ArrowDownLeft',
      note: 'Daily Net Settlement (Batch #849)'
    },
    {
      id: 'tx_9839',
      merchant: 'Supabase Enterprise',
      category: 'Cloud Services',
      amount: 49.00,
      type: 'debit',
      status: 'completed',
      date: t2.dateStr,
      isoDate: t2.isoStr,
      icon: 'Database'
    },
    {
      id: 'tx_9838',
      merchant: 'Blue Bottle Coffee',
      category: 'Food & Dining',
      amount: 16.75,
      type: 'debit',
      status: 'completed',
      date: t3.dateStr,
      isoDate: t3.isoStr,
      icon: 'Coffee',
      note: 'Sprint Fuel / Team Espresso'
    },
    {
      id: 'tx_9837',
      merchant: 'ElevenLabs Voice Engine',
      category: 'AI Tooling',
      amount: 22.00,
      type: 'debit',
      status: 'completed',
      date: t4.dateStr,
      isoDate: t4.isoStr,
      icon: 'Mic'
    },
    {
      id: 'tx_9836',
      merchant: 'Vercel Pro Deployment',
      category: 'Hosting & CDN',
      amount: 20.00,
      type: 'debit',
      status: 'completed',
      date: t5.dateStr,
      isoDate: t5.isoStr,
      icon: 'Zap'
    },
    {
      id: 'tx_9835',
      merchant: 'Angel Investor Wire',
      category: 'Investment Capital',
      amount: 25000.00,
      type: 'credit',
      status: 'completed',
      date: t6.dateStr,
      isoDate: t6.isoStr,
      icon: 'Building2',
      note: 'SAFE Note Tranche #1'
    }
  ];

  const fintech: FintechDataset = {
    overview: {
      totalBalance: 84320.45,
      monthlyIncome: 29850.00,
      monthlyExpenses: 4210.80,
      savingsRatePct: 85.9,
      currency: 'USD'
    },
    accounts: [
      { id: 'acc_primary', name: 'Operating Checking', type: 'Checking', balance: 34320.45, last4: '8821' },
      { id: 'acc_treasury', name: 'High-Yield Treasury', type: 'Savings (5.2% APY)', balance: 50000.00, last4: '1094' }
    ],
    transactions
  };

  // 3. HealthTech & Telemetry Dataset
  const timeSeries: VitalMetric[] = Array.from({ length: 12 }, (_, i) => {
    const time = getRelativeDate(0, 12 - i);
    return {
      timestamp: time.dateStr,
      heartRate: 68 + Math.floor(Math.sin(i / 2) * 12),
      hrv: 54 + Math.floor(Math.cos(i / 3) * 15),
      bloodOxygen: 98 + (i % 2 === 0 ? 1 : 0),
      stressScore: 24 + Math.floor(Math.sin(i) * 18)
    };
  });

  const health: HealthDataset = {
    patient: {
      id: 'pt_9024',
      fullName: 'Alex Vance',
      age: 29,
      bloodType: 'O+',
      sleepScore: 92,
      recoveryStatus: 'Optimal'
    },
    liveVitals: {
      heartRateBpm: 72,
      hrvMs: 64,
      oxygenSaturationPct: 99,
      bodyTempCelsius: 36.6,
      respiratoryRateRpm: 14
    },
    timeSeries,
    aiClinicalAlerts: [
      {
        id: 'alt_01',
        severity: 'info',
        title: 'Deep Recovery Peak Reached',
        description: 'REM sleep duration exceeded 2.2 hours with stable cardiopulmonary rhythm.',
        timestamp: t1.dateStr
      },
      {
        id: 'alt_02',
        severity: 'warning',
        title: 'Post-Workout Cortisol Spike',
        description: 'Vagal nerve tone modulation recommended. Hydration score index is at 84%.',
        timestamp: t3.dateStr
      }
    ]
  };

  // 4. Autonomous Agent Traces
  const agent: AgentDataset = {
    copilotState: {
      status: 'idle',
      activeModel: 'claude-3-7-sonnet-streaming',
      autonomousMode: true,
      totalTasksCompleted: 42
    },
    recentTraces: [
      {
        id: 'trace_001',
        task: 'Real-time Autonomous Arbitrage & Balance Rebalance',
        status: 'success',
        durationMs: 412,
        tokensUsed: 1240,
        model: 'claude-3-7-sonnet',
        toolsCalled: ['supabase_query', 'twilio_sms_notify'],
        timestamp: t0.dateStr
      },
      {
        id: 'trace_002',
        task: 'Biometric Anomaly Detection & Clinical Triage',
        status: 'success',
        durationMs: 289,
        tokensUsed: 890,
        model: 'gemini-1.5-flash',
        toolsCalled: ['vitals_analyzer', 'resend_email_alert'],
        timestamp: t1.dateStr
      },
      {
        id: 'trace_003',
        task: 'Voice Query Synthesizer (ElevenLabs)',
        status: 'success',
        durationMs: 310,
        tokensUsed: 420,
        model: 'eleven-multilingual-v2',
        toolsCalled: ['audio_stream_engine'],
        timestamp: t2.dateStr
      }
    ],
    sampleConversation: [
      {
        id: 'msg_01',
        sender: 'user',
        text: 'Analyze my team runway and check if any clinical anomaly requires intervention today.',
        timestamp: t1.dateStr
      },
      {
        id: 'msg_02',
        sender: 'assistant',
        text: 'Analysis complete. Your team currently has **18.4 months of runway** with net positive cashflow ($25,639.20 net this week). On the biometrics telemetry, your recovery score is at **92% (Optimal)** with zero critical cardiovascular flags.',
        timestamp: t0.dateStr,
        structuredOutput: {
          runwayMonths: 18.4,
          cashflowStatus: 'Strong Growth',
          clinicalRisk: 'Nominal',
          actionSuggested: 'Ready for live presentation demo.'
        }
      }
    ]
  };

  return {
    generatedAt: new Date().toISOString(),
    version: '1.0.0-hackathon-hydrated',
    user,
    fintech,
    health,
    agent
  };
}

// Main execution
function main() {
  console.log(`${c.cyan}${c.bold}=====================================================${c.reset}`);
  console.log(`${c.cyan}${c.bold} ⚡ HACKATHON SYNTHETIC DATA HYDRATOR (seed-demo-data)${c.reset}`);
  console.log(`${c.cyan}${c.bold}=====================================================${c.reset}\n`);

  const rootDir = process.cwd();
  const dataDir = path.join(rootDir, 'data');
  const publicMockDir = path.join(rootDir, 'public', 'mock');

  // Ensure directories exist
  [dataDir, publicMockDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });

  const seedData = generateSeedData();
  const serialized = JSON.stringify(seedData, null, 2);

  const dataPath = path.join(dataDir, 'seed.json');
  const publicPath = path.join(publicMockDir, 'seed.json');

  fs.writeFileSync(dataPath, serialized, 'utf-8');
  fs.writeFileSync(publicPath, serialized, 'utf-8');

  console.log(`${c.green}[✓] Hydrated Server Mock DB:${c.reset} ${path.relative(rootDir, dataPath)}`);
  console.log(`${c.green}[✓] Hydrated Client Public Mock:${c.reset} ${path.relative(rootDir, publicPath)}`);
  console.log(`\n${c.bold}Dataset Highlights:${c.reset}`);
  console.log(`  • VIP Judge User:    ${c.yellow}${seedData.user.name}${c.reset} (${seedData.user.role})`);
  console.log(`  • Fintech Records:   ${c.yellow}${seedData.fintech.transactions.length}${c.reset} transactions (Balance: $${seedData.fintech.overview.totalBalance.toLocaleString()})`);
  console.log(`  • Health Telemetry:  ${c.yellow}${seedData.health.timeSeries.length}${c.reset} vital time-series frames`);
  console.log(`  • Agent Traces:      ${c.yellow}${seedData.agent.recentTraces.length}${c.reset} autonomous actions recorded`);
  console.log(`\n${c.green}${c.bold}✨ UI tables and demo cards are now 100% judge-ready!${c.reset}\n`);
}

main();
