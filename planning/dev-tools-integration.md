# Development Tools Integration

## Core Development Infrastructure

### Version Control: GitHub

- Primary Git hosting platform
- Agents interact via Git CLI and GitHub API
- **Design Principle**: Abstract Git operations to support GitLab/others later

### CI/CD: GitHub Actions

- Automated testing and deployment
- Agents trigger workflows and parse results
- **Design Principle**: Abstract CI operations for Jenkins/GitLab CI compatibility

## Agent Development Tools

### Code Intelligence & Navigation

- **`ast-grep`**: AST-based structural search and refactoring
- **`semgrep`**: Advanced pattern-based code analysis
- **`ctags`/`universal-ctags`**: Code navigation and jump-to-definition
- **`ripgrep`**: Fast, language-aware code search

### Refactoring Tools

- **`jscodeshift`** (JavaScript/TypeScript): AST transformations
- **`rope`** (Python): Automated refactoring with CLI interface
- **`comby`**: Language-agnostic structural find/replace
- **`grit`**: Modern pattern-based refactoring

### Linting & Formatting

- **`ruff`** (Python): Ultra-fast linter and formatter
- **`eslint`** (JavaScript/TypeScript): Configurable linting rules
- **`prettier`**: Universal code formatter
- **`standardrb`** (Ruby): Opinionated linter with auto-fix
- **`black`** (Python): Uncompromising code formatter

### Type Checking

- **`mypy`** (Python): Static type analysis
- **`tsc`** (TypeScript): Type checking without compilation
- **`pyright`**: Microsoft's Python type checker

### Language Servers (CLI Usage)

- **`pylsp`** (Python): Full language server protocol support
- **`typescript-language-server`**: Code intelligence for JS/TS
- **`gopls`** (Go): Official Go language server
- **`rust-analyzer`** (Rust): Advanced Rust intelligence

### Code Quality Metrics

- **`radon`** (Python): Cyclomatic complexity analysis
- **`plato`** (JavaScript): Complexity and maintainability reports
- **`scc`**: Fast, accurate code statistics (LOC, complexity)
- **`lizard`**: Multi-language complexity analyzer

## Documentation & Knowledge Base

### Documentation Strategy

- **Markdown files in Git**: Version-controlled documentation
- **Agent-generated artifacts**: PRDs, design docs, API specs
- **Automatic linking**: Connect tickets to documentation

### Documentation Tools

- **`mdformat`**: Consistent markdown formatting
- **`markdownlint`**: Markdown style enforcement
- **`mkdocs`**: Static site generation from markdown

## Integration Patterns

### Git Operations Abstraction

```python
class GitProvider(ABC):
    @abstractmethod
    def create_pr(self, title, body, branch): pass

    @abstractmethod
    def get_pr_comments(self, pr_id): pass

class GitHubProvider(GitProvider):
    # GitHub-specific implementation

class GitLabProvider(GitProvider):
    # GitLab-specific implementation
```

### CI/CD Abstraction

```python
class CIProvider(ABC):
    @abstractmethod
    def trigger_build(self, branch): pass

    @abstractmethod
    def get_build_status(self, build_id): pass

class GitHubActionsProvider(CIProvider):
    # GHA-specific implementation
```

## Tool Configuration

### Agent Tool Access

Each agent type gets specific tools based on their role:

```yaml
agents:
  code_style_enforcer:
    tools:
      - ruff
      - black
      - prettier
      - eslint

  security_auditor:
    tools:
      - semgrep
      - bandit
      - safety

  test_generator:
    tools:
      - pytest
      - coverage
      - hypothesis
```

### Tool Execution Environment

- Tools run in isolated Docker containers
- Resource limits per agent type
- Cached tool installations for performance

## Future Considerations

### Phase 2 Tools

- **Monitoring Integration**: Datadog, Sentry APIs
- **Performance Profiling**: py-spy, node --prof
- **Database Tools**: pgcli, mycli for migrations

### Phase 3 Tools

- **Deployment Tools**: Terraform, Ansible
- **Container Tools**: Docker, Buildah
- **Security Scanning**: Trivy, Grype
