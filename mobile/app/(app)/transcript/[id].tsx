import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transcriptApi, reportApi } from '../../../src/services/endpoints';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';

export default function TranscriptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const { data: transcript, isLoading } = useQuery({
    queryKey: ['transcript', id],
    queryFn: async () => { const res = await transcriptApi.getById(id!); return res.data.data; },
    enabled: !!id,
  });

  const editMutation = useMutation({
    mutationFn: async () => {
      await transcriptApi.edit(id!, editedText);
      await transcriptApi.reprocess(id!);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transcript', id] });
      setIsEditing(false);
      Alert.alert('Success', 'Transcript updated and reprocessed');
    },
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const reportId = transcript?.progress_report?.id;
      if (reportId) await reportApi.submit(reportId);
    },
    onSuccess: () => {
      Alert.alert('Submitted!', 'Your report has been submitted for review.');
      router.back();
    },
  });

  if (!transcript) return null;

  const report = transcript.progress_report;
  const displayText = transcript.edited_transcript || transcript.raw_transcript;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Transcript Card */}
      <Card title="Transcript">
        {isEditing ? (
          <View>
            <TextInput
              style={styles.textArea}
              value={editedText}
              onChangeText={setEditedText}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
            />
            <View style={styles.editActions}>
              <Button title="Cancel" onPress={() => setIsEditing(false)} variant="ghost" />
              <Button title="Save & Reprocess" onPress={() => editMutation.mutate()} loading={editMutation.isPending} />
            </View>
          </View>
        ) : (
          <View>
            <Text style={styles.transcriptText}>{displayText}</Text>
            <Button
              title="Edit Transcript"
              onPress={() => { setEditedText(displayText); setIsEditing(true); }}
              variant="outline"
              size="sm"
              style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
            />
          </View>
        )}
      </Card>

      {/* Extracted Data */}
      {report && (
        <Card title="Extracted Information" style={{ marginTop: spacing.lg }}>
          <View style={styles.dataGrid}>
            {report.block_name && <DataRow label="Block" value={report.block_name} />}
            {report.floor_number && <DataRow label="Floor" value={report.floor_number} />}
            {report.activity && <DataRow label="Activity" value={report.activity} />}
            {report.completion_percentage != null && <DataRow label="Completion" value={`${report.completion_percentage}%`} />}
            {report.worker_count != null && <DataRow label="Workers" value={`${report.worker_count}`} />}
            {report.start_time && <DataRow label="Start Time" value={report.start_time} />}
            {report.weather_condition && <DataRow label="Weather" value={report.weather_condition} />}
          </View>

          {report.notes && (
            <View style={styles.notes}>
              <Text style={styles.notesLabel}>Notes:</Text>
              <Text style={styles.notesText}>{report.notes}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Submit Button */}
      {report && report.status === 'draft' && (
        <Button
          title="Submit Report"
          onPress={() => submitMutation.mutate()}
          loading={submitMutation.isPending}
          fullWidth
          size="lg"
          style={{ marginTop: spacing['2xl'] }}
        />
      )}
    </ScrollView>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.dataRow}>
      <Text style={styles.dataLabel}>{label}</Text>
      <Text style={styles.dataValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  transcriptText: { ...typography.body, color: colors.text, lineHeight: 26 },
  textArea: {
    ...typography.body, color: colors.text, backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md, padding: spacing.md, minHeight: 150,
    borderWidth: 1, borderColor: colors.border,
  },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.md, marginTop: spacing.md },

  dataGrid: {},
  dataRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  dataLabel: { ...typography.label, color: colors.textSecondary },
  dataValue: { ...typography.label, color: colors.text, fontWeight: '600' },

  notes: { marginTop: spacing.md, backgroundColor: colors.surfaceAlt, padding: spacing.md, borderRadius: borderRadius.md },
  notesLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  notesText: { ...typography.bodySmall, color: colors.text },
});
