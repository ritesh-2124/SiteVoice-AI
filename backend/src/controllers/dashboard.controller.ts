import { Response, NextFunction } from 'express';
import { dashboardService } from '../services/dashboard.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/api.types';

export class DashboardController {
  async overview(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getOverview(req.user!.id, req.user!.role);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async projectProgress(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getProjectProgress(req.params.id!);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async risks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getRisksOverview(req.query.project_id as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async activities(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getPendingActivities(req.query.project_id as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  async timeline(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getTimeline(req.query.project_id as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}

export const dashboardController = new DashboardController();
