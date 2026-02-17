/** Simulation phase timing (milliseconds) */
export const TIMING = {
  PHASE_1_PLANNING_START: 600,
  PHASE_1_STEP_2: 800,
  PHASE_1_COMPLETE: 600,
  PHASE_2_METHOD_SELECTION: 400,
  PHASE_3_EXECUTION_START: 600,
  PHASE_3_STREAM_INTERVAL: 50,
  PHASE_4_RESULTS: 400,
  /** Plan approval flow — extra steps for complex queries */
  PHASE_PLAN_EVAL: 600,
  PHASE_PLAN_DESIGN: 800,
  PHASE_PLAN_SHOW: 400,
} as const;

/** API configuration */
export const API_CONFIG = {
  MODEL: 'claude-3-haiku-20240307',
  MAX_TOKENS: 4096,
} as const;
