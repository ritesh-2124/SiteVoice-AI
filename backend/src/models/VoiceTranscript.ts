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
import { TranscriptStatus } from '../types/api.types';
import { AudioUpload } from './AudioUpload';
import { ProgressReport } from './ProgressReport';

@Table({ tableName: 'voice_transcripts', timestamps: true, underscored: true })
export class VoiceTranscript extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => AudioUpload)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare audio_upload_id: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare raw_transcript: string;

  @Column(DataType.TEXT)
  declare edited_transcript: string | null;

  @Column(DataType.FLOAT)
  declare confidence: number | null;

  @Default('en')
  @Column(DataType.STRING(10))
  declare language: string;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_edited: boolean;

  @AllowNull(false)
  @Default('pending')
  @Column(DataType.ENUM('pending', 'completed', 'failed'))
  declare status: TranscriptStatus;

  @Column(DataType.DATE)
  declare processed_at: Date | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @BelongsTo(() => AudioUpload)
  declare audio_upload: AudioUpload;

  @HasOne(() => ProgressReport)
  declare progress_report: ProgressReport;

  /**
   * Returns the most recent version of the transcript (edited or raw)
   */
  get effectiveTranscript(): string {
    return this.edited_transcript || this.raw_transcript;
  }
}
