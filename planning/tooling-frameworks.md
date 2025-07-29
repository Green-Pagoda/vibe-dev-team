# Tooling & Frameworks Analysis

## Framework Decision: CrewAI over Mastra (2025-07-29)

After evaluating Mastra (TypeScript agent framework), we're staying with CrewAI for the following reasons:

**Complexity Cost Outweighs Benefits**:
- Mixing TypeScript (Mastra) + Python (CrewAI) agents adds significant complexity
- Cross-language serialization overhead
- Double deployment and debugging complexity
- Team needs expertise in both ecosystems

**Our Python Stack Already Provides**:
- Type safety via mypyc compilation
- MCP integration via Python clients
- Mature ecosystem (CrewAI 31k+ stars vs Mastra 7.5k)
- Single language throughout agent layer

**Mastra is excellent but not for us**:
- Better suited for greenfield TypeScript projects
- Would fragment our architecture unnecessarily
- Benefits (TS type safety, modern DX) don't justify the complexity

**Decision**: Continue with CrewAI + Python + MCP integration for architectural simplicity.

## Core Requirements
- **Multi-LLM Support**: Easy switching between providers (OpenAI, Anthropic, local models)
- **Async Architecture**: Agents as independent processes
- **Webhook Handling**: Receive and process ticket system events
- **Scalability**: Handle multiple agents running concurrently
- **Configuration**: Simple agent role and model assignment

## Language Choice

### Python (Recommended)
**Pros:**
- Excellent LLM libraries (LangChain, LiteLLM, OpenAI SDK)
- Strong async support (asyncio, FastAPI)
- Rich ecosystem for AI/ML tasks
- Simple deployment and packaging

**Cons:**
- GIL limitations (mitigated by multi-process architecture)
- Type safety requires discipline

### Go
**Pros:**
- Excellent concurrency model
- Single binary deployment
- Strong type safety
- Great for webhook servers

**Cons:**
- Fewer mature LLM libraries
- More verbose than Python

### TypeScript/Node.js
**Pros:**
- Good LLM library support
- Native async/await
- Frontend integration if needed

**Cons:**
- Runtime overhead
- Dependency management complexity

## Framework Architecture

### Agent Framework Options

**CrewAI** (Recommended)
- Simple role-based agents with specific jobs
- Clean abstractions without over-engineering
- Active community (34k+ stars)
- Provider-agnostic from the start
- Aligns with our "assembly line" mental model

**Alternative: Minimal Custom Framework**
- Direct provider SDKs + custom base classes
- Maximum control and simplicity
- No framework lock-in
- Build only what we need

**Not Recommended: LangChain**
- Too complex and bloated
- Frequent breaking changes
- Over-abstracted for our needs

### Workflow Orchestration
**Temporal** (Highly Recommended)
- Durable execution for long-running workflows
- Handles failures, retries, and restarts automatically
- Perfect for multi-day ticket workflows
- Battle-tested at scale (Uber, Netflix)
- Language-agnostic (Python SDK available)

### LLM Provider Abstraction
**LiteLLM** (Recommended)
- Unified interface for all providers
- Simple provider switching
- Cost tracking built-in
- Fallback support
- Works well with any agent framework

### Web Framework (for webhooks)
**FastAPI** (Recommended)
- Native async support
- Auto-generated API docs
- Pydantic validation
- WebSocket support if needed

### Communication Architecture
**Ticket System (Plane) as Message Bus**
- No direct agent-to-agent communication
- All coordination through ticket API
- Webhook events trigger agent actions
- Tickets provide audit trail and human visibility

**NOT using:**
- Custom document passing (like MetaGPT)
- Direct message queues between agents
- Agent-to-agent chat

## Proposed Stack

### Core Stack
```
Language: Python 3.11+
Agent Framework: CrewAI (or minimal custom)
Workflow Orchestration: Temporal
LLM Abstraction: LiteLLM  
Web Framework: FastAPI
Ticket System: Plane (self-hosted)
Config: Pydantic Settings
Deployment: Docker + Docker Compose
```

### Agent Structure
```python
# Each agent type as a separate service
class BaseAgent:
    - LLM configuration
    - Ticket system client
    - Tool definitions
    - Memory/context management

class FeatureEstimatorAgent(BaseAgent):
    - Specialized prompts
    - Estimation tools
    - Historical data access

# Webhook receiver
FastAPI app:
    - Receive Plane webhooks
    - Route to appropriate agent via Celery
    - Track task status
```

### Configuration Management
```yaml
# agents.yaml
agents:
  feature_estimator:
    model_provider: "anthropic"
    model: "claude-3-sonnet"
    temperature: 0.2
    tools: ["search_codebase", "analyze_complexity"]
    
  code_reviewer:
    model_provider: "openai"  
    model: "gpt-4"
    temperature: 0.1
    tools: ["lint", "security_scan"]
```

## Development Tools

### Testing
- **pytest**: Unit and integration tests
- **pytest-asyncio**: Async test support
- **VCR.py**: Record/replay LLM calls
- **Testcontainers**: Integration test infrastructure

### Monitoring
- **OpenTelemetry**: Distributed tracing
- **Prometheus**: Metrics collection
- **Grafana**: Visualization
- **Structured logging**: JSON logs for analysis

### Development Environment
- **Poetry**: Dependency management
- **Black**: Code formatting
- **mypy**: Type checking
- **pre-commit**: Git hooks

## Architecture Insights from Research

### Key Learnings from MetaGPT
- **Structured Communication**: Agents produce concrete artifacts (PRDs, design docs)
- **Role-Based SOPs**: Each role has standard operating procedures
- **Assembly Line Pattern**: Sequential task processing with clear handoffs
- **Document Artifacts**: Generate and commit deliverables to Git

### Our Improvements
- **Use Tickets Instead of Custom Docs**: Proven workflow management
- **Temporal for Durability**: Handle long-running workflows properly
- **Provider Flexibility**: Different models for different roles via LiteLLM
- **Human Inspectable**: All communication visible in ticket system

## Implementation Phases

### Phase 1: Foundation
1. Set up project structure with CrewAI
2. Deploy Plane and configure webhooks
3. Implement base agent class with ticket integration
4. Set up Temporal for workflow orchestration
5. Create webhook receiver with FastAPI

### Phase 2: Core Agents
1. Implement Feature Estimator and Requirements Decomposer
2. Set up Temporal workflows for ticket lifecycle
3. Add LiteLLM configuration for multi-provider support
4. Implement artifact generation (docs → Git)

### Phase 3: Full Team
1. Implement remaining specialist agents
2. Add sophisticated workflow patterns in Temporal
3. Enhance error handling and retry logic
4. Performance optimization and monitoring