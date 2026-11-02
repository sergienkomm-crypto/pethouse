import React from 'react';
import { Image, Pressable, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, shadow, spacing } from '../theme';
import { Pet, petTags, shelterById } from '../data/pets';
import { useApp } from '../store';
import { useNav } from '../nav';
import { FavoriteButton, PetTag, ShelterLogo, T } from './ui';
import { Tap } from '../anim';

// Обране вимагає акаунта — тому спершу requireAuth
export function useFavorite(id: string) {
  const app = useApp();
  const nav = useNav();
  return {
    active: app.favorites.includes(id),
    toggle: () => nav.requireAuth(() => app.toggleFavorite(id), 'Щоб додати тварину в обране, створіть акаунт'),
  };
}

// Картка тварини. variant="feed" — велика (Стрічка, Пошук), "compact" — для каруселей (Головна, Акаунт)
export function PetCard({ pet, variant = 'feed', width }: { pet: Pet; variant?: 'feed' | 'compact'; width?: number }) {
  const nav = useNav();
  const fav = useFavorite(pet.id);
  const shelter = shelterById(pet.shelterId);

  if (variant === 'compact') {
    const w = width ?? 172;
    return (
      <Tap onPress={() => nav.openPet(pet.id)} scaleTo={0.97} style={[s.card, { width: w, padding: 4, borderRadius: 18 }]}>
        <View>
          <Image source={{ uri: pet.photos[0] }} style={{ width: w - 8, height: (w - 8) * 0.78, borderRadius: 15, backgroundColor: colors.border }} />
          <View style={s.favPos}>
            <FavoriteButton active={fav.active} onPress={fav.toggle} size={18} />
          </View>
        </View>
        <View style={{ padding: spacing.sm, gap: 3 }}>
          <T variant="h3" numberOfLines={1}>{pet.name}</T>
          <T variant="caption" color={colors.textSecondary} numberOfLines={1} style={{ fontWeight: '400' }}>{pet.ageText} · {pet.city}</T>
          <View style={[s.tags, { marginTop: 4 }]}>
            {petTags(pet, 2).map((t) => <PetTag key={t} label={t} />)}
          </View>
        </View>
      </Tap>
    );
  }

  return (
    <Tap onPress={() => nav.openPet(pet.id)} scaleTo={0.985} style={{ width: '100%', gap: spacing.md, paddingBottom: spacing.sm }}>
      {/* автор: логотип притулку, назва, місто */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          {shelter && <ShelterLogo kind={shelter.logo} size={40} />}
          <View>
            <T variant="bodySmall" style={{ fontWeight: '500' }}>{shelter?.name}</T>
            <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{shelter?.city}</T>
          </View>
        </View>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.text} />
      </View>
      <T variant="bodySmall" numberOfLines={2} style={{ paddingHorizontal: spacing.lg, lineHeight: 20 }}>{pet.short}</T>
      <Image source={{ uri: pet.photos[0] }} style={{ width: '100%', aspectRatio: 1.5, backgroundColor: colors.border }} />
      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <T variant="h2">{pet.name}</T>
            <T variant="caption" color={colors.textSecondary} style={{ fontWeight: '400' }}>{pet.ageText} · {pet.city}</T>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <FavoriteButton active={fav.active} onPress={fav.toggle} overlay={false} size={24} />
            <Ionicons name="bookmark-outline" size={24} color={colors.text} />
          </View>
        </View>
        <View style={s.tags}>
          {petTags(pet, 3).map((t) => <PetTag key={t} label={t} />)}
        </View>
      </View>
    </Tap>
  );
}

// «Історія»-пілюля: фото тварини, маленький логотип притулку, ім’я та статус
export function PetStory({ pet, label, onPress }: { pet: Pet; label: string; onPress?: () => void }) {
  const shelter = shelterById(pet.shelterId);
  return (
    <Tap onPress={onPress} scaleTo={0.95} style={s.story}>
      <View>
        <Image source={{ uri: pet.photos[0] }} style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colors.border }} />
        {shelter && <ShelterLogo kind={shelter.logo} size={26} style={{ position: 'absolute', left: 19, bottom: -2, borderWidth: 2, borderColor: colors.bg }} />}
      </View>
      <T variant="caption" numberOfLines={1} style={{ marginTop: 4 }}>{pet.name}</T>
      <T variant="caption" color={colors.link} numberOfLines={1} style={{ fontWeight: '400', fontSize: 11 }}>{label}</T>
    </Tap>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.surface, ...shadow.card },
  favPos: { position: 'absolute', top: spacing.sm, right: spacing.sm },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  story: { width: 78, alignItems: 'center', paddingTop: 6, paddingBottom: 10, borderRadius: 50, borderWidth: 1, borderColor: colors.accent },
});
