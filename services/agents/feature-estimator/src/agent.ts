import { z } from 'zod';
import { BaseAgent } from '@vibe-dev-team/agent-core';
import { PlaneClient } from '@vibe-dev-team/plane-client';
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
  private planeClient: PlaneClient;

  constructor(mastra: Mastra, planeClient: PlaneClient) {
    super(
      {
        name: 'Feature Estimator',
        description: 'Estimates complexity and effort for new features',
        version: '0.1.0',
        capabilities: [
          'Analyze feature requirements',
          'Estimate complexity',
          'Identify dependencies',
          'Assess technical risks',
        ],
      },
      mastra
    );
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
      const estimation = JSON.parse(response.text) as FeatureEstimatorOutput;
      
      // Update the Plane issue with the estimation
      await this.updatePlaneIssue(input.projectId, input.issueId, estimation);
      
      return estimation;
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      throw new Error('Invalid estimation response from LLM');
    }
  }

  private buildEstimationPrompt(input: FeatureEstimatorInput): string {
    return `
Feature Title: ${input.title}

Description:
${input.description}

Labels: ${input.labels?.join(', ') || 'None'}

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
    await this.planeClient.updateIssue(projectId, issueId, {
      labels: [complexityLabel],
      estimate_point: this.complexityToPoints(estimation.complexity),
    });
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

  private complexityToPoints(complexity: string): number {
    const pointMap: Record<string, number> = {
      'trivial': 1,
      'small': 2,
      'medium': 3,
      'large': 5,
      'extra-large': 8,
    };
    return pointMap[complexity] || 3;
  }
}