# Changesets

This directory stores release notes for the publishable packages in this workspace.

- Run `npm run changeset` from the repo root when a branch changes package behavior, metadata, or release configuration.
- Run `npm run version:packages` when preparing a release to apply version bumps and changelog updates.
- Run the GitHub Actions `Release` workflow from `main` when you want to create or update the release PR, or publish the prepared release.
- Keep the generated markdown files committed so CI can validate package-affecting pull requests.
