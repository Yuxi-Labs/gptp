const fs = require('fs');
const path = require('path');

// Load the .gptp file
const gptp = JSON.parse(fs.readFileSync(path.join(__dirname, 'test-prompt.gptp'), 'utf-8'));

// Dummy variable injection
const userVars = {
    name: "Fiona"
};

// Simple templating function
function inject(content, vars) {
    return content.replace(/{{(.*?)}}/g, (_, v) => vars[v.trim()] || "");
}

// Render messages
const renderedMessages = gptp.messages.map(msg => ({
    role: msg.role,
    content: inject(msg.content, userVars)
}));

// Final OpenAI-ready message payload
const payload = [
    ...(gptp.system ? [{ role: "system", content: gptp.system }] : []),
    ...renderedMessages
];

// Output to console
console.log("=== RENDERED PROMPT ===");
payload.forEach(m => {
    console.log(`[${m.role.toUpperCase()}] ${m.content}\n`);
});
