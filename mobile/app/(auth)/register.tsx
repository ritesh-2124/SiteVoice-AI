import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useAuthStore } from '../../src/stores/authStore';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, typography, spacing } from '../../src/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.first_name) e.first_name = 'Required';
    if (!form.last_name) e.last_name = 'Required';
    if (!form.email) e.email = 'Required';
    if (!form.password || form.password.length < 8) e.password = 'Min 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = async () => {
    clearError();
    if (!validate()) return;
    try {
      await register({ first_name: form.first_name, last_name: form.last_name, email: form.email, password: form.password });
    } catch {}
  };

  const update = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join SiteVoice AI to start reporting</Text>

        {error && <View style={styles.errorBanner}><Text style={styles.errorText}>{error}</Text></View>}

        <View style={styles.row}>
          <View style={styles.halfInput}>
            <Input label="First Name" leftIcon="person-outline" value={form.first_name} onChangeText={(v) => update('first_name', v)} error={errors.first_name} />
          </View>
          <View style={styles.halfInput}>
            <Input label="Last Name" leftIcon="person-outline" value={form.last_name} onChangeText={(v) => update('last_name', v)} error={errors.last_name} />
          </View>
        </View>

        <Input label="Email" leftIcon="mail-outline" value={form.email} onChangeText={(v) => update('email', v)} keyboardType="email-address" autoCapitalize="none" error={errors.email} />
        <Input label="Password" leftIcon="lock-closed-outline" value={form.password} onChangeText={(v) => update('password', v)} isPassword error={errors.password} />
        <Input label="Confirm Password" leftIcon="lock-closed-outline" value={form.confirmPassword} onChangeText={(v) => update('confirmPassword', v)} isPassword error={errors.confirmPassword} />

        <Button title="Create Account" onPress={handleRegister} loading={isLoading} fullWidth size="lg" />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/(auth)/login"><Text style={styles.linkText}>Sign In</Text></Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, padding: spacing['2xl'], paddingTop: spacing['5xl'] },
  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.bodySmall, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing['3xl'] },
  row: { flexDirection: 'row', gap: spacing.md },
  halfInput: { flex: 1 },
  errorBanner: { backgroundColor: colors.dangerBg, padding: spacing.md, borderRadius: 8, marginBottom: spacing.lg },
  errorText: { ...typography.bodySmall, color: colors.danger, textAlign: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing['2xl'] },
  footerText: { ...typography.bodySmall, color: colors.textSecondary },
  linkText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },
});
