import { Sequelize } from 'sequelize-typescript';
import { env } from './environment';
import { User } from '../models/User';
import { Project } from '../models/Project';
import { ProjectMember } from '../models/ProjectMember';
import { AudioUpload } from '../models/AudioUpload';
import { VoiceTranscript } from '../models/VoiceTranscript';
import { ProgressReport } from '../models/ProgressReport';
import { Activity } from '../models/Activity';
import { Risk } from '../models/Risk';
import { Notification } from '../models/Notification';
import { RefreshToken } from '../models/RefreshToken';
import { AuditLog } from '../models/AuditLog';

const sequelize = new Sequelize({
  dialect: 'postgres',
  host: env.db.host,
  port: env.db.port,
  database: env.db.name,
  username: env.db.user,
  password: env.db.password,
  models: [User, Project, ProjectMember, AudioUpload, VoiceTranscript, ProgressReport, Activity, Risk, Notification, RefreshToken, AuditLog],
  logging: env.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 20,
    min: 5,
    acquire: 30000,
    idle: 10000,
  },
  define: {
    timestamps: true,
    underscored: true,
  },
});

export default sequelize;
