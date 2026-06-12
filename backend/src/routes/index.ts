import { Router } from 'express';
import authRoutes from './auth.routes';
import projectRoutes from './project.routes';
import voiceRoutes from './voice.routes';
import transcriptRoutes from './transcript.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/projects', projectRoutes);
router.use('/voice', voiceRoutes);
router.use('/transcripts', transcriptRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);

export default router;
