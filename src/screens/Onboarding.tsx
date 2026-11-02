import React, { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, spacing } from '../theme';
import { Need, PrefSpecies, Prefs } from '../store';
import { pets } from '../data/pets';
import { BrandLogo, IconButton, PrimaryButton, T } from '../components/ui';
import { FadeIn, ScreenTransition, Tap } from '../anim';

const photo = (id: string) => pets.find((p) => p.id === id)!.photos[0];

// Тут смайлики замість іконок
const needsList: { key: Need; emoji: string; label: string; tint: string }[] = [
  { key: 'kids', emoji: '👨‍👩‍👧', label: 'Для сім’ї з дітьми', tint: '#FFE3DB' },
  { key: 'animals', emoji: '🐶', label: 'Може жити з іншими тваринами', tint: colors.butter },
  { key: 'small', emoji: '🐩', label: 'Маленький розмір', tint: colors.primarySoft },
  { key: 'calm', emoji: '🛋️', label: 'Спокійний характер', tint: '#F4ECE3' },
  { key: 'trained', emoji: '🎓', label: 'Вже вихований', tint: colors.butter },
  { key: 'any', emoji: '🤷', label: 'Не важливо', tint: '#EDEDED' },
];

export function Onboarding({ onDone, onLogin }: { onDone: (p: Prefs) => void; onLogin: () => void }) {
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [species, setSpecies] = useState<PrefSpecies>('any');
  const [needs, setNeeds] = useState<Need[]>([]);

  const toggleNeed = (n: Need) => {
    if (n === 'any') return setNeeds(['any']);
    setNeeds((cur) => {
      const base = cur.filter((x) => x !== 'any');
      return base.includes(n) ? base.filter((x) => x !== n) : [...base, n];
    });
  };

  const next = () => (step < 3 ? setStep(step + 1) : onDone({ species, needs: needs.length ? needs : ['any'] }));
  const labels = ['Почати', 'Далі →', 'Далі →', 'Показати тварин →'];
  const heroH = Math.min(height * 0.48, 420);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {/* ===== Екран 1: привітання (за макетом) ===== */}
      {step === 0 && (
        <ScreenTransition from="fade">
          <View style={{ flex: 1 }}>
            <View style={{ height: heroH + insets.top, flexDirection: 'row', overflow: 'hidden', borderBottomLeftRadius: 90, borderBottomRightRadius: 90, backgroundColor: colors.accentSoft }}>
              <Image source={{ uri: photo('buddy') }} style={{ flex: 1.25, height: '100%' }} />
              <Image source={{ uri: photo('mia') }} style={{ flex: 1, height: '100%', marginLeft: -2 }} />
            </View>
            <Ionicons name="heart-outline" size={54} color={colors.amber} style={{ position: 'absolute', right: spacing.xl, top: heroH + insets.top - 40, transform: [{ rotate: '12deg' }] }} />
            <View style={{ flex: 1, paddingHorizontal: spacing.xl, justifyContent: 'center', alignItems: 'center', gap: spacing.md }}>
              <FadeIn delay={150}>
                <View style={{ backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, paddingVertical: 4 }}>
                  <BrandLogo size={30} />
                </View>
              </FadeIn>
              <FadeIn delay={260} style={{ alignItems: 'center', gap: spacing.sm }}>
                <T variant="display" color={colors.primary} style={{ textAlign: 'center', fontSize: 34, lineHeight: 40 }}>Знайди свого друга</T>
                <T variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>Тварини з притулків України в одному місці</T>
              </FadeIn>
            </View>
            <View style={{ paddingHorizontal: spacing.lg, paddingBottom: Math.max(insets.bottom, spacing.lg), gap: spacing.md, alignItems: 'center' }}>
              <Pressable onPress={onLogin} hitSlop={8}>
                <T variant="bodySmall" color={colors.textSecondary}>Вже маєте акаунт? <T variant="bodySmall" color={colors.primary} style={{ fontWeight: '700' }}>Увійти</T></T>
              </Pressable>
              <PrimaryButton title="Почати" onPress={next} style={{ alignSelf: 'stretch' }} />
              <Dots step={0} />
            </View>
          </View>
        </ScreenTransition>
      )}

      {step > 0 && (
        <ScreenTransition key={step} from="right">
        <View style={{ flex: 1, paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, spacing.lg) }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 48, paddingHorizontal: spacing.sm }}>
            <IconButton icon="chevron-back" onPress={() => setStep(step - 1)} />
            <Pressable onPress={() => onDone({ species: 'any', needs: ['any'] })} hitSlop={10} style={{ paddingRight: spacing.sm }}>
              <T variant="bodySmall" color={colors.link} style={{ fontWeight: '500' }}>Пропустити</T>
            </Pressable>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, flexGrow: 1, justifyContent: 'center', gap: spacing.lg }} showsVerticalScrollIndicator={false}>
            {/* ===== Екран 2: роби добро (за прикладом) ===== */}
            {step === 1 && (
              <>
                <Ionicons name="paw" size={64} color={colors.amber} style={{ position: 'absolute', top: -4, left: -8, opacity: 0.25, transform: [{ rotate: '-18deg' }] }} />
                <Ionicons name="heart-outline" size={40} color={colors.amber} style={{ position: 'absolute', top: 4, right: 4, transform: [{ rotate: '14deg' }] }} />
                <View style={{ alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md }}>
                  <T variant="display" style={{ textAlign: 'center', fontSize: 30, lineHeight: 36 }}>Роби добро{'\n'}разом із нами</T>
                  <T variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>Тут ти можеш знайти друга для життя або підтримати тварин, які ще чекають на свою родину.</T>
                </View>
                <InfoCard emoji="🏠" tint={colors.butter} title="Знайти друга" text="Обери улюбленця з притулку та подаруй йому дім і турботу." uri={photo('luna')} />
                <InfoCard emoji="🫶" tint={colors.primarySoft} title="Підтримати" text="Допоможи тваринам: на лікування, харчування та догляд у притулках." uri={photo('snizhok')} />
              </>
            )}

            {/* ===== Екран 3 ===== */}
            {step === 2 && (
              <>
                <T variant="display">Кого шукаєте?</T>
                <T variant="body" color={colors.textSecondary}>Виберіть, кого ви хотіли б знайти. Це допоможе показати найбільш релевантні оголошення.</T>
                <Choice label="Собаку" selected={species === 'dog'} onPress={() => setSpecies('dog')} left={photo('luna')} />
                <Choice label="Кота" selected={species === 'cat'} onPress={() => setSpecies('cat')} left={photo('mia')} />
                <Choice label="Не важливо" selected={species === 'any'} onPress={() => setSpecies('any')} left={photo('buddy')} right={photo('snizhok')} />
              </>
            )}

            {/* ===== Екран 4 ===== */}
            {step === 3 && (
              <>
                <T variant="display">Що для вас важливо?</T>
                <T variant="body" color={colors.textSecondary}>Оберіть один або кілька варіантів. Це допоможе нам підібрати найкращих компаньйонів.</T>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between' }}>
                  {needsList.map((n) => {
                    const sel = needs.includes(n.key);
                    return (
                      <Tap key={n.key} onPress={() => toggleNeed(n.key)} scaleTo={0.95} style={{ width: (width - spacing.lg * 2 - spacing.md) / 2, minHeight: 140, borderRadius: radius.lg, backgroundColor: n.tint, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, padding: spacing.md, borderWidth: 2.5, borderColor: sel ? colors.amber : 'transparent' }}>
                        <View style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 7, backgroundColor: sel ? colors.accent : colors.surface, borderWidth: sel ? 0 : 1.5, borderColor: colors.textSecondary, alignItems: 'center', justifyContent: 'center' }}>
                          {sel && <Ionicons name="checkmark" size={16} color="#fff" />}
                        </View>
                        <Text style={{ fontSize: 40 }}>{n.emoji}</Text>
                        <T variant="bodySmall" style={{ fontWeight: '500', textAlign: 'center' }}>{n.label}</T>
                      </Tap>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg, alignItems: 'center' }}>
            <PrimaryButton title={labels[step]} onPress={next} style={{ alignSelf: 'stretch' }} />
            <Dots step={step} />
          </View>
        </View>
        </ScreenTransition>
      )}
    </View>
  );
}

function Dots({ step }: { step: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8 }}>
      {[0, 1, 2, 3].map((i) => (
        <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? colors.primary : colors.border }} />
      ))}
    </View>
  );
}

// Картка «Знайти друга» / «Підтримати»: смайлик, текст і фото праворуч
function InfoCard({ emoji, tint, title, text, uri }: { emoji: string; tint: string; title: string; text: string; uri: string }) {
  return (
    <View style={{ backgroundColor: tint, borderRadius: radius.lg, flexDirection: 'row', overflow: 'hidden', minHeight: 170 }}>
      <View style={{ flex: 1.2, padding: spacing.lg, gap: 6, justifyContent: 'center' }}>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 24 }}>{emoji}</Text>
        </View>
        <T variant="h2">{title}</T>
        <T variant="bodySmall" color={colors.textSecondary}>{text}</T>
      </View>
      <Image source={{ uri }} style={{ flex: 1, margin: spacing.sm, borderRadius: radius.md + 4 }} />
    </View>
  );
}

// Рядок вибору «Собаку / Кота / Не важливо»: фото ліворуч, радіо праворуч
function Choice({ label, selected, onPress, left, right }: { label: string; selected: boolean; onPress: () => void; left: string; right?: string }) {
  return (
    <Tap onPress={onPress} scaleTo={0.97} style={{ flexDirection: 'row', alignItems: 'center', height: 118, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: selected ? colors.accentSoft : colors.surface, borderWidth: 2, borderColor: selected ? colors.amber : 'transparent', ...shadow.card }}>
      <View style={{ width: 140, height: '100%', flexDirection: 'row' }}>
        <Image source={{ uri: left }} style={{ flex: 1, height: '100%' }} />
        {right && <Image source={{ uri: right }} style={{ flex: 1, height: '100%' }} />}
      </View>
      <T variant="h2" style={{ flex: 1, paddingLeft: spacing.lg }}>{label}</T>
      <View style={{ width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: selected ? colors.accent : colors.border, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg }}>
        {selected && <View style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: colors.accent }} />}
      </View>
    </Tap>
  );
}
