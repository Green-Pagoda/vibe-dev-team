import { z } from 'zod';
import { BaseAgent, type AgentConfig } from '@vibe-dev-team/agent-core';
import { PlaneMCPClient, type UpdateIssueInput } from '@vibe-dev-team/plane-mcp-client';
import { Mastra } from '@mastra/core';
import { generateText } from '@vercel/ai';

// Input schema for the feature estimator
const FeatureEstimatorInputSchema = z.object({
  issueId: z.string(),
  projectId: z.string(),
  title: z.string(),
  description: z.string(),
  labels: z.array(z.string()).optional(),
  attachments: z.array(z.string()).optional(),
});

// Output schema for the estimation result
const FeatureEstimatorOutputSchema = z.object({
  complexity: z.enum(['trivial', 'small', 'medium', 'large', 'extra-large']),
  estimatedHours: z.number(),
  confidence: z.enum(['low', 'medium', 'high']),
  reasoning: z.string(),
  technicalConsiderations: z.array(z.string()),
  dependencies: z.array(z.string()),
  risks: z.array(z.string()),
});

type FeatureEstimatorInput = z.infer<typeof FeatureEstimatorInputSchema>;
type FeatureEstimatorOutput = z.infer<typeof FeatureEstimatorOutputSchema>;

export class FeatureEstimatorAgent extends BaseAgent {
  private planeClient: PlaneMCPClient;

  constructor(mastra: Mastra, planeClient: PlaneMCPClient) {
    const config: AgentConfig = {
      name: 'Feature Estimator',
      description: 'Estimates complexity and effort for new features using official Plane MCP integration',
      version: '0.2.0',
      capabilities: ['feature-estimation'],
    };
    super(config, mastra);
    this.planeClient = planeClient;
  }

  getInputSchema() {
    return FeatureEstimatorInputSchema;
  }

  getOutputSchema() {
    return FeatureEstimatorOutputSchema;
  }

  async execute(input: FeatureEstimatorInput): Promise<FeatureEstimatorOutput> {
    // Prepare prompt for the LLM
    const prompt = this.buildEstimationPrompt(input);

    // Generate estimation using LLM
    const response = await generateText({
      model: this.mastra.llm.model,
      prompt,
      system: `You are an expert software architect and project estimator. 
        Analyze the given feature request and provide a detailed complexity estimation.
        Consider technical requirements, potential dependencies, and risks.
        Respond in JSON format matching the specified schema.`,
    });

    // Parse and validate the response
    try {
      let parsedResponse: unknown;
      try {
        parsedResponse = JSON.parse(response.text);
      } catch (parseError) {
        throw this.createError(
          'LLM_RESPONSE_INVALID_JSON',
          'LLM response is not valid JSON',
          { response: response.text, parseError: parseError instanceof Error ? parseError.message : String(parseError) }
        );
      }

      // Validate the parsed response against our schema
      const validationResult = this.getOutputSchema().safeParse(parsedResponse);
      if (!validationResult.success) {
        throw this.createError(
          'LLM_RESPONSE_INVALID_SCHEMA',
          'LLM response does not match expected schema',
          { response: parsedResponse, errors: validationResult.error.errors }
        );
      }

      const estimation = validationResult.data;
      
      // Update the Plane issue with the estimation
      try {
        await this.updatePlaneIssue(input.projectId, input.issueId, estimation);
      } catch (planeError) {
        // Log the error but don't fail the entire operation
        console.error('Failed to update Plane issue:', planeError);
        // Still return the estimation even if Plane update failed
      }
      
      return estimation;
    } catch (error) {
      // Re-throw our custom errors
      if (typeof error === 'object' && error !== null && 'code' in error) {
        throw error;
      }
      
      // Handle unexpected errors
      throw this.createError(
        'ESTIMATION_EXECUTION_ERROR',
        'Unexpected error during estimation',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  private buildEstimationPrompt(input: FeatureEstimatorInput): string {
    // Sanitize inputs to prevent prompt injection
    const sanitizedTitle = this.sanitizeInput(input.title);
    const sanitizedDescription = this.sanitizeInput(input.description);
    const sanitizedLabels = input.labels?.map(label => this.sanitizeInput(label)).join(', ') || 'None';

    return `
Feature Title: ${sanitizedTitle}

Description:
${sanitizedDescription}

Labels: ${sanitizedLabels}

Please analyze this feature request and provide:
1. Complexity rating (trivial/small/medium/large/extra-large)
2. Estimated hours of development effort
3. Confidence level in the estimate
4. Detailed reasoning for the estimate
5. Technical considerations
6. Potential dependencies
7. Identified risks

Response format:
{
  "complexity": "medium",
  "estimatedHours": 16,
  "confidence": "high",
  "reasoning": "...",
  "technicalConsiderations": ["..."],
  "dependencies": ["..."],
  "risks": ["..."]
}
`;
  }

  private sanitizeInput(input: string): string {
    // Remove potential prompt injection attempts
    return input
      .replace(/\n\s*system:/gi, '\n[SYSTEM]:')
      .replace(/\n\s*user:/gi, '\n[USER]:')
      .replace(/\n\s*assistant:/gi, '\n[ASSISTANT]:')
      .trim();
  }

  private async updatePlaneIssue(
    projectId: string,
    issueId: string,
    estimation: FeatureEstimatorOutput
  ): Promise<void> {
    // Add estimation as a comment
    const comment = this.formatEstimationComment(estimation);
    await this.planeClient.addComment(projectId, issueId, comment);

    // Update issue labels based on complexity
    const complexityLabel = `complexity:${estimation.complexity}`;
    const updateData: UpdateIssueInput = {
      labels: [complexityLabel],
      estimate_point: this.complexityToPoints(estimation.complexity),
    };
    await this.planeClient.updateIssue(projectId, issueId, updateData);
  }

  private formatEstimationComment(estimation: FeatureEstimatorOutput): string {
    return `## 🤖 Feature Estimation

**Complexity:** ${estimation.complexity}
**Estimated Hours:** ${estimation.estimatedHours}
**Confidence:** ${estimation.confidence}

### Reasoning
${estimation.reasoning}

### Technical Considerations
${estimation.technicalConsiderations.map(tc => `- ${tc}`).join('\n')}

### Dependencies
${estimation.dependencies.map(dep => `- ${dep}`).join('\n')}

### Risks
${estimation.risks.map(risk => `- ⚠️ ${risk}`).join('\n')}

---
*Estimated by Feature Estimator Agent v0.1.0*`;
  }

  private complexityToPoints(complexity: FeatureEstimatorOutput['complexity']): number {
    const pointMap: Record<FeatureEstimatorOutput['complexity'], number> = {
      'trivial': 1,
      'small': 2,
      'medium': 3,
      'large': 5,
      'extra-large': 8,
    };
    return pointMap[complexity];
  }
}