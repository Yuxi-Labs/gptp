# <img src="./assets/images/icons/GPTP Icon.png" width="400" alt="GPTP Icon" />

<p>
  <!-- Latest Release -->
  <img src="https://img.shields.io/github/v/release/Yuxi-Labs/gptp?include_prereleases&sort=semver" alt="Latest Release" />

  <!-- Open Issues -->
  <img src="https://img.shields.io/github/issues/Yuxi-Labs/gptp" alt="Open Issues" />

  <!-- Pull Requests -->
  <img src="https://img.shields.io/github/issues-pr/Yuxi-Labs/gptp" alt="Pull Requests" />

  <!-- Last Commit -->
  <img src="https://img.shields.io/github/last-commit/Yuxi-Labs/gptp" alt="Last Commit" />

  <!-- Contributors -->
  <img src="https://img.shields.io/github/contributors/Yuxi-Labs/gptp" alt="Contributors" />

  <!-- License -->
  <img src="https://img.shields.io/badge/License-MIT-orange.svg" alt="License: MIT" />
</p>

**GPT Prompt (GPTP)** is a structured and portable JSON-based file format that defines reusable, templated prompt packages for use with Generative Pre-trained Transformer (GPT) models. GPTP files have the extension `.gptp` and are versioned, schema-validated files intended for use across GPT-compatible systems.

## Format Overview

Each `.gptp` file is a standalone JSON object that includes all necessary information to define a reusable prompt, including:

* **Metadata** (`title`, `description`, `promptVersion`)
* **Role-based prompt turns** (`messages` array)
* **Templated variables** (declared in `variables`, referenced via `{{var}}` syntax)
* **Optional system instructions** (`system`)
* **Optional configuration**: rendering hints, execution parameters, output expectations, assets, vision inputs, tests, tools, and connections

GPTP is based on a strict JSON schema with `additionalProperties: false` at the top level. All `.gptp` files must declare a `schemaVersion` field that is used to validate them.

## Required Fields

```json
{
  "$doctype": "gptp",
  "schemaVersion": "1.2.0",
  "promptVersion": "1.0.0",
  "title": "Prompt Name",
  "description": "What this prompt does",
  "messages": [
    { "role": "user", "content": "Say hello to {{name}}" }
  ]
}
```

## Supported Fields

| Key             | Required | Type   | Notes                                          |
| --------------- | -------- | ------ | ---------------------------------------------- |
| `$doctype`      | Yes      | string | Format identifier (`gptp`)                     |
| `schemaVersion` | Yes      | string | Schema version (e.g. `1.2.0`)                  |
| `promptVersion` | Yes      | string | Prompt content version                         |
| `title`         | Yes      | string | Title of the prompt                            |
| `description`   | Yes      | string | Human-readable summary                         |
| `messages`      | Yes      | array  | List of `{role, content}` turns                |
| `system`        | No       | string | High-level instruction                         |
| `variables`     | No       | object | Input parameters (templated with `{{var}}`)    |
| `metadata`      | No       | object | Tags, author, creation date, compatibility     |
| `rendering`     | No       | object | UI/display hints                               |
| `output_format` | No       | string | `markdown` \\| `json` \\| `plain-text` \\| `html` |
| `output_schema` | No       | object | JSON Schema for expected output                |
| `params`        | No       | object | Model call parameters                          |
| `connections`   | No       | object | Provider config using env substitution         |
| `assets`        | No       | array  | Attachments with path + MIME type              |
| `tools`         | No       | array  | Tool/function declarations                     |
| `vision`        | No       | object | Expected image inputs                          |
| `tests`         | No       | array  | Self-checks for prompt output                  |
| `extends`       | No       | string | Relative path to base `.gptp`                  |
| `license`       | No       | string | SPDX ID (e.g., MIT)                            |
| `usage_notes`   | No       | string | Freeform tips                                  |
| `provenance`    | No       | object | SHA256 + optional signature                    |
| `secrets`       | No       | array  | List of env var names required                 |

## Schema Version

The `schemaVersion` field identifies the specific version of the GPTP specification. For version `1.2.0`, it is:

```json
"schemaVersion": "1.2.0"
```

## Format Status

* **Current schema**: v1.2.0
* **Stability**: Stable
* **Schema language**: JSON Schema Draft-07
* **Media type** (non-registered): `application/vnd.yuxilabs.gptp+json`
* **File extension**: `.gptp`

## Compatibility

Tools and runtimes can render `.gptp` into formats suitable for:

* OpenAI models (e.g., GPT-3.5, GPT-4, GPT-4 Turbo)
* Claude 3 (after conversion to `Human:` / `Assistant:` turns)
* LLaMA / Mistral (via instruction-style templating)

## Specification

The full specification is available at:

* [`/docs/gptp-spec.md`](docs/gptp-spec.md)
* [`/schema/gptp.schema.v1.2.0.json`](schema/gptp.schema.v1.2.0.json)

All conformance claims must validate against the schema referenced by `schemaVersion`.
