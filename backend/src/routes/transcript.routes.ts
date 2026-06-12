import { Router } from 'express';
import { transcriptController } from '../controllers/transcript.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { editTranscriptSchema } from '../validators/voice.validator';

const router = Router();

router.use(authenticate);

router.get('/:id', transcriptController.getById);
router.put('/:id', validate(editTranscriptSchema), transcriptController.edit);
router.post('/:id/reprocess', transcriptController.reprocess);

export default router;
