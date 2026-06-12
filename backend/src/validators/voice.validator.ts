import { z } from 'zod';

export const uploadVoiceSchema = z.object({
  project_id: z.string().uuid('Invalid project ID'),
});

export const editTranscriptSchema = z.object({
  edited_transcript: z.string().min(1, 'Transcript cannot be empty'),
});

export type UploadVoiceInput = z.infer<typeof uploadVoiceSchema>;
export type EditTranscriptInput = z.infer<typeof editTranscriptSchema>;
