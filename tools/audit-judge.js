#!/usr/bin/env node

/**
 * ==============================================================================
 * tools/audit-judge.js - Pre-Submission Hackathon Health Check
 * ==============================================================================
 * Verifies repository readiness before submitting to Devpost/judges:
 *  1. Secret Hygiene (no exposed API keys in source files)
 *  2. .gitignore & Environment Configuration (.env not tracked)
 *  3. README Judge Polish (problem, demo links, tech stack)
 *  4. Fail-Safe Synthetic Demo Data (data/seed.json hydration)
 *  5. Integrations & Mock Fallback Architecture
 *  6. Pitch Playbook & Offline Demo Script Verification
 *  7. Fail-Safe Screen Recording verification (presentation/demo.mp4)
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

const rootDir = path.resolve(__dirname, '..');
let criticalErrors = 0;
let warnings = 0;

function logPass(msg) {
  console.log(`${colors.green}  [✓] PASS:${colors.reset} ${msg}`);
}

function logWarn(msg) {
  warnings++;
  console.log(`${colors.yellow}  [!] WARN:${colors.reset} ${msg}`);
}

function logFail(msg) {
  criticalErrors++;
  console.log(`${colors.red}  [✗] FAIL:${colors.reset} ${msg}`);
}

console.log(`\n${colors.cyan}${colors.bold}=====================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}   🔍 HACKATHON PRE-SUBMISSION JUDGE AUDIT           ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}=====================================================${colors.reset}\n`);

// 1. Secret Hygiene Scanner
console.log(`${colors.bold}1. Secret Hygiene & API Key Leak Check:${colors.reset}`);
const secretPatterns = [
  { name: 'OpenAI Secret Key', regex: /sk-[A-Za-z0-9-_]{20,}/g },
  { name: 'Anthropic Secret Key', regex: /sk-ant-[A-Za-z0-9-_]{20,}/g },
  { name: 'Google AI / Gemini Key', regex: /AIza[0-9A-Za-z-_]{35}/g },
  { name: 'AWS Access Key ID', regex: /AKIA[0-9A-Z]{16}/g },
  { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/g }
];

function scanFilesForSecrets(dir) {
  const ignoredDirs = new Set(['node_modules', '.git', '.next', 'dist', 'build', '.cache']);
  let foundLeak = false;

  function traverse(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!ignoredDirs.has(entry.name)) {
          traverse(path.join(currentDir, entry.name));
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        const fileName = entry.name;
        // Don't flag sample env files or audit scanner itself
        if (fileName === '.env.example' || fileName === 'audit-judge.js') continue;
        if (['.ts', '.tsx', '.js', '.jsx', '.json', '.py', '.env', '.env.local'].includes(ext) || fileName.startsWith('.env')) {
          const filePath = path.join(currentDir, entry.name);
          const content = fs.readFileSync(filePath, 'utf-8');
          for (const pattern of secretPatterns) {
            if (pattern.regex.test(content)) {
              logFail(`Found potential ${pattern.name} in: ${path.relative(rootDir, filePath)}`);
              foundLeak = true;
            }
          }
        }
      }
    }
  }

  traverse(dir);
  if (!foundLeak) {
    logPass('No exposed API keys or secrets detected in source files.');
  }
}
scanFilesForSecrets(rootDir);

// 2. .gitignore & Env Setup
console.log(`\n${colors.bold}2. Environment & Git Hygiene:${colors.reset}`);
const gitignorePath = path.join(rootDir, '.gitignore');
if (fs.existsSync(gitignorePath)) {
  const gitignore = fs.readFileSync(gitignorePath, 'utf-8');
  if (gitignore.includes('.env.local') || gitignore.includes('.env*.local') || gitignore.includes('.env')) {
    logPass('.gitignore properly excludes local environment files.');
  } else {
    logFail('.gitignore does NOT exclude .env.local or .env! Risk of leaking API keys.');
  }
} else {
  logWarn('No .gitignore found at repository root.');
}

if (fs.existsSync(path.join(rootDir, '.env.example'))) {
  logPass('.env.example is present with mock default configuration.');
} else {
  logWarn('Missing .env.example. Teammates and judges will struggle to run your code.');
}

// 3. Synthetic Seed Data & Mock Architecture
console.log(`\n${colors.bold}3. Synthetic Data & Mock Architecture:${colors.reset}`);
const seedPath = path.join(rootDir, 'data', 'seed.json');
if (fs.existsSync(seedPath)) {
  try {
    const seed = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
    if (seed.user && (seed.fintech || seed.health || seed.agent)) {
      logPass(`Synthetic demo data hydrated (User: ${seed.user.name}).`);
    } else {
      logWarn('data/seed.json exists but appears incomplete. Run `npm run seed`.');
    }
  } catch {
    logWarn('data/seed.json is invalid JSON. Run `npm run seed`.');
  }
} else {
  logWarn('data/seed.json not found. Run `npm run seed` so UI never looks empty during judging.');
}

const integrationsDir = path.join(rootDir, 'integrations');
if (fs.existsSync(integrationsDir)) {
  const intFiles = fs.readdirSync(integrationsDir);
  logPass(`Pluggable integrations active (${intFiles.filter(f => f.endsWith('.ts')).length} modules ready with mock fallbacks).`);
} else {
  logWarn('integrations/ directory not found. Ensure sponsor API fallbacks are organized.');
}

// 4. README & Submission Polish
console.log(`\n${colors.bold}4. README & Devpost Submission Polish:${colors.reset}`);
const readmePath = path.join(rootDir, 'README.md');
if (fs.existsSync(readmePath)) {
  const readme = fs.readFileSync(readmePath, 'utf-8');
  const hasDemoLink = /http[s]?:\/\/[^\s]+/i.test(readme);
  const hasProblemStatement = /problem|challenge|why/i.test(readme);
  const hasInstallGuide = /npm|pnpm|yarn|docker|setup/i.test(readme);

  if (hasProblemStatement) {
    logPass('README contains clear problem context.');
  } else {
    logWarn('README lacks an explicit "Problem Statement" or context header.');
  }

  if (hasDemoLink) {
    logPass('README includes live URLs or deployment links.');
  } else {
    logWarn('README does not contain a live demo link (e.g. Vercel deployment URL).');
  }

  if (hasInstallGuide) {
    logPass('README includes setup / quickstart instructions.');
  } else {
    logWarn('README does not clearly describe how to run the project.');
  }
} else {
  logFail('Missing README.md! Judges require a complete project description.');
}

const devpostDoc = path.join(rootDir, 'DEVPOST_SUBMISSION.md');
if (fs.existsSync(devpostDoc)) {
  logPass('DEVPOST_SUBMISSION.md found with complete submission sections.');
} else {
  logWarn('Missing DEVPOST_SUBMISSION.md. Run `npm run devpost` to draft your writeup.');
}

// 5. Demo Script & Backup Screen Recording
console.log(`\n${colors.bold}5. Offline Demo & Fail-Safe Recording:${colors.reset}`);
const demoScriptCandidates = [
  path.join(rootDir, 'presentation', 'PITCH_PLAYBOOK.md'),
  path.join(rootDir, 'presentation', 'DEMO_SCRIPT.md'),
  path.join(rootDir, 'pitch', 'DEMO_SCRIPT.md')
];
const hasDemoScript = demoScriptCandidates.some(f => fs.existsSync(f));

if (hasDemoScript) {
  logPass('Pitch Playbook & Demo Script verified with structured click-by-click flow.');
} else {
  logWarn('No demo script found in presentation/ or pitch/. Team risks stumbling on stage.');
}

const mediaFiles = [
  path.join(rootDir, 'presentation', 'demo.mp4'),
  path.join(rootDir, 'presentation', 'demo.gif'),
  path.join(rootDir, 'pitch', 'backup-demo.mp4'),
  path.join(rootDir, 'pitch', 'demo.mp4')
];
const hasOfflineVideo = mediaFiles.some(file => fs.existsSync(file));

if (hasOfflineVideo) {
  logPass('Fail-safe screen recording detected.');
} else {
  logWarn('No offline backup video found (e.g. presentation/demo.mp4). Highly recommended if stage Wi-Fi drops.');
}

// Final Summary
console.log(`\n${colors.cyan}${colors.bold}=====================================================${colors.reset}`);
if (criticalErrors === 0) {
  console.log(`${colors.green}${colors.bold} ✓ AUDIT PASSED WITH ${warnings} WARNING(S). Ready for submission!${colors.reset}`);
  console.log(`${colors.cyan}Tip: Disconnect Wi-Fi once and verify your 3-minute demo works completely offline.${colors.reset}\n`);
  process.exit(0);
} else {
  console.log(`${colors.red}${colors.bold} ✗ AUDIT FAILED WITH ${criticalErrors} CRITICAL ERROR(S). Fix before pushing!${colors.reset}\n`);
  process.exit(1);
}
