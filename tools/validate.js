#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv").default;
const ajv = new Ajv({ allErrors: true });

const schema = JSON.parse(fs.readFileSync(path.join(__dirname, "../schema/gptp.schema.json")));
const args = process.argv.slice(2);

// --- Helper: validate one file ---
function validateFile(filePath) {
    try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        const validate = ajv.compile(schema);
        const isValid = validate(data);

        if (isValid) {
            console.log(`✅ ${path.basename(filePath)} is valid.`);
        } else {
            console.error(`❌ ${path.basename(filePath)} failed validation:`);
            validate.errors.forEach(err =>
                console.error(` - ${err.instancePath || 'root'} ${err.message}`)
            );
        }
    } catch (err) {
        console.error(`💥 Error reading ${filePath}: ${err.message}`);
    }
}

// --- Handle input ---
if (args.includes("--all")) {
    const promptDir = path.join(__dirname, "../prompts");
    const files = fs.readdirSync(promptDir).filter(f => f.endsWith(".gptp"));

    console.log(`🔍 Validating all .gptp files in /prompts...\n`);
    files.forEach(file => validateFile(path.join(promptDir, file)));
} else if (args[0]) {
    validateFile(path.resolve(args[0]));
} else {
    console.error("Usage: node tools/validate.js <file.gptp> OR --all");
    process.exit(1);
}
