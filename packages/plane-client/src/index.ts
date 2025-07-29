import { z } from 'zod';

export interface PlaneClientConfig {
  apiUrl: string;
  apiKey: string;
  workspaceSlug: string;
}

export class PlaneAPIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public response?: string
  ) {
    super(message);
    this.name = 'PlaneAPIError';
  }
}

export class PlaneClientError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'PlaneClientError';
  }
}

// Plane API response types
export interface PlaneIssue {
  id: string;
  name: string;
  description: string;
  state: string;
  priority: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  estimate_point?: number;
  labels: string[];
  created_at: string;
  updated_at: string;
  project: string;
  workspace: string;
}

export interface PlaneComment {
  id: string;
  comment: string;
  created_at: string;
  updated_at: string;
  actor: string;
  issue: string;
}

export interface PlaneIssueUpdate {
  name?: string;
  description?: string;
  state?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  estimate_point?: number;
  labels?: string[];
}

export interface PlaneIssueCreate {
  name: string;
  description?: string;
  state?: string;
  priority?: 'urgent' | 'high' | 'medium' | 'low' | 'none';
  estimate_point?: number;
  labels?: string[];
}

export class PlaneClient {
  private config: PlaneClientConfig;

  constructor(config: PlaneClientConfig) {
    this.config = config;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.apiUrl}/api/v1/workspaces/${this.config.workspaceSlug}${path}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-API-Key': this.config.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        throw new PlaneAPIError(
          `Plane API error: ${response.statusText}`,
          response.status,
          errorText
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof PlaneAPIError) {
        throw error;
      }
      throw new PlaneClientError(
        `Failed to make request to ${url}`,
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  async getIssue(projectId: string, issueId: string): Promise<PlaneIssue> {
    return this.request<PlaneIssue>(`/projects/${projectId}/issues/${issueId}`);
  }

  async updateIssue(projectId: string, issueId: string, data: PlaneIssueUpdate): Promise<PlaneIssue> {
    return this.request<PlaneIssue>(`/projects/${projectId}/issues/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createIssue(projectId: string, data: PlaneIssueCreate): Promise<PlaneIssue> {
    return this.request<PlaneIssue>(`/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addComment(projectId: string, issueId: string, comment: string): Promise<PlaneComment> {
    return this.request<PlaneComment>(`/projects/${projectId}/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }
}