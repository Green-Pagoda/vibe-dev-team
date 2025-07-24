# API Contracts

## Overview
This document defines the API contracts between system components, ensuring type-safe communication.

## 1. Webhook Server API

### POST /webhook/plane
Receives events from Plane ticket system.

**Request Headers:**
```
X-Plane-Signature: <webhook_signature>
Content-Type: application/json
```

**Request Body:**
```python
from typing import Literal, Optional
from datetime import datetime
from pydantic import BaseModel

class PlaneWebhookEvent(BaseModel):
    event_type: Literal[
        "issue.created",
        "issue.updated", 
        "issue.deleted",
        "issue.comment.created",
        "issue.assignee.updated",
        "issue.label.updated",
        "issue.state.updated"
    ]
    timestamp: datetime
    issue: IssueData
    actor: ActorData
    changes: Optional[dict[str, Any]] = None

class IssueData(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    state: Literal["open", "in_progress", "closed"]
    priority: int  # 1-5
    assignee_id: Optional[str]
    labels: list[str]
    parent_id: Optional[str]  # For subtasks

class ActorData(BaseModel):
    id: str
    email: str
    name: str
```

**Response:**
```python
class WebhookResponse(BaseModel):
    status: Literal["accepted", "rejected"]
    workflow_id: Optional[str]  # Temporal workflow ID
    message: Optional[str]
```

## 2. Plane API Client Interface

```python
from abc import ABC, abstractmethod

class PlaneClient(ABC):
    @abstractmethod
    async def get_issue(self, issue_id: str) -> IssueData:
        """Fetch issue details."""
        
    @abstractmethod
    async def update_issue(
        self, 
        issue_id: str, 
        updates: IssueUpdate
    ) -> IssueData:
        """Update issue fields."""
        
    @abstractmethod
    async def create_issue(
        self, 
        project_id: str,
        issue: IssueCreate
    ) -> IssueData:
        """Create new issue."""
        
    @abstractmethod
    async def add_comment(
        self, 
        issue_id: str, 
        comment: str
    ) -> CommentData:
        """Add comment to issue."""

class IssueUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    state: Optional[str] = None
    priority: Optional[int] = None
    assignee_id: Optional[str] = None
    labels: Optional[list[str]] = None

class IssueCreate(BaseModel):
    title: str
    description: str
    priority: int = 3
    labels: list[str] = []
    parent_id: Optional[str] = None
```

## 3. Agent Base Contract

```python
from typing import Protocol, TypeVar
from dataclasses import dataclass

T = TypeVar('T', bound='AgentResult')

class Agent(Protocol[T]):
    """Base protocol all agents must implement."""
    
    @property
    def agent_type(self) -> str:
        """Unique agent type identifier."""
        
    @property
    def model_config(self) -> ModelConfig:
        """LLM configuration for this agent."""
        
    async def process_ticket(
        self, 
        ticket: IssueData,
        context: AgentContext
    ) -> T:
        """Process a ticket and return result."""

@dataclass(frozen=True)
class ModelConfig:
    provider: Literal["openai", "anthropic", "local"]
    model: str
    temperature: float
    max_tokens: int

@dataclass(frozen=True)
class AgentContext:
    workflow_id: str
    parent_ticket_id: Optional[str]
    git_branch: Optional[str]
    previous_results: dict[str, Any]
```

## 4. Agent-Specific Results

```python
@dataclass(frozen=True)
class EstimatorResult:
    complexity: Literal["trivial", "simple", "medium", "complex", "epic"]
    estimated_hours: float
    confidence: float
    reasoning: str

@dataclass(frozen=True)
class DecomposerResult:
    subtasks: list[Subtask]
    dependencies: dict[str, list[str]]  # task_id -> [dependency_ids]

@dataclass(frozen=True)
class Subtask:
    title: str
    description: str
    acceptance_criteria: list[str]
    estimated_hours: float

@dataclass(frozen=True)
class CodeReviewResult:
    approved: bool
    issues: list[CodeIssue]
    suggestions: list[str]

@dataclass(frozen=True)
class CodeIssue:
    severity: Literal["error", "warning", "info"]
    file: str
    line: int
    message: str
    rule: Optional[str]
```

## 5. Temporal Workflow Contracts

```python
from temporalio import workflow

@workflow.defn
class TicketWorkflow:
    @workflow.run
    async def run(self, ticket_id: str) -> WorkflowResult:
        """Main ticket processing workflow."""

@workflow.defn  
class CodeReviewWorkflow:
    @workflow.run
    async def run(
        self, 
        pr_url: str, 
        ticket_id: str
    ) -> ReviewResult:
        """Code review sub-workflow."""

@dataclass(frozen=True)
class WorkflowResult:
    ticket_id: str
    status: Literal["completed", "failed", "blocked"]
    artifacts: list[Artifact]
    metrics: WorkflowMetrics

@dataclass(frozen=True)
class Artifact:
    type: Literal["code", "document", "test", "config"]
    path: str
    commit_sha: Optional[str]

@dataclass(frozen=True)
class WorkflowMetrics:
    duration_seconds: float
    tokens_used: dict[str, int]  # agent_type -> token_count
    api_calls: dict[str, int]     # service -> call_count
```

## 6. Tool Execution Contract

```python
class ToolExecutor(Protocol):
    async def execute(
        self,
        tool: str,
        args: list[str],
        cwd: Optional[str] = None,
        timeout: int = 300
    ) -> ToolResult:
        """Execute CLI tool in sandboxed environment."""

@dataclass(frozen=True)
class ToolResult:
    exit_code: int
    stdout: str
    stderr: str
    duration_seconds: float
```

## 7. LiteLLM Wrapper Contract

```python
class LLMClient(Protocol):
    async def complete(
        self,
        messages: list[Message],
        model: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        tools: Optional[list[Tool]] = None
    ) -> CompletionResult:
        """Get LLM completion with automatic fallback."""

@dataclass(frozen=True)
class Message:
    role: Literal["system", "user", "assistant", "tool"]
    content: str
    tool_calls: Optional[list[ToolCall]] = None

@dataclass(frozen=True)
class CompletionResult:
    content: str
    model_used: str
    tokens_used: TokenUsage
    tool_calls: Optional[list[ToolCall]] = None

@dataclass(frozen=True)
class TokenUsage:
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    cost_usd: float
```

## 8. Git Abstraction Contract

```python
class GitProvider(Protocol):
    async def create_branch(
        self, 
        branch_name: str, 
        from_branch: str = "main"
    ) -> str:
        """Create new branch."""
        
    async def commit(
        self,
        branch: str,
        message: str,
        files: dict[str, str]  # path -> content
    ) -> str:
        """Commit files with message."""
        
    async def create_pr(
        self,
        title: str,
        body: str,
        source_branch: str,
        target_branch: str = "main"
    ) -> PullRequest:
        """Create pull request."""

@dataclass(frozen=True)
class PullRequest:
    id: str
    number: int
    url: str
    state: Literal["open", "closed", "merged"]
```

## Error Handling

All APIs should raise typed exceptions:

```python
class PlaneAPIError(Exception):
    """Base exception for Plane API errors."""
    
class WebhookValidationError(PlaneAPIError):
    """Invalid webhook signature or payload."""
    
class TicketNotFoundError(PlaneAPIError):
    """Requested ticket does not exist."""
    
class RateLimitError(PlaneAPIError):
    """API rate limit exceeded."""
    retry_after: int  # seconds
    
class AgentExecutionError(Exception):
    """Agent failed to process ticket."""
    agent_type: str
    ticket_id: str
```

## Versioning

All contracts are versioned using protocol version headers:

```
X-API-Version: 1.0
```

Backward compatibility maintained for 2 major versions.