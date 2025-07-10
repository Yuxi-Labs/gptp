#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');

// Setup AJV
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// === Path Setup ===
const baseDir = path.resolve(__dirname, ".."); // project root
const defaultSchemaPath = path.join(baseDir, "schema/gptp.schema.json");

// === Helper Functions ===

function inject(template, vars) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        const trimmed = key.trim();
        if (!(trimmed in vars)) {
            throw new Error(`Missing value for variable: {{${trimmed}}}`);
        }
        return vars[trimmed];
    });
}

function loadJson(filePath) {
    const fullPath = path.resolve(filePath);
    try {
        return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    } catch (err) {
        console.error(`❌ Failed to read JSON from ${filePath}:`, err.message);
        process.exit(1);
    }
}

function validateGptp(schemaPath, gptp) {
    const schema = loadJson(schemaPath);
    const validate = ajv.compile(schema);
    const valid = validate(gptp);
    if (!valid) {
        console.error(`❌ Schema validation failed:\n`);
        validate.errors.forEach(err => {
            console.error(`- ${err.instancePath || 'root'} ${err.message}`);
        });
        process.exit(1);
    }
}

// === Main Function ===

function renderPrompt(gptpPath, inputPath, schemaPath = defaultSchemaPath) {
    const gptp = loadJson(gptpPath);
    const input = loadJson(inputPath);

    validateGptp(schemaPath, gptp);

    const requiredVars = gptp.variables?.filter(v => v.required !== false) || [];
    const missingVars = requiredVars.filter(v => !(v.name in input));

    if (missingVars.length > 0) {
        console.error(`❌ Missing required variables: ${missingVars.map(v => v.name).join(', ')}`);
        process.exit(1);
    }

    const output = [];

    if (gptp.system) {
        output.push({ role: "system", content: gptp.system });
    }

    gptp.messages.forEach(msg => {
        output.push({
            role: msg.role,
            content: inject(msg.content, input)
        });
    });

    console.log("\n=== ✅ FINAL RENDERED PROMPT ===\n");
    output.forEach(msg => {
        console.log(`[${msg.role.toUpperCase()}]\n${msg.content}\n`);
    });
}

// === CLI Entrypoint ===

const [, , gptpFile, inputFile, schemaArg] = process.argv;

if (!gptpFile || !inputFile) {
    console.error("Usage:\n  node tools/render.js <.gptp file> <input.json> [schema.json]");
    process.exit(1);
}

const resolvedSchemaPath = schemaArg ? path.resolve(schemaArg) : defaultSchemaPath;

renderPrompt(gptpFile, inputFile, resolvedSchemaPath);
