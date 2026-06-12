import { Response, NextFunction } from 'express';
import { reportService } from '../services/report.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/api.types';

export class ReportController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { reports, meta } = await reportService.list(req.query as Record<string, string>);
      sendSuccess(res, reports, 'Success', 200, meta);
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.getById(req.params.id!);
      sendSuccess(res, report);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.update(req.params.id!, req.body);
      sendSuccess(res, report, 'Report updated');
    } catch (err) { next(err); }
  }

  async submit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.submit(req.params.id!);
      sendSuccess(res, report, 'Report submitted');
    } catch (err) { next(err); }
  }

  async approve(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.approve(req.params.id!, req.user!.id);
      sendSuccess(res, report, 'Report approved');
    } catch (err) { next(err); }
  }

  async reject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const report = await reportService.reject(req.params.id!, req.user!.id, req.body.reason);
      sendSuccess(res, report, 'Report rejected');
    } catch (err) { next(err); }
  }

  async daily(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id, date } = req.query as Record<string, string>;
      const reports = await reportService.getDailyReport(project_id, date || new Date().toISOString().split('T')[0]!);
      sendSuccess(res, reports);
    } catch (err) { next(err); }
  }

  async weekly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id, start_date, end_date } = req.query as Record<string, string>;
      const reports = await reportService.getAggregatedReport(project_id, start_date, end_date);
      sendSuccess(res, reports);
    } catch (err) { next(err); }
  }

  async monthly(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id, start_date, end_date } = req.query as Record<string, string>;
      const reports = await reportService.getAggregatedReport(project_id, start_date, end_date);
      sendSuccess(res, reports);
    } catch (err) { next(err); }
  }

  async aiSummary(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { project_id, date } = req.query as Record<string, string>;
      const summary = await reportService.generateAISummary(project_id, date || new Date().toISOString().split('T')[0]!);
      sendSuccess(res, summary);
    } catch (err) { next(err); }
  }
}

export const reportController = new ReportController();
