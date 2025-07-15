## GPTP Format Specification (JSON Template)

```jsonc
{
"$schema": "./schema/gptp.schema.json", // Enables schema validation & autocomplete

"name": "string",                        // Title of the prompt
"description": "string",                 // What it does
"version": "string",                     // Format version (e.g. "1.0")

"system": "string",                      // Optional system prompt (instructions to the assistant)

"messages": [                            // Core prompt turns (chat style)
{
"role": "system" | "user" | "assistant",
"content": "string"
}
],

"variables": [                           // Optional: templated inputs
{
"name": "string",                    // e.g. "topic"
"description": "string",             // Helpful for UI/display
"required": true | false,
"example": "string"                  // Optional example value
}
],

"metadata": {                            // Optional extra info
"tags": ["string"],                    // Keywords
"created_by": "string",                // Author or org
"created_at": "2025-07-09T16:00:00Z",  // ISO 8601 format
"model_compatibility": [               // Compatible GPT-style models
"gpt-4",
"gpt-3.5-turbo",
"claude-3-opus"
]
},

"rendering": {                           // UI/display hints
"style": "chat" | "single-shot" | "template",     // Preferred UI format
"instructions_position": "top" | "inline" | "none" // Where system prompt appears in UI
},

"output_format": "markdown" | "json" | "plain-text" | "html", // Optional: expected response format

// Future support (optional)
// "extends": "./base-prompt.gptp"        // Optional: inherit fields from another prompt
}
```