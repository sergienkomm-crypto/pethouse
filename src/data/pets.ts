// Мок-дані (вигадані). Фото — з Unsplash, тому потрібен інтернет.

export type Species = 'dog' | 'cat';
export type Sex = 'f' | 'm';
export type Size = 'S' | 'M' | 'L' | 'XL';
export type AgeGroup = 'baby' | 'young' | 'adult' | 'senior';
export type Trait = 'active' | 'calm' | 'gentle' | 'playful' | 'social' | 'independent';
export type Compat = 'kids' | 'dogs' | 'cats' | 'people';
export type PetUpdate = 'нове фото' | 'лікування' | 'оновлення' | 'новина';

export type Shelter = { id: string; name: string; city: string; about: string; logo: 1 | 2 | 3 };

export type Pet = {
  id: string;
  name: string;
  species: Species;
  sex: Sex;
  size: Size;
  ageGroup: AgeGroup;
  ageText: string;
  months: number;
  city: string;
  shelterId: string;
  traits: Trait[];
  goodWith: Compat[];
  vaccinated: boolean;
  sterilized: boolean;
  special: boolean;
  short: string;
  story: string;
  health: string;
  photos: string[];
  update?: PetUpdate; // для «історій»
  needsHelp?: 'лікування' | 'допомога' | 'новини';
};

export const shelters: Shelter[] = [
  { id: 's0', name: 'Чотири лапи', city: 'Дніпро', about: 'Затишний притулок, де кожен хвостик має ім’я. Працюємо щодня з 10:00 до 19:00.', logo: 1 },
  { id: 's1', name: 'Щасливий хвіст', city: 'Київ', about: 'Невеликий притулок, де тварини живуть у вольєрах з теплими будками. Працюємо щодня з 10:00 до 18:00.', logo: 2 },
  { id: 's2', name: 'Лапа допомоги', city: 'Львів', about: 'Волонтерський притулок. Допомагаємо знайти родину цуценятам і кошенятам.', logo: 1 },
  { id: 's3', name: 'Тепла оселя', city: 'Харків', about: 'Приймаємо тварин, що потрапили в біду, лікуємо та соціалізуємо.', logo: 3 },
  { id: 's4', name: 'Добрі руки', city: 'Одеса', about: 'Притулок для собак і котів різного віку. Є ветеринар на місці.', logo: 2 },
  { id: 's5', name: 'Свій дім', city: 'Дніпро', about: 'Допомагаємо великим собакам знайти домівку.', logo: 3 },
];

const U = (id: string) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=70`;

const DOGS = [
  U('1587300003388-59208cc962cb'),
  U('1543466835-00a7907e9de1'),
  U('1561037404-61cd46aa615b'),
  U('1552053831-71594a27632d'),
  U('1518717758536-85ae29035b6d'),
  U('1548199973-03cce0bbc87b'),
  U('1537151625747-768eb6cf92b2'),
  U('1505628346881-b72b27e84530'),
  U('1583337130417-3346a1be7dee'),
  U('1517849845537-4d257902454a'),
];
const CATS = [
  U('1514888286974-6c03e2ca1dba'),
  U('1533738363-b7f9aef128ce'),
  U('1574158622682-e40e69881006'),
  U('1495360010541-f48722b34f7d'),
  U('1573865526739-10659fec78a5'),
  U('1592194996308-7b43878e84a6'),
  U('1596492784531-6e6eb5ea9993'),
];
// дає 3 фото для галереї: головне + два сусідніх з пулу
const gallery = (pool: string[], i: number) => [pool[i % pool.length], pool[(i + 3) % pool.length], pool[(i + 5) % pool.length]];

export const pets: Pet[] = [
  {
    id: 'luna', name: 'Луна', species: 'dog', sex: 'f', size: 'M', ageGroup: 'adult', ageText: '2 роки', months: 24, city: 'Дніпро', shelterId: 's0',
    traits: ['gentle', 'social'], goodWith: ['kids', 'people'], vaccinated: true, sterilized: true, special: false,
    short: 'Ніжна й уважна. Любить довгі прогулянки та чухання за вушком.',
    story: 'Луна прийшла до нас навесні. Вона швидко вчиться, добре ходить на повідку і дуже прив’язується до людей. Шукає родину, де її будуть любити й гуляти щодня.',
    health: 'Вакцинована, стерилізована, оброблена від паразитів. Чіп встановлено.',
    photos: gallery(DOGS, 0), update: 'нове фото',
  },
  {
    id: 'buddy', name: 'Бадді', species: 'dog', sex: 'm', size: 'S', ageGroup: 'young', ageText: '8 місяців', months: 8, city: 'Львів', shelterId: 's2',
    traits: ['active', 'playful'], goodWith: ['kids', 'dogs', 'people'], vaccinated: true, sterilized: false, special: false,
    short: 'Енергійний непосида, який обожнює м’ячики та нових друзів.',
    story: 'Бадді знайшли волонтери разом із братиками. Усіх уже забрали додому, а він ще чекає. Йому потрібна активна родина й трохи терпіння на навчання.',
    health: 'Вакцинований згідно з віком. Стерилізація — після року.',
    photos: gallery(DOGS, 1), update: 'оновлення',
  },
  {
    id: 'mia', name: 'Мія', species: 'cat', sex: 'f', size: 'S', ageGroup: 'adult', ageText: '4 роки', months: 48, city: 'Київ', shelterId: 's1',
    traits: ['calm', 'gentle'], goodWith: ['cats', 'people'], vaccinated: true, sterilized: true, special: false,
    short: 'Спокійна красуня, яка любить вечори на дивані й тихе муркотіння.',
    story: 'Мія жила в одній сімʼї, але власники виїхали за кордон. Вона привчена до лотка й когтеточки, не конфліктує з іншими котами.',
    health: 'Вакцинована, стерилізована. Здорова.',
    photos: gallery(CATS, 0), update: 'новина',
  },
  {
    id: 'rex', name: 'Рекс', species: 'dog', sex: 'm', size: 'L', ageGroup: 'adult', ageText: '6 років', months: 72, city: 'Харків', shelterId: 's3',
    traits: ['calm', 'social'], goodWith: ['dogs', 'people'], vaccinated: true, sterilized: true, special: true,
    short: 'Спокійний і вірний. Після операції на лапі потребує підтримки.',
    story: 'Рекс потрапив до нас із пошкодженою лапою. Тепер він одужує й вчиться знову бігати. Дуже вдячний кожному, хто поруч.',
    health: 'Проходить реабілітацію лапи. Вакцинований, стерилізований.',
    photos: gallery(DOGS, 2), update: 'лікування', needsHelp: 'лікування',
  },
  {
    id: 'marquis', name: 'Маркіз', species: 'cat', sex: 'm', size: 'S', ageGroup: 'young', ageText: '1 рік', months: 12, city: 'Одеса', shelterId: 's4',
    traits: ['playful', 'active'], goodWith: ['kids', 'cats'], vaccinated: true, sterilized: false, special: false,
    short: 'Грайливий мисливець за бантиками, ідеальний друг для дітей.',
    story: 'Маркіз виріс у притулку й звик до людей. Любить гратися, стрибати й спати в ногах.',
    health: 'Вакцинований. Стерилізація запланована.',
    photos: gallery(CATS, 1),
  },
  {
    id: 'dasya', name: 'Дася', species: 'dog', sex: 'f', size: 'M', ageGroup: 'senior', ageText: '10 років', months: 120, city: 'Київ', shelterId: 's1',
    traits: ['gentle', 'calm'], goodWith: ['kids', 'cats', 'people'], vaccinated: true, sterilized: true, special: false,
    short: 'Мудра й лагідна. Мріє про затишний куточок і теплий плед.',
    story: 'Дася прожила в притулку три роки. Вона любить спокійні прогулянки й тих, хто сидить поруч. Старші друзі — найвдячніші.',
    health: 'Вакцинована, стерилізована. Потрібен корм для сеньйорів.',
    photos: gallery(DOGS, 3), update: 'оновлення',
  },
  {
    id: 'tosha', name: 'Тоша', species: 'cat', sex: 'm', size: 'S', ageGroup: 'baby', ageText: '3 місяці', months: 3, city: 'Львів', shelterId: 's2',
    traits: ['playful', 'social'], goodWith: ['kids', 'cats', 'dogs'], vaccinated: false, sterilized: false, special: false,
    short: 'Крихітне кошеня, яке вже вміє муркотіти на всю кімнату.',
    story: 'Тошу знайшли на подвірʼї волонтери. Він привчений до лотка, їсть сам і дуже ласкавий.',
    health: 'Першу вакцинацію зроблять найближчим часом.',
    photos: gallery(CATS, 2), update: 'нове фото',
  },
  {
    id: 'greta', name: 'Грета', species: 'dog', sex: 'f', size: 'XL', ageGroup: 'adult', ageText: '5 років', months: 60, city: 'Дніпро', shelterId: 's5',
    traits: ['independent', 'active'], goodWith: ['people'], vaccinated: true, sterilized: true, special: false,
    short: 'Велика й самостійна. Потрібен будинок із двориком.',
    story: 'Грета любить простір і рух. З людьми, яких знає, дуже ніжна. Шукає господаря з досвідом.',
    health: 'Вакцинована, стерилізована.',
    photos: gallery(DOGS, 4),
  },
  {
    id: 'snizhok', name: 'Сніжок', species: 'cat', sex: 'm', size: 'S', ageGroup: 'adult', ageText: '2 роки', months: 24, city: 'Київ', shelterId: 's1',
    traits: ['gentle', 'social'], goodWith: ['kids', 'people'], vaccinated: true, sterilized: true, special: false,
    short: 'Привітний білосніжний котик, що зустрічає біля дверей.',
    story: 'Сніжок любить увагу й обійми. Швидко знаходить спільну мову з усіма.',
    health: 'Вакцинований, стерилізований.',
    photos: gallery(CATS, 3), update: 'новина',
  },
  {
    id: 'alfi', name: 'Алфі', species: 'dog', sex: 'm', size: 'M', ageGroup: 'senior', ageText: '7 років', months: 84, city: 'Одеса', shelterId: 's4',
    traits: ['calm'], goodWith: ['cats', 'people'], vaccinated: true, sterilized: true, special: true,
    short: 'Тихий джентльмен. Потребує щоденних ліків для серця.',
    story: 'Алфі трохи втомився від життя на вулиці, але зберіг добре серце. Зараз ми підбираємо терапію й шукаємо тих, хто допоможе.',
    health: 'Щоденні ліки для серця. Вакцинований, стерилізований.',
    photos: gallery(DOGS, 5), needsHelp: 'допомога', update: 'лікування',
  },
  {
    id: 'liza', name: 'Ліза', species: 'cat', sex: 'f', size: 'S', ageGroup: 'young', ageText: '1,5 року', months: 18, city: 'Харків', shelterId: 's3',
    traits: ['active', 'playful'], goodWith: ['kids', 'dogs'], vaccinated: true, sterilized: true, special: false,
    short: 'Швидка й цікава. Обожнює вікно та пташок за склом.',
    story: 'Ліза не сидить на місці: досліджує кожен куточок. Їй підійде родина, яка любить активних питомців.',
    health: 'Вакцинована, стерилізована.',
    photos: gallery(CATS, 4), needsHelp: 'новини',
  },
  {
    id: 'baron', name: 'Барон', species: 'dog', sex: 'm', size: 'L', ageGroup: 'adult', ageText: '3 роки', months: 36, city: 'Львів', shelterId: 's2',
    traits: ['active', 'social'], goodWith: ['dogs', 'kids', 'people'], vaccinated: true, sterilized: true, special: false,
    short: 'Сильний, добрий і дуже товариський. Пробіжки — його стихія.',
    story: 'Барон дружить з усіма собаками в притулку. Потребує активного господаря й щоденних прогулянок.',
    health: 'Вакцинований, стерилізований.',
    photos: gallery(DOGS, 6),
  },
];

export const petById = (id: string) => pets.find((p) => p.id === id);
export const shelterById = (id: string) => shelters.find((s) => s.id === id);

// Підписи
export const sizeLabel: Record<Size, string> = { S: 'Малий', M: 'Середній', L: 'Великий', XL: 'Дуже великий' };
export const sizeWeight: Record<Size, string> = { S: '< 5 кг', M: '5–15 кг', L: '15–25 кг', XL: '> 25 кг' };
export const ageGroupLabel: Record<AgeGroup, string> = { baby: 'Малюк', young: 'Молодий', adult: 'Дорослий', senior: 'Старший' };
export const ageGroupRange: Record<AgeGroup, string> = { baby: '< 6 міс.', young: 'до 2 р.', adult: '2–6 р.', senior: '> 6 р.' };
export const compatLabel: Record<Compat, string> = { kids: 'Діти', dogs: 'Собаки', cats: 'Коти', people: 'Люди' };
export const compatEmoji: Record<Compat, string> = { kids: '🧒', dogs: '🐶', cats: '🐱', people: '👤' };

const traitForms: Record<Trait, [string, string]> = {
  active: ['Активна', 'Активний'],
  calm: ['Спокійна', 'Спокійний'],
  gentle: ['Лагідна', 'Лагідний'],
  playful: ['Грайлива', 'Грайливий'],
  social: ['Товариська', 'Товариський'],
  independent: ['Самостійна', 'Самостійний'],
};
export const traitLabel = (t: Trait, sex: Sex) => traitForms[t][sex === 'f' ? 0 : 1];
export const traitLabelNeutral = (t: Trait) => traitForms[t][1];
export const allTraits: Trait[] = ['active', 'calm', 'gentle', 'playful', 'social', 'independent'];

export const petTags = (p: Pet, max = 3) => {
  const list = [...p.traits.map((t) => traitLabel(t, p.sex))];
  if (p.goodWith.includes('kids')) list.push('Любить дітей');
  if (p.vaccinated) list.push(p.sex === 'f' ? 'Вакцинована' : 'Вакцинований');
  return list.slice(0, max);
};

export const plural = (n: number, one: string, few: string, many: string) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

// Міста для фільтра: великі — як теги, усі — у випадаючому меню
export const bigCities = ['Київ', 'Львів', 'Харків', 'Дніпро'];
export const allCities = [...bigCities, 'Вінниця', 'Запоріжжя', 'Полтава', 'Чернівці', 'Івано-Франківськ', 'Ужгород', 'Житомир', 'Суми'];
