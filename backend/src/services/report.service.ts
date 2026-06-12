import { Op } from 'sequelize';
import { ProgressReport } from '../models/ProgressReport';
import { Project } from '../models/Project';
import { User } from '../models/User';
import { VoiceTranscript } from '../models/VoiceTranscript';
import { Activity } from '../models/Activity';
import { Risk } from '../models/Risk';
import { NotFoundError } from '../utils/errors';
import { geminiService } from './gemini.service';
import { getPaginationParams, PaginationMeta } from '../utils/response';
import logger from '../utils/logger';

export class ReportService {
  async list(filters: {
    project_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: string;
    limit?: string;
  }) {
    const where: Record<string, unknown> = {};
    if (filters.project_id) where.project_id = filters.project_id;
    if (filters.status) where.status = filters.status;
    if (filters.start_date || filters.end_date) {
      where.report_date = {};
      if (filters.start_date) (where.report_date as Record<string, unknown>)[Op.gte as unknown as string] = filters.start_date;
      if (filters.end_date) (where.report_date as Record<string, unknown>)[Op.lte as unknown as string] = filters.end_date;
    }

    const { offset, limit, page } = getPaginationParams(filters);
    const { rows, count } = await ProgressReport.findAndCountAll({
      where,
      include: [
        { model: Project, attributes: ['id', 'name', 'code'] },
        { model: User, attributes: ['id', 'first_name', 'last_name'] },
      ],
      order: [['report_date', 'DESC'], ['created_at', 'DESC']],
      limit,
      offset,
    });

    const meta: PaginationMeta = { page, limit, total: count, totalPages: Math.ceil(count / limit) };
    return { reports: rows, meta };
  }

  async getById(id: string) {
    const report = await ProgressReport.findByPk(id, {
      include: [
        { model: Project, attributes: ['id', 'name', 'code'] },
        { model: User, attributes: ['id', 'first_name', 'last_name'] },
        { model: VoiceTranscript },
        { model: Activity },
        { model: Risk },
      ],
    });
    if (!report) throw new NotFoundError('Report not found');
    return report;
  }

  async update(id: string, data: Record<string, unknown>) {
    const report = await ProgressReport.findByPk(id);
    if (!report) throw new NotFoundError('Report not found');
    await report.update(data);
    return report;
  }

  async submit(id: string) {
    const report = await ProgressReport.findByPk(id);
    if (!report) throw new NotFoundError('Report not found');
    await report.update({ status: 'submitted' });
    return report;
  }

  async approve(id: string, userId: string) {
    const report = await ProgressReport.findByPk(id);
    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'submitted') {
      throw new Error(`Cannot approve a report with status '${report.status}'. Only submitted reports can be approved.`);
    }
    await report.update({
      status: 'approved',
      approved_by: userId,
      approved_at: new Date(),
    });
    return report;
  }

  async reject(id: string, userId: string, reason?: string) {
    const report = await ProgressReport.findByPk(id);
    if (!report) throw new NotFoundError('Report not found');
    if (report.status !== 'submitted') {
      throw new Error(`Cannot reject a report with status '${report.status}'. Only submitted reports can be rejected.`);
    }
    await report.update({
      status: 'rejected',
      rejected_by: userId,
      rejected_at: new Date(),
      rejection_reason: reason || null,
    });
    return report;
  }

  async getDailyReport(projectId: string, date: string) {
    const reports = await ProgressReport.findAll({
      where: { project_id: projectId, report_date: date },
      include: [
        { model: User, attributes: ['id', 'first_name', 'last_name'] },
        { model: Activity },
        { model: Risk },
      ],
      order: [['created_at', 'ASC']],
    });
    return reports;
  }

  async getAggregatedReport(projectId: string, startDate: string, endDate: string) {
    const reports = await ProgressReport.findAll({
      where: {
        project_id: projectId,
        report_date: { [Op.between]: [startDate, endDate] },
      },
      include: [{ model: Activity }, { model: Risk }],
      order: [['report_date', 'ASC']],
    });
    return reports;
  }

  async generateAISummary(projectId: string, date: string) {
    const reports = await this.getDailyReport(projectId, date);
    const reportsData = reports.map((r) => r.toJSON());
    const summary = await geminiService.generateSummary(reportsData as Record<string, unknown>[]);
    return { date, summary, report_count: reports.length };
  }
}

export const reportService = new ReportService();
