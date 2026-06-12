import { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export interface AuthRequest extends Request<{ [key: string]: string }> {
  user?: AuthUser;
}

export type UserRole = 'site_engineer' | 'project_manager' | 'admin';

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed';

export type ProjectMemberRole = 'engineer' | 'manager' | 'viewer';

export type AudioUploadStatus = 'uploading' | 'uploaded' | 'processing' | 'completed' | 'failed';

export type TranscriptStatus = 'pending' | 'completed' | 'failed';

export type ReportStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export type ActivityStatus = 'not_started' | 'in_progress' | 'completed' | 'delayed';

export type RiskSeverity = 'low' | 'medium' | 'high' | 'critical';

export type RiskCategory = 'safety' | 'quality' | 'schedule' | 'cost' | 'environmental';

export type RiskStatus = 'open' | 'mitigated' | 'closed';

export type NotificationType = 'info' | 'warning' | 'alert' | 'report';
