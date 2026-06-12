import { Stack } from 'expo-router';
import { colors } from '../../src/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="project/[id]" options={{ title: 'Project Details' }} />
      <Stack.Screen name="project/record/[id]" options={{ title: 'Voice Recording', presentation: 'modal' }} />
      <Stack.Screen name="transcript/[id]" options={{ title: 'Transcript' }} />
      <Stack.Screen name="report/[id]" options={{ title: 'Report Details' }} />
    </Stack>
  );
}
