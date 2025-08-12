# How to Author a GPTP File

Overview
The .gptp format is a structured JSON file that packages a reusable prompt. Every .gptp must validate against the schema referenced by its \$schema field. The prompt’s own version lives in "version" (semver); the spec version is implied by the schema’s \$id.

1. Start with the minimal structure
   A valid .gptp is a JSON object with required fields: name, description, version, messages. Add \$schema so your editor can validate.

Example (minimal):
{
"\$schema": "./schema/gptp.schema.json",
"name": "My Prompt",
"description": "Generates a professional artist statement.",
"version": "1.1.0",
"messages": \[
{ "role": "user", "content": "Write an artist statement about {{topic}}" }
]
}

Notes:
• version is the prompt’s own semantic version (e.g., 1.1.0). It is not the spec version.
• The schema controls validation; unknown top-level keys are invalid (additionalProperties=false).

2. Add variables (for templating)
   Use variables to make prompts reusable. Reference variables with {{name}} inside message content or system. Declare each variable in the "variables" array.

Example:
"variables": \[
{
"name": "topic",
"description": "The subject of the artist statement",
"required": true,
"example": "sustainability in fashion"
}
]

Rules:
• Substitution uses string coercion (tools should apply String(value) before replacing {{name}}).
• If required is true (default), the variable must be provided before running.

3. (Optional) Add a system instruction
   "system" is a single string with high‑level guidance. If your runner supports system role, it should use it; otherwise it may prepend the instruction appropriately.

Example:
"system": "You are a professional writer."

4. (Optional) Metadata for organization
   Metadata helps catalog and filter prompts. It does not affect execution.

Example:
"metadata": {
"tags": \["writing", "creative", "statement"],
"created\_by": "Jane Doe",
"created\_at": "2025-07-15T12:00:00Z",
"model\_compatibility": \["gpt-4", "claude-3-opus"]
}

5. (Optional) Rendering hints
   These guide UIs. Tools may ignore them.

Example:
"rendering": {
"style": "chat",
"instructions\_position": "top"
}

6. (Optional) Expected output and JSON contract
   If you expect a particular format, set "output\_format". When using "json", you can also provide "output\_schema" so tools validate the model’s response.

Example:
"output\_format": "json",
"output\_schema": {
"type": "object",
"required": \["title", "summary"],
"properties": {
"title": { "type": "string" },
"summary": { "type": "string" }
},
"additionalProperties": false
}

Normative behavior:
• If output\_format=json and output\_schema is present, tools must validate outputs against the schema and surface errors.

7. (Optional) Params
   Request parameters for the model. Only the documented keys are allowed inside "params".

Example:
"params": {
"model": "gpt-4",
"temperature": 0.7,
"top\_p": 0.9,
"max\_tokens": 512,
"stop": \["\n\n"]
}

8. (Optional) Connections and secrets
   Declare provider configurations in "connections". Use \${env\:VAR} placeholders. Do not inline secret values. List secret NAMES in "secrets".

Example:
"connections": {
"active": "openai",
"providers": {
"openai": {
"type": "openai",
"endpoint": "[https://api.openai.com/v1](https://api.openai.com/v1)",
"deployment": "gpt-4",
"api\_key": "\${env\:OPENAI\_API\_KEY}"
}
}
},
"secrets": \["OPENAI\_API\_KEY"]

Security:
• Secrets must not be stored inline. Use \${env:\*} placeholders and declare names in secrets\[].

9. (Optional) Assets
   Attach supporting files to provide context or examples.

Example:
"assets": \[
{
"path": "docs/reference.md",
"media\_type": "text/markdown",
"purpose": "context",
"description": "Background material"
}
]

10. (Optional) Tools
    Declare tools with a parameters\_schema describing the tool’s input shape.

Example:
"tools": \[
{
"name": "search",
"description": "Look up background info",
"parameters\_schema": {
"type": "object",
"required": \["query"],
"properties": { "query": { "type": "string" } }
}
}
]

11. (Optional) Vision
    Gate image inputs and document expected media types.

Example:
"vision": {
"allow\_images": true,
"inputs": \[
{ "name": "reference\_photo", "media\_type": "image/png", "description": "Reference image" }
]
}

12. (Optional) Tests
    Author simple checks to sanity test the prompt.

Example:
"tests": \[
{
"name": "hello-world",
"input": { "topic": "World" },
"expect\_contains": \["World"]
}
]

13. (Optional) Extends (advanced reuse)
    You can point to a base .gptp and override fields in your file.

Example:
"extends": "./base-prompt.gptp"

Note:
• Inheritance semantics are runner-defined in v1.1. Avoid cycles. Document your merge rules if you implement them.

14. Validation
    • Include "\$schema": "./schema/gptp.schema.json" to enable editor validation.
    • The top level uses additionalProperties=false. Unknown top-level keys are invalid.
    • Validate using any JSON Schema validator that supports draft-07.

15. Full example (author-focused)
    {
    "\$schema": "./schema/gptp.schema.json",
    "name": "Artist Statement Generator",
    "description": "Writes a short artist statement about a given topic.",
    "version": "1.1.0",
    "system": "You are a professional writer who crafts compelling artist bios.",
    "messages": \[
    { "role": "user", "content": "Write a 150-word artist statement about {{topic}}." }
    ],
    "variables": \[
    { "name": "topic", "description": "The subject of the artist statement", "required": true, "example": "eco-conscious materials" }
    ],
    "metadata": {
    "tags": \["art", "bio", "writing"],
    "created\_by": "ICI Prompt Lab",
    "created\_at": "2025-07-15T12:00:00Z",
    "model\_compatibility": \["gpt-4", "claude-3-opus"]
    ],
    "rendering": { "style": "chat", "instructions\_position": "top" },
    "output\_format": "markdown"
    }

16. Authoring checklist
    • Required fields present: name, description, version, messages.
    • version uses semver style (prefer full 1.1.0).
    • All variables declared under "variables" and referenced as {{name}}.
    • No unknown top-level keys.
    • If output\_format=json and output\_schema provided, it is a valid JSON Schema.
    • No inline secrets; use \${env\:VAR} and declare names in secrets\[].
