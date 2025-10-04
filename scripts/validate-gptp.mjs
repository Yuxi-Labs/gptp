#!/usr/bin/env node
// ESM validator for .gptp files (no schema changes). Handles fenced code blocks.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SCHEMA_PATH = path.join(ROOT, 'schema', 'gptp.schema.json');
const EXAMPLES_DIR = path.join(ROOT, 'docs', 'examples');

function loadJSON(file) {
  const raw = fs.readFileSync(file, 'utf8').trim();
  const fenced = /^```[\w-]*\n([\s\S]*?)\n```\s*$/m;
  const m = raw.match(fenced);
  const jsonText = m ? m[1] : raw;
  return JSON.parse(jsonText);
}

function main() {
  const schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  const ajv = new Ajv({
    strict: true,
    allowUnionTypes: true,
    strictTypes: true,
    strictTuples: true,
    allErrors: true,
  });
  addFormats(ajv);
  const validate = ajv.compile(schema);

  const files = fs
    .readdirSync(EXAMPLES_DIR)
    .filter((f) => f.endsWith('.gptp'))
    .map((f) => path.join(EXAMPLES_DIR, f));

  let ok = 0;
  let fail = 0;
  for (const file of files) {
    try {
      const data = loadJSON(file);
      const valid = validate(data);
      if (!valid) {
        console.error(`FAIL  ${path.basename(file)}`);
        console.error(ajv.errorsText(validate.errors, { dataVar: 'data' }));
        fail++;
      } else {
        console.log(`PASS  ${path.basename(file)}`);
        ok++;
      }
    } catch (err) {
      console.error(`ERROR ${path.basename(file)}: ${err.message}`);
      fail++;
    }
  }

  console.log(`\nSummary: ${ok} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
}

main();
