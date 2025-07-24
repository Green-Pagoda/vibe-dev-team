# Vibe Dev Team - Project Memory

## Project Overview
This is a documentation-focused monorepo for AI agent team development planning and coordination.

## Repository Structure
- **planning/**: Documentation package for AI agent team roles and interaction patterns
- Uses release-please for automated versioning and releases

## Release Management
- **Tool**: release-please with GitHub Actions workflow
- **Configuration**: 
  - `planning` package uses "simple" release type (for documentation)
  - Separate pull requests enabled for independent versioning
  - Node workspace plugin for monorepo support
- **Target branch**: master
- **Authentication**: GitHub App with custom tokens

## Git Workflow
- **Main branch**: master (for releases)
- **Current work**: planning branch
- Follows conventional commits for automated changelog generation
- Commit to git as you work. Commits should be small and frequent, covering only a single logical task.

## Key Files
- `release-please-config.json`: Release configuration
- `.release-please-manifest.json`: Version tracking
- `.github/workflows/release-please.yml`: Automated release workflow