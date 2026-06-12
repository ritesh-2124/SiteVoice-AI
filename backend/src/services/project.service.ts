import { Op } from 'sequelize';
import { Project } from '../models/Project';
import { ProjectMember } from '../models/ProjectMember';
import { User } from '../models/User';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import type { CreateProjectInput, UpdateProjectInput, AddMemberInput } from '../validators/project.validator';
import logger from '../utils/logger';

export class ProjectService {
  async list(userId: string, role: string) {
    if (role === 'admin') {
      return Project.findAll({
        include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }],
        order: [['created_at', 'DESC']],
      });
    }

    const memberProjects = await ProjectMember.findAll({
      where: { user_id: userId },
      attributes: ['project_id'],
    });

    const projectIds = memberProjects.map((m) => m.project_id);

    return Project.findAll({
      where: {
        [Op.or]: [{ id: { [Op.in]: projectIds } }, { created_by: userId }],
      },
      include: [{ model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name'] }],
      order: [['created_at', 'DESC']],
    });
  }

  async getById(id: string, userId: string, role: string) {
    const project = await Project.findByPk(id, {
      include: [
        { model: User, as: 'creator', attributes: ['id', 'first_name', 'last_name', 'email'] },
        {
          model: ProjectMember,
          include: [{ model: User, attributes: ['id', 'first_name', 'last_name', 'email', 'role'] }],
        },
      ],
    });

    if (!project) throw new NotFoundError('Project not found');

    if (role !== 'admin') {
      const isMember = project.members?.some((m) => m.user_id === userId);
      if (!isMember && project.created_by !== userId) {
        throw new ForbiddenError('Not a member of this project');
      }
    }

    return project;
  }

  async create(data: CreateProjectInput, userId: string) {
    const project = await Project.create({ ...data, created_by: userId });

    // Add creator as a manager member
    await ProjectMember.create({
      project_id: project.id,
      user_id: userId,
      role: 'manager',
    });

    logger.info(`Project created: ${project.name} (${project.code})`);
    return project;
  }

  async update(id: string, data: UpdateProjectInput) {
    const project = await Project.findByPk(id);
    if (!project) throw new NotFoundError('Project not found');

    await project.update(data);
    logger.info(`Project updated: ${project.name}`);
    return project;
  }

  async delete(id: string) {
    const project = await Project.findByPk(id);
    if (!project) throw new NotFoundError('Project not found');

    await project.destroy();
    logger.info(`Project deleted: ${project.name}`);
  }

  async addMember(projectId: string, data: AddMemberInput) {
    const project = await Project.findByPk(projectId);
    if (!project) throw new NotFoundError('Project not found');

    const user = await User.findByPk(data.user_id);
    if (!user) throw new NotFoundError('User not found');

    const existing = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: data.user_id },
    });

    if (existing) {
      await existing.update({ role: data.role });
      return existing;
    }

    return ProjectMember.create({
      project_id: projectId,
      user_id: data.user_id,
      role: data.role,
    });
  }

  async removeMember(projectId: string, userId: string) {
    const member = await ProjectMember.findOne({
      where: { project_id: projectId, user_id: userId },
    });
    if (!member) throw new NotFoundError('Member not found');

    await member.destroy();
  }
}

export const projectService = new ProjectService();
