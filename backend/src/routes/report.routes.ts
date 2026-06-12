import { Router } from 'express';
import { reportController } from '../controllers/report.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { updateReportSchema, reportFilterSchema } from '../validators/report.validator';

const router = Router();

router.use(authenticate);

router.get('/', validate(reportFilterSchema, 'query'), reportController.list);
router.get('/daily', authorize('project_manager', 'admin'), reportController.daily);
router.get('/weekly', authorize('project_manager', 'admin'), reportController.weekly);
router.get('/monthly', authorize('project_manager', 'admin'), reportController.monthly);
router.get('/ai-summary', authorize('project_manager', 'admin'), reportController.aiSummary);
router.get('/:id', reportController.getById);
router.put('/:id', authorize('project_manager', 'admin'), validate(updateReportSchema), reportController.update);
router.post('/:id/submit', reportController.submit);
router.post('/:id/approve', authorize('project_manager', 'admin'), reportController.approve);
router.post('/:id/reject', authorize('project_manager', 'admin'), reportController.reject);

export default router;
