import { Mastra } from '@mastra/core';
import { z } from 'zod';
import type { AgentCapability, AgentResult, AgentError } from './types.js';

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
  capabilities: AgentCapability[];
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

  protected createError(code: string, message: string, details?: Record<string, unknown>): AgentError {
    return { code, message, details };
  }

  async run(input: unknown): Promise<AgentResult> {
    const startTime = Date.now();
    const timestamp = new Date();
    
    try {
      // Validate input
      const validatedInput = this.getInputSchema().parse(input);
      
      console.log(`[${this.config.name}] Starting execution...`);
      
      // Execute agent logic
      const result = await this.execute(validatedInput);
      
      // Validate output
      const validatedOutput = this.getOutputSchema().parse(result);
      
      const duration = Date.now() - startTime;
      console.log(`[${this.config.name}] Execution completed successfully in ${duration}ms`);
      
      return {
        success: true,
        data: validatedOutput,
        duration,
        timestamp,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const agentError = error instanceof z.ZodError
        ? this.createError('VALIDATION_ERROR', 'Input/output validation failed', { zodError: error.errors })
        : error instanceof Error
        ? this.createError('EXECUTION_ERROR', error.message, { stack: error.stack })
        : this.createError('UNKNOWN_ERROR', 'An unknown error occurred', { error });
      
      console.error(`[${this.config.name}] Execution failed in ${duration}ms:`, agentError);
      
      return {
        success: false,
        error: agentError,
        duration,
        timestamp,
      };
    }
  }

  getInfo(): AgentConfig {
    return this.config;
  }
}