import path from 'path';
import { AudioUpload } from '../models/AudioUpload';
import { VoiceTranscript } from '../models/VoiceTranscript';
import { ProgressReport } from '../models/ProgressReport';
import { Risk } from '../models/Risk';
import { Activity } from '../models/Activity';
import { whisperService } from './whisper.service';
import { geminiService } from './gemini.service';
import { NotFoundError } from '../utils/errors';
import { env } from '../config/environment';
import logger from '../utils/logger';

export class VoiceService {
  /**
   * Create audio upload record after file is stored
   */
  async createUpload(
    file: Express.Multer.File,
    projectId: string,
    userId: string
  ) {
    const upload = await AudioUpload.create({
      project_id: projectId,
      user_id: userId,
      file_name: file.originalname,
      file_path: file.path,
      mime_type: file.mimetype,
      file_size: file.size,
      status: 'uploaded',
    });

    logger.info(`Audio uploaded: ${upload.id} (${file.originalname})`);
    return upload;
  }

  /**
   * List uploads for a user, optionally filtered by project
   */
  async listUploads(userId: string, projectId?: string) {
    const where: Record<string, unknown> = { user_id: userId };
    if (projectId) where.project_id = projectId;

    return AudioUpload.findAll({
      where,
      include: [{ model: VoiceTranscript, attributes: ['id', 'status'] }],
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Get upload details by ID
   */
  async getUpload(id: string) {
    const upload = await AudioUpload.findByPk(id, {
      include: [{ model: VoiceTranscript }],
    });
    if (!upload) throw new NotFoundError('Audio upload not found');
    return upload;
  }

  /**
   * Full AI processing pipeline: Whisper → Gemini → DB
   */
  async processUpload(uploadId: string) {
    const upload = await AudioUpload.findByPk(uploadId);
    if (!upload) throw new NotFoundError('Audio upload not found');

    try {
      // Step 1: Mark as processing
      await upload.update({ status: 'processing' });

      // Step 2: Transcribe with Whisper
      const whisperResult = await whisperService.transcribe(upload.file_path);

      // Step 3: Save transcript
      const transcript = await VoiceTranscript.create({
        audio_upload_id: upload.id,
        raw_transcript: whisperResult.text,
        confidence: 0.95, // Whisper doesn't return confidence per-se
        language: whisperResult.language || 'en',
        status: 'completed',
        processed_at: new Date(),
      });

      // Step 4: Extract structured data with Gemini
      const extracted = await geminiService.extractProgressData(whisperResult.text);

      // Step 5: Create progress report
      const report = await ProgressReport.create({
        project_id: upload.project_id,
        transcript_id: transcript.id,
        user_id: upload.user_id,
        block_name: extracted.block_name,
        floor_number: extracted.floor_number,
        activity: extracted.activity,
        completion_percentage: extracted.completion_percentage,
        worker_count: extracted.worker_count,
        material_usage: extracted.material_usage as unknown as Record<string, unknown>[],
        weather_condition: extracted.weather_condition,
        report_date: extracted.report_date || new Date().toISOString().split('T')[0],
        start_time: extracted.start_time,
        end_time: extracted.end_time,
        notes: extracted.notes,
        status: 'draft',
        extracted_data: extracted as unknown as Record<string, unknown>,
      });

      // Step 6: Create activity records
      if (extracted.activity) {
        await Activity.create({
          project_id: upload.project_id,
          report_id: report.id,
          name: extracted.activity,
          status: extracted.completion_percentage === 100 ? 'completed' : 'in_progress',
          completion_percentage: extracted.completion_percentage || 0,
        });
      }

      // Step 7: Create risk records from issues
      for (const issue of extracted.issues) {
        await Risk.create({
          project_id: upload.project_id,
          report_id: report.id,
          reported_by: upload.user_id,
          title: issue.description.substring(0, 255),
          description: issue.description,
          severity: issue.severity as 'low' | 'medium' | 'high' | 'critical',
          category: (issue.category as 'safety' | 'quality' | 'schedule' | 'cost' | 'environmental') || 'safety',
          status: 'open',
        });
      }

      // Step 8: Create risk records from safety incidents
      for (const incident of extracted.safety_incidents) {
        await Risk.create({
          project_id: upload.project_id,
          report_id: report.id,
          reported_by: upload.user_id,
          title: incident.description.substring(0, 255),
          description: incident.description,
          severity: (incident.severity as 'low' | 'medium' | 'high' | 'critical') || 'high',
          category: 'safety',
          status: 'open',
        });
      }

      // Step 9: Mark upload as completed
      await upload.update({ status: 'completed' });

      logger.info(`Processing complete for upload: ${uploadId}`);

      return {
        upload,
        transcript,
        report,
      };
    } catch (error) {
      await upload.update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed',
      });
      throw error;
    }
  }

  /**
   * Delete an audio upload and its file
   */
  async deleteUpload(id: string) {
    const upload = await AudioUpload.findByPk(id);
    if (!upload) throw new NotFoundError('Audio upload not found');

    // Delete file from disk
    const fs = await import('fs/promises');
    try {
      await fs.unlink(upload.file_path);
    } catch {
      logger.warn(`File not found on disk: ${upload.file_path}`);
    }

    await upload.destroy();
  }
}

export const voiceService = new VoiceService();
