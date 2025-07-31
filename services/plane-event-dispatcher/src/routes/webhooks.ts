import { Hono } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';
import { verifyPlaneWebhook } from '../utils/webhook-verification';
import {
  handlePlaneEvent,
  type PlaneWebhookPayload,
} from '../handlers/plane-events';

const webhookRouter = new Hono();

// Plane webhook payload schema - validates structure but not full typing
const PlaneWebhookSchema = z.object({
  event: z.enum(['issue', 'issue_comment']),
  action: z.enum(['created', 'updated', 'deleted']),
  data: z.object({}).passthrough(), // Allow any object shape
  webhook_id: z.string(),
  workspace_id: z.string(),
  project_id: z.string().optional(),
  timestamp: z.string(),
});

webhookRouter.post('/plane', async (c) => {
  try {
    // Verify webhook signature
    const signature = c.req.header('X-Plane-Signature');
    const body = await c.req.text();

    if (!signature) {
      throw new HTTPException(401, { message: 'Missing webhook signature' });
    }

    const isValid = await verifyPlaneWebhook(body, signature);
    if (!isValid) {
      throw new HTTPException(401, { message: 'Invalid webhook signature' });
    }

    // Parse and validate payload
    const payload = JSON.parse(body);
    const validatedPayload = PlaneWebhookSchema.parse(payload);

    // Log the event
    console.log(
      `Received Plane webhook: ${validatedPayload.event}.${validatedPayload.action}`
    );

    // Handle the event asynchronously - cast through unknown for type safety
    handlePlaneEvent(validatedPayload as unknown as PlaneWebhookPayload).catch(
      console.error
    );

    // Return immediate response to Plane
    return c.json({ status: 'accepted' }, 202);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new HTTPException(400, { message: 'Invalid webhook payload' });
    }
    throw error;
  }
});

export { webhookRouter };
