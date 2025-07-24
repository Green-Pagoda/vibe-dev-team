# FOSS Ticket Tracking Solutions Analysis

## Requirements
- **FOSS**: Open source and self-hostable
- **Strong API**: Programmatic ticket creation, assignment, commenting
- **Webhooks**: Real-time event notifications for agents
- **Modern**: Actively maintained, not legacy
- **Dev-Focused**: Software development workflows

## Top Recommendations

### 1. Plane (Recommended)
**Why**: Purpose-built for modern API-first workflows

- **License**: Apache 2.0
- **Architecture**: Modern, API-first design
- **API**: Comprehensive REST API with excellent documentation
- **Webhooks**: Full support with retry mechanism and security
- **Auth**: API keys, OAuth support
- **Events**: Complete project lifecycle webhooks
- **Status**: Very actively maintained, rapid development

**Ideal for**: Our use case - designed for programmatic interaction

### 2. GitLab Issues  
**Why**: Tight Git integration, mature API

- **License**: MIT (CE edition)
- **API**: REST + GraphQL APIs
- **Webhooks**: Comprehensive event system
- **Auth**: Personal access tokens, OAuth 2.0
- **Events**: Issue, merge request, pipeline events
- **Status**: Actively maintained by GitLab Inc.

**Ideal for**: Teams wanting Git integration

### 3. GitHub Issues
**Why**: Ecosystem and 2024 enhancements

- **License**: Not self-hostable (GitHub Enterprise is paid)
- **API**: Excellent GraphQL API
- **Webhooks**: Enhanced in 2024 with custom fields
- **Auth**: OAuth, personal access tokens
- **Events**: Project status webhooks (new)
- **Status**: Continuously improved by GitHub

**Note**: Not truly FOSS for self-hosting

### 4. Taiga
**Why**: Agile-focused with good APIs

- **License**: AGPL
- **Architecture**: Python/Django backend
- **API**: REST API with good coverage
- **Webhooks**: Via integration service
- **Auth**: Token-based
- **Status**: Active development

**Ideal for**: Scrum/Kanban workflows

### 5. Redmine
**Why**: Mature, highly customizable

- **License**: GPL v2
- **Architecture**: Ruby on Rails
- **API**: REST API (XML/JSON)
- **Webhooks**: Via plugins
- **Auth**: API keys
- **Status**: Stable, slower release cycle

**Ideal for**: Teams needing extensive customization

## Other Options Considered

### OpenProject
- Strong project management features
- REST API v3
- Webhook support via plugins
- More complex than needed

### Bugzilla
- Legacy system, primarily for bug tracking
- Limited modern API features
- Not recommended for new projects

### Trac
- Tightly integrated with SVN/Git
- Limited API capabilities
- Legacy architecture

## Recommendation for Our Project

**Primary Choice: Plane**

Reasons:
1. **API-First Design**: Built for programmatic use from the ground up
2. **Modern Architecture**: Clean codebase, easy to extend
3. **Webhook Reliability**: Built-in retry logic for failed deliveries
4. **Security**: Webhook signatures for verification
5. **Active Development**: Rapid feature additions
6. **Clean UI**: Human-inspectable when needed

**Secondary Choice: GitLab CE (self-hosted)**

If we need:
- Tighter source control integration
- Built-in CI/CD triggers
- More mature ecosystem

## Implementation Considerations

### Webhook Event Types (Plane)
- `issue.created`
- `issue.updated` 
- `issue.deleted`
- `issue.comment.created`
- `issue.assignee.updated`
- `issue.label.updated`
- `issue.state.updated`

### API Authentication
- Generate API keys per agent
- Implement rate limiting awareness
- Use webhook signatures for security

### Agent Integration Pattern
1. Each agent gets unique API credentials
2. Webhook endpoint per agent type
3. Event filtering based on agent role
4. Automatic retry handling for failures