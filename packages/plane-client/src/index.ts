import { z } from 'zod';

export interface PlaneClientConfig {
  apiUrl: string;
  apiKey: string;
  workspaceSlug: string;
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
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'X-API-Key': this.config.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Plane API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
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