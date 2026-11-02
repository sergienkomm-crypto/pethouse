import React, { useEffect, useRef, useState } from 'react';
import { FlatList, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING, type } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { petById, shelterById } from '../data/pets';
import { MessageRow, timeLabel } from '../components/chat';
import { EmptyState, FilterChip, IconButton, SearchBar, ShelterLogo, T } from '../components/ui';
import { Pressable } from 'react-native';

type Tab = 'all' | 'unread' | 'apps';

export function Chats() {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  const list = app.chats
    .filter((c) => (tab === 'unread' ? c.unread > 0 : tab === 'apps' ? c.kind === 'application' : true))
    .filter((c) => {
      if (!q.trim()) return true;
      const p = petById(c.petId);
      const sh = p && shelterById(p.shelterId);
      return `${p?.name} ${sh?.name}`.toLowerCase().includes(q.trim().toLowerCase());
    })
    .sort((a, b) => b.updated - a.updated);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, paddingTop: spacing.md, gap: spacing.md }}>
        <T variant="h1">Повідомлення</T>
        <SearchBar placeholder="Пошук" value={q} onChangeText={setQ} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
          <FilterChip label="Усі" selected={tab === 'all'} onPress={() => setTab('all')} />
          <FilterChip label="Непрочитані" selected={tab === 'unread'} onPress={() => setTab('unread')} />
          <FilterChip label="Заявки" selected={tab === 'apps'} onPress={() => setTab('apps')} />
        </ScrollView>
      </View>
      <FlatList
        style={{ marginTop: spacing.sm }}
        data={list}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => <MessageRow chat={item} onPress={() => nav.openChat(item.id)} />}
        ListEmptyComponent={<EmptyState emoji="💬" title="Тут поки порожньо" text="Відкрийте профіль тварини й напишіть притулку" />}
      />
    </View>
  );
}

// ---- Окрема розмова ----
export function ChatThread({ chatId }: { chatId: string }) {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const listRef = useRef<FlatList>(null);
  const chat = app.chats.find((c) => c.id === chatId);
  const pet = chat && petById(chat.petId);
  const shelter = pet && shelterById(pet.shelterId);

  useEffect(() => {
    app.markRead(chatId);
  }, [chatId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!chat || !pet) return <EmptyState emoji="🤷" title="Розмову не знайдено" />;

  const send = () => {
    const t = text.trim();
    if (!t) return;
    app.sendMessage(chatId, t);
    setText('');
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.sm, paddingVertical: spacing.sm, backgroundColor: colors.surface }}>
        <IconButton icon="chevron-back" onPress={nav.back} />
        <ShelterLogo kind={shelter?.logo ?? 1} size={40} />
        <View style={{ flex: 1 }}>
          <T variant="h3" numberOfLines={1}>Притулок «{shelter?.name}»</T>
          <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{shelter?.city}</T>
        </View>
      </View>

      {/* Про яку тварину розмова */}
      <Pressable onPress={() => nav.openPet(pet.id)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, margin: spacing.md, padding: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md }}>
        <Image source={{ uri: pet.photos[0] }} style={{ width: 48, height: 48, borderRadius: radius.sm, backgroundColor: colors.border }} />
        <View style={{ flex: 1 }}>
          <T variant="h3">{pet.name}</T>
          <T variant="bodySmall" color={colors.textSecondary}>{pet.ageText} · {pet.city}</T>
        </View>
        <T variant="bodySmall" color={colors.primary} style={{ fontWeight: '600' }}>Профіль</T>
      </Pressable>

      <FlatList
        ref={listRef}
        data={chat.messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm, flexGrow: 1, justifyContent: chat.messages.length ? 'flex-end' : 'center' }}
        ListEmptyComponent={<EmptyState emoji="👋" title="Напишіть перше повідомлення" text={'Запитайте про характер, візит або документи'} />}
        renderItem={({ item }) => {
          const mine = item.from === 'user';
          return (
            <View style={{ alignSelf: mine ? 'flex-end' : 'flex-start', maxWidth: '82%', backgroundColor: mine ? colors.primary : colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
              <T variant="body" color={mine ? '#fff' : colors.text}>{item.text}</T>
              <T variant="caption" color={mine ? 'rgba(255,255,255,0.75)' : colors.textSecondary} style={{ alignSelf: 'flex-end', fontWeight: '400' }}>{timeLabel(item.at)}</T>
            </View>
          );
        }}
      />

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: colors.surface }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Повідомлення"
          placeholderTextColor={colors.textSecondary}
          style={[type.body, { flex: 1, backgroundColor: colors.bg, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 10, color: colors.text }]}
          onSubmitEditing={send}
        />
        <Pressable onPress={send} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="arrow-up" size={22} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
