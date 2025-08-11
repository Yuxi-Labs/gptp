#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const Ajv = require('ajv').default;
const addFormats = require('ajv-formats');

// === AJV Setup ===
const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

// === Helper Functions ===

function inject(template, vars) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        const trimmed = key.trim();
        if (!(trimmed in vars)) {
            throw new Error(`Missing value for variable: {{${trimmed}}}`);
        }
        return String(vars[trimmed]).trim();
    });
}

function loadJson(filePath) {
    const fullPath = path.resolve(filePath);
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        return JSON.parse(content);
    } catch (err) {
        console.error(`Failed to read JSON from ${filePath}: ${err.message}`);
        process.exit(1);
    }
}

function validateGptp(gptp, schemaPath) {
    const schema = loadJson(schemaPath);
    const validate = ajv.compile(schema);
    const isValid = validate(gptp);
    if (!isValid) {
        console.error("Schema validation failed:");
        for (const err of validate.errors) {
            console.error(`- ${err.instancePath || 'root'} ${err.message}`);
        }
        process.exit(1);
    }
}

// === Main Function ===

function renderPrompt(gptpPath, inputPath, schemaPath) {
    const gptp = loadJson(gptpPath);
    const input = loadJson(inputPath);

    validateGptp(gptp, schemaPath);

    if (!Array.isArray(gptp.messages)) {
        console.error("Invalid .gptp file: missing or malformed 'messages' array.");
        process.exit(1);
    }

    const requiredVars = (gptp.variables || []).filter(v => v.required !== false);
    const missingVars = requiredVars.filter(v => !(v.name in input));

    if (missingVars.length > 0) {
        console.error("Missing required input values:");
        for (const v of missingVars) {
            console.error(`  • ${v.name}`);
        }
        process.exit(1);
    }

    const output = [];

    if (gptp.system) {
        output.push({ role: "system", content: gptp.system });
    }

    for (const msg of gptp.messages) {
        output.push({
            role: msg.role,
            content: inject(msg.content, input)
        });
    }

    console.log();
    for (const msg of output) {
        console.log(`[${msg.role.toUpperCase()}]`);
        console.log(msg.content);
        console.log();
    }
}

// === CLI Entrypoint ===

const [, , gptpFile, inputFile, schemaArg] = process.argv;

if (!gptpFile || !inputFile) {
    console.error("Usage:");
    console.error("  node tools/render.js <.gptp file> <input.json> [schema.json]");
    process.exit(1);
}

const defaultSchemaPath = path.join(__dirname, "..", "schema/gptp.schema.json");
const schemaPath = schemaArg ? path.resolve(schemaArg) : defaultSchemaPath;

renderPrompt(gptpFile, inputFile, schemaPath);
