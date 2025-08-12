# GPTP Template


```jsonc
{
  "$schema": "./schema/gptp.schema.json", // Enables validation & autocomplete; spec version implied by $id

  "name": "Example Prompt",               // REQUIRED — title of the prompt
  "description": "Demonstrates the GPTP v1.1.0 structure", // REQUIRED — what it does

  "version": "1.1.0",                      // REQUIRED — prompt’s own semver (not spec version)

  "system": "You are a helpful assistant.", // OPTIONAL — system-level instructions

  "messages": [                            // REQUIRED — core prompt turns (chat style)
    {
      "role": "user",                      // REQUIRED — one of system | user | assistant
      "content": "Say hello to {{who}}"    // REQUIRED — text; {{var}} placeholders replaced at runtime
    }
  ],

  "variables": [                           // OPTIONAL — templated inputs; injected with String(value)
    {
      "name": "who",                        // REQUIRED — variable identifier
      "description": "Name of the person to greet", // OPTIONAL
      "required": true,                     // OPTIONAL — default is true
      "example": "Alice"                     // OPTIONAL — example value
    }
  ],

  "metadata": {                             // OPTIONAL — extra info; tools MAY ignore
    "tags": ["example", "demo"],            // Keywords
    "created_by": "Yuxi Labs",              // Author or org
    "created_at": "2025-07-09T16:00:00Z",   // ISO 8601 date-time
    "model_compatibility": ["gpt-4", "gpt-3.5-turbo"] // Compatible models
  },

  "rendering": {                            // OPTIONAL — UI/display hints; tools MAY ignore
    "style": "chat",                        // chat | single-shot | template
    "instructions_position": "top"          // top | inline | none
  },

  "output_format": "markdown",              // OPTIONAL — markdown | json | plain-text | html

  "params": {                                // OPTIONAL — request parameters
    "model": "gpt-4",                        // Model name
    "temperature": 0.7,                      // [0, 2]
    "top_p": 0.9,                             // [0, 1]
    "max_tokens": 512                         // >=1
  },

  "connections": {                           // OPTIONAL — provider configs; may include ${env:VAR}
    "active": "openai",                      // Active provider key
    "providers": {
      "openai": {
        "type": "openai",                     // Provider type
        "endpoint": "https://api.openai.com/v1", // API endpoint
        "deployment": "gpt-4",                // Deployment name/version
        "api_key": "${env:OPENAI_API_KEY}"    // MUST NOT inline secrets
      }
    }
  },

  "assets": [                                 // OPTIONAL — hint files; runners SHOULD attach if supported
    {
      "path": "docs/example.md",              // Path to asset file
      "media_type": "text/markdown",          // MIME type
      "purpose": "context",                   // context | example | citation | other
      "description": "Background information for the prompt"
    }
  ],

  "license": "MIT",                           // OPTIONAL — SPDX license ID
  "usage_notes": "Replace {{who}} with a provided name before sending.", // OPTIONAL

  "provenance": {                             // OPTIONAL — integrity and signing info
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", // 64-char hex
    "signature": "optional-signature-data"    // Optional opaque signature
  },

  "secrets": ["OPENAI_API_KEY"],              // OPTIONAL — required env var names (no values)

  "tools": [                                  // OPTIONAL — tool/function definitions
    {
      "name": "search",                       // REQUIRED — tool name
      "description": "Search the web for information", // Optional
      "parameters_schema": {                  // Optional — JSON Schema for tool parameters
        "type": "object",
        "properties": {
          "query": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  ],

  "vision": {                                 // OPTIONAL — vision capabilities
    "allow_images": true,                     // Allow image input
    "inputs": [
      {
        "name": "reference_photo",            // REQUIRED — vision input name
        "media_type": "image/png",            // REQUIRED — MIME type
        "description": "Provide a PNG image for analysis" // Optional
      }
    ]
  },

  "tests": [                                  // OPTIONAL — self-tests
    {
      "name": "hello-world",                  // REQUIRED — test name
      "input": { "who": "World" },             // REQUIRED — variables to use
      "expect_contains": ["Hello"],           // Output must contain these strings
      "expect_exact": "Hello World"           // Output must match exactly (optional)
    }
  ],

  "extends": "./base-prompt.gptp"             // OPTIONAL — inherit from another .gptp
}
```
