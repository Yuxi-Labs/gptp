#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// === Utility ===

function inject(template, vars) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        const val = vars[key.trim()];
        if (val === undefined) {
            throw new Error(`Missing variable: {{${key.trim()}}}`);
        }
        return String(val).trim();
    });
}

function parseArgs() {
    const [, , promptFile, inputFile, ...flags] = process.argv;
    const args = {
        promptFile,
        inputFile,
        send: flags.includes("--send"),
        output: null,
        model: "gpt-4"
    };

    for (let i = 0; i < flags.length; i++) {
        if (flags[i] === "--output" && flags[i + 1]) args.output = flags[i + 1];
        if (flags[i] === "--model" && flags[i + 1]) args.model = flags[i + 1];
    }

    if (!args.promptFile || !args.inputFile) {
        console.error("Usage:");
        console.error("  node tools/run-cli.js <prompt.gptp> <input.json> [--send] [--output file] [--model gpt-4]");
        process.exit(1);
    }

    return args;
}

function loadJson(filePath) {
    try {
        return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf-8"));
    } catch (err) {
        console.error(`Failed to load JSON from ${filePath}: ${err.message}`);
        process.exit(1);
    }
}

function buildMessages(gptp, input) {
    if (!Array.isArray(gptp.messages)) {
        console.error("Invalid .gptp file: missing or malformed 'messages' array.");
        process.exit(1);
    }

    const messages = [];

    if (gptp.system) {
        messages.push({ role: "system", content: gptp.system });
    }

    for (const msg of gptp.messages) {
        messages.push({
            role: msg.role,
            content: inject(msg.content, input)
        });
    }

    return messages;
}

// === Main Logic ===

(async function main() {
    const { promptFile, inputFile, send, output, model } = parseArgs();
    const gptp = loadJson(promptFile);
    const input = loadJson(inputFile);
    const messages = buildMessages(gptp, input);

    console.log("\n--- Prompt ---");
    for (const m of messages) {
        console.log(`\n[${m.role.toUpperCase()}]`);
        console.log(m.content);
    }

    if (!send) {
        console.log("\n(use --send to execute the prompt via API)");
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("Missing OPENAI_API_KEY in environment.");
        process.exit(1);
    }

    console.log("\nSending to OpenAI API...");

    let res;
    try {
        res = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model,
                messages,
                temperature: 0.7
            })
        });
    } catch (err) {
        console.error(`Request failed: ${err.message}`);
        process.exit(1);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        console.error("No response content from model:");
        console.error(JSON.stringify(data, null, 2));
        process.exit(1);
    }

    console.log("\n--- Response ---\n");
    console.log(content);

    if (output) {
        try {
            fs.writeFileSync(path.resolve(output), content, "utf-8");
            console.log(`\nSaved to ${output}`);
        } catch (err) {
            console.error(`Failed to write output: ${err.message}`);
            process.exit(1);
        }
    }
})();
