// Базові багаторазові компоненти. Усі беруть кольори й відступи з theme.ts.
import React, { useState } from 'react';
import { Animated, Image, ImageSourcePropType, LayoutAnimation, Pressable, ScrollView, StyleProp, StyleSheet, Text, TextInput, TextProps, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing, type } from '../theme';
import { Tap, usePop } from '../anim';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

// ---- Текст з готовими стилями типографіки ----
export function T({ variant = 'body', color, style, ...rest }: TextProps & { variant?: keyof typeof type; color?: string }) {
  return <Text {...rest} style={[type[variant], { color: color ?? colors.text }, style]} />;
}

// ---- Кнопки ----
type BtnProps = { title: string; onPress?: () => void; icon?: IconName; style?: StyleProp<ViewStyle>; disabled?: boolean; flex?: boolean };

export function PrimaryButton({ title, onPress, icon, style, disabled, flex }: BtnProps) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, { backgroundColor: colors.primary, opacity: disabled ? 0.45 : 1 }, flex && { flex: 1 }, style]}
    >
      {icon && <Ionicons name={icon} size={20} color="#fff" />}
      <T variant="button" color="#fff">{title}</T>
    </Tap>
  );
}

export function SecondaryButton({ title, onPress, icon, style, disabled, flex }: BtnProps) {
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      style={[s.btn, { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.accent, opacity: disabled ? 0.45 : 1 }, flex && { flex: 1 }, style]}
    >
      {icon && <Ionicons name={icon} size={20} color={colors.link} />}
      <T variant="button" color={colors.link}>{title}</T>
    </Tap>
  );
}

// ---- Кругла кнопка-іконка (для заголовків) ----
export function IconButton({ icon, onPress, size = 24, style, color }: { icon: IconName; onPress?: () => void; size?: number; style?: StyleProp<ViewStyle>; color?: string }) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={({ pressed }) => [s.iconBtn, pressed && { opacity: 0.6 }, style]}>
      <Ionicons name={icon} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

// ---- Чіпи / теги ----
export function FilterChip({ label, selected, onPress, emoji }: { label: string; selected?: boolean; onPress?: () => void; emoji?: string }) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.93}
      style={[s.chip, selected ? { backgroundColor: colors.primary } : { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.amber }]}
    >
      <T variant="bodySmall" color={selected ? '#fff' : colors.text} style={{ fontWeight: '500' }}>
        {emoji ? `${emoji} ` : ''}
        {label}
      </T>
    </Tap>
  );
}

export function PetTag({ label }: { label: string }) {
  return (
    <View style={s.tag}>
      <T variant="caption" color={colors.text} style={{ fontWeight: '400' }}>{label}</T>
    </View>
  );
}

// ---- Візуальна картка вибору (фільтри, онбординг) ----
export function VisualFilterCard({
  label, caption, selected, onPress, emoji, icon, image, style, big,
}: { label: string; caption?: string; selected?: boolean; onPress?: () => void; emoji?: string; icon?: React.ReactNode; image?: ImageSourcePropType; style?: StyleProp<ViewStyle>; big?: boolean }) {
  return (
    <Tap
      onPress={onPress}
      scaleTo={0.94}
      style={[
        s.vcard,
        { backgroundColor: colors.surface, borderColor: selected ? colors.amber : 'transparent' },
        big && { paddingVertical: spacing.xl },
        style,
      ]}
    >
      {image ? <Image source={image} style={{ width: 56, height: 56 }} resizeMode="contain" /> : icon ?? (emoji ? <Text style={{ fontSize: big ? 44 : 30 }}>{emoji}</Text> : null)}
      <T variant="bodySmall" color={selected ? colors.link : colors.text} style={{ fontWeight: '500', textAlign: 'center' }}>{label}</T>
      {caption ? <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400', textAlign: 'center', marginTop: -4 }}>{caption}</T> : null}
    </Tap>
  );
}

// ---- Пошук ----
export function SearchBar({
  placeholder, value, onChangeText, onPress, rightIcon, onRightPress,
}: { placeholder: string; value?: string; onChangeText?: (t: string) => void; onPress?: () => void; rightIcon?: IconName; onRightPress?: () => void }) {
  const inner = (
    <View style={s.search}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
      {onPress ? (
        <T style={{ flex: 1 }} color={colors.textSecondary}>{placeholder}</T>
      ) : (
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[type.body, { flex: 1, color: colors.text, padding: 0 }]}
        />
      )}
      {rightIcon && <IconButton icon={rightIcon} onPress={onRightPress} size={20} color={colors.text} />}
    </View>
  );
  return onPress ? <Pressable onPress={onPress}>{inner}</Pressable> : inner;
}

// ---- Обране ----
export function FavoriteButton({ active, onPress, overlay = true, size = 22 }: { active?: boolean; onPress?: () => void; overlay?: boolean; size?: number }) {
  const pop = usePop(active);
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={[overlay && s.favOverlay, { width: size + 18, height: size + 18, alignItems: 'center', justifyContent: 'center' }]}
    >
      <Animated.View style={{ transform: [{ scale: pop }] }}>
        <Ionicons name={active ? 'heart' : 'heart-outline'} size={size} color={active ? colors.accent : colors.text} />
      </Animated.View>
    </Pressable>
  );
}

// ---- Аватари ----
export function AnimalAvatar({ uri, size = 64, style }: { uri: string; size?: number; style?: StyleProp<ViewStyle> }) {
  return <Image source={{ uri }} style={[{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.border }, style as any]} />;
}

// Логотип притулку. Три варіанти, можуть повторюватися між притулками.
const logoSpec: Record<1 | 2 | 3, { bg: string; fg: string; icon: IconName; border?: string }> = {
  1: { bg: colors.primary, fg: '#fff', icon: 'paw' },
  2: { bg: colors.accent, fg: '#fff', icon: 'heart' },
  3: { bg: colors.accentSoft, fg: colors.primary, icon: 'home', border: colors.amber },
};
export function ShelterLogo({ kind, size = 40, style }: { kind: 1 | 2 | 3; size?: number; style?: StyleProp<ViewStyle> }) {
  const l = logoSpec[kind];
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: l.bg, alignItems: 'center', justifyContent: 'center', borderWidth: l.border ? 1.5 : 0, borderColor: l.border },
        style,
      ]}
    >
      <Ionicons name={l.icon} size={Math.round(size * 0.5)} color={l.fg} />
    </View>
  );
}

export function ShelterBadge({ name, city, kind }: { name: string; city?: string; kind?: 1 | 2 | 3 }) {
  return (
    <View style={s.shelter}>
      {kind ? <ShelterLogo kind={kind} size={22} /> : <Text style={{ fontSize: 12 }}>🏠</Text>}
      <T variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ flexShrink: 1, fontWeight: '400' }}>
        {name}
        {city ? ` · ${city}` : ''}
      </T>
    </View>
  );
}

export function NotificationBadge({ count, style }: { count: number; style?: StyleProp<ViewStyle> }) {
  if (count <= 0) return null;
  return (
    <View style={[s.badge, style]}>
      <T variant="caption" color="#fff" style={{ fontSize: 11, lineHeight: 14 }}>{count > 9 ? '9+' : count}</T>
    </View>
  );
}

// Логотип застосунку (з Figma) + назва
export function BrandLogo({ size = 44 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <Image source={require('../../assets/logo.png')} style={{ width: size * 0.864, height: size }} resizeMode="contain" />
      <T variant="h1" color={colors.primary}>Притулок</T>
    </View>
  );
}

// ---- Структурні ----
export function SectionHeader({ title, action, onAction, style }: { title: string; action?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }, style]}>
      <T variant="h2">{title}</T>
      {action && (
        <Pressable onPress={onAction} hitSlop={8} style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
          <T variant="bodySmall" color={colors.link} style={{ fontWeight: '500' }}>{action}</T>
          <Ionicons name="chevron-forward" size={16} color={colors.link} />
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({ emoji, title, text, actionLabel, onAction, style }: { emoji: string; title: string; text?: string; actionLabel?: string; onAction?: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ alignItems: 'center', paddingVertical: spacing.xxl, paddingHorizontal: spacing.xl, gap: spacing.sm }, style]}>
      <Text style={{ fontSize: 44 }}>{emoji}</Text>
      <T variant="h3" style={{ textAlign: 'center' }}>{title}</T>
      {text && <T variant="body" color={colors.textSecondary} style={{ textAlign: 'center' }}>{text}</T>}
      {actionLabel && <PrimaryButton title={actionLabel} onPress={onAction} style={{ marginTop: spacing.md, paddingHorizontal: spacing.xl }} />}
    </View>
  );
}

// Заголовок екрана з іконками справа
export function ScreenHeader({ title, right, left, style }: { title: string; right?: React.ReactNode; left?: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md, minHeight: 56 }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        {left}
        <T variant="h1">{title}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>{right}</View>
    </View>
  );
}

// ---- Випадаюче меню (вибір одного варіанта) ----
export function Dropdown({
  value, options, placeholder, onChange, icon = 'location-outline', extra,
}: { value: string | null; options: string[]; placeholder: string; onChange: (v: string | null) => void; icon?: IconName; extra?: (o: string) => string | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setOpen(!open); }} style={[s.dd, open && { borderColor: colors.amber }]}>
        <Ionicons name={icon} size={20} color={colors.accent} />
        <T style={{ flex: 1 }} color={value ? colors.text : colors.textSecondary}>{value ?? placeholder}</T>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textSecondary} />
      </Pressable>
      {open && (
        <View style={s.ddList}>
          <ScrollView style={{ maxHeight: 220 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
            {[null, ...options].map((o) => {
              const active = o === value;
              return (
                <Pressable
                  key={o ?? 'all'}
                  onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); onChange(o); setOpen(false); }}
                  style={({ pressed }) => [s.ddItem, pressed && { backgroundColor: colors.bg }]}
                >
                  <T style={{ flex: 1 }} color={active ? colors.primary : colors.text}>{o ?? 'Усі міста'}</T>
                  {o && extra?.(o) ? <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{extra(o)}</T> : null}
                  {active && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 15, paddingHorizontal: spacing.lg, borderRadius: radius.pill },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill },
  tag: { borderWidth: 1, borderColor: colors.amber, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  vcard: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.lg, paddingHorizontal: spacing.sm, borderRadius: radius.md, borderWidth: 1.5 },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.pill, paddingHorizontal: spacing.lg, height: 50, ...shadow.card },
  favOverlay: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: radius.pill },
  shelter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badge: { minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  dd: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, borderRadius: radius.md, borderWidth: 1.5, borderColor: 'transparent', paddingHorizontal: spacing.lg, height: 50 },
  ddList: { backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.xs, overflow: 'hidden', ...shadow.card },
  ddItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.lg, paddingVertical: 13 },
});
