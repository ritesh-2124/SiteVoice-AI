import { Response, NextFunction } from 'express';
import { projectService } from '../services/project.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { AuthRequest } from '../types/api.types';

export class ProjectController {
  async list(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projects = await projectService.list(req.user!.id, req.user!.role);
      sendSuccess(res, projects);
    } catch (err) { next(err); }
  }

  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getById(req.params.id!, req.user!.id, req.user!.role);
      sendSuccess(res, project);
    } catch (err) { next(err); }
  }

  async create(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.create(req.body, req.user!.id);
      sendCreated(res, project);
    } catch (err) { next(err); }
  }

  async update(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const project = await projectService.update(req.params.id!, req.body);
      sendSuccess(res, project);
    } catch (err) { next(err); }
  }

  async delete(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.delete(req.params.id!);
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const member = await projectService.addMember(req.params.id!, req.body);
      sendCreated(res, member);
    } catch (err) { next(err); }
  }

  async removeMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await projectService.removeMember(req.params.id!, req.params.userId!);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}

export const projectController = new ProjectController();
