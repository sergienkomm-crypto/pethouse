// Легкі анімації на стандартному Animated (без додаткових бібліотек).
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Pressable, PressableProps, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './theme';

const APressable = Animated.createAnimatedComponent(Pressable);

// Кнопка, яка трохи «втискається» під пальцем
export function Tap({ style, scaleTo = 0.96, onPressIn, onPressOut, children, ...rest }: Omit<PressableProps, 'style'> & { style?: StyleProp<ViewStyle>; scaleTo?: number }) {
  const [v] = useState(() => new Animated.Value(1));
  const to = (x: number) => Animated.spring(v, { toValue: x, useNativeDriver: true, speed: 50, bounciness: 7 }).start();
  return (
    <APressable
      {...rest}
      onPressIn={(e) => { to(scaleTo); onPressIn?.(e); }}
      onPressOut={(e) => { to(1); onPressOut?.(e); }}
      style={[style, { transform: [{ scale: v }] }]}
    >
      {children}
    </APressable>
  );
}

// М’яка поява знизу (з відступом у часі для каскаду)
export function FadeIn({ children, delay = 0, y = 14, duration = 380, style }: { children: React.ReactNode; delay?: number; y?: number; duration?: number; style?: StyleProp<ViewStyle> }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [y, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

// Перехід між екранами: виїзд справа + проявлення
export function ScreenTransition({ children, from = 'right' }: { children: React.ReactNode; from?: 'right' | 'fade' }) {
  const [v] = useState(() => new Animated.Value(0));
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={{ flex: 1, opacity: v, transform: from === 'right' ? [{ translateX: v.interpolate({ inputRange: [0, 1], outputRange: [36, 0] }) }] : [] }}>
      {children}
    </Animated.View>
  );
}

// «Поп» (збільшення й повернення) — для серця в обраному та галочок
export function usePop(trigger: unknown, skipFirst = true) {
  const [v] = useState(() => new Animated.Value(1));
  const first = useRef(true);
  useEffect(() => {
    if (first.current && skipFirst) { first.current = false; return; }
    first.current = false;
    Animated.sequence([
      Animated.timing(v, { toValue: 1.4, duration: 110, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.spring(v, { toValue: 1, useNativeDriver: true, speed: 14, bounciness: 14 }),
    ]).start();
  }, [trigger]); // eslint-disable-line react-hooks/exhaustive-deps
  return v;
}

// Святкова анімація успіху: галочка вискакує, хвилі розходяться, смайлики летять угору
const bursts = ['💛', '🐾', '💚', '✨', '🐾', '💛', '✨', '🐾'];
export function SuccessBurst({ size = 120, icon = 'checkmark' }: { size?: number; icon?: React.ComponentProps<typeof Ionicons>['name'] }) {
  const [pop] = useState(() => new Animated.Value(0));
  const [ring] = useState(() => new Animated.Value(0));
  const fly = useMemo(() => bursts.map(() => new Animated.Value(0)), []);
  useEffect(() => {
    Animated.sequence([
      Animated.spring(pop, { toValue: 1, useNativeDriver: true, speed: 9, bounciness: 14 }),
    ]).start();
    Animated.loop(Animated.timing(ring, { toValue: 1, duration: 1600, easing: Easing.out(Easing.quad), useNativeDriver: true })).start();
    fly.forEach((f, i) => Animated.timing(f, { toValue: 1, duration: 1500 + (i % 3) * 300, delay: 250 + i * 90, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start());
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const R = size * 2.2;
  return (
    <View style={{ width: R, height: R, alignItems: 'center', justifyContent: 'center' }}>
      {[0, 0.5].map((off, i) => (
        <Animated.View
          key={i}
          style={{
            position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary,
            opacity: ring.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 0.25 - i * 0.1, 0] }),
            transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1 - off] }) }],
          }}
        />
      ))}
      {bursts.map((e, i) => {
        const ang = (i / bursts.length) * Math.PI * 2;
        const dx = Math.cos(ang) * size * 0.95;
        const dy = Math.sin(ang) * size * 0.95;
        return (
          <Animated.Text
            key={i}
            style={{
              position: 'absolute', fontSize: 20 + (i % 3) * 4,
              opacity: fly[i].interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
              transform: [
                { translateX: fly[i].interpolate({ inputRange: [0, 1], outputRange: [0, dx] }) },
                { translateY: fly[i].interpolate({ inputRange: [0, 1], outputRange: [0, dy - 24] }) },
                { scale: fly[i].interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            }}
          >
            {e}
          </Animated.Text>
        );
      })}
      <Animated.View
        style={{
          width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
          transform: [{ scale: pop }], shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 18, shadowOffset: { width: 0, height: 8 }, elevation: 8,
        }}
      >
        <Ionicons name={icon} size={size * 0.52} color="#fff" />
      </Animated.View>
    </View>
  );
}

// Прогрес-смужка, що плавно заповнюється
export function ProgressBar({ step, total }: { step: number; total: number }) {
  const [v] = useState(() => new Animated.Value(step / total));
  useEffect(() => {
    Animated.timing(v, { toValue: step / total, duration: 320, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [step, total]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
      <Animated.View style={{ height: 6, borderRadius: 3, backgroundColor: colors.primary, width: v.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
    </View>
  );
}

export { Text };
