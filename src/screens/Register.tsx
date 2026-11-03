import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, SCREEN_PADDING } from '../theme';
import { AuthMethod, useApp } from '../store';
import { FadeIn, SuccessBurst, Tap } from '../anim';
import { PrimaryButton, SecondaryButton, T } from '../components/ui';
import { Spinner, StepHeader, TextField } from '../components/form';

type Step = 'method' | 'form' | 'code' | 'loading' | 'welcome';

// Реєстрація / вхід. Прототип: справжньої перевірки немає, код підтвердження — будь-які 4 цифри.
export function Register({ onDone, onClose, reason }: { onDone: () => void; onClose: () => void; reason?: string }) {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState<'signup' | 'login'>('signup');
  const [step, setStep] = useState<Step>('method');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [left, setLeft] = useState(30);
  const codeRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const social = (m: AuthMethod) => {
    setMethod(m);
    setName('Олена');
    setContact(m === 'google' ? 'Google' : 'Apple');
    setStep('loading');
  };

  // таймер «надіслати ще раз»
  useEffect(() => {
    if (step !== 'code') return;
    const t = setInterval(() => setLeft((x) => (x > 0 ? x - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [step]);

  // перевірка… → привітання
  useEffect(() => {
    if (step !== 'loading') return;
    const t = setTimeout(() => setStep('welcome'), 900);
    return () => clearTimeout(t);
  }, [step]);

  useEffect(() => {
    if (code.length === 4) {
      const t = setTimeout(() => setStep('loading'), 250);
      return () => clearTimeout(t);
    }
  }, [code]);

  const isEmail = method === 'email';
  const formOk = (mode === 'login' || name.trim().length > 1) && (isEmail ? contact.includes('@') && contact.length > 4 : contact.replace(/\D/g, '').length >= 9) && (!isEmail || password.length >= 4 || mode === 'login');
  const finish = () => {
    if (mode === 'login') app.login();
    else app.register({ name, contact, method });
    onDone();
  };
  const title = mode === 'login' ? 'Увійти' : 'Створити акаунт';
  const back = step === 'form' ? () => setStep('method') : step === 'code' ? () => { setCode(''); setStep('form'); } : undefined;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      {step !== 'welcome' && step !== 'loading' && <StepHeader onBack={back} onClose={back ? undefined : onClose} />}

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, paddingHorizontal: SCREEN_PADDING, paddingBottom: Math.max(insets.bottom, spacing.lg) + spacing.md, gap: spacing.xl }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {step === 'method' && (
          <FadeIn key="m" style={{ gap: spacing.xl, flex: 1, justifyContent: 'center' }}>
            <View style={{ gap: spacing.sm }}>
              <Text style={{ fontSize: 44 }}>🐾</Text>
              <T variant="display">{title}</T>
              <T variant="body" color={colors.textSecondary}>{reason ?? 'Щоб зберігати обране, писати притулкам і подавати заявки'}</T>
            </View>
            <View style={{ gap: spacing.md }}>
              <SecondaryButton title="Продовжити з Google" icon="logo-google" onPress={() => social('google')} />
              <SecondaryButton title="Продовжити з Apple" icon="logo-apple" onPress={() => social('apple')} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: 2 }}>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
                <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>або</T>
                <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
              </View>
              <PrimaryButton title="Email" icon="mail-outline" onPress={() => { setMethod('email'); setStep('form'); }} />
              <SecondaryButton title="Телефон" icon="call-outline" onPress={() => { setMethod('phone'); setStep('form'); }} />
            </View>
            <Pressable onPress={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={{ alignItems: 'center' }} hitSlop={8}>
              <T variant="body" color={colors.textSecondary}>
                {mode === 'signup' ? 'Вже є акаунт? ' : 'Ще немає акаунта? '}
                <T variant="body" color={colors.primary} style={{ fontWeight: '700' }}>{mode === 'signup' ? 'Увійти' : 'Створити'}</T>
              </T>
            </Pressable>
          </FadeIn>
        )}

        {step === 'form' && (
          <FadeIn key="f" style={{ gap: spacing.xl, flex: 1 }}>
            <View style={{ gap: spacing.sm }}>
              <T variant="display">{mode === 'login' ? 'З поверненням' : 'Розкажіть про себе'}</T>
              <T variant="body" color={colors.textSecondary}>{isEmail ? 'Вкажіть пошту та пароль' : 'Вкажіть номер телефону — надішлемо код'}</T>
            </View>
            <View style={{ gap: spacing.lg }}>
              {mode === 'signup' && <TextField label="Ім’я" value={name} onChangeText={setName} placeholder="Як до вас звертатись" icon="person-outline" autoFocus />}
              <TextField label={isEmail ? 'Email' : 'Телефон'} value={contact} onChangeText={setContact} placeholder={isEmail ? 'name@example.com' : '+380 __ ___ __ __'} keyboardType={isEmail ? 'email-address' : 'phone-pad'} icon={isEmail ? 'mail-outline' : 'call-outline'} />
              {isEmail && mode === 'signup' && <TextField label="Пароль" value={password} onChangeText={setPassword} placeholder="Не менше 4 символів" icon="lock-closed-outline" secure />}
            </View>
            <View style={{ flex: 1, justifyContent: 'flex-end' }}>
              <PrimaryButton title="Продовжити" disabled={!formOk} onPress={() => { setLeft(30); setStep('code'); }} />
            </View>
          </FadeIn>
        )}

        {step === 'code' && (
          <FadeIn key="c" style={{ gap: spacing.xl, flex: 1 }}>
            <View style={{ gap: spacing.sm }}>
              <T variant="display">Введіть код</T>
              <T variant="body" color={colors.textSecondary}>Ми надіслали 4 цифри на {isEmail ? 'пошту' : 'номер'} {contact}. У прототипі підійдуть будь-які.</T>
            </View>
            <Pressable onPress={() => codeRef.current?.focus()} style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
              {[0, 1, 2, 3].map((i) => (
                <View key={i} style={{ width: 62, height: 72, borderRadius: radius.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: code.length === i ? colors.amber : 'transparent' }}>
                  <T variant="display">{code[i] ?? ''}</T>
                </View>
              ))}
              <TextInput ref={codeRef} value={code} onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" autoFocus style={{ position: 'absolute', opacity: 0, width: '100%', height: '100%' }} />
            </Pressable>
            <Pressable disabled={left > 0} onPress={() => setLeft(30)} style={{ alignItems: 'center' }}>
              <T variant="bodySmall" color={left > 0 ? colors.textSecondary : colors.primary} style={{ fontWeight: '500' }}>{left > 0 ? `Надіслати ще раз через ${left} с` : 'Надіслати код ще раз'}</T>
            </Pressable>
          </FadeIn>
        )}

        {step === 'loading' && (
          <FadeIn key="l" style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
            <Spinner />
            <T variant="body" color={colors.textSecondary}>Перевіряємо…</T>
          </FadeIn>
        )}

        {step === 'welcome' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
            <SuccessBurst />
            <FadeIn delay={500} style={{ alignItems: 'center', gap: spacing.sm }}>
              <T variant="display" style={{ textAlign: 'center' }}>{mode === 'login' ? 'З поверненням!' : 'Вітаємо в «Притулку»!'}</T>
              <T variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>{mode === 'login' ? 'Ви увійшли в акаунт.' : `${name.trim() || 'Друже'}, акаунт створено. Тепер можна підтримувати тварин і подавати заявки на зустріч.`}</T>
            </FadeIn>
            <FadeIn delay={800} style={{ alignSelf: 'stretch', marginTop: spacing.lg }}>
              <PrimaryButton title="Продовжити" onPress={finish} />
            </FadeIn>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
