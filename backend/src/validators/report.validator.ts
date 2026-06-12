import { z } from 'zod';

export const updateReportSchema = z.object({
  block_name: z.string().max(100).optional(),
  floor_number: z.string().max(50).optional(),
  activity: z.string().max(255).optional(),
  completion_percentage: z.number().min(0).max(100).optional(),
  worker_count: z.number().int().min(0).optional(),
  material_usage: z.array(z.record(z.unknown())).optional(),
  weather_condition: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
});

export const reportFilterSchema = z.object({
  project_id: z.string().uuid().optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  status: z.enum(['draft', 'submitted', 'approved', 'rejected']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type UpdateReportInput = z.infer<typeof updateReportSchema>;
export type ReportFilterInput = z.infer<typeof reportFilterSchema>;
