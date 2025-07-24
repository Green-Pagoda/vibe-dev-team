# Agentic AI Dev Team - Project Overview

## Vision
Create an autonomous software development team using AI agents with distinct roles and personalities, coordinating through a FOSS ticket tracking system.

## Core Architecture

### Agent Communication Model
- **Async Processes**: Each agent runs as an independent process/container
- **Ticket-Only Communication**: All coordination happens through the ticket system
- **Event-Driven**: Agents respond to ticket system events via webhooks/notifications
- **No Email**: Avoid email-based notifications in favor of programmatic interfaces

### Model Flexibility
- **Multi-Provider Support**: Seamless switching between OpenAI, Anthropic, local models, etc.
- **Role-Optimized Models**: Different providers/models for different team roles
- **Minimal Code Changes**: Configuration-driven model selection

### Ticket System Integration
- **Standard User Permissions**: Agents operate with regular user accounts (no admin)
- **Full CRUD Operations**: Create, assign, comment on tickets automatically
- **Human Inspectable**: All agent interactions visible to humans
- **No Human Approval Required**: Agents can interact autonomously

## Scope & Boundaries

### In Scope (Software Development Team)
- Code development and review
- Testing and quality assurance
- Technical architecture decisions
- Bug fixing and maintenance
- Documentation (technical)

### Out of Scope (Product Team Functions)
- Requirements gathering
- Product roadmap planning
- User research
- Business strategy
- Marketing/sales

### Deferred Items
- Cloud infrastructure (copy from existing repos)
- CI/CD/release automation (copy existing GHA configs)

## Key Design Questions to Resolve

1. **Tooling & Frameworks**: Language, agent framework, LLM client libraries
2. **Team Role Definition**: What roles make an effective software team?
3. **FOSS Ticket System**: Which system best supports webhook integration?
4. **Token Economics**: How to optimize for compute cost across all agents

## Next Steps
1. Research tooling and framework options
2. Define software team roles and responsibilities  
3. Evaluate FOSS ticket tracking solutions
4. Create initial system architecture