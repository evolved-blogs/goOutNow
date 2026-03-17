/**
 * Shared chat utilities — deterministic name + color from a userId UUID.
 * Used by both PostChat and GlobalChat so every player has the same
 * identity across the whole app.
 */

const COLORS = ['#e07b54', '#5b8dd9', '#6cbb7e', '#b57bee', '#e8a838', '#4ecdc4'];

const ADJECTIVES = [
  'swift',
  'calm',
  'bold',
  'bright',
  'clever',
  'eager',
  'fierce',
  'gentle',
  'happy',
  'jolly',
  'keen',
  'lively',
  'noble',
  'proud',
  'quick',
  'sharp',
  'sly',
  'warm',
];
const NOUNS = [
  'fox',
  'hawk',
  'bear',
  'wolf',
  'deer',
  'crow',
  'lynx',
  'pike',
  'kite',
  'wren',
  'finch',
  'hare',
  'mole',
  'newt',
  'orca',
  'puma',
  'rook',
  'teal',
];

export function stableHash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function userName(userId: string): string {
  const h = stableHash(userId);
  return `${ADJECTIVES[h % ADJECTIVES.length]} ${NOUNS[Math.floor(h / ADJECTIVES.length) % NOUNS.length]}`;
}

export function userColor(userId: string): string {
  return COLORS[stableHash(userId) % COLORS.length];
}

export function formatTimestamp(createdAt: string): string {
  const msgDate = new Date(createdAt);

  // Start of today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Start of yesterday
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Start of message date
  const msgDateOnly = new Date(msgDate);
  msgDateOnly.setHours(0, 0, 0, 0);

  // Determine relative date
  let dateStr: string;
  if (msgDateOnly.getTime() === today.getTime()) {
    dateStr = 'Today';
  } else if (msgDateOnly.getTime() === yesterday.getTime()) {
    dateStr = 'Yesterday';
  } else {
    // Show date in MM/DD format
    dateStr = msgDate.toLocaleDateString([], { month: '2-digit', day: '2-digit' });
  }

  // Time in HH:MM format
  const timeStr = msgDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return `${dateStr} ${timeStr}`;
}
