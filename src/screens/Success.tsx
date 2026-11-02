import React from 'react';
import { Image, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, SCREEN_PADDING } from '../theme';
import { petById, shelterById } from '../data/pets';
import { FadeIn, SuccessBurst } from '../anim';
import { PrimaryButton, SecondaryButton, ShelterLogo, T } from '../components/ui';

export type SuccessKind = 'support' | 'apply';

// Екран успіху: святкова анімація, підсумок і наступні кроки
export function Success({ kind, petId, amount, monthly, day, time, onPrimary, onSecondary }: {
  kind: SuccessKind; petId: string; amount?: number; monthly?: boolean; day?: string; time?: string; onPrimary: () => void; onSecondary: () => void;
}) {
  const insets = useSafeAreaInsets();
  const pet = petById(petId);
  const shelter = pet && shelterById(pet.shelterId);
  if (!pet || !shelter) return null;
  const support = kind === 'support';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top + spacing.xl, paddingBottom: Math.max(insets.bottom, spacing.lg), paddingHorizontal: SCREEN_PADDING }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        <SuccessBurst icon={support ? 'heart' : 'checkmark'} />
        <FadeIn delay={450} style={{ alignItems: 'center', gap: spacing.sm }}>
          <T variant="display" style={{ textAlign: 'center' }}>{support ? 'Дякуємо за підтримку!' : 'Заявку надіслано!'}</T>
          <T variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>
            {support
              ? `Сума підтримки: ${amount} ₴${monthly ? ' щомісяця' : ''}. Притулок надсилатиме вам новини про тварину, яку ви підтримали.`
              : `Притулок «${shelter.name}» відповість протягом доби. Зустріч: ${day}, ${time}.`}
          </T>
        </FadeIn>
        <FadeIn delay={650} style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm, ...shadow.card }}>
          <Image source={{ uri: pet.photos[0] }} style={{ width: 64, height: 64, borderRadius: radius.md }} />
          <View style={{ flex: 1, gap: 4 }}>
            <T variant="h3">{pet.name}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ShelterLogo kind={shelter.logo} size={20} />
              <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400', flex: 1 }} numberOfLines={1}>«{shelter.name}» · {shelter.city}</T>
            </View>
          </View>
        </FadeIn>
      </View>
      <FadeIn delay={850} style={{ gap: spacing.md }}>
        <PrimaryButton title={support ? 'Стежити за новинами' : 'Відкрити чат із притулком'} onPress={onPrimary} />
        <SecondaryButton title={support ? 'До стрічки' : 'На головну'} onPress={onSecondary} />
      </FadeIn>
    </View>
  );
}
