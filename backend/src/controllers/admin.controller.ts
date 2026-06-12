import { Response, NextFunction } from 'express';
import { User } from '../models/User';
import { sendSuccess, sendNoContent, getPaginationParams } from '../utils/response';
import { NotFoundError } from '../utils/errors';
import { AuthRequest } from '../types/api.types';
import { auditLogService } from '../services/auditLog.service';

export class AdminController {
  async listUsers(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { offset, limit, page } = getPaginationParams(req.query as Record<string, string>);
      const { rows, count } = await User.findAndCountAll({
        attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
        order: [['created_at', 'DESC']],
        limit,
        offset,
      });
      sendSuccess(res, rows, 'Success', 200, { page, limit, total: count, totalPages: Math.ceil(count / limit) });
    } catch (err) { next(err); }
  }

  async updateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findByPk(req.params.id!);
      if (!user) throw new NotFoundError('User not found');
      const { first_name, last_name, phone, is_active } = req.body;
      await user.update({ first_name, last_name, phone, is_active });
      sendSuccess(res, user.toSafeJSON(), 'User updated');
    } catch (err) { next(err); }
  }

  async deactivateUser(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findByPk(req.params.id!);
      if (!user) throw new NotFoundError('User not found');
      await user.update({ is_active: false });
      sendNoContent(res);
    } catch (err) { next(err); }
  }

  async changeUserRole(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await User.findByPk(req.params.id!);
      if (!user) throw new NotFoundError('User not found');
      await user.update({ role: req.body.role });
      sendSuccess(res, user.toSafeJSON(), 'Role updated');
    } catch (err) { next(err); }
  }

  async auditLogs(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '50', 10);
      const { rows, count } = await auditLogService.list(page, limit);
      sendSuccess(res, rows, 'Success', 200, { page, limit, total: count, totalPages: Math.ceil(count / limit) });
    } catch (err) { next(err); }
  }
}

export const adminController = new AdminController();
