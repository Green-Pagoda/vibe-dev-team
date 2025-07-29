import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';
import { webhookRouter } from './routes/webhooks';
import { healthRouter } from './routes/health';

const app = new Hono();

// Middleware
app.use('*', logger());
app.use('*', cors());

// Error handling
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Routes
app.route('/health', healthRouter);
app.route('/webhooks', webhookRouter);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

const port = process.env.PORT || 3000;

export default {
  port,
  fetch: app.fetch,
};

console.log(`Plane Event Dispatcher running on port ${port}`);