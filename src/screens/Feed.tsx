import React from 'react';
import { FlatList, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING } from '../theme';
import { recommended, useApp } from '../store';
import { useNav } from '../nav';
import { pets, plural } from '../data/pets';
import { PetCard, PetStory } from '../components/pet';
import { T } from '../components/ui';

export function Feed() {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();

  const helpPets = pets.filter((p) => p.needsHelp);
  const personal = app.personalFeed;
  const list = personal ? recommended(app.prefs) : pets;

  const header = (
    <View style={{ gap: spacing.lg, paddingBottom: spacing.md }}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md }}>
        {helpPets.map((p) => <PetStory key={p.id} pet={p} label={p.needsHelp!} onPress={() => nav.openPet(p.id)} />)}
      </ScrollView>
      {personal && (
        <View style={{ marginHorizontal: SCREEN_PADDING, backgroundColor: colors.butter, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }}>
          <View style={{ flex: 1 }}>
            <T variant="h3">💛 Добірка для вас</T>
            <T variant="bodySmall" color={colors.textSecondary}>{list.length} {plural(list.length, 'тварина', 'тварини', 'тварин')} за вашим вибором</T>
          </View>
          <Pressable onPress={() => app.setPersonalFeed(false)} hitSlop={8}>
            <T variant="bodySmall" color={colors.link} style={{ fontWeight: '500' }}>Показати всіх</T>
          </Pressable>
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SCREEN_PADDING, paddingVertical: spacing.md }}>
        <Pressable onPress={() => nav.setTab('chats')} hitSlop={8}>
          <Ionicons name="mail-outline" size={26} color={colors.text} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: spacing.lg }}>
          <Ionicons name="bookmark-outline" size={26} color={colors.text} />
          <Pressable onPress={() => nav.setTab('account')} hitSlop={8}>
            <Ionicons name="heart-outline" size={26} color={colors.text} />
          </Pressable>
        </View>
      </View>
      <FlatList
        data={list}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View style={{ marginBottom: spacing.lg, backgroundColor: colors.surface, paddingTop: spacing.md }}>
            <PetCard pet={item} variant="feed" />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: spacing.xl }}
      />
    </View>
  );
}
