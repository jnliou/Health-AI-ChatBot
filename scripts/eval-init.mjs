#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const template = path.resolve('eval/responses.template.json');
const output = path.resolve('eval/responses.latest.json');

fs.copyFileSync(template, output);
console.log(`Created ${output}`);
