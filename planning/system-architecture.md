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
4. Feature Estimator Agent
   ├─→ Reads ticket via Plane API
   ├─→ Analyzes complexity
   └─→ Updates ticket with estimate
   │
5. Requirements Decomposer Agent  
   ├─→ Reads estimated ticket
   ├─→ Creates subtask tickets
   └─→ Links subtasks to parent
   │
6. For each subtask:
   ├─→ Code Generator Agent
   ├─→ Style Enforcer Agent
   ├─→ Security Auditor Agent
   ├─→ Test Generator Agent
   └─→ QA Manager Agent (gate)
   │
7. Documentation Manager Agent
   ├─→ Generates docs from code
   └─→ Creates final PR
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