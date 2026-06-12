import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

router.use(authenticate);

router.get('/overview', dashboardController.overview);
router.get('/projects/:id/progress', dashboardController.projectProgress);
router.get('/risks', authorize('project_manager', 'admin'), dashboardController.risks);
router.get('/activities', authorize('project_manager', 'admin'), dashboardController.activities);
router.get('/timeline', dashboardController.timeline);

export default router;
