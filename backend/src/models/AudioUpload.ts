import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  ForeignKey,
  BelongsTo,
  HasOne,
  AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { AudioUploadStatus } from '../types/api.types';
import { User } from './User';
import { Project } from './Project';
import { VoiceTranscript } from './';

@Table({ tableName: 'audio_uploads', timestamps: true, underscored: true })
export class AudioUpload extends Model {
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
  @Column(DataType.STRING(255))
  declare file_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(500))
  declare file_path: string;

  @AllowNull(false)
  @Default('audio/m4a')
  @Column(DataType.STRING(100))
  declare mime_type: string;

  @AllowNull(false)
  @Column(DataType.INTEGER)
  declare file_size: number;

  @Column(DataType.INTEGER)
  declare duration: number | null;

  @AllowNull(false)
  @Default('uploaded')
  @Column(DataType.ENUM('uploading', 'uploaded', 'processing', 'completed', 'failed'))
  declare status: AudioUploadStatus;

  @Column(DataType.TEXT)
  declare error_message: string | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => Project)
  declare project: Project;

  @BelongsTo(() => User)
  declare user: User;

  @HasOne(() => VoiceTranscript)
  declare transcript: VoiceTranscript;
}
