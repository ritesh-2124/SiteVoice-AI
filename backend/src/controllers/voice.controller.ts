import { Response, NextFunction } from 'express';
import { voiceService } from '../services/voice.service';
import { sendSuccess, sendCreated, sendNoContent } from '../utils/response';
import { AuthRequest } from '../types/api.types';
import { BadRequestError } from '../utils/errors';

export class VoiceController {
  async upload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      if (!req.file) throw new BadRequestError('Audio file is required');
      const upload = await voiceService.createUpload(req.file, req.body.project_id, req.user!.id);
      sendCreated(res, upload, 'Audio uploaded successfully');
    } catch (err) { next(err); }
  }

  async listUploads(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const uploads = await voiceService.listUploads(req.user!.id, req.query.project_id as string);
      sendSuccess(res, uploads);
    } catch (err) { next(err); }
  }

  async getUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const upload = await voiceService.getUpload(req.params.id!);
      sendSuccess(res, upload);
    } catch (err) { next(err); }
  }

  async processUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await voiceService.processUpload(req.params.id!);
      sendSuccess(res, result, 'Processing complete');
    } catch (err) { next(err); }
  }

  async deleteUpload(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      await voiceService.deleteUpload(req.params.id!);
      sendNoContent(res);
    } catch (err) { next(err); }
  }
}

export const voiceController = new VoiceController();
