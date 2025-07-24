# System Architecture

## Overview

The AI Dev Team system consists of specialized agents that communicate exclusively through a ticket tracking system (Plane), orchestrated by Temporal workflows.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           External Systems                           │
├─────────────────┬───────────────────┬───────────────┬──────────────┤
│   GitHub/Git    │    Plane API      │  LLM Providers │  Dev Tools  │
│                 │  (Ticket System)  │  (OpenAI, etc) │  (ruff, etc)│
└────────┬────────┴─────────┬─────────┴────────┬──────┴──────┬───────┘
         │                  │                  │             │
┌────────┴────────┐ ┌───────┴────────┐ ┌──────┴──────┐ ┌───┴────┐
│ Git Abstraction │ │ Webhook Server │ │  LiteLLM    │ │ Tools  │
│    Layer        │ │   (FastAPI)    │ │  Wrapper    │ │  CLI   │
└────────┬────────┘ └───────┬────────┘ └──────┬──────┘ └───┬────┘
         │                  │                  │             │
         └──────────────────┴──────────────────┴─────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │    Temporal       │
                          │  Orchestrator     │
                          └─────────┬─────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        │                   Agent Workers                        │
        ├──────────────────────────────────────────────────────┤
        │             CrewAI Agent Framework                    │
        │          (Role-based Agent Execution)                │
        ├────────────┬────────────┬────────────┬────────────────┤
        │  Feature   │Requirements│   Code     │    Test        │
        │ Estimator  │Decomposer  │ Generator  │  Runner        │
        ├────────────┼────────────┼────────────┼────────────────┤
        │  Security  │   Style    │    QA      │Documentation   │
        │  Auditor   │ Enforcer   │  Manager   │  Manager       │
        └────────────┴────────────┴────────────┴────────────────┘
```

## Component Details

### 1. Webhook Server (FastAPI)
- **Purpose**: Receives events from Plane ticket system
- **Responsibilities**:
  - Validate webhook signatures
  - Parse ticket events
  - Trigger appropriate Temporal workflows
  - Return acknowledgment to Plane

### 2. Temporal Orchestrator
- **Purpose**: Manages durable, long-running workflows
- **Responsibilities**:
  - Coordinate agent execution order
  - Handle failures and retries
  - Maintain workflow state
  - Enforce quality gates between stages

### 3. Agent Workers
- **Purpose**: Specialized task execution
- **Structure**: Each agent type runs as separate worker pool
- **Communication**: Only through Plane API (no direct agent-to-agent)
- **State**: Stateless - all context from tickets

#### CrewAI Agent Framework
- **Purpose**: Provides role-based agent execution foundation
- **Responsibilities**:
  - Define agent roles with specific capabilities and tools
  - Handle LLM interactions through standardized interfaces
  - Execute agent tasks with consistent error handling
  - Provide memory and context management per agent
- **Integration**: 
  - Receives tasks from Temporal workflows
  - Uses Plane API client for ticket operations
  - Leverages LiteLLM for provider-agnostic LLM access
  - Executes development tools through CLI interface
- **Agent Configuration**: Each specialized agent (Feature Estimator, etc.) is implemented as a CrewAI agent with:
  - Custom system prompts for their specific role
  - Tailored tool sets for their domain
  - Optimized LLM model selection via LiteLLM
  - Role-specific memory and context handling

### 4. External Integrations

#### Plane API Client
- Create, update, comment on tickets
- Query ticket state and history
- Manage labels and assignments

#### LiteLLM Wrapper
- Unified interface to all LLM providers
- Model selection per agent role
- Cost tracking and rate limiting
- Fallback handling

#### Git Abstraction Layer
- Provider-agnostic Git operations
- Support for GitHub, GitLab, etc.
- Commit, branch, PR management

#### Tool CLI Interface
- Containerized tool execution
- Resource limits per agent
- Output parsing and error handling

## Workflow Example

```
1. User creates ticket: "Add user authentication"
   │
2. Webhook → FastAPI → Temporal
   │
3. Temporal starts TicketWorkflow
   │
4. CrewAI Feature Estimator Agent
   ├─→ Reads ticket via Plane API
   ├─→ Analyzes complexity using specialized tools
   └─→ Updates ticket with structured estimate
   │
5. CrewAI Requirements Decomposer Agent  
   ├─→ Reads estimated ticket
   ├─→ Creates subtask tickets with clear acceptance criteria
   └─→ Links subtasks to parent via Plane API
   │
6. For each subtask (CrewAI agents execute in parallel):
   ├─→ Code Generator Agent (writes implementation)
   ├─→ Style Enforcer Agent (applies formatting/conventions)
   ├─→ Security Auditor Agent (scans for vulnerabilities)
   ├─→ Test Generator Agent (creates comprehensive tests)
   └─→ QA Manager Agent (validates all work - quality gate)
   │
7. CrewAI Documentation Manager Agent
   ├─→ Generates docs from code artifacts
   └─→ Creates final PR with all changes
```

## Deployment Architecture

### Development
```yaml
# docker-compose.yml
services:
  plane:
    image: makeplane/plane
  
  temporal:
    image: temporalio/server
  
  webhook-server:
    build: ./webhook
    
  agent-estimator:
    build: ./agents
    environment:
      - AGENT_TYPE=estimator
      
  # ... more agents
```

### Production
- **Kubernetes**: For container orchestration
- **Separate namespaces**: Per agent type
- **Horizontal scaling**: Based on ticket volume
- **Secrets management**: For API keys

## Security Considerations

1. **Webhook Security**: Validate signatures from Plane
2. **Agent Isolation**: Separate containers/processes
3. **API Key Management**: Per-agent credentials
4. **Tool Sandboxing**: Limited filesystem access
5. **Network Policies**: Restrict agent communication

## Monitoring & Observability

- **OpenTelemetry**: Distributed tracing
- **Prometheus**: Metrics per agent type
- **Structured Logging**: JSON logs with correlation IDs
- **Temporal UI**: Workflow visibility

## Failure Handling

1. **Webhook failures**: Plane retries with backoff
2. **Agent failures**: Temporal handles retry logic
3. **LLM failures**: LiteLLM fallback to alternate models
4. **Tool failures**: Isolated, won't crash agents

## Scalability

- **Horizontal**: Add more agent workers
- **Vertical**: Increase resources per agent type
- **Queue-based**: Temporal handles load distribution
- **Stateless agents**: Easy to scale