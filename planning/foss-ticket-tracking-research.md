# FOSS Ticket Tracking Solutions for Agentic AI Development Teams

## Executive Summary

This research covers modern FOSS (Free and Open Source Software) ticket tracking systems suitable for programmatic automation in an agentic AI development team environment. The analysis focuses on systems with strong API support, webhook capabilities, and active maintenance.

## Key Requirements Analysis

1. **FOSS (open source)** ✓
2. **Strong API support** for programmatic ticket creation, assignment, commenting
3. **Webhook support** for real-time notifications to agents
4. **Modern, actively maintained** (not legacy systems)
5. **Good for software development workflows**

## Top Recommendations

### 1. **Plane** (Best for Modern Development Teams)
- **License**: Open source (Apache 2.0)
- **API**: REST API with comprehensive documentation
- **Webhooks**: Full webhook support with retry mechanism
- **Key Features**:
  - Modern Linear/Jira alternative
  - API base URL: `https://api.plane.so/`
  - API key authentication via `X-API-Key` header
  - Webhook events for project lifecycle (create, update, delete)
  - Automatic retry with exponential backoff
  - Secret key for webhook security
- **Best For**: Teams wanting a modern, developer-friendly interface with strong automation capabilities

### 2. **GitLab Issues** (Best for Git-Integrated Workflows)
- **License**: Open source (MIT for CE)
- **API**: Extensive REST and GraphQL APIs
- **Webhooks**: Comprehensive webhook event system
- **Key Features**:
  - Native Git integration
  - Project and Group webhooks
  - Real-time issue event notifications
  - Built-in CI/CD integration
  - Extensive API for issue management
- **Best For**: Teams already using Git workflows who want integrated issue tracking

### 3. **GitHub Issues** (Best for Open Source Projects)
- **License**: Proprietary platform, but issues are part of open repos
- **API**: REST and GraphQL APIs
- **Webhooks**: Enhanced in 2024 with project custom fields
- **Key Features**:
  - GraphQL support for complex queries
  - Project status webhook events (new in 2024)
  - Custom field change notifications
  - Extensive third-party integrations
- **Best For**: Open source projects or teams already on GitHub

### 4. **Taiga** (Best for Agile Teams)
- **License**: Open source (AGPL)
- **API**: REST API
- **Webhooks**: Supported with integration platforms
- **Key Features**:
  - Agile-focused (Scrum, Kanban)
  - Multi-functional team support
  - Integration via n8n and similar platforms
  - Permalink data in webhook payloads
- **Best For**: Agile development teams needing sprint planning

### 5. **Redmine** (Best for Customization)
- **License**: Open source (GPL v2)
- **API**: REST API
- **Webhooks**: Via plugins
- **Key Features**:
  - Extensive plugin ecosystem
  - Multi-project support
  - Custom fields and workflows
  - Email-to-ticket creation
  - Time tracking built-in
- **Best For**: Teams needing highly customizable workflows

## Other Notable Options

### Modern Alternatives

1. **Zammad**
   - Good automation features
   - API and webhook support
   - Self-hosted or cloud options
   - Limited advanced workflow capabilities

2. **OpenSupports**
   - Powerful, well-documented API
   - Good for building custom solutions
   - Lacks advanced automation features

3. **Peppermint**
   - Lightweight self-hosted option
   - Webhook integration support
   - Email-to-ticket conversion
   - Good for smaller teams

### Established Systems

1. **osTicket**
   - Widely used and trusted
   - PHP-based (customizable)
   - API available
   - Strong community support

2. **Trac**
   - Python-based
   - Tight SCM integration
   - Plugin architecture
   - More legacy-focused

## API & Webhook Comparison

| System | API Type | Authentication | Webhook Events | Real-time | Retry Logic |
|--------|----------|----------------|----------------|-----------|-------------|
| Plane | REST | API Key | Full lifecycle | Yes | Yes (exponential backoff) |
| GitLab | REST/GraphQL | Token/OAuth | Comprehensive | Yes | Configurable |
| GitHub | REST/GraphQL | Token/OAuth | Issues + Projects | Yes | Yes |
| Taiga | REST | Token | Via integrations | Yes | Platform-dependent |
| Redmine | REST | API Key | Via plugins | Depends | Plugin-dependent |
| Zammad | REST | Token | Native support | Yes | Yes |

## Recommendations by Use Case

### For Agentic AI Development Teams

**Primary Recommendation: Plane**
- Modern architecture designed for API-first usage
- Comprehensive webhook support with security
- Active development and community
- Clean API design suitable for AI agents

**Secondary Recommendation: GitLab (self-hosted)**
- Complete DevOps integration
- Extensive API coverage
- Strong webhook system
- Can be self-hosted for full control

### For Specific Needs

- **Maximum Customization**: Redmine with plugins
- **Simplest Setup**: Peppermint or FreeScout
- **Agile Workflows**: Taiga
- **Existing GitHub Users**: GitHub Issues with Actions
- **Enterprise Features**: GitLab EE (self-hosted)

## Technical Integration Considerations

### API Endpoints Typically Available
- Issues: Create, read, update, delete, search
- Comments: Add, edit, delete
- Users: Assign, mention, permissions
- Projects: Manage, configure
- Labels/Tags: Apply, filter
- Milestones: Track, assign
- Time tracking: Log, report

### Webhook Event Types
- Issue created/updated/closed
- Comment added/edited
- Assignment changes
- Label changes
- Milestone updates
- Project modifications

### Authentication Methods
- API Keys (Plane, Redmine)
- OAuth 2.0 (GitHub, GitLab)
- Personal Access Tokens (most systems)
- JWT tokens (some modern systems)

## Conclusion

For an agentic AI development team, **Plane** offers the best combination of modern architecture, comprehensive API/webhook support, and active development. However, if you're already invested in a Git-based workflow, **GitLab** provides excellent integration with development processes while maintaining strong programmatic access capabilities.

The choice ultimately depends on your specific needs:
- Choose **Plane** for a modern, API-first experience
- Choose **GitLab/GitHub** for integrated Git workflows
- Choose **Redmine** for maximum customization
- Choose **Taiga** for agile-focused teams