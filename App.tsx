import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, BackHandler, Easing, LayoutAnimation, Platform, StatusBar, UIManager, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { Ionicons } from '@expo/vector-icons';
import { AppProvider, ApplicationForm, useApp } from './src/store';
import { Nav, NavContext, Tab } from './src/nav';
import { colors, radius, spacing } from './src/theme';
import { ScreenTransition } from './src/anim';
import { NavigationBar } from './src/components/NavigationBar';
import { MeetSheet } from './src/components/Sheets';
import { T } from './src/components/ui';
import { Onboarding } from './src/screens/Onboarding';
import { Home } from './src/screens/Home';
import { Feed } from './src/screens/Feed';
import { Search } from './src/screens/Search';
import { Chats, ChatThread } from './src/screens/Chats';
import { Account } from './src/screens/Account';
import { PetDetail } from './src/screens/PetDetail';
import { Register } from './src/screens/Register';
import { SupportFlow } from './src/screens/SupportFlow';
import { Apply } from './src/screens/Apply';
import { Success, SuccessKind } from './src/screens/Success';

// Android: дозволяємо плавні зміни розкладки (випадаюче меню, розкриття блоків)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) UIManager.setLayoutAnimationEnabledExperimental(true);

// Стек екранів поверх вкладок
type Route =
  | { name: 'pet'; id: string }
  | { name: 'chat'; id: string }
  | { name: 'register'; reason?: string }
  | { name: 'support'; petId: string }
  | { name: 'apply'; petId: string }
  | { name: 'success'; kind: SuccessKind; petId: string; amount?: number; monthly?: boolean; day?: string; time?: string; chatId?: string };

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <Root />
      </AppProvider>
    </SafeAreaProvider>
  );
}

// Тост, що м’яко з’являється й зникає
function Toast({ text, bottom }: { text: string; bottom: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(v, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.delay(1700),
      Animated.timing(v, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', left: spacing.lg, right: spacing.lg, bottom, alignItems: 'center', opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }) }] }}>
      <View style={{ backgroundColor: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: radius.pill }}>
        <T variant="bodySmall" color="#fff" style={{ fontWeight: '500' }}>{text}</T>
      </View>
    </Animated.View>
  );
}

function Root() {
  const app = useApp();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('home');
  const [stack, setStack] = useState<Route[]>([]);
  const [meetFor, setMeetFor] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ id: number; text: string } | null>(null);
  const pending = useRef<null | (() => void)>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const toast = useCallback((text: string) => {
    setToastMsg({ id: Date.now(), text });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMsg(null), 2400);
  }, []);

  const push = useCallback((r: Route) => setStack((s) => [...s, r]), []);
  const back = useCallback(() => setStack((s) => s.slice(0, -1)), []);
  const replaceTop = useCallback((r: Route) => setStack((s) => [...s.slice(0, -1), r]), []);

  // Кнопка «назад» на Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (meetFor) { setMeetFor(null); return true; }
      if (stack.length > 0) { back(); return true; }
      if (tab !== 'home') { setTab('home'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, tab, meetFor, back]);

  // Якщо користувач не зареєстрований — показуємо реєстрацію, а після неї виконуємо відкладену дію
  const requireAuth = useCallback(
    (action: () => void, reason?: string) => {
      if (app.user) return action();
      pending.current = action;
      setStack((s) => [...s, { name: 'register', reason }]);
    },
    [app.user],
  );

  const nav = useMemo<Nav>(
    () => ({
      tab,
      setTab: (t) => { setStack([]); setTab(t); },
      openPet: (id) => push({ name: 'pet', id }),
      openChat: (id) => push({ name: 'chat', id }),
      back,
      requireAuth,
      openSupport: (id) => requireAuth(() => push({ name: 'support', petId: id }), 'Щоб підтримати тварину, створіть акаунт'),
      openMeet: (id) => setMeetFor(id),
      toast,
    }),
    [tab, back, push, requireAuth, toast],
  );

  // Шрифт іконок вантажимо наперед, щоб іконки не зникали на старті
  const [fontsReady] = useFonts(Ionicons.font);

  if (!app.loaded || !fontsReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!app.onboarded) {
    return (
      <>
        <StatusBar barStyle="dark-content" />
        <Onboarding
          onDone={(prefs) => {
            app.finishOnboarding(prefs);
            setTab('feed'); // одразу відкриваємо персональну добірку
          }}
          onLogin={() => {
            app.finishOnboarding({ species: 'any', needs: ['any'] });
            setTab('home');
            pending.current = null;
            setStack([{ name: 'register' }]); // «Вже маєте акаунт? Увійти»
          }}
        />
      </>
    );
  }

  const top = stack[stack.length - 1];
  const unread = app.chats.reduce((n, c) => n + c.unread, 0);

  const finishAuth = () => {
    back();
    const action = pending.current;
    pending.current = null;
    if (action) setTimeout(action, 0);
    else if (stack.length <= 1) setTab('home');
  };
  const cancelAuth = () => {
    pending.current = null;
    back();
  };

  const meetApply = (id: string) => {
    setMeetFor(null);
    requireAuth(() => push({ name: 'apply', petId: id }), 'Щоб подати заявку на зустріч, створіть акаунт');
  };
  const meetMessage = (id: string) => {
    setMeetFor(null);
    requireAuth(() => push({ name: 'chat', id: app.messageShelter(id) }), 'Щоб написати притулку, створіть акаунт');
  };

  const goHome = (t: Tab) => { setStack([]); setTab(t); LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); };

  let body: React.ReactNode;
  let key = tab as string;
  if (top?.name === 'pet') { body = <PetDetail id={top.id} />; key = 'pet-' + top.id + stack.length; }
  else if (top?.name === 'chat') { body = <ChatThread chatId={top.id} />; key = 'chat-' + top.id; }
  else if (top?.name === 'register') { body = <Register onDone={finishAuth} onClose={cancelAuth} reason={top.reason} />; key = 'register'; }
  else if (top?.name === 'support') {
    body = (
      <SupportFlow
        petId={top.petId}
        onBack={back}
        onDone={(amount, monthly) => { app.donate(top.petId, amount, monthly); replaceTop({ name: 'success', kind: 'support', petId: top.petId, amount, monthly }); }}
      />
    );
    key = 'support';
  } else if (top?.name === 'apply') {
    body = (
      <Apply
        petId={top.petId}
        onBack={back}
        onSubmit={(form: ApplicationForm) => { const chatId = app.applyToMeet(top.petId, form); replaceTop({ name: 'success', kind: 'apply', petId: top.petId, day: form.day, time: form.time, chatId }); }}
      />
    );
    key = 'apply';
  } else if (top?.name === 'success') {
    body = (
      <Success
        kind={top.kind}
        petId={top.petId}
        amount={top.amount}
        monthly={top.monthly}
        day={top.day}
        time={top.time}
        onPrimary={() => (top.kind === 'support' ? goHome('home') : setStack([{ name: 'chat', id: top.chatId ?? `chat-${top.petId}` }]))}
        onSecondary={() => goHome(top.kind === 'support' ? 'feed' : 'home')}
      />
    );
    key = 'success';
  } else {
    body = (
      <>
        <View style={{ flex: 1 }}>
          {tab === 'home' && <Home />}
          {tab === 'feed' && <Feed />}
          {tab === 'search' && <Search />}
          {tab === 'chats' && <Chats />}
          {tab === 'account' && <Account />}
        </View>
        <NavigationBar tab={tab} onChange={nav.setTab} unread={unread} />
      </>
    );
  }

  return (
    <NavContext.Provider value={nav}>
      <StatusBar barStyle="dark-content" />
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <ScreenTransition key={key} from={top ? 'right' : 'fade'}>{body}</ScreenTransition>
      </View>
      <MeetSheet petId={meetFor} onClose={() => setMeetFor(null)} onApply={meetApply} onMessage={meetMessage} />
      {toastMsg && <Toast key={toastMsg.id} text={toastMsg.text} bottom={insets.bottom + 90} />}
    </NavContext.Provider>
  );
}
