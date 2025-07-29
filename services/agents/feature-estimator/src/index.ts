import { Mastra } from '@mastra/core';
import { openai } from '@vercel/ai';
import { FeatureEstimatorAgent } from './agent';
import { PlaneClient } from '@vibe-dev-team/plane-client';

// Initialize Mastra
const mastra = new Mastra({
  llm: {
    provider: openai,
    model: 'gpt-4',
  },
});

// Initialize Plane client
const planeClient = new PlaneClient({
  apiUrl: process.env.PLANE_API_URL!,
  apiKey: process.env.PLANE_API_KEY!,
  workspaceSlug: process.env.PLANE_WORKSPACE_SLUG!,
});

// Create agent instance
const agent = new FeatureEstimatorAgent(mastra, planeClient);

// Start agent server
const port = process.env.PORT || 8080;

console.log(`Feature Estimator Agent starting on port ${port}...`);

// TODO: Add HTTP server for health checks and manual triggers
// For now, this agent will be triggered by Mastra workflows