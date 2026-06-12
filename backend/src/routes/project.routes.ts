import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';
import { validate } from '../middleware/validation.middleware';
import { createProjectSchema, updateProjectSchema, addMemberSchema } from '../validators/project.validator';

const router = Router();

router.use(authenticate);

router.get('/', projectController.list);
router.get('/:id', projectController.getById);
router.post('/', authorize('project_manager', 'admin'), validate(createProjectSchema), projectController.create);
router.put('/:id', authorize('project_manager', 'admin'), validate(updateProjectSchema), projectController.update);
router.delete('/:id', authorize('admin'), projectController.delete);
router.post('/:id/members', authorize('project_manager', 'admin'), validate(addMemberSchema), projectController.addMember);
router.delete('/:id/members/:userId', authorize('project_manager', 'admin'), projectController.removeMember);

export default router;
