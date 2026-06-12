import { Response, NextFunction } from 'express';
import { transcriptService } from '../services/transcript.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/api.types';

export class TranscriptController {
  async getById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transcript = await transcriptService.getById(req.params.id!);
      sendSuccess(res, transcript);
    } catch (err) { next(err); }
  }

  async edit(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const transcript = await transcriptService.editTranscript(req.params.id!, req.body.edited_transcript);
      sendSuccess(res, transcript, 'Transcript updated');
    } catch (err) { next(err); }
  }

  async reprocess(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await transcriptService.reprocess(req.params.id!);
      sendSuccess(res, result, 'Reprocessing complete');
    } catch (err) { next(err); }
  }
}

export const transcriptController = new TranscriptController();
