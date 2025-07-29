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
┌────────┴────────┐ ┌───────┴────────┐ ┌──────┴──────┐ ┌───┴────────┐
│ Git Abstraction │ │ Webhook Server │ │ Vercel AI   │ │ MCP Servers│
│    Layer        │ │  (Hono/Bun)    │ │    SDK      │ │(Tool Access)│
└────────┬────────┘ └───────┬────────┘ └──────┬──────┘ └───┬────────┘
         │                  │                  │             │
         └──────────────────┴──────────────────┴─────────────┘
                                    │
                          ┌─────────┴─────────┐
                          │  Mastra vNext     │
                          │  Workflows        │
                          │ (Temporal later)  │
                          └─────────┬─────────┘
                                    │
        ┌───────────────────────────┴───────────────────────────┐
        │                   Agent Workers                        │
        ├──────────────────────────────────────────────────────┤
        │              Mastra Agent Framework                   │
        │          (TypeScript Agent Execution)                 │
        │               + MCP Client Integration               │
        ├────────────┬────────────┬────────────┬────────────────┤
        │  Feature   │Requirements│   Code     │    Test        │
        │ Estimator  │Decomposer  │ Generator  │  Runner        │
        ├────────────┼────────────┼────────────┼────────────────┤
        │  Security  │   Style    │    QA      │Documentation   │
        │  Auditor   │ Enforcer   │  Manager   │  Manager       │
        └────────────┴────────────┴────────────┴────────────────┘
```

## Component Details

### 1. Webhook Server (Hono/Bun)
- **Purpose**: Receives events from Plane ticket system
- **Responsibilities**:
  - Validate webhook signatures
  - Parse ticket events
  - Trigger appropriate Temporal workflows
  - Return acknowledgment to Plane

### 2. Workflow Orchestration
#### Phase 1: Mastra vNext Workflows
- **Purpose**: Lightweight agent coordination
- **Responsibilities**:
  - Coordinate agent execution order
  - Handle basic retries and error handling
  - Manage workflow state with external storage
  - Enforce quality gates between stages

#### Phase 2: Temporal Integration (Future)
- **Purpose**: Durable, long-running workflows
- **Migration**: When Mastra ships Temporal backend support
- **Benefits**: Full durability, event sourcing, proven reliability

### 3. Agent Workers
- **Purpose**: Specialized task execution
- **Structure**: Each agent type runs as separate worker pool
- **Communication**: Only through Plane API (no direct agent-to-agent)
- **State**: Stateless - all context from tickets

#### Mastra Agent Framework
- **Purpose**: Provides role-based agent execution foundation
- **Responsibilities**:
  - Define agent roles with specific capabilities and tools
  - Handle LLM interactions through standardized interfaces
  - Execute agent tasks with consistent error handling
  - Provide memory and context management per agent
- **Integration**: 
  - Receives tasks from Mastra workflows
  - Uses Plane API client for ticket operations
  - Leverages Vercel AI SDK for provider-agnostic LLM access
  - **MCP Client Integration**: Each agent acts as MCP client accessing standardized tool servers
- **Agent Configuration**: Each specialized agent (Feature Estimator, etc.) is implemented as a Mastra agent with:
  - Custom system prompts for their specific role
  - **MCP-enabled tool access** for standardized development operations
  - Optimized LLM model selection via Vercel AI SDK
  - Role-specific memory and context handling
  - **Secure tool permissions** via MCP authentication

### 4. External Integrations

#### Plane API Client
- Create, update, comment on tickets
- Query ticket state and history
- Manage labels and assignments

#### Vercel AI SDK
- Unified interface to all LLM providers
- Model selection per agent role
- Cost tracking and rate limiting
- Fallback handling

#### Git Abstraction Layer
- Provider-agnostic Git operations
- Support for GitHub, GitLab, etc.
- Commit, branch, PR management

#### MCP Server Integration
- **Purpose**: Standardized protocol for agent-tool communication
- **Architecture**: Client-server model with secure OAuth 2.1 authentication
- **Capabilities**:
  - Tools: Agent-controlled actions (ruff, mypy, git operations)
  - Resources: Context provision (codebase analysis, documentation)
  - Prompts: User-invoked specialized interactions
- **Benefits**:
  - Unified interface across all development tools
  - Real-time bi-directional communication via Streamable HTTP
  - Provider-agnostic integration (compatible with OpenAI, Google adoption)
  - Enhanced security with permission-based access control

## Workflow Example

```
1. User creates ticket: "Add user authentication"
   │
2. Webhook → Hono/Bun → Mastra Workflow
   │
3. Mastra starts TicketWorkflow
   │
4. Mastra Feature Estimator Agent
   ├─→ Reads ticket via Plane API
   ├─→ Analyzes complexity using specialized tools
   └─→ Updates ticket with structured estimate
   │
5. Mastra Requirements Decomposer Agent  
   ├─→ Reads estimated ticket
   ├─→ Creates subtask tickets with clear acceptance criteria
   └─→ Links subtasks to parent via Plane API
   │
6. For each subtask (Mastra agents execute in parallel via MCP):
   ├─→ Code Generator Agent (writes implementation via MCP git tools)
   ├─→ Style Enforcer Agent (applies formatting via MCP ruff/prettier)
   ├─→ Security Auditor Agent (scans via MCP security tools)
   ├─→ Test Generator Agent (creates tests via MCP test frameworks)
   └─→ QA Manager Agent (validates via MCP linting/testing tools)
   │
7. Mastra Documentation Manager Agent
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
  
  # temporal: # Phase 2 - when Mastra supports Temporal backend
  #   image: temporalio/server
  
  webhook-server:
    build: ./webhook
    runtime: bun
    
  mcp-dev-tools:
    build: ./mcp-servers
    ports:
      - "3001:3001"  # MCP server for development tools
    
  agent-estimator:
    build: ./agents
    environment:
      - AGENT_TYPE=estimator
      - MCP_DEV_TOOLS_URL=http://mcp-dev-tools:3001
      
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
4. **MCP Security**: OAuth 2.1 authentication for tool access
5. **Tool Permissions**: MCP-based access control per agent role
6. **Network Policies**: Restrict agent communication to authorized MCP servers

## Monitoring & Observability

- **OpenTelemetry**: Distributed tracing
- **Prometheus**: Metrics per agent type
- **Structured Logging**: JSON logs with correlation IDs
- **Mastra Playground**: Local agent development and testing
- **Temporal UI**: Workflow visibility (Phase 2)

## MCP Integration Strategy

### Protocol Benefits
- **Standardization**: Universal interface for agent-tool communication
- **Security**: OAuth 2.1 authentication and permission-based access control
- **Real-time**: Streamable HTTP transport for bi-directional communication
- **Ecosystem**: Compatible with OpenAI and Google's 2025 MCP adoption

### Implementation Approach
- **MCP Servers**: Containerized services exposing development tools (ruff, mypy, git)
- **Agent Clients**: Each CrewAI agent configured as MCP client with role-specific permissions
- **Tool Categories**:
  - **Tools**: Agent-controlled actions (code formatting, testing, commits)
  - **Resources**: Context provision (codebase analysis, documentation)
  - **Prompts**: Specialized user-invoked interactions

### Migration Path
1. **Phase 1**: Deploy MCP servers alongside existing CLI wrappers
2. **Phase 2**: Migrate agents to MCP clients incrementally
3. **Phase 3**: Deprecate custom CLI interface in favor of MCP standard

## Failure Handling

1. **Webhook failures**: Plane retries with backoff
2. **Agent failures**: Temporal handles retry logic
3. **LLM failures**: Vercel AI SDK fallback to alternate models
4. **MCP server failures**: Graceful degradation with fallback tool access
5. **Tool failures**: Isolated via MCP sandboxing, won't crash agents

## Scalability

- **Horizontal**: Add more agent workers
- **Vertical**: Increase resources per agent type
- **Queue-based**: Temporal handles load distribution
- **Stateless agents**: Easy to scale