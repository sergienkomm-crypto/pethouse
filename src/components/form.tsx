// Компоненти для форм: поле вводу, радіо-рядок, шапка кроку.
import React, { useRef, useState } from 'react';
import { Animated, Easing, KeyboardTypeOptions, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, type } from '../theme';
import { Tap } from '../anim';
import { IconButton, T } from './ui';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// Поле з підписом; при фокусі рамка стає бурштиновою
export function TextField({
  label, value, onChangeText, placeholder, keyboardType, icon, secure, multiline, autoFocus,
}: { label: string; value: string; onChangeText: (t: string) => void; placeholder?: string; keyboardType?: KeyboardTypeOptions; icon?: IconName; secure?: boolean; multiline?: boolean; autoFocus?: boolean }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '500' }}>{label}</T>
      <View
        style={{
          flexDirection: 'row', alignItems: multiline ? 'flex-start' : 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md,
          borderWidth: 1.5, borderColor: focus ? colors.amber : 'transparent', paddingHorizontal: spacing.lg, minHeight: multiline ? 96 : 52, paddingVertical: multiline ? 12 : 0,
        }}
      >
        {icon && <Ionicons name={icon} size={20} color={focus ? colors.accent : colors.textSecondary} />}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType={keyboardType}
          secureTextEntry={secure}
          multiline={multiline}
          autoFocus={autoFocus}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={[type.body, { flex: 1, color: colors.text, padding: 0, textAlignVertical: multiline ? 'top' : 'center' }]}
        />
      </View>
    </View>
  );
}

// Рядок вибору одного варіанта: смайлик, текст, радіо справа
export function ChoiceRow({ emoji, label, caption, selected, onPress }: { emoji?: string; label: string; caption?: string; selected: boolean; onPress: () => void }) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.975}
      style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: selected ? colors.accentSoft : colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: selected ? colors.amber : 'transparent', paddingHorizontal: spacing.lg, paddingVertical: 14, ...shadow.card }}
    >
      {emoji && <Text style={{ fontSize: 24 }}>{emoji}</Text>}
      <View style={{ flex: 1 }}>
        <T variant="h3">{label}</T>
        {caption && <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{caption}</T>}
      </View>
      <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: selected ? colors.accent : colors.border, alignItems: 'center', justifyContent: 'center' }}>
        {selected && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: colors.accent }} />}
      </View>
    </Tap>
  );
}

// Перемикач з двох-трьох варіантів (сегменти)
export function Segmented<K extends string>({ value, options, onChange }: { value: K; options: { key: K; label: string }[]; onChange: (k: K) => void }) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.pill, padding: 4 }}>
      {options.map((o) => (
        <Tap key={o.key} onPress={() => onChange(o.key)} scaleTo={0.97} style={{ flex: 1, paddingVertical: 11, borderRadius: radius.pill, alignItems: 'center', backgroundColor: value === o.key ? colors.primary : 'transparent' }}>
          <T variant="bodySmall" color={value === o.key ? '#fff' : colors.textSecondary} style={{ fontWeight: '500' }}>{o.label}</T>
        </Tap>
      ))}
    </View>
  );
}

// Шапка екрана-кроку: назад, заголовок, (необов'язково) права дія
export function StepHeader({ title, onBack, onClose, right }: { title?: string; onBack?: () => void; onClose?: () => void; right?: React.ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 52, paddingHorizontal: spacing.sm }}>
      <View style={{ width: 40 }}>{onBack ? <IconButton icon="chevron-back" onPress={onBack} /> : onClose ? <IconButton icon="close" onPress={onClose} /> : null}</View>
      {title ? <T variant="h3">{title}</T> : <View />}
      <View style={{ minWidth: 40, alignItems: 'flex-end', paddingRight: spacing.sm }}>{right}</View>
    </View>
  );
}

// Мітка-запитання над блоком відповідей
export function Question({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={{ gap: 2 }}>
      <T variant="h3">{children}</T>
      {hint && <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{hint}</T>}
    </View>
  );
}

// Крапки завантаження (для «перевіряємо…»)
export function Spinner({ color = colors.primary }: { color?: string }) {
  const v = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.loop(Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={{ transform: [{ rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }}>
      <Ionicons name="paw" size={28} color={color} />
    </Animated.View>
  );
}
