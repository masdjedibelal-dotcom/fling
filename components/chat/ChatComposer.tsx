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
import { FLING_COLORS, FLING_BUTTON_GRADIENT, FLING_TOUCH, FLING_TYPE } from '@/lib/designTokens';
import { MAX_MESSAGE_LENGTH, MESSAGE_LIMIT_HINT } from '@/lib/constants';

export const CHAT_INPUT_ACCESSORY_ID = 'flingChatEmojiBar';

/** Eine Toolbar-Zeile — iOS Mindesthöhe 44pt (wie Messages/WhatsApp) */
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

  const insertEmoji = useCallback(
    (emoji: string) => {
      const next = `${text}${emoji}`.slice(0, MAX_MESSAGE_LENGTH);
      onChangeText(next);
      inputRef.current?.focus();
    },
    [text, onChangeText],
  );

  const captureViewOncePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Kamera', 'Bitte Kamera-Zugriff erlauben.');
      return;
    }
    setBusy(true);
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    });
    setBusy(false);
    if (result.canceled || !result.assets[0]) return;
    await onSendImage(result.assets[0].uri);
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

  const onMicPressIn = () => {
    if (hasText || busy) return;
    void startRecording();
  };

  const onMicPressOut = () => {
    if (recording) void stopRecording();
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

      <View
        style={{
          borderTopWidth: 1,
          borderTopColor: FLING_COLORS.line,
          backgroundColor: FLING_COLORS.bg,
          paddingBottom: keyboardVisible
            ? Platform.OS === 'web'
              ? Math.max(keyboardInsetBottom, 8) + 4
              : 4
            : Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingHorizontal: 8,
        }}
      >
        <View className="flex-row items-center gap-1.5" style={{ minHeight: BAR_H }}>
          <Pressable
            onPress={() => void captureViewOncePhoto()}
            disabled={busy}
            style={[styles.barSlot, styles.cameraSlot]}
            accessibilityLabel="Einmal-Foto aufnehmen"
          >
            <FlingIcon name="camera" size={20} color={FLING_COLORS.fg} />
            <View style={styles.viewOnceBadge}>
              <Text style={styles.viewOnceBadgeText}>1</Text>
            </View>
          </Pressable>

          <View
            nativeID="fling-chat-composer-field"
            className="flex-1 flex-row items-center rounded-[18px] border border-line-2 overflow-hidden"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              height: fieldH,
              maxHeight: INPUT_MAX_H + INPUT_V_PAD * 2 + 2,
              paddingLeft: 12,
            }}
          >
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
                styles.inputWithEmoji,
                useMultiline ? styles.inputMultiline : styles.inputSingleLine,
              ]}
              textAlign="left"
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
                if (Platform.OS === 'web' && typeof document !== 'undefined') {
                  requestAnimationFrame(() => {
                    document
                      .getElementById('fling-chat-input')
                      ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
                  });
                }
              }}
              onBlur={() => onInputBlur?.()}
            />
            <Pressable
              onPress={() => {
                inputRef.current?.focus();
                if (Platform.OS === 'android') setAndroidEmoji((v) => !v);
              }}
              hitSlop={8}
              style={styles.emojiBtn}
              accessibilityLabel="Emojis"
            >
              <FlingIcon name="smile" size={18} color="rgba(255,255,255,0.55)" />
            </Pressable>
          </View>

          <View style={styles.counterSlot}>
            <Text
              style={[
                styles.counterText,
                text.length >= MAX_MESSAGE_LENGTH && styles.counterTextLimit,
              ]}
            >
              {text.length}/{MAX_MESSAGE_LENGTH}
            </Text>
          </View>

          {hasText ? (
            <Pressable
              onPress={onSendText}
              disabled={busy}
              style={[styles.actionBtn, styles.sendShadow]}
              className="rounded-full overflow-hidden"
            >
              <LinearGradient
                colors={[...FLING_BUTTON_GRADIENT]}
                locations={[0, 0.55, 1]}
                className="flex-1 items-center justify-center"
              >
                <FlingIcon name="arrow" size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          ) : (
            <Pressable
              onPressIn={onMicPressIn}
              onPressOut={onMicPressOut}
              disabled={busy}
              style={styles.actionBtn}
              className={`rounded-full items-center justify-center ${
                recording ? 'bg-accent-2' : 'bg-accent'
              }`}
            >
              {busy && !recording ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <FlingIcon name="mic" size={19} color="#fff" />
              )}
            </Pressable>
          )}
        </View>

        {text.length >= MAX_MESSAGE_LENGTH ? (
          <Text
            style={{
              marginTop: 6,
              textAlign: 'center',
              fontSize: FLING_TYPE.caption2,
              color: FLING_COLORS.accent2,
              fontFamily: 'Inter_500Medium',
            }}
          >
            {MESSAGE_LIMIT_HINT}
          </Text>
        ) : null}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  barSlot: {
    width: BAR_H,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraSlot: {
    position: 'relative',
    overflow: 'visible',
  },
  viewOnceBadge: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FLING_COLORS.accent,
    borderWidth: 1.5,
    borderColor: FLING_COLORS.bg,
  },
  viewOnceBadgeText: {
    color: '#FFFFFF',
    fontSize: FLING_TYPE.caption2,
    fontWeight: '700',
    lineHeight: 11,
  },
  counterSlot: {
    minWidth: 44,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  counterText: {
    color: 'rgba(255,255,255,0.32)',
    fontSize: FLING_TYPE.caption2,
    fontFamily: 'JetBrainsMono_400Regular',
    letterSpacing: -0.3,
  },
  counterTextLimit: {
    color: FLING_COLORS.accent2,
  },
  emojiBtn: {
    width: 34,
    height: BAR_H,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 2,
    zIndex: 2,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontFamily: 'Inter_500Medium',
    fontSize: INPUT_FONT,
    lineHeight: INPUT_LINE_H,
    color: '#FFFFFF',
    paddingLeft: 0,
    paddingRight: 0,
    margin: 0,
    textAlign: 'left',
    textAlignVertical: 'center',
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
    paddingTop: 0,
    paddingBottom: 0,
    lineHeight: Platform.OS === 'ios' ? BAR_H - 2 : BAR_H,
  },
  inputWithEmoji: {
    paddingRight: 4,
  },
  inputMultiline: {
    minHeight: INPUT_LINE_H,
    maxHeight: INPUT_MAX_H,
    paddingTop: INPUT_V_PAD,
    paddingBottom: INPUT_V_PAD,
  },
  actionBtn: {
    width: BAR_H,
    height: BAR_H,
  },
  sendShadow: {
    shadowColor: FLING_COLORS.accentGlow,
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
