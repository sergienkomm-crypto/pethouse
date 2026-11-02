import React, { useMemo, useState } from 'react';
import { LayoutAnimation, Pressable, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING } from '../theme';
import { useApp } from '../store';
import {
  AgeGroup, Compat, Sex, Size, Trait, Pet, pets, shelters, ageGroupLabel, ageGroupRange, compatLabel, allTraits, traitLabelNeutral,
  plural, sizeWeight, bigCities, allCities,
} from '../data/pets';
import { PetCard } from '../components/pet';
import { ageImages, compatImages, sizeImages } from '../data/filterIcons';
import { Dropdown, EmptyState, FilterChip, IconButton, PrimaryButton, ScreenHeader, SearchBar, SecondaryButton, T, VisualFilterCard } from '../components/ui';

type Filters = {
  query: string;
  city: string | null;
  species: 'any' | 'dog' | 'cat';
  sex: Sex | null;
  sizes: Size[];
  ages: AgeGroup[];
  compat: Compat[];
  traits: Trait[];
  sterilized: boolean;
  vaccinated: boolean;
  special: boolean;
  shelterId: string | null;
};

const empty: Filters = { query: '', city: null, species: 'any', sex: null, sizes: [], ages: [], compat: [], traits: [], sterilized: false, vaccinated: false, special: false, shelterId: null };

const toggle = <X,>(arr: X[], v: X) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

function applyFilters(f: Filters): Pet[] {
  const q = f.query.trim().toLowerCase();
  return pets.filter(
    (p) =>
      (!f.city || p.city === f.city) &&
      (f.species === 'any' || p.species === f.species) &&
      (!f.sex || p.sex === f.sex) &&
      (f.sizes.length === 0 || f.sizes.includes(p.size)) &&
      (f.ages.length === 0 || f.ages.includes(p.ageGroup)) &&
      f.compat.every((c) => p.goodWith.includes(c)) &&
      (f.traits.length === 0 || f.traits.some((t) => p.traits.includes(t))) &&
      (!f.sterilized || p.sterilized) &&
      (!f.vaccinated || p.vaccinated) &&
      (!f.special || p.special) &&
      (!f.shelterId || p.shelterId === f.shelterId) &&
      (!q || p.name.toLowerCase().includes(q) || p.city.toLowerCase().includes(q)),
  );
}

const sizes: Size[] = ['S', 'M', 'L', 'XL'];
const ages: { key: AgeGroup }[] = [{ key: 'baby' }, { key: 'young' }, { key: 'adult' }, { key: 'senior' }];

export function Search() {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [f, setF] = useState<Filters>(() => ({
    ...empty,
    species: app.prefs.species,
    compat: app.prefs.needs.includes('kids') ? (['kids'] as Compat[]) : [],
  }));
  const [more, setMore] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((cur) => ({ ...cur, [k]: v }));
  const result = useMemo(() => applyFilters(f), [f]);
  const count = result.length;
  const cityCount = (c: string) => `${pets.filter((p) => p.city === c).length}`;

  if (showResults) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
        <ScreenHeader
          title="Результати"
          left={<IconButton icon="chevron-back" onPress={() => setShowResults(false)} />}
          right={<T variant="bodySmall" color={colors.textSecondary}>{count} {plural(count, 'тварина', 'тварини', 'тварин')}</T>}
        />
        <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl, gap: spacing.lg }} showsVerticalScrollIndicator={false}>
          {count === 0 ? (
            <EmptyState emoji="🔍" title="Нікого не знайшли" text="Спробуйте прибрати частину фільтрів" actionLabel="Змінити фільтри" onAction={() => setShowResults(false)} />
          ) : (
            result.map((p) => (
              <View key={p.id} style={{ backgroundColor: colors.surface, paddingTop: spacing.md }}>
                <PetCard pet={p} variant="feed" />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScreenHeader title="Пошук" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: spacing.xl, gap: spacing.xl }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <SearchBar placeholder="Пошук тварини" value={f.query} onChangeText={(t) => set('query', t)} rightIcon="options-outline" />

        {/* 1. Місто: теги великих міст + випадаюче меню */}
        <Block title="Місто">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {bigCities.map((c) => (
              <FilterChip key={c} label={c} selected={f.city === c} onPress={() => set('city', f.city === c ? null : c)} />
            ))}
          </View>
          <Dropdown value={f.city} options={allCities} placeholder="Усі міста" onChange={(v) => set('city', v)} extra={cityCount} />
        </Block>

        <Block title="Вид тварини">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <VisualFilterCard style={{ flex: 1 }} big emoji="🐶" label="Собака" selected={f.species === 'dog'} onPress={() => set('species', 'dog')} />
            <VisualFilterCard style={{ flex: 1 }} big emoji="🐱" label="Кіт" selected={f.species === 'cat'} onPress={() => set('species', 'cat')} />
            <VisualFilterCard style={{ flex: 1 }} big emoji="🐾" label="Не важливо" selected={f.species === 'any'} onPress={() => set('species', 'any')} />
          </View>
        </Block>

        <Block title="Стать">
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <VisualFilterCard
              style={{ flex: 1 }}
              icon={<Ionicons name="female" size={30} color={colors.accent} />}
              label="Дівчинка"
              selected={f.sex === 'f'}
              onPress={() => set('sex', f.sex === 'f' ? null : 'f')}
            />
            <VisualFilterCard
              style={{ flex: 1 }}
              icon={<Ionicons name="male" size={30} color={colors.primary} />}
              label="Хлопчик"
              selected={f.sex === 'm'}
              onPress={() => set('sex', f.sex === 'm' ? null : 'm')}
            />
          </View>
        </Block>

        <Block title="Розмір" hint="Орієнтовна вага дорослої тварини">
          <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' }}>
            {sizes.map((z) => (
              <VisualFilterCard
                key={z}
                style={{ flex: 1, height: 128, justifyContent: 'flex-end', paddingHorizontal: 2 }}
                image={sizeImages[z]}
                label={z}
                caption={sizeWeight[z]}
                selected={f.sizes.includes(z)}
                onPress={() => set('sizes', toggle(f.sizes, z))}
              />
            ))}
          </View>
        </Block>

        <Block title="Вік">
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {ages.map((a) => (
              <VisualFilterCard
                key={a.key}
                style={{ flex: 1, height: 128, justifyContent: 'flex-end', paddingHorizontal: 2 }}
                image={ageImages[a.key]}
                label={ageGroupLabel[a.key]}
                caption={ageGroupRange[a.key]}
                selected={f.ages.includes(a.key)}
                onPress={() => set('ages', toggle(f.ages, a.key))}
              />
            ))}
          </View>
        </Block>

        <Block title="Сумісність">
          <View style={{ flexDirection: 'row', gap: spacing.sm }}>
            {(['kids', 'dogs', 'cats', 'people'] as Compat[]).map((c) => (
              <VisualFilterCard
                key={c}
                style={{ flex: 1 }}
                image={compatImages[c]}
                label={compatLabel[c]}
                selected={f.compat.includes(c)}
                onPress={() => set('compat', toggle(f.compat, c))}
              />
            ))}
          </View>
        </Block>

        <Block title="Характер">
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {allTraits.map((t) => (
              <FilterChip key={t} label={traitLabelNeutral(t)} selected={f.traits.includes(t)} onPress={() => set('traits', toggle(f.traits, t))} />
            ))}
          </View>
        </Block>

        <View>
          <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setMore(!more); }} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm }}>
            <T variant="h3">Додаткові параметри</T>
            <Ionicons name={more ? 'chevron-up' : 'chevron-down'} size={22} color={colors.textSecondary} />
          </Pressable>
          {more && (
            <View style={{ gap: spacing.md, marginTop: spacing.sm }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                <FilterChip emoji="✂️" label="Стерилізований" selected={f.sterilized} onPress={() => set('sterilized', !f.sterilized)} />
                <FilterChip emoji="💉" label="Вакцинований" selected={f.vaccinated} onPress={() => set('vaccinated', !f.vaccinated)} />
                <FilterChip emoji="🩺" label="Особливі потреби" selected={f.special} onPress={() => set('special', !f.special)} />
              </View>
              <T variant="bodySmall" color={colors.textSecondary}>Притулок</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {shelters.map((s) => (
                  <FilterChip key={s.id} emoji="🏠" label={s.name} selected={f.shelterId === s.id} onPress={() => set('shelterId', f.shelterId === s.id ? null : s.id)} />
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Липка нижня панель */}
      <View style={{ flexDirection: 'row', gap: spacing.md, padding: spacing.lg, backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
        <SecondaryButton title="Очистити" onPress={() => setF(empty)} />
        <PrimaryButton flex title={count === 0 ? 'Нікого не знайдено' : `Показати ${count} ${plural(count, 'тварину', 'тварини', 'тварин')}`} onPress={() => setShowResults(true)} />
      </View>
    </View>
  );
}

function Block({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: spacing.md }}>
      <View>
        <T variant="h3">{title}</T>
        {hint && <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{hint}</T>}
      </View>
      {children}
    </View>
  );
}
