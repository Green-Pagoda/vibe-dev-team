import { Mastra } from '@mastra/core';
import { z } from 'zod';

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  capabilities: string[];
}

export abstract class BaseAgent {
  protected mastra: Mastra;
  protected config: AgentConfig;

  constructor(config: AgentConfig, mastra: Mastra) {
    this.config = config;
    this.mastra = mastra;
  }

  abstract getInputSchema(): z.ZodSchema;
  abstract getOutputSchema(): z.ZodSchema;
  abstract execute(input: unknown): Promise<unknown>;

  async run(input: unknown): Promise<unknown> {
    // Validate input
    const validatedInput = this.getInputSchema().parse(input);
    
    console.log(`[${this.config.name}] Starting execution...`);
    
    try {
      // Execute agent logic
      const result = await this.execute(validatedInput);
      
      // Validate output
      const validatedOutput = this.getOutputSchema().parse(result);
      
      console.log(`[${this.config.name}] Execution completed successfully`);
      return validatedOutput;
    } catch (error) {
      console.error(`[${this.config.name}] Execution failed:`, error);
      throw error;
    }
  }

  getInfo(): AgentConfig {
    return this.config;
  }
}