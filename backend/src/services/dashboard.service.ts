import { Op, fn, col, literal } from 'sequelize';
import { ProgressReport } from '../models/ProgressReport';
import { Project } from '../models/Project';
import { Risk } from '../models/Risk';
import { Activity } from '../models/Activity';
import { AudioUpload } from '../models/AudioUpload';

export class DashboardService {
  async getOverview(userId: string, role: string) {
    const projectWhere = role === 'admin' ? {} : undefined;

    const [totalProjects, totalReports, totalRisks, recentReports] = await Promise.all([
      Project.count({ where: projectWhere }),
      ProgressReport.count(),
      Risk.count({ where: { status: 'open' } }),
      ProgressReport.findAll({
        limit: 10,
        order: [['created_at', 'DESC']],
        include: [
          { model: Project, attributes: ['id', 'name', 'code'] },
        ],
        attributes: ['id', 'block_name', 'activity', 'completion_percentage', 'report_date', 'status', 'created_at'],
      }),
    ]);

    return {
      stats: {
        total_projects: totalProjects,
        total_reports: totalReports,
        open_risks: totalRisks,
      },
      recent_reports: recentReports,
    };
  }

  async getProjectProgress(projectId: string) {
    const reports = await ProgressReport.findAll({
      where: { project_id: projectId },
      attributes: ['report_date', 'block_name', 'activity', 'completion_percentage', 'worker_count'],
      order: [['report_date', 'ASC']],
    });

    const activities = await Activity.findAll({
      where: { project_id: projectId },
      order: [['created_at', 'DESC']],
    });

    return { reports, activities };
  }

  async getRisksOverview(projectId?: string) {
    const where: Record<string, unknown> = { status: 'open' };
    if (projectId) where.project_id = projectId;

    const risks = await Risk.findAll({
      where,
      include: [{ model: Project, attributes: ['id', 'name'] }],
      order: [
        [literal("CASE severity WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END"), 'ASC'],
      ],
    });

    return risks;
  }

  async getPendingActivities(projectId?: string) {
    const where: Record<string, unknown> = {
      status: { [Op.in]: ['not_started', 'in_progress', 'delayed'] },
    };
    if (projectId) where.project_id = projectId;

    return Activity.findAll({
      where,
      include: [{ model: Project, attributes: ['id', 'name'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async getTimeline(projectId?: string, limit = 20) {
    const where: Record<string, unknown> = {};
    if (projectId) where.project_id = projectId;

    return ProgressReport.findAll({
      where,
      include: [
        { model: Project, attributes: ['id', 'name', 'code'] },
      ],
      attributes: ['id', 'block_name', 'activity', 'completion_percentage', 'report_date', 'created_at'],
      order: [['created_at', 'DESC']],
      limit,
    });
  }
}

export const dashboardService = new DashboardService();
