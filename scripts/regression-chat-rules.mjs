#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function read(filePath) {
  return fs.readFileSync(path.resolve(filePath), 'utf8');
}

function assertIncludes(haystack, needle, message, failures) {
  if (!haystack.includes(needle)) failures.push(message);
}

function assertRegex(haystack, regex, message, failures) {
  if (!regex.test(haystack)) failures.push(message);
}

function main() {
  const failures = [];
  const chatPage = read('app/pages/ChatPage.tsx');
  const sourcePill = read('app/components/SourcePill.tsx');

  // Triage lock guardrails
  assertIncludes(chatPage, "const [triageLock, setTriageLock] = useState(false);", 'Missing triageLock state', failures);
  assertIncludes(chatPage, 'if (triageLock) return false;', 'LLM gate does not enforce triageLock', failures);
  assertIncludes(chatPage, "if (triageStage !== 'idle') return false;", 'LLM gate allows non-idle triage stage', failures);
  assertRegex(
    chatPage,
    /setTriageStage\('symptomCheck'\);\s*setTriageLock\(true\);/g,
    'Symptom-check entry does not set triage lock',
    failures
  );
  assertIncludes(chatPage, "setTriageLock(false);", 'No triage lock release found in terminal triage branch', failures);

  // Regression for generic birth-control effectiveness answer
  assertIncludes(
    chatPage,
    '**How effective is birth control overall?**',
    'Missing deterministic birth-control effectiveness answer',
    failures
  );

  // Prevent source chip regression back to [Source]
  assertIncludes(sourcePill, '<span>{displayLabel}</span>', 'Source chip does not render labels', failures);
  if (/\[Source\]/.test(sourcePill)) failures.push('Source chip regressed to generic [Source] label');

  if (failures.length > 0) {
    console.error(`Regression checks failed (${failures.length})`);
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Regression checks passed');
}

main();
