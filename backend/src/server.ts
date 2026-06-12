import app from './app';
import sequelize from './config/database';
import { env } from './config/environment';
import logger from './utils/logger';

async function bootstrap(): Promise<void> {
  try {
    // Test database connection
    await sequelize.authenticate();
    logger.info('✅ Database connection established');

    // Sync models (dev only — use migrations in production)
    if (env.nodeEnv === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ Database models synced');
    }

    // Start server
    app.listen(env.port, '0.0.0.0', () => {
      logger.info(`🚀 SiteVoice API running on port ${env.port}`);
      logger.info(`📄 Swagger docs: http://localhost:${env.port}/api-docs`);
      logger.info(`🏥 Health check: http://localhost:${env.port}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
