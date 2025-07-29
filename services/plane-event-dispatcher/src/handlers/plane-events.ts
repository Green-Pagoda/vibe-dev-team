import { z } from 'zod';
import type { PlaneIssue, PlaneComment } from '@vibe-dev-team/plane-client';

// Base webhook payload
interface BaseWebhookPayload {
  webhook_id: string;
  workspace_id: string;
  project_id?: string;
  timestamp: string;
}

// Discriminated union for different webhook events
export type PlaneWebhookPayload = 
  | (BaseWebhookPayload & {
      event: 'issue';
      action: 'created' | 'updated' | 'deleted';
      data: PlaneIssue;
    })
  | (BaseWebhookPayload & {
      event: 'issue_comment';
      action: 'created' | 'updated' | 'deleted';
      data: PlaneComment;
    });

// Event handlers mapping
const eventHandlers: Record<string, (payload: PlaneWebhookPayload) => Promise<void>> = {
  'issue.created': handleIssueCreated,
  'issue.updated': handleIssueUpdated,
  'issue.deleted': handleIssueDeleted,
  'issue_comment.created': handleCommentCreated,
  'issue_comment.updated': handleCommentUpdated,
};

export class WebhookHandlerError extends Error {
  constructor(
    message: string,
    public eventKey: string,
    public webhookId: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'WebhookHandlerError';
  }
}

export async function handlePlaneEvent(payload: PlaneWebhookPayload): Promise<void> {
  const eventKey = `${payload.event}.${payload.action}`;
  const handler = eventHandlers[eventKey];

  if (!handler) {
    console.log(`No handler for event: ${eventKey}`);
    return;
  }

  try {
    await handler(payload);
  } catch (error) {
    const webhookError = new WebhookHandlerError(
      `Failed to handle webhook event ${eventKey}`,
      eventKey,
      payload.webhook_id,
      error instanceof Error ? error : new Error(String(error))
    );
    
    console.error(`Error handling ${eventKey}:`, {
      webhookId: payload.webhook_id,
      workspaceId: payload.workspace_id,
      projectId: payload.project_id,
      error: webhookError.cause?.message,
    });
    
    throw webhookError;
  }
}

async function handleIssueCreated(payload: PlaneWebhookPayload): Promise<void> {
  // Type guard to ensure we have the right payload type
  if (payload.event !== 'issue' || payload.action !== 'created') {
    throw new Error(`Invalid payload for handleIssueCreated: ${payload.event}.${payload.action}`);
  }

  console.log('New issue created:', {
    issueId: payload.data.id,
    title: payload.data.name,
    projectId: payload.project_id,
  });
  
  // TODO: Trigger Mastra workflow for new issue
  // 1. Analyze issue type
  // 2. Route to appropriate workflow
  // 3. Start agent processing
}

async function handleIssueUpdated(payload: PlaneWebhookPayload): Promise<void> {
  // Type guard
  if (payload.event !== 'issue' || payload.action !== 'updated') {
    throw new Error(`Invalid payload for handleIssueUpdated: ${payload.event}.${payload.action}`);
  }

  console.log('Issue updated:', {
    issueId: payload.data.id,
    title: payload.data.name,
  });
  
  // TODO: Check if update requires agent action
}

async function handleIssueDeleted(payload: PlaneWebhookPayload): Promise<void> {
  // Type guard
  if (payload.event !== 'issue' || payload.action !== 'deleted') {
    throw new Error(`Invalid payload for handleIssueDeleted: ${payload.event}.${payload.action}`);
  }

  console.log('Issue deleted:', {
    issueId: payload.data.id,
  });
  
  // TODO: Cancel any running workflows for this issue
}

async function handleCommentCreated(payload: PlaneWebhookPayload): Promise<void> {
  // Type guard
  if (payload.event !== 'issue_comment' || payload.action !== 'created') {
    throw new Error(`Invalid payload for handleCommentCreated: ${payload.event}.${payload.action}`);
  }

  console.log('New comment:', {
    commentId: payload.data.id,
    issueId: payload.data.issue,
  });
  
  // TODO: Check if comment is from user requesting agent action
}

async function handleCommentUpdated(payload: PlaneWebhookPayload): Promise<void> {
  // Type guard
  if (payload.event !== 'issue_comment' || payload.action !== 'updated') {
    throw new Error(`Invalid payload for handleCommentUpdated: ${payload.event}.${payload.action}`);
  }

  console.log('Comment updated:', {
    commentId: payload.data.id,
  });
}