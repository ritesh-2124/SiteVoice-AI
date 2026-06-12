import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl, Alert, Modal,
  TextInput, TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { reportApi } from '../../../src/services/endpoints';
import { useAuthStore } from '../../../src/stores/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/theme';

const statusConfig: Record<string, { bg: string; text: string; icon: string; label: string }> = {
  draft:     { bg: '#F1F5F9', text: '#64748B', icon: 'create-outline',          label: 'Draft' },
  submitted: { bg: '#EFF6FF', text: '#2563EB', icon: 'time-outline',            label: 'Submitted' },
  approved:  { bg: '#ECFDF5', text: '#10B981', icon: 'checkmark-circle-outline', label: 'Approved' },
  rejected:  { bg: '#FEF2F2', text: '#EF4444', icon: 'close-circle-outline',    label: 'Rejected' },
};

export default function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const { data: report, isLoading, refetch } = useQuery({
    queryKey: ['report', id],
    queryFn: async () => { const res = await reportApi.getById(id!); return res.data.data; },
    enabled: !!id,
  });

  const approveMutation = useMutation({
    mutationFn: () => reportApi.approve(id!),
    onSuccess: () => {
      Alert.alert('Success', 'Report has been approved.');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to approve report'),
  });

  const rejectMutation = useMutation({
    mutationFn: (reason?: string) => reportApi.reject(id!, reason),
    onSuccess: () => {
      setShowRejectModal(false);
      setRejectReason('');
      Alert.alert('Done', 'Report has been rejected.');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to reject report'),
  });

  const submitMutation = useMutation({
    mutationFn: () => reportApi.submit(id!),
    onSuccess: () => {
      Alert.alert('Success', 'Report submitted for approval.');
      queryClient.invalidateQueries({ queryKey: ['report', id] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
    onError: (err: any) => Alert.alert('Error', err?.response?.data?.message || 'Failed to submit report'),
  });

  const canApprove = user && (user.role === 'project_manager' || user.role === 'admin') && report?.status === 'submitted';
  const canSubmit = report?.status === 'draft';

  const handleApprove = () => {
    Alert.alert('Approve Report', 'Are you sure you want to approve this report?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Approve', style: 'default', onPress: () => approveMutation.mutate() },
    ]);
  };

  const handleRejectConfirm = () => {
    rejectMutation.mutate(rejectReason.trim() || undefined);
  };

  const handleSubmit = () => {
    Alert.alert('Submit Report', 'Submit this report for PM approval?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Submit', style: 'default', onPress: () => submitMutation.mutate() },
    ]);
  };

  if (isLoading || !report) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const status = statusConfig[report.status] || statusConfig.draft;

  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {/* Status Header */}
        <View style={[styles.statusBanner, { backgroundColor: status.bg }]}>
          <Ionicons name={status.icon as any} size={24} color={status.text} />
          <Text style={[styles.statusLabel, { color: status.text }]}>{status.label}</Text>
        </View>

        {/* Report Info Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Report Details</Text>
            <Text style={styles.dateText}>{report.report_date}</Text>
          </View>

          {report.project && (
            <View style={styles.infoRow}>
              <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Project</Text>
              <Text style={styles.infoValue}>{report.project.name}</Text>
            </View>
          )}
          {report.user && (
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Submitted by</Text>
              <Text style={styles.infoValue}>{report.user.first_name} {report.user.last_name}</Text>
            </View>
          )}
          {report.block_name && (
            <View style={styles.infoRow}>
              <Ionicons name="cube-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Block</Text>
              <Text style={styles.infoValue}>{report.block_name}</Text>
            </View>
          )}
          {report.floor_number && (
            <View style={styles.infoRow}>
              <Ionicons name="layers-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Floor</Text>
              <Text style={styles.infoValue}>{report.floor_number}</Text>
            </View>
          )}
          {report.activity && (
            <View style={styles.infoRow}>
              <Ionicons name="construct-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Activity</Text>
              <Text style={styles.infoValue}>{report.activity}</Text>
            </View>
          )}
          {report.completion_percentage != null && (
            <View style={styles.infoRow}>
              <Ionicons name="stats-chart-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Completion</Text>
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${report.completion_percentage}%` }]} />
                </View>
                <Text style={styles.progressText}>{report.completion_percentage}%</Text>
              </View>
            </View>
          )}
          {report.worker_count != null && (
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Workers</Text>
              <Text style={styles.infoValue}>{report.worker_count}</Text>
            </View>
          )}
          {report.weather_condition && (
            <View style={styles.infoRow}>
              <Ionicons name="cloudy-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Weather</Text>
              <Text style={styles.infoValue}>{report.weather_condition}</Text>
            </View>
          )}
          {report.start_time && (
            <View style={styles.infoRow}>
              <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.infoLabel}>Time</Text>
              <Text style={styles.infoValue}>{report.start_time}{report.end_time ? ` – ${report.end_time}` : ''}</Text>
            </View>
          )}
        </View>

        {/* Notes */}
        {report.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{report.notes}</Text>
          </View>
        )}

        {/* Activities */}
        {report.report_activities && report.report_activities.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Activities ({report.report_activities.length})</Text>
            {report.report_activities.map((act: any, i: number) => (
              <View key={act.id || i} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{act.name}</Text>
                  <View style={[styles.activityBadge, { backgroundColor: act.status === 'completed' ? colors.successBg : act.status === 'delayed' ? colors.dangerBg : colors.infoBg }]}>
                    <Text style={[styles.activityBadgeText, { color: act.status === 'completed' ? colors.success : act.status === 'delayed' ? colors.danger : colors.info }]}>
                      {act.status?.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                {act.description && <Text style={styles.activityDesc}>{act.description}</Text>}
                {act.completion_percentage != null && (
                  <View style={styles.miniProgress}>
                    <View style={styles.miniProgressBar}>
                      <View style={[styles.miniProgressFill, { width: `${act.completion_percentage}%` }]} />
                    </View>
                    <Text style={styles.miniProgressText}>{act.completion_percentage}%</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Risks */}
        {report.report_risks && report.report_risks.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Risks ({report.report_risks.length})</Text>
            {report.report_risks.map((risk: any, i: number) => (
              <View key={risk.id || i} style={styles.riskItem}>
                <View style={styles.riskHeader}>
                  <Text style={styles.riskTitle}>{risk.title}</Text>
                  <View style={[styles.riskBadge, {
                    backgroundColor: risk.severity === 'critical' ? colors.dangerBg : risk.severity === 'high' ? '#FFF7ED' : risk.severity === 'medium' ? colors.warningBg : colors.successBg,
                  }]}>
                    <Text style={[styles.riskBadgeText, {
                      color: risk.severity === 'critical' ? colors.danger : risk.severity === 'high' ? '#EA580C' : risk.severity === 'medium' ? colors.warning : colors.success,
                    }]}>
                      {risk.severity}
                    </Text>
                  </View>
                </View>
                {risk.description && <Text style={styles.riskDesc}>{risk.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Rejection Reason (if rejected) */}
        {report.status === 'rejected' && report.rejection_reason && (
          <View style={[styles.card, { borderLeftWidth: 3, borderLeftColor: colors.danger }]}>
            <Text style={[styles.cardTitle, { color: colors.danger }]}>Rejection Reason</Text>
            <Text style={styles.notesText}>{report.rejection_reason}</Text>
          </View>
        )}

        {/* Bottom spacer for action buttons */}
        <View style={{ height: canApprove || canSubmit ? 100 : spacing.xl }} />
      </ScrollView>

      {/* Action Buttons - Fixed at bottom */}
      {canApprove && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => setShowRejectModal(true)}
            disabled={rejectMutation.isPending}
            activeOpacity={0.8}
          >
            <Ionicons name="close-circle" size={22} color={colors.white} />
            <Text style={styles.actionButtonText}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={handleApprove}
            disabled={approveMutation.isPending}
            activeOpacity={0.8}
          >
            {approveMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color={colors.white} />
                <Text style={styles.actionButtonText}>Approve</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {canSubmit && (
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={[styles.actionButton, styles.submitButton, { flex: 1 }]}
            onPress={handleSubmit}
            disabled={submitMutation.isPending}
            activeOpacity={0.8}
          >
            {submitMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <>
                <Ionicons name="send" size={20} color={colors.white} />
                <Text style={styles.actionButtonText}>Submit for Approval</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Reject Reason Modal */}
      <Modal visible={showRejectModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Ionicons name="close-circle-outline" size={32} color={colors.danger} />
              <Text style={styles.modalTitle}>Reject Report</Text>
              <Text style={styles.modalSubtitle}>Provide a reason for rejection (optional)</Text>
            </View>

            <TextInput
              style={styles.reasonInput}
              placeholder="Enter rejection reason..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={rejectReason}
              onChangeText={setRejectReason}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => { setShowRejectModal(false); setRejectReason(''); }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalRejectBtn}
                onPress={handleRejectConfirm}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <Text style={styles.modalRejectText}>Reject Report</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  content: { padding: spacing.lg },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  // Status banner
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
  },
  statusLabel: { ...typography.h4, textTransform: 'capitalize' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  cardTitle: { ...typography.h4, color: colors.text },
  dateText: { ...typography.label, color: colors.textSecondary },

  // Info rows
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
    gap: spacing.sm,
  },
  infoLabel: { ...typography.bodySmall, color: colors.textSecondary, width: 90 },
  infoValue: { ...typography.body, color: colors.text, flex: 1, fontWeight: '500' },

  // Progress bar
  progressContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  progressBar: { flex: 1, height: 8, backgroundColor: colors.surfaceAlt, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  progressText: { ...typography.label, color: colors.text, fontWeight: '600', width: 40, textAlign: 'right' },

  // Notes
  notesText: { ...typography.body, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 22 },

  // Activities
  activityItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activityName: { ...typography.label, color: colors.text, flex: 1 },
  activityBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  activityBadgeText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  activityDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  miniProgress: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm },
  miniProgressBar: { flex: 1, height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2, overflow: 'hidden' },
  miniProgressFill: { height: '100%', backgroundColor: colors.success, borderRadius: 2 },
  miniProgressText: { ...typography.caption, color: colors.textSecondary, fontWeight: '600' },

  // Risks
  riskItem: { paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  riskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  riskTitle: { ...typography.label, color: colors.text, flex: 1 },
  riskBadge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  riskBadgeText: { ...typography.caption, fontWeight: '700', textTransform: 'uppercase' },
  riskDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },

  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing['2xl'],
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.lg,
  },
  approveButton: { backgroundColor: colors.success },
  rejectButton: { backgroundColor: colors.danger },
  submitButton: { backgroundColor: colors.primary },
  actionButtonText: { ...typography.button, color: colors.white },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing['2xl'],
    width: '100%',
    maxWidth: 400,
    ...shadows.lg,
  },
  modalHeader: { alignItems: 'center', marginBottom: spacing.xl },
  modalTitle: { ...typography.h3, color: colors.text, marginTop: spacing.sm },
  modalSubtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },

  reasonInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    minHeight: 100,
    ...typography.body,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },

  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surfaceAlt,
  },
  modalCancelText: { ...typography.button, color: colors.textSecondary },
  modalRejectBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    backgroundColor: colors.danger,
  },
  modalRejectText: { ...typography.button, color: colors.white },
});
