export const API_URL = __DEV__
  ? 'http://localhost:3001/api/v1'  // Android emulator
  : 'http://localhost:3001/api/v1';

export const APP_NAME = 'SiteVoice AI';
export const APP_VERSION = '1.0.0';

export const ROLES = {
  SITE_ENGINEER: 'site_engineer',
  PROJECT_MANAGER: 'project_manager',
  ADMIN: 'admin',
} as const;

export const REPORT_STATUS = {
  DRAFT: 'draft',
  SUBMITTED: 'submitted',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const AUDIO_CONFIG = {
  MAX_DURATION_MS: 10 * 60 * 1000, // 10 minutes
  MAX_FILE_SIZE: 25 * 1024 * 1024,  // 25MB
} as const;
