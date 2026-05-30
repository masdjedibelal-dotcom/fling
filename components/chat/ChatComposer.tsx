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
import { FLING_COLORS, FLING_BUTTON_GRADIENT, FLING_TOUCH, FLING_TYPE } from '@/lib/designTokens';
import { MAX_MESSAGE_LENGTH, MESSAGE_LIMIT_HINT } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';

const BAR_H = FLING_TOUCH.bar;
const INPUT_FONT = FLING_TYPE.body;
const INPUT_LINE_H = 22;
const INPUT_MAX_H = 88;
const INPUT_V_PAD = (BAR_H - INPUT_LINE_H) / 2;

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
  const [busy, setBusy] = useState(false);
  const [photoSheetOpen, setPhotoSheetOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [inputContentH, setInputContentH] = useState(INPUT_LINE_H);

  useEffect(() => {
    if (!text) setInputContentH(INPUT_LINE_H);
  }, [text]);

  const hasText = text.trim().length > 0;

  const fieldH = Math.max(
    BAR_H,
    Math.min(INPUT_MAX_H + INPUT_V_PAD * 2, inputContentH + INPUT_V_PAD * 2),
  );

  const bottomPad =
    Platform.OS === 'web' && keyboardVisible
      ? Math.max(keyboardInsetBottom, 0)
      : keyboardVisible
        ? 0
        : insets.bottom;

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
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Mikrofon', 'Bitte Mikrofon-Zugriff erlauben.');
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );
      recordingRef.current = rec;
      recordStartedAt.current = Date.now();
      setRecording(true);
    } catch {
      Alert.alert('Aufnahme', 'Sprachnotiz konnte nicht gestartet werden.');
    }
  };

  const stopRecording = async () => {
    const rec = recordingRef.current;
    if (!rec) return;
    setRecording(false);
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
          paddingTop: 8,
          paddingHorizontal: 10,
        }}
      >
        <View className="flex-row items-center gap-2" style={{ minHeight: BAR_H }}>
          <Pressable
            onPress={openPhotoSheet}
            disabled={busy}
            style={styles.iconSlot}
            accessibilityLabel="Foto senden"
          >
            <FlingIcon name="camera" size={22} color={FLING_COLORS.fg} />
          </Pressable>

          <View style={[styles.field, { height: fieldH, maxHeight: INPUT_MAX_H + INPUT_V_PAD * 2 }]}>
            <TextInput
              ref={inputRef}
              value={text}
              onChangeText={(t) => onChangeText(t.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder="Nachricht"
              placeholderTextColor="rgba(255,255,255,0.38)"
              multiline
              editable
              autoCorrect
              spellCheck
              blurOnSubmit={false}
              scrollEnabled={inputContentH >= INPUT_MAX_H}
              nativeID="fling-chat-input"
              style={styles.input}
              textAlignVertical="center"
              onContentSizeChange={(e) => {
                const h = Math.ceil(e.nativeEvent.contentSize.height);
                if (Platform.OS === 'web' && !text.trim()) {
                  setInputContentH(INPUT_LINE_H);
                  return;
                }
                setInputContentH(Math.min(INPUT_MAX_H, Math.max(INPUT_LINE_H, h)));
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
              <FlingIcon name="send" size={20} color="#fff" />
            </Pressable>
          ) : (
            <Pressable
              onPress={onMicPress}
              disabled={busy && !recording}
              style={[
                styles.actionBtn,
                { backgroundColor: recording ? FLING_COLORS.accent2 : FLING_COLORS.accent },
              ]}
              accessibilityLabel={recording ? 'Aufnahme beenden' : 'Sprachnotiz'}
            >
              {busy && !recording ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <FlingIcon name="mic" size={20} color="#fff" />
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
    width: BAR_H,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    justifyContent: 'center',
    minHeight: BAR_H,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_500Medium',
    fontSize: INPUT_FONT,
    lineHeight: INPUT_LINE_H,
    color: '#FFFFFF',
    paddingTop: INPUT_V_PAD,
    paddingBottom: INPUT_V_PAD,
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
  actionBtn: {
    width: BAR_H,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  counter: {
    marginTop: 6,
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
