import { useState } from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import { FlingScrollView } from '@/components/ui/FlingScrollView';
import { SectionLabel, TitleText, MetaText } from '@/components/ui/Typography';
import { BOTTOM_SHEET_MAX_RATIO } from '@/components/ui/BottomSheet';
import { BottomSheet, BottomSheetPanel } from '@/components/ui/BottomSheet';
import { FlingIcon } from '@/components/icons/FlingIcon';
import { INTEREST_TAGS, MAX_INTEREST_TAGS } from '@/lib/constants';
import { FLING_INPUT_TEXT, FLING_TYPE } from '@/lib/designTokens';

export function ProfileInterestEditor({
  tags,
  onChange,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [customTag, setCustomTag] = useState('');

  const remove = (tag: string) => onChange(tags.filter((t) => t !== tag));

  const add = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed || tags.includes(trimmed) || tags.length >= MAX_INTEREST_TAGS) return;
    onChange([...tags, trimmed]);
    setCustomTag('');
    setModalOpen(false);
  };

  const available = INTEREST_TAGS.filter((t) => !tags.includes(t));

  return (
    <View className="mb-4">
      <SectionLabel className="px-1">Interessen</SectionLabel>
      <MetaText className="text-fg-4 mb-2 px-1 normal-case">
        Max. {MAX_INTEREST_TAGS} Interessen
      </MetaText>
      <View className="flex-row flex-wrap gap-1.5">
        {tags.map((tag) => (
          <View
            key={tag}
            className="flex-row items-center pl-2.5 pr-1.5 py-1 rounded-pill bg-white/5 border border-line"
          >
            <Text
              className="text-white font-semibold mr-1"
              style={{ fontSize: FLING_TYPE.subhead }}
            >
              {tag}
            </Text>
            <Pressable onPress={() => remove(tag)} hitSlop={6} className="p-0.5">
              <FlingIcon name="close" size={14} color="rgba(255,255,255,0.45)" />
            </Pressable>
          </View>
        ))}
        {tags.length < MAX_INTEREST_TAGS ? (
          <Pressable
            onPress={() => setModalOpen(true)}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-pill border border-dashed border-line-2"
          >
            <FlingIcon name="plus" size={14} color="rgba(255,255,255,0.5)" />
            <Text
              className="text-fg-3 font-semibold"
              style={{ fontSize: FLING_TYPE.subhead }}
            >
              Hinzufügen
            </Text>
          </Pressable>
        ) : null}
      </View>

      <BottomSheet visible={modalOpen} onClose={() => setModalOpen(false)} animationType="fade">
        <BottomSheetPanel maxHeightRatio={BOTTOM_SHEET_MAX_RATIO}>
          <TitleText className="text-center mb-4">Interesse wählen</TitleText>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={customTag}
              onChangeText={setCustomTag}
              placeholder="Eigenes Tag…"
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="flex-1 bg-white/5 border border-line rounded-pill px-4 py-2.5 text-white"
              style={FLING_INPUT_TEXT}
              onSubmitEditing={() => add(customTag)}
            />
            <Pressable
              onPress={() => add(customTag)}
              className="px-4 py-2.5 rounded-pill bg-accent justify-center"
            >
              <Text
                className="text-white font-semibold"
                style={{ fontSize: FLING_TYPE.caption }}
              >
                OK
              </Text>
            </Pressable>
          </View>
          <FlingScrollView className="max-h-64">
            <View className="flex-row flex-wrap gap-2 pb-6">
              {available.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => add(tag)}
                  className="px-3 py-2 rounded-pill border border-white/12 bg-white/[0.06]"
                >
                  <Text
                    className="text-white font-semibold"
                    style={{ fontSize: FLING_TYPE.caption }}
                  >
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FlingScrollView>
        </BottomSheetPanel>
      </BottomSheet>
    </View>
  );
}
