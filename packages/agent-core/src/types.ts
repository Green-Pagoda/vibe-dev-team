export interface AgentContext {
  workspaceId: string;
  projectId: string;
  issueId?: string;
  userId?: string;
  metadata?: Record<string, unknown>;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: AgentError;
  duration: number;
  timestamp: Date;
}

export interface AgentError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export type AgentCapability =
  | 'feature-estimation'
  | 'requirements-analysis'
  | 'code-review'
  | 'test-generation'
  | 'documentation';

export interface AgentMetrics {
  executionCount: number;
  averageDuration: number;
  successRate: number;
  lastExecuted?: Date;
}
