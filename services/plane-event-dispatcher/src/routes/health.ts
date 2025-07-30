import { Hono } from 'hono';

export const healthRouter = new Hono();

healthRouter.get('/', (c) => {
  return c.json({
    status: 'healthy',
    service: 'plane-event-dispatcher',
    timestamp: new Date().toISOString(),
    version: process.env['npm_package_version'] || '0.1.0',
  });
});

healthRouter.get('/ready', (c) => {
  // TODO: Check dependencies (Plane API, Mastra, etc.)
  const checks = {
    plane_api: true, // TODO: Implement actual health check
    mastra: true, // TODO: Implement actual health check
  };

  const allHealthy = Object.values(checks).every((status) => status);

  return c.json(
    {
      status: allHealthy ? 'ready' : 'not_ready',
      checks,
      timestamp: new Date().toISOString(),
    },
    allHealthy ? 200 : 503
  );
});
