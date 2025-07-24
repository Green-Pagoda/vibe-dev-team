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

## Next Steps
- Create system architecture diagram
- Define API contracts between components
- Begin implementation of base agent framework