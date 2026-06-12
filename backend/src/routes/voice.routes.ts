import { Router } from 'express';
import { voiceController } from '../controllers/voice.controller';
import { authenticate } from '../middleware/auth.middleware';
import { uploadAudio } from '../middleware/upload.middleware';
import { uploadLimiter } from '../middleware/rateLimiter.middleware';

const router = Router();

router.use(authenticate);

router.post('/upload', uploadLimiter, uploadAudio, voiceController.upload);
router.get('/uploads', voiceController.listUploads);
router.get('/uploads/:id', voiceController.getUpload);
router.post('/uploads/:id/process', voiceController.processUpload);
router.delete('/uploads/:id', voiceController.deleteUpload);

export default router;
