import { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { PhotoSourceSheet } from '@/components/chat/PhotoSourceSheet';
import { ViewOnceCaptureModal } from '@/components/chat/ViewOnceCaptureModal';
import { ViewOncePhotoPreview } from '@/components/chat/ViewOncePhotoPreview';
import { VoiceRecordingWaveform } from '@/components/chat/VoiceRecordingWaveform';
import { FLING_COLORS, FLING_BUTTON_GRADIENT, FLING_TYPE } from '@/lib/designTokens';
import { MAX_MESSAGE_LENGTH, MESSAGE_LIMIT_HINT } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';

/** Kompakter als Standard-Tab-Bar — klebt an der Tastatur */
const BTN_SIZE = 36;
const INPUT_FONT = FLING_TYPE.body;
const INPUT_LINE_H = 22;
const INPUT_MAX_LINES = 5;
const INPUT_MAX_H = INPUT_LINE_H * INPUT_MAX_LINES;
const INPUT_V_PAD = 8;
const ICON_SIZE = 20;
const ACTION_ICON_SIZE = 18;

type Props = {
  text: string;
  onChangeText: (t: string) => void;
  onSendText: () => void;
  onSendImage: (uri: string) => Promise<void>;
  onSendVoice: (uri: string, durationMs: number) => Promise<void>;
  keyboardVisible: boolean;
  keyboardInsetBottom?: number;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
};

export function ChatComposer({
  text,
  onChangeText,
  onSendText,
  onSendImage,
  onSendVoice,
  keyboardVisible,
  keyboardInsetBottom = 0,
  onInputFocus,
  onInputBlur,
}: Props) {
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordStartedAt = useRef(0);
  const [recording, setRecording] = useState(false);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(null);
  const [meterLevel, setMeterLevel] = useState(0.35);
  const [busy, setBusy] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [inputContentH, setInputContentH] = useState(INPUT_LINE_H);

  useEffect(() => {
    if (!text) setInputContentH(INPUT_LINE_H);
  }, [text]);

  const hasText = text.trim().length > 0;
  const multiline = inputContentH > INPUT_LINE_H + 2;

  const fieldH = Math.max(
    BTN_SIZE,
    Math.min(INPUT_MAX_H + INPUT_V_PAD * 2, inputContentH + INPUT_V_PAD * 2),
  );

  const bottomPad = (() => {
    if (Platform.OS === 'android') {
      return insets.bottom;
    }
    if (keyboardVisible && keyboardInsetBottom > 0) {
      return keyboardInsetBottom;
    }
    return insets.bottom;
  })();

  const openPhotoSheet = () => {
    inputRef.current?.blur();
    setPhotoSheetOpen(true);
  };

  const pickFromGallery = async () => {
    setPhotoSheetOpen(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Galerie', 'Bitte Galerie-Zugriff erlauben.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPreviewUri(result.assets[0].uri);
    }
  };

  const openCamera = () => {
    setPhotoSheetOpen(false);
    setCameraOpen(true);
  };

  const sendPhoto = async (uri: string) => {
    setBusy(true);
    try {
      await onSendImage(uri);
    } finally {
      setBusy(false);
      setPreviewUri(null);
      setCameraOpen(false);
    }
  };

  const startRecording = async () => {
    try {
      inputRef.current?.blur();
      triggerHaptic('medium');
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Mikrofon', 'Bitte Mikrofon-Zugriff erlauben.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const preset = Audio.RecordingOptionsPresets.HIGH_QUALITY;
      const { recording: rec } = await Audio.Recording.createAsync({
        ...preset,
        isMeteringEnabled: true,
      });
      rec.setOnRecordingStatusUpdate((status) => {
        if (!status.isRecording || status.metering == null) return;
        const level = Math.min(1, Math.max(0.12, (status.metering + 50) / 50));
        setMeterLevel(level);
      });
      await rec.setProgressUpdateInterval(80);
      recordingRef.current = rec;
      const started = Date.now();
      recordStartedAt.current = started;
      setRecordingStartedAt(started);
      setMeterLevel(0.35);
      setRecording(true);
    } catch {
      Alert.alert('Aufnahme', 'Sprachnotiz konnte nicht gestartet werden.');
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    triggerHaptic('light');
    setRecording(false);
    setRecordingStartedAt(null);
    setMeterLevel(0.35);
    recordingRef.current = null;
    try {
      await rec.stopAndUnloadAsync();
      const uri = rec.getURI();
      const durationMs = Math.max(0, Date.now() - recordStartedAt.current);
      if (uri && durationMs > 400) {
        setBusy(true);
        await onSendVoice(uri, durationMs);
      }
    } catch {
      Alert.alert('Aufnahme', 'Sprachnotiz konnte nicht gesendet werden.');
    } finally {
      setBusy(false);
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    }
  };

  const onMicPress = () => {
    if (hasText || busy) return;
    if (recording) void stopRecording();
    else void startRecording();
  };

  return (
    <>
      <PhotoSourceSheet
        visible={photoSheetOpen}
        onClose={() => setPhotoSheetOpen(false)}
        onCamera={openCamera}
        onGallery={() => void pickFromGallery()}
      />

      <ViewOnceCaptureModal
        visible={cameraOpen}
        onClose={() => setCameraOpen(false)}
        onCapture={(uri) => setPreviewUri(uri)}
        onOpenGallery={() => void pickFromGallery()}
      />

      <ViewOncePhotoPreview
        visible={Boolean(previewUri)}
        uri={previewUri ?? ''}
        onClose={() => setPreviewUri(null)}
        onRetake={() => setPreviewUri(null)}
        onSend={() => {
          if (previewUri) void sendPhoto(previewUri);
        }}
      />

      <View
        style={{
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: FLING_COLORS.line,
          backgroundColor: FLING_COLORS.bg,
          paddingBottom: bottomPad,
          paddingTop: recording ? 0 : keyboardVisible ? 6 : 8,
          paddingHorizontal: keyboardVisible ? 8 : 10,
        }}
      >
        <VoiceRecordingWaveform
          active={recording}
          meterLevel={meterLevel}
          startedAt={recordingStartedAt ?? undefined}
        />

        <View
          className="flex-row gap-1.5"
          style={{ alignItems: 'flex-end', minHeight: BTN_SIZE }}
        >
          <Pressable
            onPress={openPhotoSheet}
            disabled={busy || recording}
            style={[styles.iconSlot, recording && styles.dimmed]}
            accessibilityLabel="Foto senden"
          >
            <FlingIcon name="camera" size={ICON_SIZE} color={FLING_COLORS.fg} />
          </Pressable>

          <View
            style={[
              styles.field,
              { height: fieldH },
              recording && styles.fieldRecording,
            ]}
          >
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={(t) => onChangeText(t.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={recording ? 'Aufnahme läuft…' : ''}
              placeholderTextColor="rgba(255,255,255,0.38)"
              multiline
              editable={!recording}
              autoCorrect
              spellCheck
              blurOnSubmit={false}
              scrollEnabled={inputContentH >= INPUT_MAX_H - 1}
              nativeID="fling-chat-input"
              style={[
                styles.input,
                multiline ? styles.inputMultiline : styles.inputSingle,
              ]}
              onContentSizeChange={(e) => {
                const h = Math.ceil(e.nativeEvent.contentSize.height);
                if (Platform.OS === 'web' && !text.trim()) {
                  setInputContentH(INPUT_LINE_H);
                  return;
                }
                setInputContentH(
                  Math.min(INPUT_MAX_H, Math.max(INPUT_LINE_H, h)),
                );
              }}
              showSoftInputOnFocus={Platform.OS !== 'web'}
              onFocus={onInputFocus}
              onBlur={onInputBlur}
            />
          </View>

          {hasText ? (
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                onSendText();
              }}
              disabled={busy}
              style={styles.actionBtn}
              accessibilityLabel="Senden"
            >
              <LinearGradient
                colors={[...FLING_BUTTON_GRADIENT]}
                locations={[0, 0.55, 1]}
                style={StyleSheet.absoluteFillObject}
              />
              <FlingIcon name="send" size={ACTION_ICON_SIZE} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={onMicPress}
              disabled={busy && !recording}
              style={[
                styles.actionBtn,
                recording ? styles.stopBtn : styles.micBtn,
              ]}
              accessibilityLabel={recording ? 'Aufnahme stoppen' : 'Sprachnotiz'}
            >
              {busy && !recording ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : recording ? (
                <FlingIcon name="stop" size={ACTION_ICON_SIZE} color="#fff" />
              ) : (
                <FlingIcon name="mic" size={ACTION_ICON_SIZE} color="#fff" />
              )}
            </Pressable>
          )}
        </View>

        {text.length >= MAX_MESSAGE_LENGTH * 0.85 || text.length >= MAX_MESSAGE_LENGTH ? (
          <Text
            style={[
              styles.counter,
              text.length >= MAX_MESSAGE_LENGTH && styles.counterLimit,
            ]}
          >
            {text.length >= MAX_MESSAGE_LENGTH
              ? MESSAGE_LIMIT_HINT
              : `${text.length}/${MAX_MESSAGE_LENGTH}`}
          </Text>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  iconSlot: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  field: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    overflow: 'hidden',
    minHeight: BTN_SIZE,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_500Medium',
    fontSize: INPUT_FONT,
    lineHeight: INPUT_LINE_H,
    color: '#FFFFFF',
    margin: 0,
    maxHeight: INPUT_MAX_H,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    ...(Platform.OS === 'web'
      ? {
          outlineWidth: 0,
          outlineStyle: 'solid',
          outlineColor: 'transparent',
        }
      : {}),
  },
  inputSingle: {
    paddingTop: (BTN_SIZE - INPUT_LINE_H) / 2,
    paddingBottom: (BTN_SIZE - INPUT_LINE_H) / 2,
    textAlignVertical: 'center',
  },
  inputMultiline: {
    paddingTop: INPUT_V_PAD,
    paddingBottom: INPUT_V_PAD,
    textAlignVertical: 'top',
  },
  actionBtn: {
    width: BTN_SIZE,
    height: BTN_SIZE,
    borderRadius: BTN_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  micBtn: {
    backgroundColor: FLING_COLORS.accent,
  },
  stopBtn: {
    backgroundColor: FLING_COLORS.accent2,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  dimmed: {
    opacity: 0.35,
  },
  fieldRecording: {
    opacity: 0.45,
  },
  counter: {
    marginTop: 4,
    textAlign: 'center',
    fontSize: FLING_TYPE.caption2,
    color: 'rgba(255,255,255,0.32)',
    fontFamily: 'JetBrainsMono_400Regular',
  },
  counterLimit: {
    color: FLING_COLORS.accent2,
    fontFamily: 'Inter_500Medium',
  },
});
