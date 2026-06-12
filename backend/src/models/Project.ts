import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  HasMany,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { ProjectStatus } from '../types/api.types';
import { User } from './User';
import { ProjectMember } from './ProjectMember';
import { AudioUpload } from './AudioUpload';
import { ProgressReport } from './ProgressReport';
import { Activity } from './Activity';
import { Risk } from './Risk';

@Table({ tableName: 'projects', timestamps: true, underscored: true })
export class Project extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare name: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(50))
  declare code: string;

  @Column(DataType.TEXT)
  declare description: string | null;

  @Column(DataType.STRING(500))
  declare location: string | null;

  @Column(DataType.DATEONLY)
  declare start_date: string | null;

  @Column(DataType.DATEONLY)
  declare end_date: string | null;

  @AllowNull(false)
  @Default('planning')
  @Column(DataType.ENUM('planning', 'active', 'on_hold', 'completed'))
  declare status: ProjectStatus;

  @Column(DataType.JSONB)
  declare metadata: Record<string, unknown> | null;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare created_by: string;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => User, 'created_by')
  declare creator: User;

  @HasMany(() => ProjectMember)
  declare members: ProjectMember[];

  @HasMany(() => AudioUpload)
  declare audio_uploads: AudioUpload[];

  @HasMany(() => ProgressReport)
  declare progress_reports: ProgressReport[];

  @HasMany(() => Activity)
  declare activities: Activity[];

  @HasMany(() => Risk)
  declare risks: Risk[];
}
