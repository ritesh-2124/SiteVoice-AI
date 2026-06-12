import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  ForeignKey,
  BelongsTo,
  AllowNull,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User';

@Table({ tableName: 'refresh_tokens', timestamps: true, underscored: true, updatedAt: false })
export class RefreshToken extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @AllowNull(false)
  @Column(DataType.UUID)
  declare user_id: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(500))
  declare token: string;

  @AllowNull(false)
  @Column(DataType.DATE)
  declare expires_at: Date;

  @AllowNull(false)
  @Default(false)
  @Column(DataType.BOOLEAN)
  declare is_revoked: boolean;

  declare readonly created_at: Date;

  // Associations
  @BelongsTo(() => User)
  declare user: User;

  /**
   * Check if the refresh token is still valid
   */
  get isValid(): boolean {
    return !this.is_revoked && new Date() < this.expires_at;
  }
}
