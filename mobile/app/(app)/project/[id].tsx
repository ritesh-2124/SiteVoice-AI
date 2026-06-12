import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { projectApi } from '../../../src/services/endpoints';
import { Button } from '../../../src/components/ui/Button';
import { Card } from '../../../src/components/ui/Card';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/theme';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { data: project, isLoading, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => { const res = await projectApi.getById(id!); return res.data.data; },
    enabled: !!id,
  });

  if (!project) return null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      {/* Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.codeBadge}><Text style={styles.codeText}>{project.code}</Text></View>
          <View style={styles.statusBadge}><Text style={styles.statusText}>{project.status}</Text></View>
        </View>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description && <Text style={styles.description}>{project.description}</Text>}
        {project.location && (
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.locationText}>{project.location}</Text>
          </View>
        )}
      </Card>

      {/* Record Voice Update Button */}
      <Button
        title="Record Voice Update"
        icon={<Ionicons name="mic" size={20} color={colors.white} />}
        onPress={() => router.push(`/(app)/project/record/${id}`)}
        fullWidth
        size="lg"
        style={styles.recordBtn}
      />

      {/* Members */}
      <Card title="Team Members">
        {(project.members || []).map((member: any) => (
          <View key={member.id} style={styles.memberRow}>
            <View style={styles.memberAvatar}>
              <Text style={styles.memberInitials}>
                {member.user?.first_name?.[0]}{member.user?.last_name?.[0]}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.memberName}>{member.user?.first_name} {member.user?.last_name}</Text>
              <Text style={styles.memberRole}>{member.role}</Text>
            </View>
          </View>
        ))}
        {(!project.members || project.members.length === 0) && (
          <Text style={styles.emptyText}>No team members added</Text>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg },

  headerCard: { marginBottom: spacing.lg },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  codeBadge: { backgroundColor: colors.primaryBg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.sm },
  codeText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  statusBadge: { backgroundColor: colors.successBg, paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: borderRadius.full },
  statusText: { ...typography.caption, color: colors.success, fontWeight: '600', textTransform: 'capitalize' },
  projectName: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  description: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { ...typography.bodySmall, color: colors.textSecondary },

  recordBtn: { marginBottom: spacing['2xl'] },

  memberRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  memberAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surfaceAlt, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  memberInitials: { ...typography.caption, fontWeight: '600', color: colors.textSecondary },
  memberName: { ...typography.label, color: colors.text },
  memberRole: { ...typography.caption, color: colors.textTertiary, textTransform: 'capitalize' },
  emptyText: { ...typography.bodySmall, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing.lg },
});
