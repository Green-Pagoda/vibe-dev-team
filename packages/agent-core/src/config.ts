/**
 * Configuration management for agents
 *
 * Provides type-safe configuration loading with validation
 * and environment variable support.
 */

import { z } from 'zod';

// Base configuration schema that all agents extend
export const BaseConfigSchema = z.object({
  // Plane configuration
  plane: z.object({
    apiKey: z.string().min(1, 'Plane API key is required'),
    workspaceSlug: z.string().min(1, 'Plane workspace slug is required'),
    apiHostUrl: z.string().url().optional(),
  }),

  // LLM configuration
  llm: z.object({
    provider: z.enum(['openai', 'anthropic', 'local']).default('openai'),
    model: z.string().default('gpt-4'),
    temperature: z.number().min(0).max(2).default(0.7),
    maxTokens: z.number().positive().default(2000),
  }),

  // Agent behavior
  agent: z.object({
    timeout: z.number().positive().default(30000), // 30 seconds
    retries: z.number().min(0).max(5).default(3),
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  }),
});

export type BaseConfig = z.infer<typeof BaseConfigSchema>;

export interface ConfigOptions {
  envPrefix?: string;
  configFile?: string;
}

export class ConfigError extends Error {
  constructor(
    message: string,
    public validationErrors?: z.ZodError
  ) {
    super(message);
    this.name = 'ConfigError';
  }
}

/**
 * Configuration loader with environment variable support
 */
export class ConfigLoader<T extends BaseConfig = BaseConfig> {
  private schema: z.ZodSchema<T>;
  private envPrefix: string;

  constructor(schema: z.ZodSchema<T>, options: ConfigOptions = {}) {
    this.schema = schema;
    this.envPrefix = options.envPrefix || 'VIBE_';
  }

  /**
   * Load and validate configuration from environment variables
   */
  loadFromEnv(): T {
    const config = {
      plane: {
        apiKey: this.getEnvVar('PLANE_API_KEY'),
        workspaceSlug: this.getEnvVar('PLANE_WORKSPACE_SLUG'),
        apiHostUrl: this.getEnvVar('PLANE_API_HOST_URL'),
      },
      llm: {
        provider: this.getEnvVar('LLM_PROVIDER'),
        model: this.getEnvVar('LLM_MODEL'),
        temperature: this.getEnvNumber('LLM_TEMPERATURE'),
        maxTokens: this.getEnvNumber('LLM_MAX_TOKENS'),
      },
      agent: {
        timeout: this.getEnvNumber('AGENT_TIMEOUT'),
        retries: this.getEnvNumber('AGENT_RETRIES'),
        logLevel: this.getEnvVar('AGENT_LOG_LEVEL'),
      },
    };

    return this.validateConfig(config);
  }

  /**
   * Load configuration from object with environment variable fallbacks
   */
  load(config: Partial<T> = {}): T {
    const envConfig = this.loadFromEnv();
    const mergedConfig = this.deepMerge(envConfig, config);
    return this.validateConfig(mergedConfig);
  }

  private getEnvVar(key: string): string | undefined {
    return process.env[`${this.envPrefix}${key}`] || process.env[key];
  }

  private getEnvNumber(key: string): number | undefined {
    const value = this.getEnvVar(key);
    return value ? Number(value) : undefined;
  }

  private validateConfig(config: unknown): T {
    const result = this.schema.safeParse(config);
    if (!result.success) {
      throw new ConfigError('Configuration validation failed', result.error);
    }
    return result.data;
  }

  private deepMerge(target: any, source: any): any {
    const result = { ...target };

    for (const key in source) {
      if (source[key] !== undefined && source[key] !== null) {
        if (typeof source[key] === 'object' && !Array.isArray(source[key])) {
          result[key] = this.deepMerge(result[key] || {}, source[key]);
        } else {
          result[key] = source[key];
        }
      }
    }

    return result;
  }
}

// Factory function for creating configuration loaders
export function createConfigLoader<T extends BaseConfig = BaseConfig>(
  schema: z.ZodSchema<T> = BaseConfigSchema as z.ZodSchema<T>,
  options: ConfigOptions = {}
): ConfigLoader<T> {
  return new ConfigLoader(schema, options);
}

// Default configuration loader
export const defaultConfigLoader = createConfigLoader();
