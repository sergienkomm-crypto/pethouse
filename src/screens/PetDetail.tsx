import React, { useEffect, useState } from 'react';
import { Image, NativeScrollEvent, NativeSyntheticEvent, ScrollView, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, SCREEN_PADDING } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { petById, shelterById, sizeLabel, sizeWeight, traitLabel, Compat } from '../data/pets';
import { useFavorite } from '../components/pet';
import { EmptyState, FavoriteButton, IconButton, PetTag, PrimaryButton, SecondaryButton, ShelterLogo, T } from '../components/ui';

const goodWithText: Record<Compat, string> = {
  kids: 'Любить дітей',
  dogs: 'Ладнає з собаками',
  cats: 'Ладнає з котами',
  people: 'Любить людей',
};

export function PetDetail({ id }: { id: string }) {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [page, setPage] = useState(0);
  const pet = petById(id);
  const fav = useFavorite(id);

  useEffect(() => {
    app.markViewed(id);
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pet) return <EmptyState emoji="🤷" title="Тварину не знайдено" />;
  const shelter = shelterById(pet.shelterId)!;
  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => setPage(Math.round(e.nativeEvent.contentOffset.x / width));

  const chips = [
    ...pet.traits.map((t) => traitLabel(t, pet.sex)),
    ...pet.goodWith.map((c: Compat) => goodWithText[c]),
    ...(pet.vaccinated ? [pet.sex === 'f' ? 'Вакцинована' : 'Вакцинований'] : []),
    ...(pet.sterilized ? [pet.sex === 'f' ? 'Стерилізована' : 'Стерилізований'] : []),
  ];

  const facts: [string, string][] = [
    ['Вік', pet.ageText],
    ['Стать', pet.sex === 'f' ? 'Дівчинка' : 'Хлопчик'],
    ['Розмір', `${pet.size} · ${sizeWeight[pet.size]}`],
    ['Місто', pet.city],
  ];

  const thumbW = Math.min(150, (width - SCREEN_PADDING * 2 - spacing.md) / 2);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onScroll={onScroll} scrollEventThrottle={16}>
            {pet.photos.map((u) => (
              <Image key={u} source={{ uri: u }} style={{ width, height: width * 1.05, backgroundColor: colors.border }} />
            ))}
          </ScrollView>
          <View style={{ position: 'absolute', bottom: spacing.xl + 8, alignSelf: 'center', flexDirection: 'row', gap: 6 }}>
            {pet.photos.map((_, i) => <View key={i} style={{ width: i === page ? 18 : 7, height: 7, borderRadius: 4, backgroundColor: i === page ? '#fff' : 'rgba(255,255,255,0.6)' }} />)}
          </View>
          <View style={{ position: 'absolute', top: insets.top + spacing.sm, left: spacing.md, right: spacing.md, flexDirection: 'row', justifyContent: 'space-between' }}>
            <IconButton icon="chevron-back" color="#fff" onPress={nav.back} style={{ backgroundColor: colors.primary, borderRadius: 20 }} />
            <IconButton icon="ellipsis-horizontal" color="#fff" onPress={() => nav.toast('Поділитися та поскаржитись — у наступних версіях')} style={{ backgroundColor: colors.primary, borderRadius: 20 }} />
          </View>
        </View>

        <View style={{ marginTop: -spacing.xl, backgroundColor: colors.bg, borderTopLeftRadius: radius.lg + 8, borderTopRightRadius: radius.lg + 8, padding: SCREEN_PADDING, gap: spacing.xl }}>
          <View style={{ gap: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T variant="display">{pet.name}</T>
              <View style={{ backgroundColor: colors.surface, borderRadius: 20, ...shadow.card }}>
                <FavoriteButton active={fav.active} onPress={fav.toggle} overlay={false} size={24} />
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <ShelterLogo kind={shelter.logo} size={26} />
              <T variant="bodySmall" color={colors.textSecondary}>Притулок «{shelter.name}» | {shelter.city}</T>
            </View>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {facts.map(([k, v]) => (
              <View key={k} style={{ width: '48.5%', backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: 2 }}>
                <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{k}</T>
                <T variant="h3">{v}</T>
              </View>
            ))}
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {chips.map((c) => <PetTag key={c} label={c} />)}
          </View>

          <Section title="Про мене"><T variant="body" color={colors.textSecondary}>{pet.story}</T></Section>

          <Section title="Галерея">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md }}>
              {pet.photos.map((u, i) => (
                <Image key={u + i} source={{ uri: u }} style={{ width: thumbW, height: thumbW * 0.8, borderRadius: radius.md, backgroundColor: colors.border }} />
              ))}
            </ScrollView>
          </Section>

          <Section title="Здоров’я"><T variant="body" color={colors.textSecondary}>🩺 {pet.health}</T></Section>
          <Section title="Притулок">
            <View style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', gap: spacing.md, alignItems: 'center' }}>
              <ShelterLogo kind={shelter.logo} size={52} />
              <View style={{ flex: 1, gap: 2 }}>
                <T variant="h3">«{shelter.name}»</T>
                <T variant="bodySmall" color={colors.textSecondary}>{shelter.about}</T>
              </View>
            </View>
          </Section>
        </View>
      </ScrollView>

      {/* Липка нижня панель з діями */}
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, paddingBottom: Math.max(insets.bottom, spacing.md), backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 12 }}>
        <SecondaryButton flex title="Підтримати" onPress={() => nav.openSupport(pet.id)} />
        <PrimaryButton flex title="Познайомитися" onPress={() => nav.openMeet(pet.id)} />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.sm }}>
      <T variant="h2">{title}</T>
      {children}
    </View>
  );
}
