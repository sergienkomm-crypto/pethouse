import React from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, spacing, SCREEN_PADDING } from '../theme';
import { useApp, recommended } from '../store';
import { useNav } from '../nav';
import { petById, pets } from '../data/pets';
import { ActionCard } from '../components/chat';
import { PetCard, PetStory } from '../components/pet';
import { BrandLogo, IconButton, NotificationBadge, PrimaryButton, SearchBar, SectionHeader, T } from '../components/ui';
import { FadeIn } from '../anim';

export function Home() {
  const app = useApp();
  const nav = useNav();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const cardW = Math.min((width - SCREEN_PADDING * 2 - spacing.md) / 2 + 8, 200);

  const supportedPets = app.supported.map(petById).filter(Boolean) as typeof pets;
  const viewedPets = app.viewed.map(petById).filter(Boolean) as typeof pets;
  const recs = recommended(app.prefs, 6);
  const unread = app.chats.reduce((n, c) => n + c.unread, 0);

  // «Наступні дії» збираємо з даних: заявки та чати
  const actions: React.ReactNode[] = [];
  const meeting = app.applications.find((a) => a.status === 'meeting');
  if (meeting) {
    const p = petById(meeting.petId);
    actions.push(
      <ActionCard key="meet" emoji="📅" title="Підтвердити зустріч" text={`${p?.name} · субота о 11:00`} onPress={() => { app.confirmMeeting(meeting.petId); nav.toast('Зустріч підтверджено 💛'); }} />,
    );
  }
  const unreadChat = app.chats.find((c) => c.unread > 0);
  if (unreadChat) {
    const p = petById(unreadChat.petId);
    actions.push(<ActionCard key="reply" emoji="📩" title="Притулок відповів" text={`Нове повідомлення · ${p?.name}`} onPress={() => nav.openChat(unreadChat.id)} />);
  }
  const review = app.applications.find((a) => a.status === 'review');
  if (review) {
    const p = petById(review.petId);
    actions.push(<ActionCard key="rev" emoji="🐾" title="Ваша заявка розглядається" text={`Заявка на знайомство · ${p?.name}`} onPress={() => nav.openChat(`chat-${review.petId}`)} />);
  }

  if (actions.length === 0) {
    actions.push(<ActionCard key="tip1" emoji="🐾" title="Як знайти друга?" text="Що потрібно знати, щоб не помилитися" onPress={() => nav.setTab('search')} />);
    actions.push(<ActionCard key="tip2" emoji="💛" title="Підтримайте тварину" text="Допоможіть тим, хто ще чекає на родину" onPress={() => nav.setTab('feed')} />);
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xl, gap: spacing.xl }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <BrandLogo />
          <View>
            <IconButton icon="notifications-outline" onPress={() => nav.setTab('chats')} />
            <NotificationBadge count={unread} style={{ position: 'absolute', top: 2, right: 2 }} />
          </View>
        </View>
        <SearchBar placeholder="Кого шукаємо?" rightIcon="options-outline" onPress={() => nav.setTab('search')} />
      </View>

      <FadeIn delay={60}>
        <SectionHeader title="Підтримую" action="Усі" onAction={() => nav.setTab('account')} style={{ paddingHorizontal: SCREEN_PADDING }} />
        {supportedPets.length === 0 ? (
          <View style={{ marginHorizontal: SCREEN_PADDING, backgroundColor: colors.surface, borderRadius: 24, padding: spacing.lg, gap: spacing.md, alignItems: 'center' }}>
            <T variant="h3" style={{ textAlign: 'center' }}>💛 Ви ще нікого не підтримуєте</T>
            <T variant="bodySmall" color={colors.textSecondary} style={{ textAlign: 'center' }}>Оберіть тварину й допоможіть їй: її новини зʼявляться тут</T>
            <PrimaryButton title="Обрати тварину" onPress={() => nav.setTab('feed')} style={{ alignSelf: 'stretch' }} />
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md }}>
            {supportedPets.map((p) => (
              <PetStory key={p.id} pet={p} label={p.update ?? 'оновлення'} onPress={() => nav.openPet(p.id)} />
            ))}
          </ScrollView>
        )}
      </FadeIn>

      {actions.length > 0 && (
        <FadeIn delay={160} style={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md }}>
          <SectionHeader title="Наступні дії" style={{ marginBottom: 0 }} />
          {actions.slice(0, 3)}
        </FadeIn>
      )}

      {viewedPets.length > 0 && (
        <View>
          <SectionHeader title="Продовжити перегляд" action="Дивитися всіх" onAction={() => nav.setTab('feed')} style={{ paddingHorizontal: SCREEN_PADDING }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md, paddingBottom: spacing.sm }}>
            {viewedPets.map((p) => <PetCard key={p.id} pet={p} variant="compact" width={cardW} />)}
          </ScrollView>
        </View>
      )}

      <View>
        <SectionHeader title="Може підійти для вас" action="Дивитися всіх" onAction={() => nav.setTab('search')} style={{ paddingHorizontal: SCREEN_PADDING }} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.md, paddingBottom: spacing.sm }}>
          {recs.map((p) => <PetCard key={p.id} pet={p} variant="compact" width={cardW} />)}
        </ScrollView>
      </View>
    </ScrollView>
  );
}
