import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { dashboardApi } from '../../../src/services/endpoints';
import { useAuthStore } from '../../../src/stores/authStore';
import { Card, StatCard } from '../../../src/components/ui/Card';
import { colors, typography, spacing, borderRadius } from '../../../src/theme';

export default function DashboardScreen() {
  const { user } = useAuthStore();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await dashboardApi.overview();
      return res.data.data;
    },
  });

  const stats = data?.stats;
  const recentReports = data?.recent_reports || [];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
    >
      {/* Greeting */}
      <View style={styles.greeting}>
        <View>
          <Text style={styles.greetText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.first_name} {user?.last_name}</Text>
        </View>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.first_name?.[0]}{user?.last_name?.[0]}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard
          label="Projects"
          value={stats?.total_projects ?? '—'}
          icon={<Ionicons name="business" size={22} color={colors.primary} />}
          color={colors.primary}
        />
        <StatCard
          label="Reports"
          value={stats?.total_reports ?? '—'}
          icon={<Ionicons name="document-text" size={22} color={colors.success} />}
          color={colors.success}
        />
        <StatCard
          label="Risks"
          value={stats?.open_risks ?? '—'}
          icon={<Ionicons name="warning" size={22} color={colors.danger} />}
          color={colors.danger}
        />
      </View>

      {/* Recent Reports */}
      <Card title="Recent Updates" style={styles.recentCard}>
        {recentReports.length === 0 ? (
          <Text style={styles.emptyText}>No reports yet. Record your first voice update!</Text>
        ) : (
          recentReports.slice(0, 5).map((report: any) => (
            <View key={report.id} style={styles.reportItem}>
              <View style={styles.reportDot} />
              <View style={styles.reportContent}>
                <Text style={styles.reportActivity}>{report.activity || 'Update'}</Text>
                <Text style={styles.reportMeta}>
                  {report.block_name ? `Block ${report.block_name}` : ''}{report.floor_number ? ` • Floor ${report.floor_number}` : ''}
                </Text>
                <Text style={styles.reportDate}>{report.report_date}</Text>
              </View>
              {report.completion_percentage != null && (
                <View style={styles.progressBadge}>
                  <Text style={styles.progressText}>{report.completion_percentage}%</Text>
                </View>
              )}
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingBottom: spacing['4xl'] },

  greeting: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing['2xl'] },
  greetText: { ...typography.bodySmall, color: colors.textSecondary },
  userName: { ...typography.h2, color: colors.text },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { ...typography.button, color: colors.white },

  statsRow: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing['2xl'] },

  recentCard: { marginBottom: spacing.lg },
  emptyText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', paddingVertical: spacing['2xl'] },

  reportItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  reportDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginRight: spacing.md },
  reportContent: { flex: 1 },
  reportActivity: { ...typography.label, color: colors.text },
  reportMeta: { ...typography.caption, color: colors.textSecondary },
  reportDate: { ...typography.caption, color: colors.textTertiary },
  progressBadge: { backgroundColor: colors.primaryBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  progressText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
