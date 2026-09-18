# Pushing CareConnect to GitHub

The repository is complete, committed and clean. Full git history is included
(6 commits). These are the only steps left.

## 1. Create an empty repository on GitHub

Go to https://github.com/new and create it with:

- **Owner:** gaurav-product
- **Repository name:** careconnect
- **Visibility:** Public
- **Do NOT** tick "Add a README", ".gitignore" or "Choose a license" —
  the repository must be empty, otherwise the first push is rejected.

## 2. Push from this folder

```bash
git remote add origin https://github.com/gaurav-product/careconnect.git
git branch -M main
git push -u origin main
```

If it asks for a password, use a Personal Access Token
(https://github.com/settings/tokens) rather than your GitHub password —
GitHub stopped accepting passwords for git operations.

Alternatively, with the GitHub CLI installed and signed in, steps 1 and 2
collapse into one command:

```bash
gh repo create gaurav-product/careconnect --public --source=. --remote=origin --push
```

## 3. Confirm CI runs

`.github/workflows/verify.yml` runs on every push to `main` and on pull
requests. Open the **Actions** tab after the first push. The workflow has never
run on real CI — it is written but untested, so treat the first run as a test of
the workflow, not only of the code.

Expected on a green run: 70 unit/integration tests, 72 end-to-end tests across
three viewports, 0 accessibility issues, 0 consistency issues.

## 4. Repository settings worth setting

- **Description:** A shared care record for families managing a parent's recovery at home.
- **Topics:** `product-management`, `case-study`, `healthcare`, `react`, `typescript`, `accessibility`
- **About → Website:** leave empty until an instance is deployed.

## What is NOT done

- No instance is deployed, so the README's demo instructions are local-only.
- The pilot in `docs/07-validation/pilot-runbook.md` has not been run.
  Everything in the repository is labelled accordingly.
