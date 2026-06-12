import {
  Table,
  Column,
  Model,
  DataType,
  Default,
  PrimaryKey,
  Unique,
  BeforeCreate,
  BeforeUpdate,
  HasMany,
  AllowNull,
} from 'sequelize-typescript';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '../types/api.types';
import { ProjectMember } from './ProjectMember';
import { AudioUpload } from './AudioUpload';
import { Notification } from './Notification';
import { RefreshToken } from './RefreshToken';
import { AuditLog } from './AuditLog';

@Table({ tableName: 'users', timestamps: true, underscored: true })
export class User extends Model {
  @PrimaryKey
  @Default(() => uuidv4())
  @Column(DataType.UUID)
  declare id: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare first_name: string;

  @AllowNull(false)
  @Column(DataType.STRING(100))
  declare last_name: string;

  @AllowNull(false)
  @Unique
  @Column(DataType.STRING(255))
  declare email: string;

  @AllowNull(false)
  @Column(DataType.STRING(255))
  declare password: string;

  @AllowNull(false)
  @Default('site_engineer')
  @Column(DataType.ENUM('site_engineer', 'project_manager', 'admin'))
  declare role: UserRole;

  @Column(DataType.STRING(20))
  declare phone: string | null;

  @Column(DataType.STRING(500))
  declare avatar: string | null;

  @AllowNull(false)
  @Default(true)
  @Column(DataType.BOOLEAN)
  declare is_active: boolean;

  @Column(DataType.DATE)
  declare last_login: Date | null;

  @Column(DataType.STRING(255))
  declare reset_password_token: string | null;

  @Column(DataType.DATE)
  declare reset_password_expires: Date | null;

  declare readonly created_at: Date;
  declare readonly updated_at: Date;

  // Associations
  @HasMany(() => ProjectMember)
  declare project_memberships: ProjectMember[];

  @HasMany(() => AudioUpload)
  declare audio_uploads: AudioUpload[];

  @HasMany(() => Notification)
  declare notifications: Notification[];

  @HasMany(() => RefreshToken)
  declare refresh_tokens: RefreshToken[];

  @HasMany(() => AuditLog)
  declare audit_logs: AuditLog[];

  // Hooks
  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User): Promise<void> {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(12);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }

  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  toSafeJSON(): Omit<User, 'password' | 'reset_password_token' | 'reset_password_expires'> {
    const values = this.toJSON() as Record<string, unknown>;
    delete values.password;
    delete values.reset_password_token;
    delete values.reset_password_expires;
    return values as Omit<User, 'password' | 'reset_password_token' | 'reset_password_expires'>;
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
}
