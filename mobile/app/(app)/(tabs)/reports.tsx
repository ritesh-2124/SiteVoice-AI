import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { reportApi } from '../../../src/services/endpoints';
import { useAuthStore } from '../../../src/stores/authStore';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/theme';

type StatusFilter = 'all' | 'submitted' | 'approved' | 'rejected' | 'draft';

const statusStyles: Record<string, { bg: string; text: string }> = {
  draft: { bg: '#F1F5F9', text: '#64748B' },
  submitted: { bg: '#EFF6FF', text: '#2563EB' },
  approved: { bg: '#ECFDF5', text: '#10B981' },
  rejected: { bg: '#FEF2F2', text: '#EF4444' },
};

const filters: { key: StatusFilter; label: string; icon: string }[] = [
  { key: 'all',       label: 'All',       icon: 'list-outline' },
  { key: 'submitted', label: 'Pending',   icon: 'time-outline' },
  { key: 'approved',  label: 'Approved',  icon: 'checkmark-circle-outline' },
  { key: 'rejected',  label: 'Rejected',  icon: 'close-circle-outline' },
  { key: 'draft',     label: 'Drafts',    icon: 'create-outline' },
];

export default function ReportsScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isPM = user && (user.role === 'project_manager' || user.role === 'admin');

  // Default to 'submitted' for PMs to see pending approvals first
  const [activeFilter, setActiveFilter] = useState<StatusFilter>(isPM ? 'submitted' : 'all');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['reports'],
    queryFn: async () => { const res = await reportApi.list(); return res.data.data || []; },
  });

  const filteredData = useMemo(() => {
    if (!data) return [];
    if (activeFilter === 'all') return data;
    return data.filter((r: any) => r.status === activeFilter);
  }, [data, activeFilter]);

  const statusCounts = useMemo(() => {
    if (!data) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    data.forEach((r: any) => {
      counts[r.status] = (counts[r.status] || 0) + 1;
    });
    return counts;
  }, [data]);

  const renderReport = ({ item }: { item: any }) => {
    const status = statusStyles[item.status] || statusStyles.draft;
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => router.push(`/(app)/report/${item.id}`)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.date}>{item.report_date}</Text>
          <View style={[styles.badge, { backgroundColor: status.bg }]}>
            <Text style={[styles.badgeText, { color: status.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.activity} numberOfLines={1}>{item.activity || 'Progress Update'}</Text>
        <View style={styles.details}>
          {item.block_name && <Text style={styles.detail}>🏗 Block {item.block_name}</Text>}
          {item.floor_number && <Text style={styles.detail}>🏢 Floor {item.floor_number}</Text>}
          {item.worker_count && <Text style={styles.detail}>👷 {item.worker_count} workers</Text>}
          {item.completion_percentage != null && <Text style={styles.detail}>📊 {item.completion_percentage}%</Text>}
        </View>
        {item.project && <Text style={styles.projectName}>{item.project.name}</Text>}
        {item.user && (
          <Text style={styles.submittedBy}>
            by {item.user.first_name} {item.user.last_name}
          </Text>
        )}

        {/* Show a subtle arrow to indicate tappable */}
        <View style={styles.arrowIndicator}>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Status Filter Chips */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {filters.map((f) => {
            const isActive = activeFilter === f.key;
            const count = f.key === 'all' ? (data?.length || 0) : (statusCounts[f.key] || 0);
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                onPress={() => setActiveFilter(f.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={f.icon as any}
                  size={16}
                  color={isActive ? colors.white : colors.textSecondary}
                />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {f.label}
                </Text>
                {count > 0 && (
                  <View style={[styles.countBadge, isActive && styles.countBadgeActive]}>
                    <Text style={[styles.countText, isActive && styles.countTextActive]}>
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={filteredData}
        renderItem={renderReport}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>
              {activeFilter === 'all' ? 'No reports yet' : `No ${activeFilter} reports`}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingTop: spacing.sm },

  // Filters
  filterContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: spacing.sm,
  },
  filterScroll: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterChipTextActive: { color: colors.white },
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  countText: { ...typography.caption, fontWeight: '700', color: colors.textSecondary, fontSize: 11 },
  countTextActive: { color: colors.white },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    position: 'relative',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  date: { ...typography.label, color: colors.text },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  badgeText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },
  activity: { ...typography.h4, color: colors.text, marginBottom: spacing.sm, paddingRight: spacing['2xl'] },
  details: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  detail: { ...typography.caption, color: colors.textSecondary, backgroundColor: colors.surfaceAlt, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  projectName: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.sm },
  submittedBy: { ...typography.caption, color: colors.textTertiary, marginTop: 2, fontStyle: 'italic' },
  arrowIndicator: { position: 'absolute', right: spacing.lg, top: '50%', marginTop: -9 },

  // Empty
  empty: { alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyText: { ...typography.body, color: colors.textTertiary, marginTop: spacing.md },
});
