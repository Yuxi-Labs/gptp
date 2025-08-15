# GPTP Format Specification (v1.2.0)

Status: Stable. This document defines the GPT Prompt Package (.gptp) file format as implemented by schema v1.2.0.

## 1. SCOPE AND PURPOSE
The GPTP file format packages prompts as portable JSON artifacts. It is designed for reuse, validation, and tooling interoperability across editors, runners, and marketplaces. This specification is normative. The JSON Schema tagged with `schemaVersion` is the source of truth for structural validation.

## 2. NORMATIVE REFERENCES
Schema (`$id`):
https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.2.0/schema/gptp.schema.v1.2.0.json

All files claiming conformance to GPTP v1.2 MUST validate against the schema above.

## 3. CONFORMANCE MODEL
- A **GPTP document** is a JSON object that validates against the v1.2.0 schema.
- A **Runner** is software that loads a GPTP document and may render, execute, or transform it.
- A **Tool** is non-executing software that edits, validates, or analyzes GPTP documents.

**Documents**: MUST conform to the schema, including required keys and value constraints.  
**Runners**: MUST treat semantics in this spec as normative. If a field is unknown and `additionalProperties: false` in its scope, runners MUST treat the document as invalid.  
**Tools**: SHOULD surface validation errors and SHOULD preserve unknown-but-allowed fields.

## 4. VERSIONING RULES
### 4.1 Prompt Version (`promptVersion`)
Describes the version of the prompt content. It MUST follow semver:
```
^[0-9]+\.[0-9]+(\.[0-9]+)?$
```
Producers SHOULD emit full semver like `1.2.0` for clarity.

### 4.2 Schema Version (`schemaVersion`)
This indicates which GPTP schema version the document is written against.

### 4.3 Breaking Changes
A breaking change is any change that:
- Makes a previously valid document invalid
- Changes the meaning of a key or field

Such changes require a **new schemaVersion** and new schema file. Non-breaking additions within `additionalProperties: true` scopes MAY be minor versions.

## 5. FILE STRUCTURE
Top-level: `additionalProperties: false`. Unknown keys at the top level MUST be rejected.

### Required keys:
- `$doctype`: always "gptp"
- `schemaVersion`: identifies schema version used
- `promptVersion`: semver of the prompt
- `title`: human-readable title
- `description`: description of prompt purpose
- `messages`: array of `{ role, content }` chat turns

### Optional keys:
(system, variables, metadata, rendering, output_format, output_schema, params, connections, assets, license, usage_notes, provenance, secrets, tools, vision, tests, extends)

## 6. FIELD SEMANTICS
### 6.1 `title`
Human-readable title. No execution semantics.

### 6.2 `messages`
Array of turns, each with:
- `role`: one of `system`, `user`, `assistant`
- `content`: non-empty string

### 6.3 `system`
Optional string for high-level instructions. Runners MAY normalize this into a synthetic `{ role: "system" }` message at the beginning of the message array.

### 6.4 `variables`
A map of variable declarations used in `{{var}}` style templates. Each key MUST declare a type and MAY include:
- `description`
- `example`
- `required`: boolean
- validation hints (enum, pattern, minLength, etc.)

Missing required variables MUST raise an error before execution. Values MUST be coerced to string before substitution.

### 6.5 `metadata`
Optional descriptive info. Fields MAY include:
- `tags`: array of strings
- `created_by`: string
- `created_at`: RFC 3339 timestamp
- `model_compatibility`: array of model identifiers

### 6.6 `rendering`
Optional UI/display hints:
- `style`: `chat`, `single-shot`, `template`
- `instructions_position`: `top`, `inline`, `none`

### 6.7 `output_format` + `output_schema`
- `output_format`: `json`, `markdown`, `plain-text`, `html`
- If `output_format=json` and `output_schema` is present, outputs MUST validate against it.

### 6.8 `params`
Model invocation options. Recognized fields:
- `model`, `temperature`, `top_p`, `max_tokens`, `stop`, `seed`
- `frequency_penalty`, `presence_penalty`

Runners SHOULD honor supported params and ignore unknown ones with a warning.

### 6.9 `connections`
Provider config. Includes:
- `active`: name of active provider
- `providers`: map of provider configs (e.g. endpoint, api_key)

Supports environment substitution via `${env:VAR}`. Secrets MUST NOT be inlined.

### 6.10 `assets`
Hints for related files (e.g. examples, context). Each includes:
- `path`, `media_type`, `purpose`, `description`

### 6.11 `license`
SPDX license identifier.

### 6.12 `usage_notes`
Freeform guidance for human readers.

### 6.13 `provenance`
Integrity checks:
- `sha256`: 64-char hex digest
- `signature`: optional digital signature

### 6.14 `secrets`
Array of environment variable names required at runtime. Values MUST NOT appear in the file.

### 6.15 `tools`
Tool/function definitions:
- `name`: required
- `description`: optional
- `parameters_schema`: optional JSON Schema for tool arguments

### 6.16 `vision`
Declares use of visual inputs:
- `allow_images`: boolean
- `inputs`: list of expected image inputs (`name`, `media_type`, `description`)

### 6.17 `tests`
Self-checks for validating prompt behavior. Each test:
- Requires `input`
- MAY declare `expect`, `expect_exact`, `expect_contains`, or `expect_json_schema`

### 6.18 `extends`
Path to a base `.gptp` file. Merged by tools. Cycles MUST be rejected.

## 7. VALIDATION
- Top-level `additionalProperties: false`
- Nested validation rules apply (`params`, `providers`, etc.)
- Enums, formats, and regexes MUST be enforced

## 8. INTEROPERABILITY
Tools MAY ignore: `rendering`, `metadata`, `usage_notes`, `assets`.  
Runners MUST raise errors on invalid required fields or incompatible schema.

## 9. SECURITY
- DO NOT inline secrets — use `${env:VAR}` only
- Runners MUST resolve vars at runtime without logging values

## 10. ERROR HANDLING
- Schema validation failures MUST stop execution
- Output validation failures MUST produce diagnostic errors

## 11. EXTENSIBILITY
Vendor extensions MUST use `x-<vendor>-*` keys. Top-level extensions are only allowed where `patternProperties` enable them.

## 12. MEDIA TYPE AND EXTENSION
- Extension: `.gptp`
- Media type: `application/vnd.yuxilabs.gptp+json`

## 13. COMPATIBILITY NOTES
- `promptVersion` SHOULD be full semver (`1.2.0`)
- `output_format` may default to `markdown`
- `system` MAY be moved to messages during normalization

## 14. MINIMAL EXAMPLE
```json
{
  "$doctype": "gptp",
  "schemaVersion": "1.2.0",
  "promptVersion": "1.0.0",
  "title": "Example",
  "description": "Demo prompt",
  "messages": [
    { "role": "user", "content": "Say hello to {{who}}" }
  ],
  "variables": {
    "who": {
      "type": "string",
      "required": true
    }
  }
}
```

## 15. CHANGE MANAGEMENT
- Tightening validation or changing semantics REQUIRES new schemaVersion
- Non-normative changes MAY be made in docs only
- Tools SHOULD pin to a fixed schema for stability
