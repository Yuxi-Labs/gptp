# How to Author a GPTP File (v1.2.0)

Overview  
The `.gptp` format is a structured JSON file that packages a reusable prompt. Every `.gptp` must validate against the schema version declared in `schemaVersion`. The prompt’s own version is `promptVersion` (semver). The schema controls structural validation.

## 1. Start with the minimal structure
A valid `.gptp` is a JSON object with required fields: `$doctype`, `schemaVersion`, `promptVersion`, `title`, `description`, and `messages`.

```json
{
  "$doctype": "gptp",
  "schemaVersion": "1.2.0",
  "promptVersion": "1.0.0",
  "title": "My Prompt",
  "description": "Generates a professional artist statement.",
  "messages": [
    { "role": "user", "content": "Write an artist statement about {{topic}}." }
  ]
}
```

Notes:
- `promptVersion` is the prompt’s own semantic version (e.g., 1.2.0). It is not the spec version.
- The schema controls validation; unknown top-level keys are invalid (`additionalProperties: false`).

## 2. Add variables (for templating)
Use variables to make prompts reusable. Reference variables with `{{name}}` inside message content or `system`. Declare each variable in the `variables` object.

```json
"variables": {
  "topic": {
    "type": "string",
    "description": "The subject of the artist statement",
    "required": true,
    "example": "sustainability in fashion"
  }
}
```

Rules:
- Substitution uses string coercion.
- If `required` is `true` (default), the variable must be provided before running.

## 3. (Optional) Add a system instruction
`system` is a string with high‑level guidance. Runners MAY normalize it as a `{ role: "system" }` message.

```json
"system": "You are a professional writer."
```

## 4. (Optional) Metadata for organization
Metadata helps catalog and filter prompts. It does not affect execution.

```json
"metadata": {
  "tags": ["writing", "creative", "statement"],
  "created_by": "Jane Doe",
  "created_at": "2025-07-15T12:00:00Z",
  "model_compatibility": ["gpt-4", "claude-3-opus"]
}
```

## 5. (Optional) Rendering hints
These guide UIs. Tools may ignore them.

```json
"rendering": {
  "style": "chat",
  "instructions_position": "top"
}
```

## 6. (Optional) Expected output and JSON contract
If you expect a particular format, set `output_format`. When using `json`, provide `output_schema`.

```json
"output_format": "json",
"output_schema": {
  "type": "object",
  "required": ["title", "summary"],
  "properties": {
    "title": { "type": "string" },
    "summary": { "type": "string" }
  },
  "additionalProperties": false
}
```

## 7. (Optional) Params
Model request parameters.

```json
"params": {
  "model": "gpt-4",
  "temperature": 0.7,
  "top_p": 0.9,
  "max_tokens": 512,
  "stop": ["\n\n"]
}
```

## 8. (Optional) Connections and secrets
Use `${env:VAR}` to avoid hardcoded secrets.

```json
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
"secrets": ["OPENAI_API_KEY"]
```

## 9. (Optional) Assets
Supplementary files for reference.

```json
"assets": [
  {
    "path": "docs/reference.md",
    "media_type": "text/markdown",
    "purpose": "context",
    "description": "Background material"
  }
]
```

## 10. (Optional) Tools
Declare functions with parameter schemas.

```json
"tools": [
  {
    "name": "search",
    "description": "Look up background info",
    "parameters_schema": {
      "type": "object",
      "required": ["query"],
      "properties": { "query": { "type": "string" } }
    }
  }
]
```

## 11. (Optional) Vision
Declare image expectations.

```json
"vision": {
  "allow_images": true,
  "inputs": [
    {
      "name": "reference_photo",
      "media_type": "image/png",
      "description": "Reference image"
    }
  ]
}
```

## 12. (Optional) Tests
Declare self-checks for your prompt.

```json
"tests": [
  {
    "name": "hello-world",
    "input": { "topic": "World" },
    "expect_contains": ["World"]
  }
]
```

## 13. (Optional) Extends
Inherit from a base prompt.

```json
"extends": "./base-prompt.gptp"
```

Avoid cycles. Merge logic is tool-defined.

## 14. Validation Tips
- Include `$doctype`, `schemaVersion`, and `promptVersion`
- All variables used in `{{...}}` must be declared
- No unknown top-level keys
- Validate with any JSON Schema Draft-07 validator

## 15. Full Example (Author-Focused)
```json
{
  "$doctype": "gptp",
  "schemaVersion": "1.2.0",
  "promptVersion": "1.0.0",
  "title": "Artist Statement Generator",
  "description": "Writes a short artist statement about a given topic.",
  "system": "You are a professional writer who crafts compelling artist bios.",
  "messages": [
    { "role": "user", "content": "Write a 150-word artist statement about {{topic}}." }
  ],
  "variables": {
    "topic": {
      "type": "string",
      "description": "The subject of the artist statement",
      "required": true,
      "example": "eco-conscious materials"
    }
  },
  "metadata": {
    "tags": ["art", "bio", "writing"],
    "created_by": "ICI Prompt Lab",
    "created_at": "2025-07-15T12:00:00Z",
    "model_compatibility": ["gpt-4", "claude-3-opus"]
  },
  "rendering": {
    "style": "chat",
    "instructions_position": "top"
  },
  "output_format": "markdown"
}
```

## 16. Authoring Checklist
- ✅ Required fields present
- ✅ `promptVersion` uses semver
- ✅ All variables declared
- ✅ No top-level key errors
- ✅ Schema validation passes
- ✅ No inline secrets
