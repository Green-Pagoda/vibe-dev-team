export interface AgentContext {
  workspaceId: string;
  projectId: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface AgentResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  duration: number;
  timestamp: Date;
}

export interface AgentMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: Date;
}