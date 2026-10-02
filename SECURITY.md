# Security Policy

This is a **private** repository. Do not disclose its contents.

## Reporting a vulnerability

Contact: `TODO` (a human must choose the security contact email).

Include the affected page or component, reproduction steps, impact, and redacted logs. Do not open a public issue or include real credentials, tokens, personal data, or other secrets.

## Supported versions

Only the `main` branch is supported. Security fixes land through the pull-request workflow.

## Scope notes

- This static site intentionally contains no production credentials or private user data.
- Every `NEXT_PUBLIC_*` value is visible in the browser and must never contain a secret.
- GitHub secret scanning and push protection may be unavailable for this private repository on the Free plan; local pre-commit and CI Gitleaks scans still apply.
