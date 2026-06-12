import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ReportStatus } from '../types/api.types';
import { Project } from './Project';
import { VoiceTranscript } from './VoiceTranscript';
import { User } from './User';
import { Activity } from './Activity';
import { Risk } from './Risk';

@Table({ tableName: 'progress_reports', timestamps: true, underscored: true })
export class ProgressReport extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => Project)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare project_id: string;

  @ForeignKey(() => VoiceTranscript)
  @Column(DataType.UUID)
  declare transcript_id: string | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @Column(DataType.STRING(100))
  declare block_name: string | null;

  @Column(DataType.STRING(50))
  declare floor_number: string | null;

  @Column(DataType.STRING(255))
  declare activity: string | null;

  @Column(DataType.FLOAT)
  declare completion_percentage: number | null;

  @Column(DataType.INTEGER)
  declare worker_count: number | null;

  @Column(DataType.JSONB)
  declare material_usage: Record<string, unknown>[] | null;

  @Column(DataType.STRING(100))
  declare weather_condition: string | null;

  @AllowNull(false)
  @Column(DataType.DATEONLY)
  declare report_date: string;

  @Column(DataType.TIME)
  declare start_time: string | null;

  @Column(DataType.TIME)
  declare end_time: string | null;

  @Column(DataType.TEXT)
  declare notes: string | null;

  @AllowNull(false)
  @Default('draft')
  @Column(DataType.ENUM('draft', 'submitted', 'approved', 'rejected'))
  declare status: ReportStatus;

  @Column(DataType.JSONB)
  declare extracted_data: Record<string, unknown> | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare approved_by: string | null;

  @Column(DataType.DATE)
  declare approved_at: Date | null;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare rejected_by: string | null;

  @Column(DataType.DATE)
  declare rejected_at: Date | null;

  @Column(DataType.TEXT)
  declare rejection_reason: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => Project)
  declare project: Project;

  @BelongsTo(() => VoiceTranscript, 'transcript_id')
  declare transcript: VoiceTranscript;

  @BelongsTo(() => User)
  declare user: User;

  @HasMany(() => Activity)
  declare report_activities: Activity[];

  @HasMany(() => Risk)
  declare report_risks: Risk[];
}
