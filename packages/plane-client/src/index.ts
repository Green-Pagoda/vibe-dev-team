import { z } from 'zod';

export interface PlaneClientConfig {
  apiUrl: string;
  apiKey: string;
  workspaceSlug: string;
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

  async getIssue(projectId: string, issueId: string) {
    return this.request(`/projects/${projectId}/issues/${issueId}`);
  }

  async updateIssue(projectId: string, issueId: string, data: any) {
    return this.request(`/projects/${projectId}/issues/${issueId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async createIssue(projectId: string, data: any) {
    return this.request(`/projects/${projectId}/issues`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addComment(projectId: string, issueId: string, comment: string) {
    return this.request(`/projects/${projectId}/issues/${issueId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    });
  }
}