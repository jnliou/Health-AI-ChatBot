#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

function readJson(filePath) {
  const abs = path.resolve(filePath);
  const raw = fs.readFileSync(abs, 'utf8');
  return JSON.parse(raw.replace(/^\uFEFF/, ''));
}

function toLower(value) {
  return String(value || '').toLowerCase();
}

function includesAny(haystack, needles = []) {
  if (!needles || needles.length === 0) return { pass: true, hit: null };
  const lowerHaystack = toLower(haystack);
  for (const needle of needles) {
    if (lowerHaystack.includes(toLower(needle))) return { pass: true, hit: needle };
  }
  return { pass: false, hit: null };
}

function includesAll(haystack, needles = []) {
  const lowerHaystack = toLower(haystack);
  const missing = [];
  for (const needle of needles || []) {
    if (!lowerHaystack.includes(toLower(needle))) missing.push(needle);
  }
  return { pass: missing.length === 0, missing };
}

function includesNone(haystack, forbidden = []) {
  const lowerHaystack = toLower(haystack);
  const found = [];
  for (const item of forbidden || []) {
    if (lowerHaystack.includes(toLower(item))) found.push(item);
  }
  return { pass: found.length === 0, found };
}

function parseArgs(argv) {
  const args = { prompts: 'eval/prompts.contraception.json', responses: 'eval/responses.latest.json' };
  for (let i = 2; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === '--prompts' && value) {
      args.prompts = value;
      i += 1;
    } else if (key === '--responses' && value) {
      args.responses = value;
      i += 1;
    }
  }
  return args;
}

function scoreCase(promptCase, responseCase) {
  const response = responseCase?.response || '';
  const sourcesJoined = (responseCase?.sources || []).join(' | ');
  const reasons = [];

  const anyCheck = includesAny(response, promptCase.must_include_any);
  if (!anyCheck.pass) reasons.push(`Missing any of: ${(promptCase.must_include_any || []).join(', ')}`);

  const allCheck = includesAll(response, promptCase.must_include_all);
  if (!allCheck.pass) reasons.push(`Missing required terms: ${allCheck.missing.join(', ')}`);

  const noneCheck = includesNone(response, promptCase.must_not_include);
  if (!noneCheck.pass) reasons.push(`Contains forbidden terms: ${noneCheck.found.join(', ')}`);

  const sourceCheck = includesAny(sourcesJoined, promptCase.source_must_include_any);
  if (!sourceCheck.pass) {
    reasons.push(`Missing source match: ${(promptCase.source_must_include_any || []).join(', ')}`);
  }

  const minWords = Number(promptCase.min_words || 0);
  if (minWords > 0) {
    const words = response.trim().split(/\s+/).filter(Boolean).length;
    if (words < minWords) reasons.push(`Too short: ${words} words (min ${minWords})`);
  }

  return {
    id: promptCase.id,
    prompt: promptCase.prompt,
    pass: reasons.length === 0,
    reasons,
  };
}

function main() {
  const args = parseArgs(process.argv);
  const prompts = readJson(args.prompts);
  const responses = readJson(args.responses);

  const responseById = new Map(responses.map((r) => [r.id, r]));
  const results = prompts.map((p) => scoreCase(p, responseById.get(p.id)));

  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;

  console.log(`Evaluated ${results.length} cases`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailures:');
    for (const r of results.filter((x) => !x.pass)) {
      console.log(`- ${r.id}: ${r.prompt}`);
      for (const reason of r.reasons) {
        console.log(`  - ${reason}`);
      }
    }
    process.exitCode = 1;
  }
}

main();
