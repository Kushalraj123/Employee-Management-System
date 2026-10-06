export const getInitials = (name = '') => {
  if (!name) return 'EM';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'EM';
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getAvatarGradient = (name = '') => {
  const gradients = [
    'from-indigo-600 to-violet-600 text-white',
    'from-blue-600 to-cyan-600 text-white',
    'from-emerald-600 to-teal-700 text-white',
    'from-purple-600 to-pink-600 text-white',
    'from-amber-600 to-orange-600 text-white',
    'from-rose-600 to-red-700 text-white',
    'from-sky-600 to-blue-700 text-white',
    'from-teal-600 to-emerald-700 text-white',
  ];
  let hash = 0;
  const str = (name || 'Employee').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000;
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
];

export const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496799652-408c2ac9fe98?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

export const getGenderAvatar = (name = '', gender = 'Male', existingAvatar = '') => {
  if (existingAvatar && typeof existingAvatar === 'string' && !existingAvatar.includes('dicebear.com')) {
    return existingAvatar;
  }

  let hash = 0;
  const str = (name || 'Employee').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 10000;
  }

  const g = (gender || 'Male').toLowerCase();

  if (g === 'female') {
    return FEMALE_AVATARS[Math.abs(hash) % FEMALE_AVATARS.length];
  }
  
  if (g === 'male') {
    return MALE_AVATARS[Math.abs(hash) % MALE_AVATARS.length];
  }

  // Other / Prefer not to say
  return (Math.abs(hash) % 2 === 0 ? MALE_AVATARS : FEMALE_AVATARS)[Math.abs(hash) % 8];
};
