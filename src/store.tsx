// Локальне сховище: усі дані застосунку живуть на телефоні (AsyncStorage). Бекенду немає.
// Новий користувач починає з порожнього стану: нічого не підтримує, чатів і заявок ще немає.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Pet, pets, petById, shelterById } from './data/pets';

export type PrefSpecies = 'dog' | 'cat' | 'any';
export type Need = 'kids' | 'animals' | 'small' | 'calm' | 'trained' | 'any';
export type Prefs = { species: PrefSpecies; needs: Need[] };

export type Message = { id: string; from: 'user' | 'shelter'; text: string; at: number };
export type Chat = { id: string; petId: string; kind: 'chat' | 'application'; unread: number; messages: Message[]; updated: number };

// Коротка анкета для заявки на зустріч
export type Housing = 'flat' | 'house' | 'yard';
export type OtherPets = 'none' | 'dog' | 'cat' | 'both';
export type Experience = 'none' | 'some' | 'lots';
export type ApplicationForm = {
  name: string;
  phone: string;
  housing: Housing;
  kids: boolean;
  otherPets: OtherPets;
  experience: Experience;
  day: string;
  time: string;
  comment: string;
};
export type Application = { petId: string; status: 'review' | 'meeting' | 'confirmed'; form?: ApplicationForm; at: number };
export type Donation = { petId: string; amount: number; monthly: boolean; at: number };
export type Listing = { id: string; type: 'mine' | 'found'; name: string; city: string; note: string };
export type AuthMethod = 'google' | 'apple' | 'email' | 'phone';
export type User = { name: string; about: string; contact: string; method: AuthMethod; city: string };

type State = {
  loaded: boolean;
  onboarded: boolean;
  prefs: Prefs;
  personalFeed: boolean;
  favorites: string[];
  viewed: string[];
  donations: Donation[];
  user: User | null;
  chats: Chat[];
  applications: Application[];
  listings: Listing[];
};

const seed = (): State => ({
  loaded: false,
  onboarded: false,
  prefs: { species: 'any', needs: ['any'] },
  personalFeed: false,
  favorites: [],
  viewed: [],
  donations: [],
  user: null,
  applications: [],
  listings: [],
  chats: [],
});

const KEY = 'pritulok-v2';

type Store = State & {
  supported: string[]; // id тварин, яких підтримує користувач
  toggleFavorite: (id: string) => void;
  markViewed: (id: string) => void;
  donate: (petId: string, amount: number, monthly: boolean) => void;
  finishOnboarding: (prefs: Prefs) => void;
  setPersonalFeed: (v: boolean) => void;
  register: (p: { name: string; contact: string; method: AuthMethod }) => void;
  login: () => void;
  logout: () => void;
  applyToMeet: (petId: string, form: ApplicationForm) => string; // повертає id чату
  messageShelter: (petId: string) => string;
  sendMessage: (chatId: string, text: string) => void;
  markRead: (chatId: string) => void;
  confirmMeeting: (petId: string) => void;
  addListing: (l: Omit<Listing, 'id'>) => void;
};

const Ctx = createContext<Store | null>(null);

export const housingLabel: Record<Housing, string> = { flat: 'Квартира', house: 'Будинок', yard: 'Будинок із двором' };
export const otherPetsLabel: Record<OtherPets, string> = { none: 'Немає', dog: 'Собака', cat: 'Кіт', both: 'Собака й кіт' };
export const experienceLabel: Record<Experience, string> = { none: 'Це буде перший раз', some: 'Були тварини раніше', lots: 'Багато досвіду' };

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(seed);

  // 1) при запуску читаємо збережене
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...seed(), ...JSON.parse(raw), loaded: true });
        else setState((s) => ({ ...s, loaded: true }));
      })
      .catch(() => setState((s) => ({ ...s, loaded: true })));
  }, []);

  // 2) після кожної зміни зберігаємо
  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(KEY, JSON.stringify(state)).catch(() => {});
  }, [state]);

  const upd = useCallback((fn: (s: State) => State) => setState(fn), []);

  const ensureChat = (s: State, petId: string, kind: Chat['kind']): State => {
    const id = `chat-${petId}`;
    if (s.chats.some((c) => c.id === id)) return s;
    return { ...s, chats: [{ id, petId, kind, unread: 0, messages: [], updated: Date.now() }, ...s.chats] };
  };

  const store = useMemo<Store>(
    () => ({
      ...state,
      supported: Array.from(new Set(state.donations.map((d) => d.petId))),
      toggleFavorite: (id) =>
        upd((s) => ({ ...s, favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [id, ...s.favorites] })),
      markViewed: (id) => upd((s) => ({ ...s, viewed: [id, ...s.viewed.filter((x) => x !== id)].slice(0, 12) })),
      donate: (petId, amount, monthly) => upd((s) => ({ ...s, donations: [{ petId, amount, monthly, at: Date.now() }, ...s.donations] })),
      finishOnboarding: (prefs) => upd((s) => ({ ...s, onboarded: true, prefs, personalFeed: true })),
      setPersonalFeed: (v) => upd((s) => ({ ...s, personalFeed: v })),
      register: ({ name, contact, method }) =>
        upd((s) => ({ ...s, user: { name: name.trim() || 'Друже', about: 'Люблю тварин і мрію про свого друга.', contact, method, city: 'Київ' } })),
      login: () => upd((s) => ({ ...s, user: s.user ?? { name: 'Олена', about: 'Люблю тварин і довгі прогулянки. Мрію про собаку.', contact: 'olena@example.com', method: 'email', city: 'Київ' } })),
      logout: () => upd((s) => ({ ...s, user: null })),
      applyToMeet: (petId, form) => {
        const pet = petById(petId);
        upd((s) => {
          let n = ensureChat(s, petId, 'application');
          const now = Date.now();
          const text =
            `Добрий день! Подаю заявку на знайомство. Тварина: ${pet?.name ?? '—'}.\n` +
            `Мене звати ${form.name}. Житло: ${housingLabel[form.housing].toLowerCase()}. ` +
            `Діти: ${form.kids ? 'є' : 'немає'}. Інші тварини: ${otherPetsLabel[form.otherPets].toLowerCase()}.\n` +
            `Зручно приїхати: ${form.day}, ${form.time}.` + (form.comment ? `\n${form.comment}` : '');
          n = {
            ...n,
            applications: [{ petId, status: 'review', form, at: now }, ...n.applications.filter((a) => a.petId !== petId)],
            chats: n.chats.map((c) =>
              c.id !== `chat-${petId}`
                ? c
                : {
                    ...c,
                    kind: 'application',
                    unread: c.unread + 1,
                    updated: now,
                    messages: [
                      ...c.messages,
                      { id: `m${now}`, from: 'user', text, at: now },
                      { id: `m${now + 1}`, from: 'shelter', text: `Дякуємо за заявку! Ми розглянемо її й підтвердимо зустріч на ${form.day}, ${form.time} 💛`, at: now + 1 },
                    ],
                  },
            ),
          };
          return n;
        });
        return `chat-${petId}`;
      },
      messageShelter: (petId) => {
        upd((s) => ensureChat(s, petId, 'chat'));
        return `chat-${petId}`;
      },
      sendMessage: (chatId, text) =>
        upd((s) => ({
          ...s,
          chats: s.chats.map((c) =>
            c.id === chatId ? { ...c, updated: Date.now(), messages: [...c.messages, { id: `m${Date.now()}`, from: 'user', text, at: Date.now() }] } : c,
          ),
        })),
      markRead: (chatId) => upd((s) => ({ ...s, chats: s.chats.map((c) => (c.id === chatId && c.unread ? { ...c, unread: 0 } : c)) })),
      confirmMeeting: (petId) => upd((s) => ({ ...s, applications: s.applications.map((a) => (a.petId === petId ? { ...a, status: 'confirmed' } : a)) })),
      addListing: (l) => upd((s) => ({ ...s, listings: [{ ...l, id: `l${Date.now()}` }, ...s.listings] })),
    }),
    [state, upd],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export const useApp = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp потрібно викликати всередині AppProvider');
  return v;
};

// Наскільки тварина підходить під вибір з онбордингу (більше = краще)
export function matchScore(p: Pet, prefs: Prefs): number {
  let score = 0;
  if (prefs.species !== 'any') score += p.species === prefs.species ? 3 : -5;
  for (const n of prefs.needs) {
    if (n === 'kids' && p.goodWith.includes('kids')) score += 2;
    if (n === 'animals' && (p.goodWith.includes('dogs') || p.goodWith.includes('cats'))) score += 2;
    if (n === 'small' && (p.size === 'S' || p.size === 'M')) score += 2;
    if (n === 'calm' && p.traits.includes('calm')) score += 2;
    if (n === 'trained' && (p.ageGroup === 'adult' || p.ageGroup === 'senior')) score += 1;
  }
  return score;
}

export function recommended(prefs: Prefs, limit?: number): Pet[] {
  const list = [...pets].sort((a, b) => matchScore(b, prefs) - matchScore(a, prefs));
  const strict = prefs.species === 'any' ? list : list.filter((p) => p.species === prefs.species);
  return limit ? strict.slice(0, limit) : strict;
}

export { petById, shelterById };
