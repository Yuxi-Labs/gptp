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

**GPT Prompt (GPTP)** is a portable, structured JSON-based file format with the extension `.gptp`. It defines reusable, templated prompt packages for use with Generative Pre-trained Transformer (GPT) models. GPTP files are versioned, schema-validated documents intended for use across GPT-compatible systems.

## Format Overview

Each `.gptp` file is a standalone JSON object that includes all necessary information to define a reusable prompt, including:

* **Metadata** (`name`, `description`, `version`)
* **Role-based prompt turns** (`messages` array)
* **Templated variables** (declared in `variables`, referenced via `{{var}}` syntax)
* **Optional system instructions** (`system`)
* **Optional configuration**: rendering hints, execution parameters, output expectations, assets, vision inputs, tests, tools, and connections

The format is governed by a strict JSON Schema with `additionalProperties: false` at the top level. All `.gptp` documents must explicitly declare the schema version via a `$schema` field.

## Required Fields

```json
{
  "$schema": "./schema/gptp.schema.json",
  "name": "Prompt Name",
  "description": "What this prompt does",
  "version": "1.1.0",
  "messages": [
    { "role": "user", "content": "Say hello to {{name}}" }
  ]
}
```

## Supported Fields

| Key             | Required | Type   | Notes                                          |
| --------------- | -------- | ------ | ---------------------------------------------- |
| `name`          | Yes      | string | Title of the prompt                            |
| `description`   | Yes      | string | Human-readable summary                         |
| `version`       | Yes      | string | Semver (e.g. `1.1.0`)                          |
| `messages`      | Yes      | array  | List of `{role, content}` turns                |
| `system`        | No       | string | High-level instruction                         |
| `variables`     | No       | array  | Input parameters (templated with `{{var}}`)    |
| `metadata`      | No       | object | Tags, author, creation date, compatibility     |
| `rendering`     | No       | object | UI/display hints                               |
| `output_format` | No       | string | `markdown` \| `json` \| `plain-text` \| `html` |
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

All `.gptp` files must include a `$schema` field pointing to the canonical schema URL. For version `1.1.0`, that is:

```
https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.1.0/schema/gptp.schema.json
```

## Format Status

* **Current schema**: v1.1.0
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
* [`/schema/gptp.schema.json`](schema/gptp.schema.json)

All conformance claims must validate against the schema referenced by `$schema`.
