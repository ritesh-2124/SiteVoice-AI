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
import { ActivityStatus } from '../types/api.types';
import { Project } from './Project';
import { ProgressReport } from './ProgressReport';

@Table({ tableName: 'activities', timestamps: true, underscored: true })
export class Activity extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Project)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare project_id: string;

  @ForeignKey(() => ProgressReport)
  @Column(DataType.UUID)
  declare report_id: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Default('not_started')
  @Column(DataType.ENUM('not_started', 'in_progress', 'completed', 'delayed'))
  declare status: ActivityStatus;

  @Default(0)
  @Column(DataType.FLOAT)
  declare completion_percentage: number;

  @Column(DataType.DATEONLY)
  declare planned_date: string | null;

  @Column(DataType.DATEONLY)
  declare actual_date: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => Project)
  declare project: Project;

  @BelongsTo(() => ProgressReport, 'report_id')
  declare report: ProgressReport;
}
