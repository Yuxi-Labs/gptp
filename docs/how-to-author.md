# How to Author a .gptp File

The `.gptp` format lets you define reusable, portable prompts for GPT-style models using a structured JSON file. This guide walks you through authoring a `.gptp` prompt from scratch.

## 1. Start With a Basic Structure

Every `.gptp` file is a JSON object with a required structure:

```jsonc
{
"$schema": "./schema/gptp.schema.json", // Enables validation and IDE support
"name": "My Prompt",
"description": "Generates a professional artist statement.",
"version": "1.0",
"system": "You are a professional writer.",
"messages": [
{ "role": "user", "content": "Write an artist statement about {{topic}}" }
]
}
```

## 2. Add Variables

Use variables to make your prompts reusable. Wrap them in `{{double braces}}`.

Add each variable to the `variables` array to document and validate its use:

```jsonc
"variables": [
  {
    "name": "topic",
    "description": "The subject of the artist statement",
    "required": true,
    "example": "sustainability in fashion"
  }
]
```
*__Tip__: Tools can use `example` values for previews and testing.*

## 3. Include Metadata (Optional, but Recommended)

```jsonc
"metadata": {
  "tags": ["writing", "creative", "statement"],
  "created_by": "Jane Doe",
  "created_at": "2025-07-15T12:00:00Z",
  "model_compatibility": ["gpt-4", "claude-3-opus"]
}
```
*__Tip__: Use metadata to help organize prompts and indicate model compatibility.*

## 4. Add Rendering Hints (Optional)

These help tools render the prompt appropriately in a UI or API:

```jsonc
"rendering": {
  "style": "chat",  // or "single-shot", "template"
  "instructions_position": "top"  // or "inline", "none"
}
```

## 5. Specify the Expected Output (Optional)

If the prompt expects a specific format, define it:

```jsonc
"output_format": "markdown" // Other options: "json", "plain-text", "html"
```

## 6. Extend Another Prompt (Advanced)

To reuse a base prompt and override parts of it, use `"extends"`:

```jsonc
"extends": "./base-prompt.gptp"
```
*__Note__: This feature is planned for a future version — not required for v1.0.*

## 7. Validate It

Use the included schema to validate your file:

```jsonc
node tools/gptp-validate.js prompts/my-prompt.gptp
```
*__Note__: Add the `$schema` field to get inline validation in VS Code.*

## Full Example

```jsonc
{
  "$schema": "./schema/gptp.schema.json",
  "name": "Artist Statement Generator",
  "description": "Writes a short artist statement about a given topic.",
  "version": "1.0",
  "system": "You are a professional writer who crafts compelling artist bios.",
  "messages": [
    {
      "role": "user",
      "content": "Write a 150-word artist statement about {{topic}}."
    }
  ],
  "variables": [
    {
      "name": "topic",
      "description": "The subject of the artist statement",
      "required": true,
      "example": "eco-conscious materials"
    }
  ],
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

## Next Steps
- See more examples in the `prompts/` folder
- Render a `.gptp` file using `gptp-render.js`
- Package `.gptp` + input JSON together for sharing