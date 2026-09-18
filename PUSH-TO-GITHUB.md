# Pushing CareConnect to GitHub

The GitHub repository already exists and is empty:
**https://github.com/gaurav-product/careconnect**

The `origin` remote is already configured in this folder and the branch is
already named `main`. One command is left.

## Push

```bash
git push -u origin main
```

If git asks for a password, use a Personal Access Token
(https://github.com/settings/tokens → Generate new token → repo scope) —
GitHub no longer accepts account passwords for git operations. On Windows,
Git Credential Manager will usually open a browser window and handle this
for you without a token.

## Then check CI

`.github/workflows/verify.yml` runs on every push to `main`. Open the
**Actions** tab at https://github.com/gaurav-product/careconnect/actions
after the push.

This workflow has never run on real CI. It is written against what passes
locally, but the first run is a test of the workflow as much as of the code.
If it fails, that is the most likely reason.

Expected on a green run: 70 unit/integration tests, 72 end-to-end tests
across three viewports, 0 accessibility issues, 0 consistency issues.

## Optional repository settings

- **Topics:** `product-management`, `case-study`, `healthcare`, `react`, `typescript`, `accessibility`
- **About → Website:** leave empty until an instance is deployed.

## What is still not done

- No instance is deployed, so the README's demo instructions are local-only.
- The pilot in `docs/07-validation/pilot-runbook.md` has not been run.
  Everything in the repository is labelled accordingly.
