/**
 * Structured data extracted by Gemini from construction site transcripts
 */
export interface ExtractedProgressData {
  block_name: string | null;
  floor_number: string | null;
  activity: string | null;
  completion_percentage: number | null;
  worker_count: number | null;
  start_time: string | null;
  end_time: string | null;
  material_usage: MaterialUsage[];
  weather_condition: string | null;
  issues: ExtractedIssue[];
  safety_incidents: SafetyIncident[];
  notes: string | null;
  report_date: string | null;
}

export interface MaterialUsage {
  material: string;
  quantity: string;
  unit: string;
}

export interface ExtractedIssue {
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
}

export interface SafetyIncident {
  description: string;
  severity: string;
}

/**
 * Whisper API response
 */
export interface WhisperResponse {
  text: string;
  language?: string;
  duration?: number;
  segments?: WhisperSegment[];
}

export interface WhisperSegment {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  avg_logprob: number;
  no_speech_prob: number;
}
