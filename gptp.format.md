{
  "name": "string",                      // Title of the prompt
  "description": "string",               // What it does
  "version": "string",                   // Format version (e.g. "1.0")

  "system": "string",                    // Optional system prompt (instructions to the assistant)

  "messages": [                          // Core prompt turns (chat style)
    {
      "role": "system" | "user" | "assistant",
      "content": "string"
    }
  ],

  "variables": [                         // Optional: templated inputs
    {
      "name": "string",                  // e.g. "topic"
      "description": "string",           // Helpful for UI/display
      "required": true | false,
      "example": "string"                // Optional example value
    }
  ],

  "metadata": {                          // Optional extra info
    "tags": ["string"],                  // Keywords
    "created_by": "string",              // Author or org
    "created_at": "ISO 8601 datetime",   // e.g. "2025-07-09T16:00:00Z"
    "model_compatibility": [             // List of GPT-style models this works with
      "gpt-4",
      "gpt-3.5-turbo",
      "claude-3-opus"
    ]
  },

  "rendering": {                         // UI/display hints
    "style": "chat" | "single-shot" | "template",
    "instructions_position": "top" | "inline" | "none"
  }
}
