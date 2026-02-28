/**
 * Model Configuration Constants
 * Centralized configuration for AI models used throughout the application
 */

// Default model used for text humanization (using Gemini as primary)
export const DEFAULT_MODEL = "gemini-flash-latest";

// Fallback model used when primary model fails (OpenAI gpt-5-mini)
export const FALLBACK_MODEL = "gpt-5-mini";

// Allowed models for humanization (both Gemini and OpenAI)
export const ALLOWED_MODELS = [
  "gemini-3-flash-preview",
  "gemini-3-pro-preview",
  "gemini-flash-latest", // Deprecated: will auto-update to gemini-3-flash-preview on Jan 30, 2026
  "gemini-2.5-pro",
  "gpt-5-mini",
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-3.5-turbo",
  "llama-3.3-70b-versatile",
  "mixtral-8x7b-32768",
] as const;

// Model pricing information (per 1M tokens)
export const MODEL_PRICING = {
  "gpt-4o-mini": {
    input: 0.15,
    output: 0.60,
    description: "Cheapest option, recommended for most use cases",
  },
  "gpt-4o": {
    input: 2.50,
    output: 10.00,
    description: "Higher quality, more expensive",
  },
  "gpt-4-turbo": {
    input: 10.00,
    output: 30.00,
    description: "Premium option",
  },
  "gpt-3.5-turbo": {
    input: 0.50,
    output: 1.50,
    description: "Older model, still cost-effective",
  },
} as const;

/**
 * Validates if a model is allowed for humanization
 */
export function isAllowedModel(model: string): boolean {
  return ALLOWED_MODELS.includes(model as typeof ALLOWED_MODELS[number]);
}

/**
 * Gets the default model to use
 */
export function getDefaultModel(): string {
  return DEFAULT_MODEL;
}

/**
 * Gets the fallback model to use
 */
export function getFallbackModel(): string {
  return FALLBACK_MODEL;
}

