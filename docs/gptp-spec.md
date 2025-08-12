# GPTP Format Specification (v1.1.0)

Status: Stable. This document defines the GPT Prompt Package (.gptp) file format as implemented by schema v1.1.0.

1. SCOPE AND PURPOSE
   The GPTP file format packages prompts as portable JSON artifacts. It is designed for reuse, validation, and tooling interoperability across editors, runners, and marketplaces. This specification is normative. The JSON Schema at the tagged \$id is the source of truth for structural validation.

2. NORMATIVE REFERENCES
   Schema (\$id):
   [https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.1.0/schema/gptp.schema.json](https://raw.githubusercontent.com/Yuxi-Labs/gptp/refs/tags/v1.1.0/schema/gptp.schema.json)
   All files claiming conformance to GPTP v1.1 MUST validate against the schema above.

3. CONFORMANCE MODEL
   A “GPTP document” is a JSON object that validates against the v1.1.0 schema.
   A “Runner” is software that loads a GPTP document and may render, execute, or transform it.
   A “Tool” is non-executing software that edits, validates, or analyzes GPTP documents.

Documents: MUST conform to the schema, including required keys and value constraints.
Runners: MUST treat semantics in this spec as normative. If a field is unknown and additionalProperties=false in its scope, runners MUST treat the document as invalid.
Tools: SHOULD surface validation errors and SHOULD preserve unknown-but-allowed fields.

4. VERSIONING RULES
   4.1 Prompt version (the “version” key)
   The version field describes the prompt’s own semantic version, not the spec version. It MUST match the schema pattern:
   ^\[0-9]+.\[0-9]+(.\[0-9]+)?\$
   i.e., either major.minor or major.minor.patch. Producers SHOULD prefer full semver like 1.1.0 for clarity.

4.2 Spec version
The spec version is implied by the schema \$id used by the document. Tools MUST NOT infer spec version from the prompt’s version string.

4.3 Breaking changes
Any change that would cause a previously valid document to become invalid, or that changes the normative meaning of an existing key, is a breaking change and REQUIRES a new schema version and a new tagged \$id. Non-breaking additions within areas that allow them (where additionalProperties is not false) MAY be minor versions. This repository tags the schema so consumers can pin behavior.

5. FILE STRUCTURE (TOP-LEVEL)
   The top-level object has additionalProperties=false. Unknown top-level keys are invalid.

Required keys:

* name: non-empty string. Title of the prompt.
* description: non-empty string. Human-readable description.
* version: prompt’s semver (see 4.1).
* messages: non-empty array of chat turns (see 6.2).

Optional keys (presence and shape governed by schema):
system, variables, metadata, rendering, output\_format, output\_schema, params, connections, assets, license, usage\_notes, provenance, secrets, tools, vision, tests, extends.

6. SEMANTICS OF KEYS
   6.1 name
   Human-readable title. No execution semantics.

6.2 messages
Array of chat turns. Each item:

* role: one of system | user | assistant. Runners MUST honor the role semantics typical of chat models.
* content: non-empty string. Runners SHOULD pass content verbatim to the model according to role.

6.3 system
Optional string carrying system-level instructions. If present, runners SHOULD place it according to their model’s system channel mechanism or, if unavailable, prepend it to messages in a way that preserves intent.

6.4 variables
Array of variable declarations. Each item:

* name (required): variable identifier.
* description: optional human help text.
* required: boolean (default true). Runners SHOULD enforce prior to execution.
* example: optional example value.
* Validation hints (type, enum, pattern, min/max\*, minimum/maximum, default): optional constraints tools/runners MAY use to validate or coerce inputs.

Substitution: Values are injected where the document uses {{name}} placeholders. Coercion: Runners MUST coerce values with String(value) before substitution. Missing required variables MUST be treated as an error before execution.

6.5 metadata
Auxiliary info. Tools MAY ignore. Fields include tags, created\_by, created\_at (RFC 3339 date-time), and model\_compatibility (string list). Presence has no execution requirement.

6.6 rendering
UI/display hints. Tools MAY ignore. Fields:

* style: “chat”, “single-shot”, or “template”.
* instructions\_position: “top”, “inline”, or “none”.

6.7 output\_format and output\_schema
output\_format: one of markdown | json | plain-text | html. If output\_format=json and output\_schema is provided, runners and tools MUST validate model outputs against output\_schema (JSON Schema). Validation failures MUST be surfaced as errors.

6.8 params
Request parameters for model invocation. additionalProperties=false applies in this object. Recognized keys include:

* model (string)
* temperature (0..2), top\_p (0..1), max\_tokens (>=1)
* stop (string OR array of strings)
* seed (integer)
* frequency\_penalty, presence\_penalty (-2..2)
  Runners SHOULD map these to their underlying provider if supported; otherwise they MAY ignore with a warning.

6.9 connections
Provider configuration with environment-variable placeholders.

* active: provider key to use.
* providers: map of provider configs. Each provider object may include type, endpoint, deployment, api\_key.
  Placeholders: Values MAY contain \${env\:VAR}. Runners MUST resolve \${env\:VAR} at runtime using the host environment. Secrets MUST NOT be inlined in cleartext; producers SHOULD use \${env:\*} and list required names under secrets.

6.10 assets
Hints for supplementary files. Each asset has path, media\_type, purpose (context | example | citation | other), description.
Runners SHOULD attach or stage these files when supported. Tools MAY ignore.

6.11 license
SPDX identifier (e.g., MIT, Apache-2.0). No execution semantics.

6.12 usage\_notes
Free-form text for operators. Tools MAY ignore.

6.13 provenance
Provenance data for integrity and signing.

* sha256: 64 hex chars. If present, tools SHOULD verify against the file content the producer intends (e.g., normalized JSON).
* signature: optional opaque signature blob. No mandated signing scheme in v1.1.

6.14 secrets
Array of environment variable NAMES required at runtime (e.g., OPENAI\_API\_KEY). Names only; values MUST NOT appear in the document. Runners MUST NOT store or log secrets values.

6.15 tools
Declarative tool/function definitions. Each tool item:

* name (required), description (optional), parameters\_schema (object; JSON Schema for tool parameters).
  Runners MAY expose tool-calling if compatible with the target model. Where parameters\_schema is present, runners SHOULD validate tool invocation payloads.

6.16 vision
Declares vision capabilities.

* allow\_images: boolean.
* inputs: array of objects with required name and media\_type, optional description.
  Runners SHOULD use this to gate or describe expected visual inputs.

6.17 tests
Lightweight, declarative checks.

* name (required), input (object), expect\_contains (string array), expect\_exact (string), expect\_json\_schema (object).
  Runners/Tools MAY execute tests by running the prompt with “input” applied, then asserting expectations. Where expect\_json\_schema is present and output\_format=json, returned JSON MUST validate.

6.18 extends
Relative path to a base .gptp. Runners MAY implement inheritance by deep-merging the base with the current document, with the current document’s values taking precedence. Cycles MUST be rejected. Exact merge semantics are not standardized in v1.1; tools SHOULD document their behavior.

7. VALIDATION BEHAVIOR
   Top-level additionalProperties=false: unknown keys at the top level are invalid and MUST be rejected.
   Nested additionalProperties=false: in objects that declare it (e.g., params, providers), unknown keys MUST be rejected in that scope.
   Enum and numeric ranges: MUST be enforced as per schema.
   Date-time: created\_at MUST match RFC 3339 if present.
   Version: MUST match the regex in 4.1.

8. INTEROPERABILITY GUIDANCE
   Tools MAY ignore: rendering, metadata, usage\_notes.
   Assets are advisory; runners SHOULD attach when feasible.
   Where a runner cannot support a parameter or feature, it SHOULD ignore with a warning rather than fail, unless doing so violates a MUST (e.g., required variable missing, JSON output required but invalid).

9. SECURITY REQUIREMENTS
   Secrets MUST NOT be embedded in-line. Use \${env\:VAR} in connections and list required variables in secrets\[].
   Runners MUST resolve environment placeholders at runtime and MUST avoid logging values.
   Publishers SHOULD avoid placing private endpoints or identifiers that would materially increase risk if leaked.

10. ERROR HANDLING
    Pre-execution validation errors (e.g., missing required variable, schema invalid) MUST stop execution and surface a clear error.
    At-execution validation errors (e.g., output\_format=json + output\_schema fails) MUST be reported as a failed run with diagnostics.

11. EXTENSIBILITY
    Vendor-specific extensions MUST use keys of the form x-<vendor>-\*.
    Because additionalProperties=false applies at top-level, vendor extensions will be rejected unless the schema explicitly allows them. Implementers are encouraged to extend behavior via external tools/runners rather than undocumented top-level keys for v1.1.

12. MEDIA TYPE AND FILE EXTENSION
    Recommended file extension: .gptp
    Suggested (non-registered) media type for interchange: application/vnd.yuxilabs.gptp+json
    These identifiers are advisory and have no impact on validation.

13. COMPATIBILITY NOTES
    This spec allows version values of the form 1.1 or 1.1.0. Producers SHOULD emit 1.1.0 for clarity. Consumers MUST accept both per schema.
    If output\_format is not specified, runners MAY default to markdown.
    If system is omitted, runners MUST rely solely on messages for instruction.

14. MINIMAL VALID EXAMPLE (ILLUSTRATIVE, NOT NORMATIVE)
    {
    "\$schema": "./schema/gptp.schema.json",
    "name": "Example",
    "description": "Demo prompt",
    "version": "1.1.0",
    "messages": \[
    { "role": "user", "content": "Say hello to {{who}}" }
    ],
    "variables": \[
    { "name": "who", "required": true }
    ]
    }

15. CHANGE MANAGEMENT
    Any future edits to this document that tighten validation or alter semantics require a new schema version and a new \$id tag. Non-normative clarifications that do not change validation MAY be made in documentation, but implementers SHOULD pin to a specific schema tag for stable behavior.
