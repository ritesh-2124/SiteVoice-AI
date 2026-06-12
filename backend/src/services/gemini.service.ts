import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { env } from '../config/environment';
import logger from '../utils/logger';
import type { ExtractedProgressData } from '../types/ai.types';

const EXTRACTION_PROMPT = `You are a construction site progress data extraction assistant.
Given a voice transcript from a construction site engineer, extract structured information.

Rules:
1. Extract ALL mentioned activities, blocks, floors, and worker counts
2. If information is not mentioned, set the field to null
3. Normalize activity names to standard construction terminology
4. Convert time references to 24-hour format (HH:MM)
5. Identify any safety incidents or risks mentioned
6. Calculate completion percentage from context clues
7. List all materials mentioned with quantities if available
8. Detect the report date from context (or use today if not specified)

Transcript:
`;

const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    block_name: { type: SchemaType.STRING, nullable: true, description: 'Block/building identifier' },
    floor_number: { type: SchemaType.STRING, nullable: true, description: 'Floor number or level' },
    activity: { type: SchemaType.STRING, nullable: true, description: 'Main construction activity' },
    completion_percentage: { type: SchemaType.NUMBER, nullable: true, description: 'Completion % (0-100)' },
    worker_count: { type: SchemaType.NUMBER, nullable: true, description: 'Number of workers present' },
    start_time: { type: SchemaType.STRING, nullable: true, description: 'Start time in HH:MM format' },
    end_time: { type: SchemaType.STRING, nullable: true, description: 'End time in HH:MM format' },
    material_usage: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          material: { type: SchemaType.STRING },
          quantity: { type: SchemaType.STRING },
          unit: { type: SchemaType.STRING },
        },
        required: ['material', 'quantity', 'unit'],
      },
      description: 'Materials used with quantities',
    },
    weather_condition: { type: SchemaType.STRING, nullable: true, description: 'Weather conditions' },
    issues: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING, description: 'low, medium, high, or critical' },
          category: { type: SchemaType.STRING },
        },
        required: ['description', 'severity', 'category'],
      },
      description: 'Issues or problems identified',
    },
    safety_incidents: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          severity: { type: SchemaType.STRING },
        },
        required: ['description', 'severity'],
      },
      description: 'Safety incidents reported',
    },
    notes: { type: SchemaType.STRING, nullable: true, description: 'Additional notes or observations' },
    report_date: { type: SchemaType.STRING, nullable: true, description: 'Date in YYYY-MM-DD format' },
  },
  required: ['material_usage', 'issues', 'safety_incidents'],
};

class GeminiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(env.gemini.apiKey);
  }

  /**
   * Extract structured progress data from a transcript
   */
  async extractProgressData(transcript: string): Promise<ExtractedProgressData> {
    try {
      logger.info('Starting Gemini extraction...');

      const model = this.genAI.getGenerativeModel({
        model: env.gemini.model,
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema as never,
        },
      });

      const result = await model.generateContent(`${EXTRACTION_PROMPT}${transcript}`);
      const text = result.response.text();
      const parsed = JSON.parse(text) as ExtractedProgressData;

      logger.info(`Gemini extraction completed: ${JSON.stringify(parsed).substring(0, 200)}...`);
      return parsed;
    } catch (error) {
      logger.error('Gemini extraction failed:', error);
      throw error;
    }
  }

  /**
   * Generate an AI summary for a set of reports
   */
  async generateSummary(reports: Record<string, unknown>[]): Promise<string> {
    try {
      const model = this.genAI.getGenerativeModel({ model: env.gemini.model });
      const prompt = `Generate a concise daily progress summary for a construction project based on the following reports data. Focus on key achievements, concerns, and next steps. Be professional and actionable.\n\nReports:\n${JSON.stringify(reports, null, 2)}`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      logger.error('Gemini summary generation failed:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
