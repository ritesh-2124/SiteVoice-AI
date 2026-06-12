import { Notification } from '../models/Notification';
import logger from '../utils/logger';

export class NotificationService {
  async create(userId: string, title: string, message: string, type: 'info' | 'warning' | 'alert' | 'report' = 'info', data?: Record<string, unknown>) {
    return Notification.create({ user_id: userId, title, message, type, data });
  }

  async listForUser(userId: string, unreadOnly = false) {
    const where: Record<string, unknown> = { user_id: userId };
    if (unreadOnly) where.is_read = false;
    return Notification.findAll({ where, order: [['created_at', 'DESC']], limit: 50 });
  }

  async markAsRead(id: string) {
    const notification = await Notification.findByPk(id);
    if (notification) await notification.update({ is_read: true, read_at: new Date() });
  }

  async markAllAsRead(userId: string) {
    await Notification.update({ is_read: true, read_at: new Date() }, { where: { user_id: userId, is_read: false } });
  }
}

export const notificationService = new NotificationService();
