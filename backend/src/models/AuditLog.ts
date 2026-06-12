import {
  Table, Column, Model, DataType, Default, PrimaryKey,
  ForeignKey, BelongsTo, AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Table({ tableName: 'audit_logs', timestamps: true, underscored: true, updatedAt: false })
export class AuditLog extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare user_id: string | null;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare action: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare entity: string;

  @Column(DataType.UUID)
  declare entity_id: string | null;

  @Column(DataType.JSONB)
  declare old_values: Record<string, unknown> | null;

  @Column(DataType.JSONB)
  declare new_values: Record<string, unknown> | null;

  @Column(DataType.STRING(45))
  declare ip_address: string | null;

  declare readonly created_at: Date;

  @BelongsTo(() => User)
  declare user: User;
}
