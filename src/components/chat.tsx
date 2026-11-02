import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../theme';
import { Chat } from '../store';
import { petById, shelterById } from '../data/pets';
import { NotificationBadge, ShelterLogo, T } from './ui';
import { Tap } from '../anim';

export function timeLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const dayStart = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((dayStart(now) - dayStart(d)) / 86400000);
  if (diffDays <= 0) return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  if (diffDays === 1) return 'Вчора';
  return ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][d.getDay()];
}

// Рядок розмови: логотип притулку, і одразу видно, ПРО ЯКУ тварину йдеться (фото справа + підпис)
export function MessageRow({ chat, onPress }: { chat: Chat; onPress: () => void }) {
  const pet = petById(chat.petId);
  const shelter = pet && shelterById(pet.shelterId);
  const last = chat.messages[chat.messages.length - 1];
  const unread = chat.unread > 0;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md, paddingHorizontal: spacing.lg, backgroundColor: pressed ? colors.border : 'transparent' })}>
      <ShelterLogo kind={shelter?.logo ?? 1} size={52} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing.sm }}>
          <T variant="h3" numberOfLines={1} style={{ flex: 1 }}>Притулок «{shelter?.name}»</T>
          <T variant="caption" color={unread ? colors.accent : colors.textSecondary}>{timeLabel(chat.updated)}</T>
        </View>
        <T variant="caption" color={colors.link}>🐾 {pet?.name}</T>
        <T variant="bodySmall" color={unread ? colors.text : colors.textSecondary} numberOfLines={1} style={{ fontWeight: unread ? '500' : '400' }}>
          {last ? (last.from === 'user' ? `Ви: ${last.text}` : last.text) : 'Напишіть перше повідомлення'}
        </T>
      </View>
      {pet && (
        <View>
          <Image source={{ uri: pet.photos[0] }} style={{ width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.border }} />
          <NotificationBadge count={chat.unread} style={{ position: 'absolute', top: -6, right: -6 }} />
        </View>
      )}
    </Pressable>
  );
}

// Службова картка «Наступні дії»
export function ActionCard({ emoji, title, text, onPress }: { emoji: string; title: string; text: string; onPress?: () => void; tone?: 'blue' | 'yellow' | 'coral' }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: 30, padding: spacing.sm, paddingRight: spacing.lg, ...shadow.card }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18 }}>{emoji}</Text>
      </View>
      <View style={{ flex: 1, gap: 1 }}>
        <T variant="h3">{title}</T>
        <T variant="caption" color={colors.textSecondary} numberOfLines={2} style={{ fontWeight: '400' }}>{text}</T>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
    </Tap>
  );
}
