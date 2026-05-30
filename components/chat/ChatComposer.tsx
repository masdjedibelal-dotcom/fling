import { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Platform,
  Alert,
  ActivityIndicator,
  InputAccessoryView,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { ChatEmojiBar } from '@/components/chat/ChatEmojiBar';
import { PhotoSourceSheet } from '@/components/chat/PhotoSourceSheet';
import { ViewOnceCaptureModal } from '@/components/chat/ViewOnceCaptureModal';
import { ViewOncePhotoPreview } from '@/components/chat/ViewOncePhotoPreview';
import { FLING_COLORS, FLING_BUTTON_GRADIENT, FLING_TOUCH, FLING_TYPE } from '@/lib/designTokens';
import { MAX_MESSAGE_LENGTH, MESSAGE_LIMIT_HINT } from '@/lib/constants';
import { triggerHaptic } from '@/lib/haptics';

export const CHAT_INPUT_ACCESSORY_ID = 'flingChatEmojiBar';

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
  const [androidEmoji, setAndroidEmoji] = useState(false);
  const [inputContentH, setInputContentH] = useState(INPUT_LINE_H);

  useEffect(() => {
    if (!text) setInputContentH(INPUT_LINE_H);
  }, [text]);

  const hasText = text.trim().length > 0;
  const useMultiline =
    hasText || text.includes('\n') || inputContentH > INPUT_LINE_H + 2;

  const fieldH = useMultiline
    ? Math.max(
        BAR_H,
        Math.min(INPUT_MAX_H + INPUT_V_PAD * 2, inputContentH + INPUT_V_PAD * 2),
      )
    : BAR_H;

  const showAndroidEmoji = Platform.OS === 'android' && androidEmoji && keyboardVisible;

  const bottomPad =
    Platform.OS === 'web' && keyboardVisible
      ? Math.max(keyboardInsetBottom, 0)
      : keyboardVisible
        ? 0
        : insets.bottom;

  const insertEmoji = useCallback(
    (emoji: string) => {
      const next = `${text}${emoji}`.slice(0, MAX_MESSAGE_LENGTH);
      onChangeText(next);
      inputRef.current?.focus();
    },
    [text, onChangeText],
  );

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

  const emojiAccessory =
    Platform.OS === 'ios' ? (
      <InputAccessoryView nativeID={CHAT_INPUT_ACCESSORY_ID}>
        <ChatEmojiBar onPick={insertEmoji} />
      </InputAccessoryView>
    ) : null;

  return (
    <>
      {emojiAccessory}
      {showAndroidEmoji ? <ChatEmojiBar onPick={insertEmoji} /> : null}

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
        <View className="flex-row items-end gap-2" style={{ minHeight: BAR_H }}>
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
              multiline={useMultiline}
              editable
              autoCorrect
              spellCheck
              blurOnSubmit={false}
              scrollEnabled={useMultiline && inputContentH >= INPUT_MAX_H}
              nativeID="fling-chat-input"
              style={[
                styles.input,
                useMultiline ? styles.inputMultiline : styles.inputSingleLine,
              ]}
              textAlignVertical="center"
              onContentSizeChange={
                useMultiline
                  ? (e) => {
                      const h = Math.ceil(e.nativeEvent.contentSize.height);
                      if (Platform.OS === 'web' && !text.trim()) {
                        setInputContentH(INPUT_LINE_H);
                        return;
                      }
                      setInputContentH(
                        Math.min(INPUT_MAX_H, Math.max(INPUT_LINE_H, h)),
                      );
                    }
                  : undefined
              }
              inputAccessoryViewID={
                Platform.OS === 'ios' ? CHAT_INPUT_ACCESSORY_ID : undefined
              }
              showSoftInputOnFocus={Platform.OS !== 'web'}
              onFocus={() => {
                onInputFocus?.();
                if (Platform.OS === 'android') setAndroidEmoji(true);
              }}
              onBlur={() => onInputBlur?.()}
            />

            <Pressable
              onPress={() => {
                inputRef.current?.focus();
                if (Platform.OS === 'android') setAndroidEmoji((v) => !v);
              }}
              hitSlop={10}
              style={styles.emojiBtn}
              accessibilityLabel="Emojis"
            >
              <Text style={styles.emojiGlyph} accessibilityElementsHidden>
                ☺
              </Text>
            </Pressable>
          </View>

          {hasText ? (
            <Pressable
              onPress={() => {
                triggerHaptic('light');
                onSendText();
              }}
              disabled={busy}
              style={styles.actionBtn}
              className="rounded-full overflow-hidden"
              accessibilityLabel="Senden"
            >
              <LinearGradient
                colors={[...FLING_BUTTON_GRADIENT]}
                locations={[0, 0.55, 1]}
                className="flex-1 items-center justify-center"
              >
                <FlingIcon name="arrow" size={18} color="#fff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPress={onMicPress}
              disabled={busy && !recording}
              style={styles.actionBtn}
              className={`rounded-full items-center justify-center ${
                recording ? 'bg-accent-2' : 'bg-accent'
              }`}
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
    marginBottom: 0,
  },
  field: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingLeft: 14,
    paddingRight: 4,
    minHeight: BAR_H,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_400Regular',
    fontSize: INPUT_FONT,
    lineHeight: INPUT_LINE_H,
    color: '#FFFFFF',
    paddingLeft: 0,
    paddingRight: 6,
    margin: 0,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
    ...(Platform.OS === 'web'
      ? {
          outlineWidth: 0,
          outlineStyle: 'solid',
          outlineColor: 'transparent',
        }
      : {}),
  },
  inputSingleLine: {
    height: BAR_H,
    minHeight: BAR_H,
    maxHeight: BAR_H,
    paddingTop: Platform.OS === 'ios' ? 11 : 10,
    paddingBottom: Platform.OS === 'ios' ? 11 : 10,
  },
  inputMultiline: {
    minHeight: INPUT_LINE_H,
    maxHeight: INPUT_MAX_H,
    paddingTop: INPUT_V_PAD,
    paddingBottom: INPUT_V_PAD,
    textAlignVertical: 'top',
  },
  emojiBtn: {
    width: 36,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiGlyph: {
    fontSize: 22,
    lineHeight: 26,
    color: 'rgba(255,255,255,0.72)',
  },
  actionBtn: {
    width: BAR_H,
    height: BAR_H,
    borderRadius: BAR_H / 2,
    overflow: 'hidden',
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
