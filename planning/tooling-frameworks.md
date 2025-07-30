# Tooling & Frameworks Analysis

## Framework Decision: TypeScript with Mastra (2025-07-29)

After thorough evaluation, we're adopting Mastra as our agent framework for the following reasons:

**TypeScript Advantages**:

- Developer preference for TypeScript = higher productivity
- Native type safety without compilation workarounds
- Better IDE support and refactoring capabilities
- Unified tech stack potential with Temporal TypeScript SDK
- Modern async/await patterns throughout

**Mastra Strengths**:

- Purpose-built for AI agents (not retrofitted)
- Clean abstractions without over-engineering
- Built-in observability (OpenTelemetry)
- Unified interface for LLMs, tools, and RAG
- Active development (7.5k+ stars, viral growth)
- Future Temporal backend support planned

**Architecture Benefits**:

- Single language throughout the system
- Native MCP support in TypeScript
- Cleaner integration with web technologies
- Growing TypeScript AI ecosystem

**Migration Strategy**:

1. **Phase 1**: Use Mastra's built-in workflows for agent coordination
2. **Phase 2**: When Temporal backend support ships, migrate for durability
3. **Fallback**: If needed, integrate Temporal SDK directly

**Decision**: Adopt TypeScript/Mastra for better developer experience and architectural coherence.

## Core Requirements

- **Multi-LLM Support**: Easy switching between providers (OpenAI, Anthropic, local models)
- **Async Architecture**: Agents as independent processes
- **Webhook Handling**: Receive and process ticket system events
- **Scalability**: Handle multiple agents running concurrently
- **Configuration**: Simple agent role and model assignment

## Language Choice

### TypeScript/Node.js (Selected)

**Pros:**

- Excellent LLM library support (Vercel AI SDK, OpenAI, Anthropic)
- Native async/await patterns
- Strong type safety without compilation workarounds
- Mastra framework purpose-built for AI agents
- Seamless MCP integration
- Better IDE support and developer experience

**Cons:**

- Smaller AI/ML ecosystem than Python
- Some specialized tools may require CLI execution

### Python

**Pros:**

- Largest AI/ML ecosystem
- Mature agent frameworks (CrewAI, AutoGen)
- Rich scientific computing libraries

**Cons:**

- Type safety requires mypyc or strict discipline
- GIL limitations for concurrent operations
- Less elegant async patterns

### Go

**Pros:**

- Excellent concurrency model
- Single binary deployment
- Strong type safety

**Cons:**

- Limited AI/LLM libraries
- Would require significant custom development

## Framework Architecture

### Agent Framework Options

**Mastra** (Selected)

- TypeScript-native AI agent framework
- Built-in workflows, agents, tools, and RAG
- Clean abstractions without over-engineering
- Excellent developer experience
- Future Temporal backend support

**CrewAI** (Study for patterns)

- Most similar to our hyper-specialized agent approach
- Role-based agents with specific jobs
- Production-tested patterns we can adapt
- Learn from their agent coordination strategies
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
    model_provider: 'anthropic'
    model: 'claude-3-sonnet'
    temperature: 0.2
    tools: ['search_codebase', 'analyze_complexity']

  code_reviewer:
    model_provider: 'openai'
    model: 'gpt-4'
    temperature: 0.1
    tools: ['lint', 'security_scan']
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
