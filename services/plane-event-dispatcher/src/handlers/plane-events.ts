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
    console.error(`Error handling ${eventKey}:`, error);
    throw error;
  }
}

async function handleIssueCreated(payload: PlaneWebhookPayload): Promise<void> {
  console.log('New issue created:', payload.data);
  
  // TODO: Trigger Mastra workflow for new issue
  // 1. Analyze issue type
  // 2. Route to appropriate workflow
  // 3. Start agent processing
}

async function handleIssueUpdated(payload: PlaneWebhookPayload): Promise<void> {
  console.log('Issue updated:', payload.data);
  
  // TODO: Check if update requires agent action
}

async function handleIssueDeleted(payload: PlaneWebhookPayload): Promise<void> {
  console.log('Issue deleted:', payload.data);
  
  // TODO: Cancel any running workflows for this issue
}

async function handleCommentCreated(payload: PlaneWebhookPayload): Promise<void> {
  console.log('New comment:', payload.data);
  
  // TODO: Check if comment is from user requesting agent action
}

async function handleCommentUpdated(payload: PlaneWebhookPayload): Promise<void> {
  console.log('Comment updated:', payload.data);
}