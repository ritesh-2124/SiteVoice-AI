import { AuditLog } from '../models/AuditLog';

export class AuditLogService {
  async log(params: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    oldValues?: Record<string, unknown>;
    newValues?: Record<string, unknown>;
    ipAddress?: string;
  }) {
    return AuditLog.create({
      user_id: params.userId || null,
      action: params.action,
      entity: params.entity,
      entity_id: params.entityId || null,
      old_values: params.oldValues || null,
      new_values: params.newValues || null,
      ip_address: params.ipAddress || null,
    });
  }

  async list(page = 1, limit = 50) {
    const offset = (page - 1) * limit;
    return AuditLog.findAndCountAll({
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
  }
}

export const auditLogService = new AuditLogService();
