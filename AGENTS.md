# Repository Guidelines

- Use **feature branches** for each task. Keep your branch up to date by rebasing on the latest `main` before opening a pull request:
  ```bash
  git fetch origin
  git rebase origin/main
  ```
- Prior to committing, install dependencies, run lint, and execute GUI regression tests inside `rubicsolver-app`:
  ```bash
  cd rubicsolver-app
  npm ci
  npm run lint
  npm run test
  ```
- Continuous integration checks run automatically when you open a PR. However,
  branches prefixed with `codex/` skip the lint and test workflow because these
  checks run before the PR is created. Ensure other branches pass CI.
- The project typically merges PRs using **Create a merge commit**. Follow this strategy unless otherwise specified.
