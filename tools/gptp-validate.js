#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv").default;

const ajv = new Ajv({ allErrors: true });

const schemaPath = path.join(__dirname, "../schema/gptp.schema.json");
if (!fs.existsSync(schemaPath)) {
    console.error("Schema file not found at:", schemaPath);
    process.exit(1);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
const validate = ajv.compile(schema);

const args = process.argv.slice(2);
let hadValidationErrors = false;

// --- Validate one file ---
function validateFile(filePath) {
    const absPath = path.resolve(filePath);
    const name = path.basename(absPath);

    try {
        const data = JSON.parse(fs.readFileSync(absPath, "utf-8"));
        const isValid = validate(data);

        if (isValid) {
            console.log(`${name} is valid.`);
        } else {
            console.error(`${name} failed validation:`);
            for (const err of validate.errors) {
                console.error(`- ${err.instancePath || "root"} ${err.message}`);
            }
            hadValidationErrors = true;
        }
    } catch (err) {
        console.error(`Error reading or parsing ${name}: ${err.message}`);
        hadValidationErrors = true;
    }
}

// --- Entry ---
if (args.includes("--all")) {
    const promptDir = path.join(__dirname, "../prompts");
    if (!fs.existsSync(promptDir)) {
        console.error("Prompt directory not found:", promptDir);
        process.exit(1);
    }

    const files = fs.readdirSync(promptDir).filter(f => f.endsWith(".gptp"));

    if (files.length === 0) {
        console.log("No .gptp files found in /prompts.");
        process.exit(0);
    }

    console.log("Validating all .gptp files in /prompts...\n");
    for (const file of files) {
        validateFile(path.join(promptDir, file));
    }
} else if (args[0]) {
    validateFile(args[0]);
} else {
    console.error("Usage:");
    console.error("  node tools/validate.js <file.gptp>");
    console.error("  node tools/validate.js --all");
    process.exit(1);
}

if (hadValidationErrors) {
    process.exit(1);
}
