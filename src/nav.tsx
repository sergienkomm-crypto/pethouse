// Проста навігація без бібліотек: App.tsx тримає "який екран зараз" і роздає ці функції всім.
import { createContext, useContext } from 'react';

export type Tab = 'home' | 'feed' | 'search' | 'chats' | 'account';

export type Nav = {
  tab: Tab;
  setTab: (t: Tab) => void;
  openPet: (id: string) => void;
  openChat: (id: string) => void;
  back: () => void;
  // Показує екран входу, якщо користувач ще не увійшов; потім виконує дію
  requireAuth: (action: () => void, reason?: string) => void;
  openSupport: (petId: string) => void;
  openMeet: (petId: string) => void;
  toast: (msg: string) => void;
};

export const NavContext = createContext<Nav | null>(null);

export const useNav = () => {
  const v = useContext(NavContext);
  if (!v) throw new Error('useNav потрібно викликати всередині NavContext');
  return v;
};
