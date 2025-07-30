import { FeatureEstimatorAgent } from './agent';
import { PlaneMCPClient } from '@vibe-dev-team/plane-mcp-client';

// Initialize Plane client
const planeClient = new PlaneMCPClient({
  apiKey: process.env['PLANE_API_KEY'] || '',
  workspaceSlug: process.env['PLANE_WORKSPACE_SLUG'] || '',
  apiHostUrl: process.env['PLANE_API_HOST_URL'],
});

// Create agent instance
const agent = new FeatureEstimatorAgent(planeClient);

// Start agent server
const port = process.env['PORT'] || 8080;

console.log(`Feature Estimator Agent starting on port ${port}...`);
console.log(`Agent info:`, agent.getInfo());

// TODO: Add HTTP server for health checks and manual triggers
// For now, this agent will be triggered by Mastra workflows
