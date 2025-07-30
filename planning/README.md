# Vibe Dev Team - Planning Documentation

This directory contains comprehensive planning documentation for the AI-powered software development team project. The planning phase established the complete system architecture, technical decisions, and implementation strategy.

## Project Overview

**Vision**: Create an autonomous software development team using AI agents with distinct roles and personalities, coordinating through a FOSS ticket tracking system.

**Status**: Planning phase complete ✅ - All architecture and design decisions finalized.

## Documentation Index

### 🎯 Start Here

- **[project-overview.md](project-overview.md)** - Project vision, scope, and core architectural principles
- **[system-architecture.md](system-architecture.md)** - Complete system design with component diagram and workflows

### 🤖 Team Structure

- **[team-roles.md](team-roles.md)** - Hyper-specialized agent roles and interaction patterns
- **[tooling-frameworks.md](tooling-frameworks.md)** - Selected technology stack (CrewAI + Temporal + LiteLLM)

### 🔧 Technical Implementation

- **[type-safety-strategy.md](type-safety-strategy.md)** - mypyc-first compilation strategy with strict CI enforcement
- **[api-contracts.md](api-contracts.md)** - Fully typed API interfaces between all system components
- **[dev-tools-integration.md](dev-tools-integration.md)** - CLI tools providing IDE-like features to agents

### 📋 Platform Selection

- **[ticket-tracking-solutions.md](ticket-tracking-solutions.md)** - Plane selected as the central coordination system
- **[foss-ticket-tracking-research.md](foss-ticket-tracking-research.md)** - In-depth analysis of ticket system alternatives

### 🔍 Research & Analysis

- **[ai-agent-frameworks-analysis.md](ai-agent-frameworks-analysis.md)** - Detailed evaluation of agent frameworks

## Key Technical Decisions

| Component           | Selection         | Rationale                                              |
| ------------------- | ----------------- | ------------------------------------------------------ |
| **Ticket System**   | Plane             | Modern API-first design, webhook support, clean UI     |
| **Agent Framework** | CrewAI            | Simple role-based agents, proven for specialized teams |
| **Orchestration**   | Temporal          | Durable workflows for long-running ticket processing   |
| **Language**        | Python 3.11+      | Best AI ecosystem with mypyc for type safety           |
| **LLM Abstraction** | LiteLLM           | Multi-provider support with unified interface          |
| **Type Safety**     | mypyc compilation | Rust-like static typing with zero runtime overhead     |

## Architecture Principles

1. **Ticket-Only Communication**: All agent coordination through Plane API
2. **Extreme Specialization**: Each agent has one narrow, well-defined job
3. **Type Fascism**: Strict static typing enforced at CI time
4. **Provider Agnostic**: Abstraction layers for Git, LLM, and CI systems

## Suggested Reading Order

### For Newcomers

1. [project-overview.md](project-overview.md) - Understand the vision
2. [team-roles.md](team-roles.md) - Learn the agent specializations
3. [system-architecture.md](system-architecture.md) - See how it all fits together
4. [ticket-tracking-solutions.md](ticket-tracking-solutions.md) - Why Plane was chosen

### For Implementers

1. [type-safety-strategy.md](type-safety-strategy.md) - Critical for code structure
2. [api-contracts.md](api-contracts.md) - Interface specifications
3. [tooling-frameworks.md](tooling-frameworks.md) - Technology stack details
4. [dev-tools-integration.md](dev-tools-integration.md) - Agent tool capabilities

### For Researchers

1. [ai-agent-frameworks-analysis.md](ai-agent-frameworks-analysis.md) - Framework comparison
2. [foss-ticket-tracking-research.md](foss-ticket-tracking-research.md) - Platform analysis

## Implementation Status

**Planning Phase**: ✅ Complete

- All architecture decisions made
- Technology stack selected
- Agent roles defined
- API contracts designed
- Type safety strategy established

**Next Phase**: Ready for implementation

1. Set up base project with mypyc build system
2. Deploy Plane and Temporal infrastructure
3. Implement webhook server (FastAPI)
4. Create first agent (Feature Complexity Estimator)
5. Establish CI/CD with strict type checking

## Project Structure

```
planning/               # This directory - all planning docs
src/compiled/          # Future: Type-checked, mypyc-compiled code
src/dynamic/           # Future: Dynamic code that can't be compiled
```

The planning documentation is committed to Git and will be preserved as the historical record of design decisions. Implementation will begin on a new feature branch while this planning documentation remains as reference.
