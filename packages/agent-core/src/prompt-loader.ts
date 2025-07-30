/**
 * Prompt loading utility for agents
 *
 * Loads and processes prompt templates from markdown files,
 * enabling easy editing by human developers.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

export interface PromptVariables {
  [key: string]: string | undefined;
}

export class PromptLoader {
  private promptsDir: string;

  constructor(agentDir: string) {
    this.promptsDir = join(agentDir, 'prompts');
  }

  /**
   * Load a prompt template from a markdown file
   */
  loadPrompt(filename: string): string {
    const filepath = join(this.promptsDir, filename);
    try {
      return readFileSync(filepath, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to load prompt file: ${filepath}. ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  /**
   * Load and process a prompt template with variable substitution
   */
  processPrompt(filename: string, variables: PromptVariables = {}): string {
    const template = this.loadPrompt(filename);
    return this.substituteVariables(template, variables);
  }

  /**
   * Substitute {{variable}} placeholders in template
   */
  private substituteVariables(
    template: string,
    variables: PromptVariables
  ): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = variables[variableName];
      if (value === undefined) {
        console.warn(
          `Prompt variable '${variableName}' not provided, leaving placeholder`
        );
        return match;
      }
      return value;
    });
  }

  /**
   * Load system prompt
   */
  getSystemPrompt(): string {
    return this.loadPrompt('system.md');
  }
}

/**
 * Factory function to create a prompt loader for an agent
 */
export function createPromptLoader(agentDir: string): PromptLoader {
  return new PromptLoader(agentDir);
}
