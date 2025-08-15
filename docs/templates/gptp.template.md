# GPTP Template


```jsonc
{
  "$doctype": "gptp",
  "schemaVersion": "1.2.0",                 // Schema used for validation (spec version)
  "promptVersion": "1.0.0",                 // Your prompt's semantic version

  "title": "Example Prompt",                // REQUIRED — prompt title
  "description": "Demonstrates the GPTP v1.2.0 structure",

  "system": "You are a helpful assistant.", // Optional — can be normalized into messages

  "messages": [
    {
      "role": "user",
      "content": "Say hello to {{who}}"
    }
  ],

  "variables": {
    "who": {
      "type": "string",
      "description": "Name of the person to greet",
      "required": true,
      "example": "Alice"
    }
  },

  "metadata": {
    "tags": ["example", "demo"],
    "created_by": "Yuxi Labs",
    "created_at": "2025-07-09T16:00:00Z",
    "model_compatibility": ["gpt-4", "gpt-3.5-turbo"]
  },

  "rendering": {
    "style": "chat",
    "instructions_position": "top"
  },

  "output_format": "markdown",

  "params": {
    "model": "gpt-4",
    "temperature": 0.7,
    "top_p": 0.9,
    "max_tokens": 512
  },

  "connections": {
    "active": "openai",
    "providers": {
      "openai": {
        "type": "openai",
        "endpoint": "https://api.openai.com/v1",
        "deployment": "gpt-4",
        "api_key": "${env:OPENAI_API_KEY}"
      }
    }
  },

  "assets": [
    {
      "path": "docs/example.md",
      "media_type": "text/markdown",
      "purpose": "context",
      "description": "Background information for the prompt"
    }
  ],

  "license": "MIT",
  "usage_notes": "Replace {{who}} with a provided name before sending.",

  "provenance": {
    "sha256": "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
    "signature": "optional-signature-data"
  },

  "secrets": ["OPENAI_API_KEY"],

  "tools": [
    {
      "name": "search",
      "description": "Search the web for information",
      "parameters_schema": {
        "type": "object",
        "properties": {
          "query": { "type": "string" }
        },
        "required": ["query"]
      }
    }
  ],

  "vision": {
    "allow_images": true,
    "inputs": [
      {
        "name": "reference_photo",
        "media_type": "image/png",
        "description": "Provide a PNG image for analysis"
      }
    ]
  },

  "tests": [
    {
      "name": "hello-world",
      "input": { "who": "World" },
      "expect_contains": ["Hello"],
      "expect_exact": "Hello World"
    }
  ],

  "extends": "./base-prompt.gptp"
}
```
