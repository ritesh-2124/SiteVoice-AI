import api from './api';
import type { ApiResponse, LoginResponse, User } from '../types';

export const authApi = {
  register: (data: { first_name: string; last_name: string; email: string; password: string; phone?: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/register', data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiResponse<LoginResponse>>('/auth/login', data),

  logout: (refresh_token: string) =>
    api.post('/auth/logout', { refresh_token }),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  resetPassword: (token: string, password: string) =>
    api.post('/auth/reset-password', { token, password }),

  changePassword: (current_password: string, new_password: string) =>
    api.put('/auth/change-password', { current_password, new_password }),

  getProfile: () =>
    api.get<ApiResponse<User>>('/auth/me'),
};

export const projectApi = {
  list: () => api.get<ApiResponse<any[]>>('/projects'),
  getById: (id: string) => api.get<ApiResponse<any>>(`/projects/${id}`),
  create: (data: any) => api.post<ApiResponse<any>>('/projects', data),
  update: (id: string, data: any) => api.put<ApiResponse<any>>(`/projects/${id}`, data),
  addMember: (projectId: string, data: any) => api.post(`/projects/${projectId}/members`, data),
  removeMember: (projectId: string, userId: string) => api.delete(`/projects/${projectId}/members/${userId}`),
};

export const voiceApi = {
  upload: (formData: FormData) =>
    api.post<ApiResponse<any>>('/voice/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    }),
  listUploads: (projectId?: string) =>
    api.get<ApiResponse<any[]>>('/voice/uploads', { params: { project_id: projectId } }),
  getUpload: (id: string) => api.get<ApiResponse<any>>(`/voice/uploads/${id}`),
  process: (id: string) => api.post<ApiResponse<any>>(`/voice/uploads/${id}/process`),
};

export const transcriptApi = {
  getById: (id: string) => api.get<ApiResponse<any>>(`/transcripts/${id}`),
  edit: (id: string, edited_transcript: string) => api.put(`/transcripts/${id}`, { edited_transcript }),
  reprocess: (id: string) => api.post(`/transcripts/${id}/reprocess`),
};

export const reportApi = {
  list: (params?: Record<string, string>) => api.get<ApiResponse<any[]>>('/reports', { params }),
  getById: (id: string) => api.get<ApiResponse<any>>(`/reports/${id}`),
  update: (id: string, data: any) => api.put(`/reports/${id}`, data),
  submit: (id: string) => api.post(`/reports/${id}/submit`),
  approve: (id: string) => api.post(`/reports/${id}/approve`),
  reject: (id: string, reason?: string) => api.post(`/reports/${id}/reject`, { reason }),
  daily: (projectId: string, date?: string) =>
    api.get('/reports/daily', { params: { project_id: projectId, date } }),
  aiSummary: (projectId: string, date?: string) =>
    api.get('/reports/ai-summary', { params: { project_id: projectId, date } }),
};

export const dashboardApi = {
  overview: () => api.get<ApiResponse<any>>('/dashboard/overview'),
  projectProgress: (id: string) => api.get(`/dashboard/projects/${id}/progress`),
  risks: (projectId?: string) => api.get('/dashboard/risks', { params: { project_id: projectId } }),
  activities: (projectId?: string) => api.get('/dashboard/activities', { params: { project_id: projectId } }),
  timeline: (projectId?: string) => api.get('/dashboard/timeline', { params: { project_id: projectId } }),
};

export const adminApi = {
  listUsers: (params?: Record<string, string>) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  changeRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  deactivateUser: (id: string) => api.delete(`/admin/users/${id}`),
};
