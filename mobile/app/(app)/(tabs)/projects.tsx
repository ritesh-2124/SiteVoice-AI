import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { projectApi } from '../../../src/services/endpoints';
import { colors, typography, spacing, borderRadius, shadows } from '../../../src/theme';

const statusColors: Record<string, string> = {
  planning: '#6366F1', active: '#10B981', on_hold: '#F59E0B', completed: '#64748B',
};

export default function ProjectsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => { const res = await projectApi.list(); return res.data.data || []; },
  });

  const renderProject = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/(app)/project/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.codeContainer}>
          <Text style={styles.code}>{item.code}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${statusColors[item.status] || colors.textTertiary}20` }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColors[item.status] || colors.textTertiary }]} />
          <Text style={[styles.statusText, { color: statusColors[item.status] || colors.textTertiary }]}>
            {item.status.replace('_', ' ')}
          </Text>
        </View>
      </View>
      <Text style={styles.name}>{item.name}</Text>
      {item.location && (
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={14} color={colors.textTertiary} />
          <Text style={styles.location}>{item.location}</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.date}>{item.start_date || 'No date set'}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={data || []}
        renderItem={renderProject}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="business-outline" size={48} color={colors.textTertiary} />
            <Text style={styles.emptyText}>No projects yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg },

  card: { backgroundColor: colors.surface, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.md, ...shadows.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  codeContainer: { backgroundColor: colors.primaryBg, paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: borderRadius.sm },
  code: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  statusText: { ...typography.caption, fontWeight: '600', textTransform: 'capitalize' },

  name: { ...typography.h4, color: colors.text, marginBottom: spacing.xs },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  location: { ...typography.caption, color: colors.textTertiary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.borderLight },
  date: { ...typography.caption, color: colors.textSecondary },

  empty: { alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyText: { ...typography.body, color: colors.textTertiary, marginTop: spacing.md },
});
