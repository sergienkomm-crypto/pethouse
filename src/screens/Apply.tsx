import React, { useEffect, useMemo, useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING } from '../theme';
import { ApplicationForm, Experience, Housing, OtherPets, experienceLabel, housingLabel, otherPetsLabel, useApp } from '../store';
import { petById, shelterById } from '../data/pets';
import { FadeIn, ProgressBar } from '../anim';
import { FilterChip, PrimaryButton, SecondaryButton, ShelterLogo, T } from '../components/ui';
import { ChoiceRow, Question, Segmented, Spinner, StepHeader, TextField } from '../components/form';

const UA_DAYS = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
const UA_MONTHS = ['січ', 'лют', 'бер', 'кві', 'тра', 'чер', 'лип', 'сер', 'вер', 'жов', 'лис', 'гру'];
const times = ['10:00', '12:00', '14:00', '16:00'];

// Коротка анкета для заявки на зустріч: 3 кроки
export function Apply({ petId, onBack, onSubmit }: { petId: string; onBack: () => void; onSubmit: (form: ApplicationForm) => void }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const pet = petById(petId);
  const shelter = pet && shelterById(pet.shelterId);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState<ApplicationForm>({
    name: app.user?.name ?? '', phone: '', housing: 'flat', kids: false, otherPets: 'none', experience: 'some', day: '', time: '', comment: '',
  });
  const set = <K extends keyof ApplicationForm>(k: K, v: ApplicationForm[K]) => setF((c) => ({ ...c, [k]: v }));

  // найближчі 6 днів для вибору дати
  const days = useMemo(() => {
    const out: string[] = [];
    for (let i = 1; i <= 6; i++) { const d = new Date(Date.now() + i * 86400000); out.push(`${UA_DAYS[d.getDay()]}, ${d.getDate()} ${UA_MONTHS[d.getMonth()]}`); }
    return out;
  }, []);

  const ok1 = f.name.trim().length > 1 && f.phone.replace(/\D/g, '').length >= 9;
  const ok3 = !!f.day && !!f.time;
  const canNext = step === 1 ? ok1 : step === 3 ? ok3 : true;

  useEffect(() => {
    if (!busy) return;
    const t = setTimeout(() => onSubmit(f), 1100);
    return () => clearTimeout(t);
  }, [busy]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!pet || !shelter) return null;
  const next = () => (step < 3 ? setStep(step + 1) : setBusy(true));

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <StepHeader title="Заявка на знайомство" onBack={busy ? undefined : step > 1 ? () => setStep(step - 1) : onBack} />
      {busy ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
          <Spinner />
          <T variant="body" color={colors.textSecondary}>Надсилаємо заявку…</T>
        </View>
      ) : (
        <>
          <View style={{ paddingHorizontal: SCREEN_PADDING, gap: spacing.sm, paddingBottom: spacing.md }}>
            <ProgressBar step={step} total={3} />
            <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>Крок {step} з 3 · займе хвилину</T>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: SCREEN_PADDING, paddingBottom: spacing.xl, gap: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Image source={{ uri: pet.photos[0] }} style={{ width: 52, height: 52, borderRadius: radius.md }} />
              <View style={{ flex: 1 }}>
                <T variant="h3">{pet.name}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <ShelterLogo kind={shelter.logo} size={18} />
                  <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>«{shelter.name}»</T>
                </View>
              </View>
            </View>

            {step === 1 && (
              <FadeIn key="s1" style={{ gap: spacing.xl }}>
                <T variant="h1">Про вас</T>
                <View style={{ gap: spacing.lg }}>
                  <TextField label="Ім’я" value={f.name} onChangeText={(t) => set('name', t)} placeholder="Як до вас звертатись" icon="person-outline" />
                  <TextField label="Телефон для зв’язку" value={f.phone} onChangeText={(t) => set('phone', t)} placeholder="+380 __ ___ __ __" keyboardType="phone-pad" icon="call-outline" />
                </View>
                <View style={{ gap: spacing.md }}>
                  <Question>Де ви живете</Question>
                  {(['flat', 'house', 'yard'] as Housing[]).map((h) => (
                    <ChoiceRow key={h} emoji={h === 'flat' ? '🏢' : h === 'house' ? '🏠' : '🌳'} label={housingLabel[h]} selected={f.housing === h} onPress={() => set('housing', h)} />
                  ))}
                </View>
              </FadeIn>
            )}

            {step === 2 && (
              <FadeIn key="s2" style={{ gap: spacing.xl }}>
                <T variant="h1">Родина і тварини</T>
                <View style={{ gap: spacing.md }}>
                  <Question>Чи є вдома діти</Question>
                  <Segmented value={f.kids ? 'yes' : 'no'} onChange={(k) => set('kids', k === 'yes')} options={[{ key: 'no', label: 'Немає' }, { key: 'yes', label: 'Є' }]} />
                </View>
                <View style={{ gap: spacing.md }}>
                  <Question>Інші тварини вдома</Question>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {(['none', 'dog', 'cat', 'both'] as OtherPets[]).map((o) => <FilterChip key={o} label={otherPetsLabel[o]} selected={f.otherPets === o} onPress={() => set('otherPets', o)} />)}
                  </View>
                </View>
                <View style={{ gap: spacing.md }}>
                  <Question>Ваш досвід</Question>
                  {(['none', 'some', 'lots'] as Experience[]).map((e) => (
                    <ChoiceRow key={e} emoji={e === 'none' ? '🌱' : e === 'some' ? '🐕' : '🏅'} label={experienceLabel[e]} selected={f.experience === e} onPress={() => set('experience', e)} />
                  ))}
                </View>
              </FadeIn>
            )}

            {step === 3 && (
              <FadeIn key="s3" style={{ gap: spacing.xl }}>
                <T variant="h1">Коли зручно приїхати?</T>
                <View style={{ gap: spacing.md }}>
                  <Question>День</Question>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {days.map((d) => <FilterChip key={d} label={d} selected={f.day === d} onPress={() => set('day', d)} />)}
                  </View>
                </View>
                <View style={{ gap: spacing.md }}>
                  <Question>Час</Question>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                    {times.map((t) => <FilterChip key={t} label={t} selected={f.time === t} onPress={() => set('time', t)} />)}
                  </View>
                </View>
                <TextField label="Коментар (необов’язково)" value={f.comment} onChangeText={(t) => set('comment', t)} placeholder="Наприклад: приїдемо всією сім’єю" multiline />
              </FadeIn>
            )}
          </ScrollView>
          <View style={{ padding: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.lg), backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg }}>
            <PrimaryButton title={step < 3 ? 'Далі' : 'Надіслати заявку'} disabled={!canNext} onPress={next} />
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
