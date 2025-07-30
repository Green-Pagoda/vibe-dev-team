/**
 * Plane MCP Client Wrapper
 *
 * This module provides a TypeScript wrapper around the official @makeplane/plane-mcp-server
 * It offers type-safe interfaces for interacting with Plane's API through MCP.
 */

import { z } from 'zod';

// Configuration for Plane MCP connection
export interface PlaneMCPConfig {
  apiKey: string;
  workspaceSlug: string;
  apiHostUrl?: string;
}

// Core Plane entities - based on official Plane API
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

export interface PlaneProject {
  id: string;
  name: string;
  description?: string;
  workspace: string;
}

// Input schemas for creating/updating
export const CreateIssueSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  state: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  estimate_point: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export const UpdateIssueSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  state: z.string().optional(),
  priority: z.enum(['urgent', 'high', 'medium', 'low', 'none']).optional(),
  estimate_point: z.number().optional(),
  labels: z.array(z.string()).optional(),
});

export type CreateIssueInput = z.infer<typeof CreateIssueSchema>;
export type UpdateIssueInput = z.infer<typeof UpdateIssueSchema>;

/**
 * Plane MCP Client
 *
 * Wraps the official Plane MCP server for type-safe programmatic access.
 * This class provides a clean interface to Plane's project management features.
 */
export class PlaneMCPClient {
  private config: PlaneMCPConfig;

  constructor(config: PlaneMCPConfig) {
    this.config = config;

    // Set environment variables for the MCP server
    process.env.PLANE_API_KEY = config.apiKey;
    process.env.PLANE_WORKSPACE_SLUG = config.workspaceSlug;
    if (config.apiHostUrl) {
      process.env.PLANE_API_HOST_URL = config.apiHostUrl;
    }
  }

  /**
   * Create a new issue in the specified project
   */
  async createIssue(
    projectId: string,
    data: CreateIssueInput
  ): Promise<PlaneIssue> {
    // TODO: Integrate with actual MCP server once workspace issues are resolved
    // For now, return a mock implementation
    const issue: PlaneIssue = {
      id: `issue-${Date.now()}`,
      name: data.name,
      description: data.description || '',
      state: data.state || 'backlog',
      priority: data.priority || 'medium',
      estimate_point: data.estimate_point,
      labels: data.labels || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      project: projectId,
      workspace: this.config.workspaceSlug,
    };

    console.log(
      `[PlaneMCPClient] Created issue: ${issue.name} (ID: ${issue.id})`
    );
    return issue;
  }

  /**
   * Update an existing issue
   */
  async updateIssue(
    projectId: string,
    issueId: string,
    data: UpdateIssueInput
  ): Promise<PlaneIssue> {
    // TODO: Integrate with actual MCP server
    console.log(
      `[PlaneMCPClient] Updated issue ${issueId} in project ${projectId}`,
      data
    );

    // Mock implementation - in reality this would call the MCP server
    const updatedIssue: PlaneIssue = {
      id: issueId,
      name: data.name || 'Mock Issue',
      description: data.description || '',
      state: data.state || 'in-progress',
      priority: data.priority || 'medium',
      estimate_point: data.estimate_point,
      labels: data.labels || [],
      created_at: new Date(Date.now() - 86400000).toISOString(), // Yesterday
      updated_at: new Date().toISOString(),
      project: projectId,
      workspace: this.config.workspaceSlug,
    };

    return updatedIssue;
  }

  /**
   * Add a comment to an issue
   */
  async addComment(
    projectId: string,
    issueId: string,
    comment: string
  ): Promise<PlaneComment> {
    // TODO: Integrate with actual MCP server
    console.log(
      `[PlaneMCPClient] Added comment to issue ${issueId}: ${comment.substring(0, 100)}...`
    );

    const newComment: PlaneComment = {
      id: `comment-${Date.now()}`,
      comment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      actor: 'feature-estimator-agent',
      issue: issueId,
    };

    return newComment;
  }

  /**
   * Get an issue by ID
   */
  async getIssue(projectId: string, issueId: string): Promise<PlaneIssue> {
    // TODO: Integrate with actual MCP server
    console.log(
      `[PlaneMCPClient] Retrieved issue ${issueId} from project ${projectId}`
    );

    const issue: PlaneIssue = {
      id: issueId,
      name: 'Mock Issue',
      description: 'This is a mock issue for development',
      state: 'backlog',
      priority: 'medium',
      estimate_point: 3,
      labels: ['feature', 'backend'],
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString(),
      project: projectId,
      workspace: this.config.workspaceSlug,
    };

    return issue;
  }

  /**
   * List projects in the workspace
   */
  async getProjects(): Promise<PlaneProject[]> {
    // TODO: Integrate with actual MCP server
    console.log(
      `[PlaneMCPClient] Retrieved projects for workspace ${this.config.workspaceSlug}`
    );

    return [
      {
        id: 'project-1',
        name: 'Main Project',
        description: 'The main development project',
        workspace: this.config.workspaceSlug,
      },
    ];
  }
}

export default PlaneMCPClient;
