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

## Implementation Architecture
- **Webhook Server**: FastAPI receiving Plane events
- **Orchestration**: Temporal for durable workflows
- **Agents**: Separate worker pools per role
- **Communication**: Only through Plane ticket API
- **Type Safety**: mypyc compilation + strict CI checks

## Next Steps
1. Merge planning branch to master
2. Create implementation branch
3. Set up base project with mypyc build system
4. Deploy Plane and Temporal infrastructure
5. Implement first agent (Feature Estimator)

## Repository Conventions
- Changes to the planning docs under folder planning/ should be considered enhancements not docs changes, as the docs themselves are the artifact of that component.