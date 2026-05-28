import { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { INTEREST_TAGS, MAX_INTEREST_TAGS } from '@/lib/constants';

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
      <Text className="text-fg-4 text-[10px] uppercase tracking-widest font-semibold mb-2 px-1">
        Interessen
      </Text>
      <View className="flex-row flex-wrap gap-1.5">
        {tags.map((tag) => (
          <View
            key={tag}
            className="flex-row items-center pl-2.5 pr-1.5 py-1 rounded-pill bg-white/5 border border-line"
          >
            <Text className="text-white text-[11.5px] font-semibold mr-1">{tag}</Text>
            <Pressable onPress={() => remove(tag)} hitSlop={6} className="p-0.5">
              <Ionicons name="close-circle" size={16} color="rgba(255,255,255,0.45)" />
            </Pressable>
          </View>
        ))}
        {tags.length < MAX_INTEREST_TAGS ? (
          <Pressable
            onPress={() => setModalOpen(true)}
            className="flex-row items-center gap-1 px-2.5 py-1 rounded-pill border border-dashed border-line-2"
          >
            <Ionicons name="add" size={14} color="rgba(255,255,255,0.5)" />
            <Text className="text-fg-3 text-[11.5px] font-semibold">Hinzufügen</Text>
          </Pressable>
        ) : null}
      </View>

      <Modal visible={modalOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/60"
          onPress={() => setModalOpen(false)}
        />
        <View className="absolute bottom-0 left-0 right-0 bg-card border-t border-line-2 rounded-t-3xl p-5 max-h-[70%]">
          <Text className="text-white text-lg font-bold mb-3 text-center">Interesse wählen</Text>
          <View className="flex-row gap-2 mb-3">
            <TextInput
              value={customTag}
              onChangeText={setCustomTag}
              placeholder="Eigenes Tag…"
              placeholderTextColor="rgba(255,255,255,0.35)"
              className="flex-1 bg-white/5 border border-line rounded-pill px-4 py-2.5 text-white text-[14px]"
              onSubmitEditing={() => add(customTag)}
            />
            <Pressable
              onPress={() => add(customTag)}
              className="px-4 py-2.5 rounded-pill bg-accent justify-center"
            >
              <Text className="text-white font-semibold text-[13px]">OK</Text>
            </Pressable>
          </View>
          <ScrollView className="max-h-64">
            <View className="flex-row flex-wrap gap-2 pb-6">
              {available.map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => add(tag)}
                  className="px-3 py-2 rounded-pill border border-line bg-white/5"
                >
                  <Text className="text-white text-[13px] font-semibold">{tag}</Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
