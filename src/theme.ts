// Дизайн-токени. Значення взято з Figma-макета (твоя версія):
// сірий фон, темно-зелений текст і кнопки, помаранчево-бурштинові акценти. Шрифт — системний (на Android це Roboto).
import { TextStyle } from 'react-native';

export const colors = {
  primary: '#11614C', // зелений: кнопки, вибрані чіпи
  primaryDark: '#002B1E', // дуже темний зелений: заголовки й основний текст
  primarySoft: '#E3F0EC',
  accent: '#F77D11', // помаранчевий: активна вкладка, бейджі, кільця історій
  amber: '#EF9E31', // бурштиновий: обводки чіпів і тегів
  link: '#D06B11', // посилання («Усі», «Детальніше»)
  accentSoft: '#FFEBD9', // персиковий: аватари, підкладки
  butter: '#FFF2CF',
  bg: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#002B1E',
  textSecondary: '#6F6A63',
  border: '#E6E6E6',
  success: '#34A853',
  warning: '#F5A524',
  error: '#E5484D',
  overlay: 'rgba(0,20,14,0.45)',
};

export const radius = { sm: 10, md: 16, lg: 24, pill: 999 };

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };

type Weight = TextStyle['fontWeight'];
const w = (fontSize: number, lineHeight: number, fontWeight: Weight): TextStyle => ({ fontSize, lineHeight, fontWeight });

// Типографіка: лише три товщини (400 / 500 / 700)
export const type = {
  display: w(32, 38, '500'),
  h1: w(24, 30, '500'),
  h2: w(20, 26, '500'),
  h3: w(16, 22, '500'),
  body: w(15, 22, '400'),
  bodySmall: w(13, 18, '400'),
  caption: w(12, 16, '500'),
  button: w(16, 20, '500'),
};

export const shadow = {
  card: {
    shadowColor: '#4A3A2A',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
};

export const SCREEN_PADDING = spacing.lg;
