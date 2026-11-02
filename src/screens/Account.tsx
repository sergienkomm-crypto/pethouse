import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING, type, shadow } from '../theme';
import { useApp } from '../store';
import { useNav } from '../nav';
import { Pet, petById } from '../data/pets';
import { PetCard } from '../components/pet';
import { EmptyState, FilterChip, IconButton, PrimaryButton, SecondaryButton, T } from '../components/ui';

type Tab = 'fav' | 'support' | 'mine';

export function Account() {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const [tab, setTab] = useState<Tab>('support');
  const [kind, setKind] = useState<'mine' | 'found'>('mine');
  const [adding, setAdding] = useState(false);
  const cardW = (width - SCREEN_PADDING * 2 - spacing.md) / 2;

  if (!app.user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top, justifyContent: 'center' }}>
        <EmptyState emoji="🐾" title="Створіть акаунт" text="Щоб зберігати обране, писати притулкам і бачити тих, кого ви підтримуєте" actionLabel="Створити акаунт" onAction={() => nav.requireAuth(() => {})} />
      </View>
    );
  }

  const grid = (list: Pet[], empty: React.ReactNode) =>
    list.length === 0 ? (
      empty
    ) : (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md }}>
        {list.map((p) => <PetCard key={p.id} pet={p} variant="compact" width={cardW} />)}
      </View>
    );

  const supported = app.supported.map(petById).filter(Boolean) as Pet[];
  const favs = app.favorites.map(petById).filter(Boolean) as Pet[];
  const listings = app.listings.filter((l) => l.type === kind);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xl }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: SCREEN_PADDING, gap: spacing.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.lg }}>
            <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentSoft, borderWidth: 1.5, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <T variant="h1" color={colors.link}>{app.user.name.charAt(0)}</T>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <T variant="h2">{app.user.name}</T>
              <T variant="bodySmall" color={colors.textSecondary}>Київ</T>
            </View>
            {/* класична шестерінка */}
            <IconButton
              icon="settings-outline"
              onPress={() =>
                Alert.alert('Налаштування', 'У прототипі доступний лише вихід з акаунта.', [
                  { text: 'Скасувати', style: 'cancel' },
                  { text: 'Вийти', style: 'destructive', onPress: () => app.logout() },
                ])
              }
            />
          </View>

          <View style={{ gap: spacing.xs }}>
            <T variant="h3">Про мене</T>
            <T variant="bodySmall" color={colors.text}>{app.user.about}</T>
          </View>

          {/* вкладки з підкресленням */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.text }}>
            {([['fav', 'Обране'], ['support', 'Підтримую'], ['mine', 'Мої улюбленці']] as [Tab, string][]).map(([k, label]) => (
              <Pressable key={k} onPress={() => setTab(k)} style={{ flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: tab === k ? colors.primary : 'transparent', marginBottom: -1 }}>
                <T variant="bodySmall" color={tab === k ? colors.primary : colors.textSecondary} style={{ fontWeight: '500' }}>{label}</T>
              </Pressable>
            ))}
          </View>

          {tab === 'support' && grid(supported, <EmptyState emoji="💛" title="Поки нікого" text="Підтримайте тварину у Стрічці" actionLabel="До стрічки" onAction={() => nav.setTab('feed')} />)}
          {tab === 'fav' && grid(favs, <EmptyState emoji="🤍" title="Обране порожнє" text="Натисніть на серце на картці тварини" actionLabel="Знайти тварину" onAction={() => nav.setTab('search')} />)}
          {tab === 'mine' && (
            <View style={{ gap: spacing.md }}>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                <FilterChip label="Мої тварини" selected={kind === 'mine'} onPress={() => setKind('mine')} />
                <FilterChip label="Знайшов тварину" selected={kind === 'found'} onPress={() => setKind('found')} />
              </View>
              {listings.length === 0 ? (
                <EmptyState emoji="📝" title="Оголошень поки немає" text={kind === 'mine' ? 'Додайте свого улюбленця, якому шукаєте дім' : 'Знайшли тварину? Створіть оголошення, щоб знайти їй родину'} />
              ) : (
                listings.map((l) => (
                  <View key={l.id} style={{ backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.card }}>
                    <Text style={{ fontSize: 32 }}>{l.type === 'mine' ? '🐾' : '🔍'}</Text>
                    <View style={{ flex: 1 }}>
                      <T variant="h3">{l.name}</T>
                      <T variant="bodySmall" color={colors.textSecondary}>{l.city}{l.note ? ` · ${l.note}` : ''}</T>
                    </View>
                  </View>
                ))
              )}
              <SecondaryButton title="Створити оголошення" icon="add" onPress={() => setAdding(true)} />
            </View>
          )}
        </View>
      </ScrollView>
      <ListingModal visible={adding} kind={kind} onClose={() => setAdding(false)} />
    </View>
  );
}

function ListingModal({ visible, kind, onClose }: { visible: boolean; kind: 'mine' | 'found'; onClose: () => void }) {
  const app = useApp();
  const nav = useNav();
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [note, setNote] = useState('');
  const input = [type.body, { backgroundColor: colors.bg, borderRadius: radius.md, paddingHorizontal: spacing.lg, height: 50, color: colors.text }];
  const save = () => {
    if (!name.trim()) return;
    app.addListing({ type: kind, name: name.trim(), city: city.trim() || '—', note: note.trim() });
    setName(''); setCity(''); setNote('');
    onClose();
    nav.toast('Оголошення додано');
  };
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />
      <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: SCREEN_PADDING, gap: spacing.md }}>
        <T variant="h2">{kind === 'mine' ? 'Моя тварина' : 'Знайшов тварину'}</T>
        <TextInput style={input} value={name} onChangeText={setName} placeholder={kind === 'mine' ? 'Ім’я тварини' : 'Хто це? (кіт, собака…)'} placeholderTextColor={colors.textSecondary} />
        <TextInput style={input} value={city} onChangeText={setCity} placeholder="Місто" placeholderTextColor={colors.textSecondary} />
        <TextInput style={input} value={note} onChangeText={setNote} placeholder="Коротко про тварину" placeholderTextColor={colors.textSecondary} />
        <PrimaryButton title="Опублікувати" onPress={save} disabled={!name.trim()} />
      </View>
    </Modal>
  );
}
