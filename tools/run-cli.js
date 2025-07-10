#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");

// === Utility ===
function inject(template, vars) {
    return template.replace(/{{(.*?)}}/g, (_, key) => {
        const val = vars[key.trim()];
        if (val === undefined) throw new Error(`Missing variable: ${key}`);
        return val;
    });
}

function parseArgs() {
    const [,, promptFile, inputFile, ...flags] = process.argv;
    const args = {
        promptFile,
        inputFile,
        send: flags.includes("--send"),
        output: null,
        model: "gpt-4"
    };

    flags.forEach((f, i) => {
        if (f === "--output") args.output = flags[i + 1];
        if (f === "--model") args.model = flags[i + 1];
    });

    if (!promptFile || !inputFile) {
        console.error("Usage:\n  node tools/run-cli.js <prompt.gptp> <input.json> [--send] [--output file] [--model gpt-4]");
        process.exit(1);
    }

    return args;
}

function loadJson(filePath) {
    return JSON.parse(fs.readFileSync(path.resolve(filePath), "utf-8"));
}

function buildMessages(gptp, input) {
    const messages = [];
    if (gptp.system) {
        messages.push({ role: "system", content: gptp.system });
    }

    gptp.messages.forEach(msg => {
        messages.push({
            role: msg.role,
            content: inject(msg.content, input),
        });
    });

    return messages;
}

// === Main Logic ===
(async function main() {
    const { promptFile, inputFile, send, output, model } = parseArgs();
    const gptp = loadJson(promptFile);
    const input = loadJson(inputFile);
    const messages = buildMessages(gptp, input);

    console.log("📤 Prompt:");
    messages.forEach(m => {
        console.log(`\n[${m.role.toUpperCase()}] ${m.content}`);
    });

    if (!send) {
        console.log("\n💡 Use --send to actually call the model.");
        return;
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error("❌ No OPENAI_API_KEY found in environment.");
        process.exit(1);
    }

    console.log("\n⚡ Sending to OpenAI...");

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
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

    const data = await res.json();

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
        console.error("❌ No response from model.");
        console.error(data);
        return;
    }

    console.log("\n✅ Response:\n");
    console.log(content);

    if (output) {
        fs.writeFileSync(path.resolve(output), content, "utf-8");
        console.log(`\n📝 Saved to ${output}`);
    }
})();
