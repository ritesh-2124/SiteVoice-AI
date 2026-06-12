import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import { Ionicons } from '@expo/vector-icons';
import { voiceApi } from '../../../../src/services/endpoints';
import { Button } from '../../../../src/components/ui/Button';
import { colors, typography, spacing, borderRadius } from '../../../../src/theme';

export default function RecordScreen() {
  const { id: projectId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null); // ✅ track uri in state
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    (async () => {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        Alert.alert('Permission Required', 'Microphone access is needed for voice recording.');
        router.back();
      }
    })();

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startRecording = async () => {
    try {
      setAudioUri(null);
      setDuration(0);

      // ✅ prepare first, then record
      await recorder.prepareToRecordAsync();
      recorder.record();

      setIsRecording(true);
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
      console.log('🎙️ Recording started for project:', projectId);
    } catch (err) {
      console.error('Start recording error:', err);
      Alert.alert('Error', 'Failed to start recording');
    }
  };

  const pauseRecording = async () => {
    try {
      recorder.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err) {
      console.error('Pause error:', err);
    }
  };

  const resumeRecording = async () => {
    try {
      recorder.record();
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration((d) => d + 1), 1000);
    } catch (err) {
      console.error('Resume error:', err);
    }
  };

  // ✅ watch recorder.uri after stop
  useEffect(() => {
    if (!isRecording && recorder.uri && recorder.uri !== '') {
      console.log('📼 URI available:', recorder.uri);
      setAudioUri(recorder.uri);
    }
  }, [recorder.uri, isRecording]);

  const stopRecording = async () => {
    try {
      await recorder.stop();
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
      console.log('🛑 Stopped. recorder.uri:', recorder.uri);

      // ✅ sometimes uri is available immediately after stop on Android
      if (recorder.uri && recorder.uri !== '') {
        console.log('📼 URI available immediately:', recorder.uri);
        setAudioUri(recorder.uri);
      }
    } catch (err) {
      console.error('Stop recording error:', err);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  const uploadAndProcess = async () => {
    if (!audioUri) {
      Alert.alert('Error', 'No audio file found. Please record again.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri, // ✅ use state uri
        type: 'audio/m4a',
        name: `recording_${Date.now()}.m4a`,
      } as any);
      formData.append('project_id', projectId!);

      console.log('📤 Uploading audio for project:', projectId);
      const uploadRes = await voiceApi.upload(formData);
      const uploadId = uploadRes.data.data?.id;
      console.log('✅ Upload success. Upload ID:', uploadId);

      if (uploadId) {
        setUploading(false);
        setProcessing(true);
        console.log('🤖 Processing with AI...');
        const processRes = await voiceApi.process(uploadId);
        setProcessing(false);

        const transcriptId = processRes.data.data?.transcript?.id;
        console.log('📝 Transcript ID:', transcriptId);

        if (transcriptId) {
          router.replace(`/(app)/transcript/${transcriptId}`);
        } else {
          Alert.alert('Success', 'Recording uploaded and processed!');
          router.back();
        }
      } else {
        throw new Error('Upload ID not returned from server');
      }
    } catch (err: any) {
      console.error('Upload/process error:', err?.response?.data || err);
      setUploading(false);
      setProcessing(false);
      Alert.alert('Error', err?.response?.data?.message || 'Upload failed. Please try again.');
    }
  };

  const getStatusLabel = () => {
    if (processing) return 'Processing with AI...';
    if (uploading) return 'Uploading...';
    if (isRecording) return isPaused ? 'Paused' : 'Recording...';
    if (audioUri) return 'Recording complete';
    return 'Ready to record';
  };

  return (
    <View style={styles.container}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timer}>{formatTime(duration)}</Text>
        <Text style={styles.timerLabel}>{getStatusLabel()}</Text>
      </View>

      {/* Pulse Animation */}
      <View style={styles.pulseContainer}>
        <Animated.View style={[styles.pulseOuter, { transform: [{ scale: pulseAnim }] }]} />
        <View style={[styles.micCircle, isRecording && !isPaused && styles.micRecording]}>
          <Ionicons name={isRecording ? 'mic' : 'mic-outline'} size={40} color={colors.white} />
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>

        {/* Start button — show only when not recording and no audio yet */}
        {!isRecording && !audioUri && (
          <Button
            title="Start Recording"
            icon={<Ionicons name="mic" size={20} color={colors.white} />}
            onPress={startRecording}
            size="lg"
          />
        )}

        {/* Pause / Resume / Stop — show while recording */}
        {isRecording && (
          <View style={styles.recordingControls}>
            {isPaused ? (
              <Button
                title="Resume"
                icon={<Ionicons name="play" size={20} color={colors.white} />}
                onPress={resumeRecording}
              />
            ) : (
              <Button
                title="Pause"
                icon={<Ionicons name="pause" size={20} color={colors.primary} />}
                onPress={pauseRecording}
                variant="outline"
              />
            )}
            <Button
              title="Stop"
              icon={<Ionicons name="stop" size={20} color={colors.white} />}
              onPress={stopRecording}
              variant="danger"
            />
          </View>
        )}

        {/* Upload — show after recording stopped and uri is ready */}
        {!isRecording && audioUri && (
          <View style={styles.postControls}>
            <Button
              title={processing ? 'Processing with AI...' : uploading ? 'Uploading...' : 'Upload & Process'}
              icon={<Ionicons name="cloud-upload" size={20} color={colors.white} />}
              onPress={uploadAndProcess}
              loading={uploading || processing}
              size="lg"
              fullWidth
            />
            <Button
              title="Record Again"
              onPress={startRecording}
              variant="outline"
              fullWidth
              style={{ marginTop: spacing.md }}
            />
          </View>
        )}

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing['2xl'],
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: spacing['4xl'],
  },
  timer: {
    fontSize: 56,
    fontWeight: '200',
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  pulseContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['4xl'],
    width: 160,
    height: 160,
  },
  pulseOuter: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: `${colors.danger}20`,
  },
  micCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRecording: {
    backgroundColor: colors.danger,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  recordingControls: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  postControls: {
    width: '100%',
  },
});