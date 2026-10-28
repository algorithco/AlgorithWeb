# Security Policy

## Reporting a vulnerability

Use [GitHub private vulnerability reporting](https://github.com/algorithco/AlgorithWeb/security/advisories/new) on this repository. Do not open a public issue for a vulnerability.

Include the affected page or component, reproduction steps, impact, and redacted logs. Do not open a public issue or include real credentials, tokens, personal data, or other secrets.

## Supported versions

Only the `main` branch is supported. Security fixes land through the pull-request workflow.

## Scope notes

- This static site intentionally contains no production credentials or private user data.
- Every `NEXT_PUBLIC_*` value is visible in the browser and must never contain a secret.
- Local pre-commit and CI Gitleaks scans run on every change.
