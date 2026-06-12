import fs from 'fs';
import OpenAI from 'openai';
import { env } from '../config/environment';
import logger from '../utils/logger';
import type { WhisperResponse } from '../types/ai.types';

class WhisperService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: env.openai.apiKey });
  }

  /**
   * Transcribe an audio file using OpenAI Whisper API
   */
  async transcribe(filePath: string): Promise<WhisperResponse> {
    try {
      logger.info(`Starting transcription for: ${filePath}`);

      const fileStream = fs.createReadStream(filePath);

      const transcription = await this.client.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        response_format: 'verbose_json',
        language: 'en',
      });

      logger.info(`Transcription completed. Length: ${transcription.text.length} chars`);

      return {
        text: transcription.text,
        language: (transcription as Record<string, unknown>).language as string || 'en',
        duration: (transcription as Record<string, unknown>).duration as number || 0,
      };
    } catch (error) {
      logger.error('Whisper transcription failed:', error);
      throw error;
    }
  }
}

export const whisperService = new WhisperService();
