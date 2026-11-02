import React, { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing, SCREEN_PADDING, type } from '../theme';
import { petById, shelterById } from '../data/pets';
import { FadeIn } from '../anim';
import { FilterChip, PrimaryButton, ShelterLogo, T } from '../components/ui';
import { ChoiceRow, Question, Segmented, Spinner, StepHeader } from '../components/form';

const amounts = [50, 100, 200, 500];

// Підтримка тварини: сума, разово чи щомісяця, спосіб оплати. Оплата — умовна.
export function SupportFlow({ petId, onBack, onDone }: { petId: string; onBack: () => void; onDone: (amount: number, monthly: boolean) => void }) {
  const insets = useSafeAreaInsets();
  const pet = petById(petId);
  const shelter = pet && shelterById(pet.shelterId);
  const [amount, setAmount] = useState<number | 'other'>(100);
  const [custom, setCustom] = useState('');
  const [monthly, setMonthly] = useState<'once' | 'monthly'>('once');
  const [pay, setPay] = useState<'card' | 'wallet'>('card');
  const [busy, setBusy] = useState(false);

  const value = amount === 'other' ? parseInt(custom || '0', 10) : amount;
  const ok = value >= 10;

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => onDone(value, monthly === 'monthly'), 1100);
    return () => clearTimeout(t);
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pet || !shelter) return null;
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StepHeader title="Підтримка" onBack={busy ? undefined : onBack} />
      {busy ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <Spinner />
          <T variant="body" color={colors.textSecondary}>Обробляємо підтримку…</T>
        </View>
      ) : (
        <>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: spacing.xl, gap: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <FadeIn style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.sm, ...shadow.card }}>
              <Image source={{ uri: pet.photos[0] }} style={{ width: 72, height: 72, borderRadius: radius.md }} />
              <View style={{ flex: 1, gap: 4 }}>
                <T variant="h2">{pet.name}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShelterLogo kind={shelter.logo} size={20} />
                  <T variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ fontWeight: '400', flex: 1 }}>Притулок «{shelter.name}»</T>
                </View>
              </View>
            </FadeIn>

            <FadeIn delay={80} style={{ gap: spacing.md }}>
              <Question hint="Кошти підуть на корм, лікування й догляд">Оберіть суму</Question>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {amounts.map((a) => <FilterChip key={a} label={`${a} ₴`} selected={amount === a} onPress={() => setAmount(a)} />)}
                <FilterChip label="Інша" selected={amount === 'other'} onPress={() => setAmount('other')} />
              </View>
              {amount === 'other' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.amber, paddingHorizontal: spacing.lg, height: 52 }}>
                  <TextInput value={custom} onChangeText={(t) => setCustom(t.replace(/\D/g, '').slice(0, 6))} placeholder="Сума, від 10" placeholderTextColor={colors.textSecondary} keyboardType="number-pad" autoFocus style={[type.h3, { flex: 1, color: colors.text, padding: 0 }]} />
                  <T variant="h3" color={colors.textSecondary}>₴</T>
                </View>
              )}
            </FadeIn>

            <FadeIn delay={160} style={{ gap: spacing.md }}>
              <Question>Як часто</Question>
              <Segmented value={monthly} onChange={setMonthly} options={[{ key: 'once', label: 'Одноразово' }, { key: 'monthly', label: 'Щомісяця' }]} />
              {monthly === 'monthly' && <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>💛 Скасувати можна будь-коли в налаштуваннях.</T>}
            </FadeIn>

            <FadeIn delay={240} style={{ gap: spacing.md }}>
              <Question>Спосіб оплати</Question>
              <ChoiceRow emoji="💳" label="Банківська картка" caption="Visa, Mastercard" selected={pay === 'card'} onPress={() => setPay('card')} />
              <ChoiceRow emoji="📱" label="Apple Pay / Google Pay" caption="Швидко, без введення даних" selected={pay === 'wallet'} onPress={() => setPay('wallet')} />
            </FadeIn>
            <T variant="caption" color={colors.textSecondary} style={{ textAlign: 'center', fontWeight: '400' }}>У прототипі оплата не підключена — гроші не списуються.</T>
          </ScrollView>
          <View style={{ padding: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.lg), backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
            <PrimaryButton title={ok ? `Підтримати на ${value} ₴${monthly === 'monthly' ? ' щомісяця' : ''}` : 'Вкажіть суму'} disabled={!ok} onPress={() => setBusy(true)} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
