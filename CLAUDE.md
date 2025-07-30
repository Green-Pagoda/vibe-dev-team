# Vibe Dev Team - Project Memory

## Project Overview

AI-powered software development team using specialized agents communicating through a ticket tracking system (Plane).

## Architecture Decisions

- **Agent Framework**: CrewAI (role-based agents) or minimal custom framework
- **Workflow Orchestration**: Temporal for durable, long-running workflows
- **Ticket System**: Plane (self-hosted, API-first, webhook support)
- **Language**: Python 3.11+ with mypyc compilation for type safety
- **LLM Abstraction**: LiteLLM for multi-provider support
- **Web Framework**: FastAPI for webhook handling

## Type Safety Strategy

- **mypyc-first**: Compile everything except dynamic LLM wrappers
- **Static Analysis**: mypy + pyright with maximum strictness
- **CI Enforcement**: Type errors = build failures
- **Zero Runtime Overhead**: All checking happens at compile/CI time

## Agent Roles (Hyper-Specialized)

- Feature Complexity Estimator
- Requirements Decomposer
- Architecture Decision Maker
- Code Style Enforcer
- Security Auditor
- Test Case Generator
- Tester & QA Manager
- Documentation Manager
- Merge Conflict Resolver

## Development Tools

- **Git**: GitHub (abstracted for GitLab compatibility)
- **CI/CD**: GitHub Actions (abstracted for other providers)
- **Code Intelligence**: ast-grep, semgrep, ctags
- **Refactoring**: rope, comby, grit
- **Linting**: ruff, eslint, prettier

## Repository Structure

- **planning/**: Documentation and architecture decisions
- **src/compiled/**: Type-checked, mypyc-compiled code
- **src/dynamic/**: Dynamic code that can't be compiled

## Git Workflow

- **Main branch**: master (for releases)
- **Current work**: planning branch
- Follows conventional commits
- Small, frequent commits covering single logical tasks

## Planning Phase Complete

All architecture and design documentation has been created:

- System architecture with component diagram
- API contracts with full type definitions
- Tool integrations and development workflow
- Type safety strategy with mypyc compilation

## Implementation Architecture (Updated 2025-07-29)

- **Language**: TypeScript throughout (developer preference)
- **Webhook Server**: Hono/Bun receiving Plane events
- **Orchestration**: Mastra vNext workflows (Temporal backend when available)
- **Agent Framework**: Mastra for TypeScript-native AI agents
- **LLM Abstraction**: Vercel AI SDK (replaces LiteLLM)
- **Tool Integration**: MCP (Model Context Protocol) for standardized access
- **Communication**: Only through Plane ticket API
- **Type Safety**: Native TypeScript strict mode

## Technology Stack Changes

- **From**: Python/CrewAI/mypyc/FastAPI/LiteLLM
- **To**: TypeScript/Mastra/Bun/Hono/Vercel AI SDK
- **Rationale**: Developer preference for TypeScript, cleaner single-language architecture

## Next Steps

1. Merge planning branch to master
2. Create implementation branch
3. Set up TypeScript project with Mastra
4. Deploy Plane infrastructure
5. Implement first Mastra agent (Feature Estimator)
6. Use Mastra workflows initially, migrate to Temporal when backend support ships

## Repository Conventions

- Changes to the planning docs under folder planning/ should be considered enhancements not docs changes, as the docs themselves are the artifact of that component.

## Standard Operating Procedures

### Package Management Protocol (CRITICAL)

**MANDATORY**: After ANY changes to package.json, lockfiles, or npm dependencies:

1. **Immediate Verification Required**:

   ```bash
   npm install          # Must succeed without errors
   npm run typecheck    # Must pass with ZERO errors
   npm run format       # Must complete successfully
   npm run lint         # Must pass with current config
   ```

2. **Scope**: This applies to the ENTIRE repository, not just changed packages
3. **Failure Protocol**: If any command fails, the change MUST be fixed before proceeding
4. **No Exceptions**: This check is required even for "small" changes to dependencies

**Rationale**: The workspace resolved its issues through careful dependency management. Breaking this requires immediate detection and resolution to maintain developer experience.

### Error Handling Protocol (FUNDAMENTAL)

**NEVER EVER just silently SKIP or HIDE ERRORS. When there is an error, WE MUST FIX IT.**

**FORBIDDEN Practices**:

- `--skipLibCheck` for hiding OUR code errors
- `--no-emit-on-error` with ignore flags
- `// @ts-ignore` without fixing the underlying issue
- ESLint disable comments without addressing the problem
- Any flag or configuration that suppresses errors instead of resolving them

**EXCEPTION for `--skipLibCheck`**:

- **Permitted ONLY** when dependencies have broken type definitions
- **Must be documented** with specific reasons (broken deps listed)
- **Our code must still have zero errors** when lib checking is disabled
- **Temporary measure** until dependencies are fixed or replaced

**Required Approach**:

- **Fix the root cause** of every error
- **Understand why** the error occurred
- **Address the underlying problem**, don't mask symptoms
- **Zero tolerance** for "expected errors" - all errors must be resolved

**Rationale**: Hiding errors leads to technical debt, runtime failures, and poor code quality. Every error represents a real problem that needs solving.

### Development Environment Standards

- **Local Development**: Must work with `npm install` (no Docker requirement)
- **Docker Development**: Must remain functional as alternative option
- **Workspace Integrity**: All internal package references must resolve correctly
- **Tool Compatibility**: ESLint, Prettier, TypeScript must all function properly
