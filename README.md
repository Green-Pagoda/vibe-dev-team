# Vibe Dev Team

AI-powered software development team using specialized agents communicating through Plane ticket tracking system.

## Architecture

- **Language**: TypeScript with Bun runtime
- **Webhook Server**: Hono receiving Plane events
- **Agent Framework**: Mastra for AI orchestration
- **LLM Provider**: Vercel AI SDK (OpenAI, Anthropic, etc.)
- **Deployment**: Docker containers for Fargate

## Project Structure

```
vibe-dev-team/
├── packages/           # Shared libraries
│   ├── agent-core/    # Base agent classes and utilities
│   ├── plane-client/  # Plane API client
│   └── shared-types/  # TypeScript type definitions
├── services/          # Microservices
│   ├── plane-event-dispatcher/  # Webhook server
│   └── agents/                  # AI agents
│       └── feature-estimator/   # Complexity estimation agent
└── planning/          # Architecture documentation
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Bun (optional, for local development)
- Plane instance (self-hosted or cloud)

### Environment Setup

1. Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

2. Configure environment variables:
   - `PLANE_API_URL`: Your Plane instance URL
   - `PLANE_API_KEY`: API key from Plane
   - `PLANE_WEBHOOK_SECRET`: Secret for webhook verification
   - `OPENAI_API_KEY`: OpenAI API key for LLM

### Running with Docker

```bash
# Start all services
make up

# View logs
make logs

# Stop services
make down
```

### Available Commands

```bash
make help              # Show all available commands
make build             # Build Docker images
make shell             # Access dispatcher container
make shell-agent       # Access agent container
make typecheck         # Run TypeScript type checking
make lint              # Run linting
make format            # Format code with Prettier
```

## Development Workflow

1. Plane creates/updates a ticket
2. Webhook sent to `plane-event-dispatcher`
3. Dispatcher triggers appropriate Mastra workflow
4. Agents process the ticket through Plane API
5. Results posted back to Plane as comments/updates

## Agent Capabilities

### Feature Estimator

- Analyzes new feature requests
- Estimates complexity (trivial to extra-large)
- Identifies dependencies and risks
- Updates Plane tickets with structured estimates

### Coming Soon

- Requirements Decomposer
- Architecture Decision Maker
- Code Style Enforcer
- Security Auditor
- Test Case Generator

## License

[License details to be added]
