import React from 'react';
import { Pressable, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';
import { Tab } from '../nav';
import { NotificationBadge, T } from './ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const items: { key: Tab; label: string; icon: IconName }[] = [
  { key: 'home', label: 'Головна', icon: 'home-outline' },
  { key: 'feed', label: 'Стрічка', icon: 'newspaper-outline' },
  { key: 'search', label: 'Пошук', icon: 'search-outline' },
  { key: 'chats', label: 'Чати', icon: 'chatbubble-outline' },
  { key: 'account', label: 'Акаунт', icon: 'person-outline' },
];

// Активний пункт — помаранчевий, решта — темно-зелені
export function NavigationBar({ tab, onChange, unread }: { tab: Tab; onChange: (t: Tab) => void; unread: number }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.bg,
        paddingTop: spacing.md,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        shadowColor: '#2A1A00',
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -3 },
        elevation: 10,
      }}
    >
      {items.map((it) => {
        const active = tab === it.key;
        const c = active ? colors.accent : colors.text;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
            <View>
              <Ionicons name={it.icon} size={25} color={c} />
              {it.key === 'chats' && <NotificationBadge count={unread} style={{ position: 'absolute', top: -4, right: -8 }} />}
            </View>
            <T variant="caption" color={c} style={{ fontWeight: active ? '700' : '500' }}>{it.label}</T>
          </Pressable>
        );
      })}
    </View>
  );
}
