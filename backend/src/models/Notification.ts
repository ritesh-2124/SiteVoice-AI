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
import { NotificationType } from '../types/api.types';
import { User } from './User';

@Table({ tableName: 'notifications', timestamps: true, underscored: true, updatedAt: false })
export class Notification extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare title: string;

  @AllowNull(false)
  @Column(DataType.TEXT)
  declare message: string;

  @AllowNull(false)
  @Default('info')
  @Column(DataType.ENUM('info', 'warning', 'alert', 'report'))
  declare type: NotificationType;

  @Column(DataType.JSONB)
  declare data: Record<string, unknown> | null;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_read: boolean;

  @Column(DataType.DATE)
  declare read_at: Date | null;

  declare readonly created_at: Date;

  // Associations
  @BelongsTo(() => User)
  declare user: User;
}
