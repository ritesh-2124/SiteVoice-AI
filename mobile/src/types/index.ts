export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'site_engineer' | 'project_manager' | 'admin';
  phone?: string;
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  code: string;
  description?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed';
  created_by: string;
  creator?: { id: string; first_name: string; last_name: string };
  members?: ProjectMember[];
  created_at: string;
}

export interface ProjectMember {
  id: string;
  project_id: string;
  user_id: string;
  role: 'engineer' | 'manager' | 'viewer';
  user?: User;
}

export interface AudioUpload {
  id: string;
  project_id: string;
  file_name: string;
  file_size: number;
  duration?: number;
  status: 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  transcript?: VoiceTranscript;
  created_at: string;
}

export interface VoiceTranscript {
  id: string;
  audio_upload_id: string;
  raw_transcript: string;
  edited_transcript?: string;
  confidence?: number;
  language: string;
  is_edited: boolean;
  status: 'pending' | 'completed' | 'failed';
  progress_report?: ProgressReport;
}

export interface ProgressReport {
  id: string;
  project_id: string;
  block_name?: string;
  floor_number?: string;
  activity?: string;
  completion_percentage?: number;
  worker_count?: number;
  material_usage?: { material: string; quantity: string; unit: string }[];
  weather_condition?: string;
  report_date: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  extracted_data?: Record<string, unknown>;
  project?: Project;
  user?: User;
  created_at: string;
}

export interface Risk {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  status: 'open' | 'mitigated' | 'closed';
  project?: Project;
}

export interface Activity {
  id: string;
  project_id: string;
  name: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
  completion_percentage: number;
  project?: Project;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
  errors?: unknown;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface DashboardOverview {
  stats: {
    total_projects: number;
    total_reports: number;
    open_risks: number;
  };
  recent_reports: ProgressReport[];
}
