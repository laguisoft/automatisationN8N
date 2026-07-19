export type LogLevel = 'info' | 'warn' | 'error';

export type PipelineStage =
  | 'search'
  | 'extraction'
  | 'cleaning'
  | 'dedup'
  | 'analysis'
  | 'scoring'
  | 'contacts'
  | 'database'
  | 'validation'
  | 'message'
  | 'send';

export type PipelineRunStatus = 'running' | 'success' | 'failed' | 'partial';

export interface PipelineRun {
  id: string;
  startedAt: Date;
  finishedAt: Date | null;
  status: PipelineRunStatus;
  prospectsFound: number;
  prospectsNew: number;
  prospectsValidated: number;
  messagesSent: number;
  errorsCount: number;
  triggeredBy: string;
}

export interface ExecutionLogEntry {
  runId: string;
  stage: PipelineStage;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  durationMs?: number;
}
