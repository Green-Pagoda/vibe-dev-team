import { z } from 'zod';
import {
  BaseAgent,
  type AgentConfig,
  createPromptLoader,
  createAgentLogger,
  type Logger,
} from '@vibe-dev-team/agent-core';
import {
  PlaneMCPClient,
  type UpdateIssueInput,
} from '@vibe-dev-team/plane-mcp-client';
import { generateText } from 'ai';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

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

// Constants
const COMPLEXITY_POINTS = {
  trivial: 1,
  small: 2,
  medium: 3,
  large: 5,
  'extra-large': 8,
} as const;

const AGENT_VERSION = '0.2.0';
const AGENT_NAME = 'Feature Estimator';

export class FeatureEstimatorAgent extends BaseAgent {
  private planeClient: PlaneMCPClient;
  private promptLoader = createPromptLoader(__dirname);
  private logger: Logger;

  constructor(planeClient: PlaneMCPClient) {
    const config: AgentConfig = {
      name: AGENT_NAME,
      description:
        'Estimates complexity and effort for new features using official Plane MCP integration',
      version: AGENT_VERSION,
      capabilities: ['feature-estimation'],
    };
    super(config);
    this.planeClient = planeClient;
    this.logger = createAgentLogger(AGENT_NAME, AGENT_VERSION);
  }

  getInputSchema() {
    return FeatureEstimatorInputSchema;
  }

  getOutputSchema() {
    return FeatureEstimatorOutputSchema;
  }

  async execute(input: FeatureEstimatorInput): Promise<FeatureEstimatorOutput> {
    const executionId = `${input.issueId}-${Date.now()}`;
    const logger = this.logger.child({
      executionId,
      projectId: input.projectId,
      issueId: input.issueId,
    });

    logger.info('Starting feature estimation', { title: input.title });

    const prompt = this.buildEstimationPrompt(input);
    const response = await this.generateLLMEstimation(prompt);
    const estimation = this.parseAndValidateResponse(response.text);

    logger.info('Estimation completed', {
      complexity: estimation.complexity,
      estimatedHours: estimation.estimatedHours,
      confidence: estimation.confidence,
    });

    // Update Plane issue with estimation (non-blocking)
    this.updatePlaneIssueAsync(
      input.projectId,
      input.issueId,
      estimation,
      logger
    );

    return estimation;
  }

  private async generateLLMEstimation(prompt: string) {
    // TODO: Update to use proper Mastra LLM integration when upgrading to v0.12+
    return generateText({
      model: 'gpt-4' as any, // Type cast for now until Mastra config is fixed
      prompt,
      system: this.getSystemPrompt(),
    });
  }

  private getSystemPrompt(): string {
    return this.promptLoader.getSystemPrompt();
  }

  private parseAndValidateResponse(
    responseText: string
  ): FeatureEstimatorOutput {
    // Parse JSON response
    let parsedResponse: unknown;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      throw this.createError(
        'LLM_RESPONSE_INVALID_JSON',
        'LLM response is not valid JSON',
        {
          response: responseText,
          parseError:
            parseError instanceof Error
              ? parseError.message
              : String(parseError),
        }
      );
    }

    // Validate against schema
    const validationResult = this.getOutputSchema().safeParse(parsedResponse);
    if (!validationResult.success) {
      throw this.createError(
        'LLM_RESPONSE_INVALID_SCHEMA',
        'LLM response does not match expected schema',
        { response: parsedResponse, errors: validationResult.error.errors }
      );
    }

    return validationResult.data;
  }

  private async updatePlaneIssueAsync(
    projectId: string,
    issueId: string,
    estimation: FeatureEstimatorOutput,
    logger: Logger
  ): Promise<void> {
    try {
      await this.updatePlaneIssue(projectId, issueId, estimation);
      logger.info('Successfully updated Plane issue');
    } catch (error) {
      logger.error(
        'Failed to update Plane issue (non-blocking)',
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  private buildEstimationPrompt(input: FeatureEstimatorInput): string {
    const title = this.sanitizeInput(input.title);
    const description = this.sanitizeInput(input.description);
    const labels =
      input.labels?.map((label) => this.sanitizeInput(label)).join(', ') ||
      'None';

    return this.promptLoader.processPrompt('estimation.md', {
      title,
      description,
      labels,
    });
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
${estimation.technicalConsiderations.map((tc) => `- ${tc}`).join('\n')}

### Dependencies
${estimation.dependencies.map((dep) => `- ${dep}`).join('\n')}

### Risks
${estimation.risks.map((risk) => `- ⚠️ ${risk}`).join('\n')}

---
*Estimated by ${AGENT_NAME} v${AGENT_VERSION}*`;
  }

  private complexityToPoints(
    complexity: FeatureEstimatorOutput['complexity']
  ): number {
    return COMPLEXITY_POINTS[complexity];
  }
}
