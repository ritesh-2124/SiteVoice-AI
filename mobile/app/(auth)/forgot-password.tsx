import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { authApi } from '../../src/services/endpoints';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { colors, typography, spacing } from '../../src/theme';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ fontSize: 48, marginBottom: spacing.lg }}>📧</Text>
        <Text style={styles.title}>Check Your Email</Text>
        <Text style={styles.subtitle}>We've sent a password reset link to {email}</Text>
        <Button title="Back to Login" onPress={() => router.replace('/(auth)/login')} variant="outline" style={{ marginTop: spacing['2xl'] }} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>Enter your email and we'll send you a reset link</Text>
        <Input label="Email" leftIcon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} fullWidth size="lg" />
        <Button title="Back to Login" onPress={() => router.back()} variant="ghost" style={{ marginTop: spacing.md }} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center', padding: spacing['2xl'] },
  content: { flex: 1, justifyContent: 'center', padding: spacing['2xl'] },
  title: { ...typography.h2, color: colors.text, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing['3xl'], textAlign: 'center' },
});
