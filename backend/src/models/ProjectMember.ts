import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ProjectMemberRole } from '../types/api.types';
import { User } from './User';
import { Project } from './Project';

@Table({
  tableName: 'project_members',
  timestamps: true,
  underscored: true,
  indexes: [{ unique: true, fields: ['project_id', 'user_id'] }],
})
export class ProjectMember extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Project)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare project_id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Default('engineer')
  @Column(DataType.ENUM('engineer', 'manager', 'viewer'))
  declare role: ProjectMemberRole;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  declare joined_at: Date;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => Project)
  declare project: Project;

  @BelongsTo(() => User)
  declare user: User;
}
