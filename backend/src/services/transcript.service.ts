import { VoiceTranscript } from '../models/VoiceTranscript';
import { ProgressReport } from '../models/ProgressReport';
import { NotFoundError } from '../utils/errors';
import { geminiService } from './gemini.service';
import logger from '../utils/logger';

export class TranscriptService {
  async getById(id: string) {
    const transcript = await VoiceTranscript.findByPk(id, {
      include: [{ model: ProgressReport }],
    });
    if (!transcript) throw new NotFoundError('Transcript not found');
    return transcript;
  }

  async editTranscript(id: string, editedText: string) {
    const transcript = await VoiceTranscript.findByPk(id);
    if (!transcript) throw new NotFoundError('Transcript not found');
    await transcript.update({ edited_transcript: editedText, is_edited: true });
    return transcript;
  }

  async reprocess(id: string) {
    const transcript = await VoiceTranscript.findByPk(id);
    if (!transcript) throw new NotFoundError('Transcript not found');

    const text = transcript.edited_transcript || transcript.raw_transcript;
    const extracted = await geminiService.extractProgressData(text);

    const report = await ProgressReport.findOne({ where: { transcript_id: transcript.id } });
    if (report) {
      await report.update({
        block_name: extracted.block_name,
        floor_number: extracted.floor_number,
        activity: extracted.activity,
        completion_percentage: extracted.completion_percentage,
        worker_count: extracted.worker_count,
        material_usage: extracted.material_usage as unknown as Record<string, unknown>[],
        weather_condition: extracted.weather_condition,
        start_time: extracted.start_time,
        end_time: extracted.end_time,
        notes: extracted.notes,
        extracted_data: extracted as unknown as Record<string, unknown>,
      });
    }

    logger.info(`Transcript reprocessed: ${id}`);
    return { transcript, report, extracted };
  }
}

export const transcriptService = new TranscriptService();
