export interface DetectorResult {
  passed: boolean;
  score: number;
  method: string;
}

export interface HumanizerMeta {
  preset: string;
  attempts: number;
  ai_result?: Record<string, unknown>;
  detection_metadata?: Record<string, unknown>;
  source: string;
  fallback: boolean;
  error?: string;
}