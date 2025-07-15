# <img src="./images/icons/GPTP Icon.png" width="400" alt="GPTP Icon" />

GPT Prompt (GPTP) is a portable, structured file format (`.gptp`) for packaging, transporting and exchanging prompts across Generative Pre-trained Transformer (GPT) models.

It is designed for compatibility with GPT-based systems like:
- OpenAI GPT-3.5 Turbo
- OpenAI GPT-4
- OpenAI GPT-4 Turbo
- Claude 3 (convert .gptp to Claude’s Human: / Assistant: format)
- LLaMA / Mistral (render into instruction-style prompts using templates)

The goal of GPTP is to:
- Standardize reusable prompt design
- Enable editing across tools (web, CLI, IDE)
- Support variable injection and metadata
- Validate structure via JSON Schema

This format supports:
- Role-based message prompts (`system`, `user`, `assistant`)
- Templated variables (`{{name}}`, `{{topic}}`)
- Metadata (`tags`, `created_by`, `compatible_models`)
- Rendering preferences for UI and API use

## Example

```json
{
  "name": "My Prompt",
  "description": "Writes an intro paragraph",
  "version": "1.0",
  "system": "You are a professional writer.",
  "messages": [{ "role": "user", "content": "Write an intro about {{topic}}" }],
  "variables": [{ "name": "topic", "required": true }]
}
```
## VS Code Integration

To enable schema validation and autocomplete in VS Code, add this line at the top of your `.gptp` files:

```json
"$schema": "./schema/gptp.schema.json",
```

## Tools

You can:
- Use GPTP in CLI runners or scripts
- Load it into web prompt editors
- Validate it in IDEs such as VS Code using `$schema`

## Usage

### Validate a `.gptp` file:

```bash
node tools/gptp-validate.js prompts/test-prompt.gptp
```

### Render a .gptp file with variables:

```bash
node tools/gptp-render.js prompts/artist-statement.gptp inputs/artist-statement.input.json
```

### Run CLI script (example wrapper):

```bash
node tools/gptp-run.js --file prompts/resume-writer.gptp --vars inputs/resume-writer.input.json
```

## References

- [GPTP Specification](/docs/gptp-spec.md) – human-readable spec
- [GPTP Schema](/schema/gptp.schema.json) – validation schema
