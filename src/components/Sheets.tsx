import React from 'react';
import { Modal, Pressable, View } from 'react-native';
import { colors, radius, spacing, SCREEN_PADDING } from '../theme';
import { petById } from '../data/pets';
import { PrimaryButton, SecondaryButton, T } from './ui';

function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: colors.overlay }} onPress={onClose} />
      <View style={{ backgroundColor: colors.surface, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, padding: SCREEN_PADDING, paddingBottom: spacing.xl, gap: spacing.lg }}>
        <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
        {children}
      </View>
    </Modal>
  );
}

// «Познайомитися»: заявка з анкетою або просто написати притулку
export function MeetSheet({ petId, onClose, onApply, onMessage }: { petId: string | null; onClose: () => void; onApply: (petId: string) => void; onMessage: (petId: string) => void }) {
  const pet = petId ? petById(petId) : null;
  return (
    <Sheet visible={!!pet} onClose={onClose}>
      <View style={{ gap: 4 }}>
        <T variant="h2">Знайомство: {pet?.name} 🐾</T>
        <T variant="body" color={colors.textSecondary}>Подайте заявку на зустріч — це коротка анкета на 3 кроки. Або спершу напишіть притулку й поставте запитання.</T>
      </View>
      <PrimaryButton title="Подати заявку на зустріч" icon="calendar-outline" onPress={() => pet && onApply(pet.id)} />
      <SecondaryButton title="Написати притулку" icon="chatbubble-outline" onPress={() => pet && onMessage(pet.id)} />
    </Sheet>
  );
}
