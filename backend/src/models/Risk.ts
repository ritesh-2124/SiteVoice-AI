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
import { RiskSeverity, RiskCategory, RiskStatus } from '../types/api.types';
import { Project } from './Project';
import { ProgressReport } from './ProgressReport';
import { User } from './User';

@Table({ tableName: 'risks', timestamps: true, underscored: true })
export class Risk extends Model {
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

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare reported_by: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare title: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @AllowNull(false)
  @Default('medium')
  @Column(DataType.ENUM('low', 'medium', 'high', 'critical'))
  declare severity: RiskSeverity;

  @AllowNull(false)
  @Default('safety')
  @Column(DataType.ENUM('safety', 'quality', 'schedule', 'cost', 'environmental'))
  declare category: RiskCategory;

  @AllowNull(false)
  @Default('open')
  @Column(DataType.ENUM('open', 'mitigated', 'closed'))
  declare status: RiskStatus;

  @Column(DataType.TEXT)
  declare mitigation: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => Project)
  declare project: Project;

  @BelongsTo(() => ProgressReport, 'report_id')
  declare report: ProgressReport;

  @BelongsTo(() => User, 'reported_by')
  declare reporter: User;
}
