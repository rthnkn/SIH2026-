import type { CognitiveDifficulty } from '../types';

// NER-focused cognitive game content
export const memoryMatchItems = {
  easy: [
    { id: '1', emoji: '🍚', label: 'Rice' },
    { id: '2', emoji: '🍵', label: 'Tea' },
    { id: '3', emoji: '🥘', label: 'Curry' },
    { id: '4', emoji: '🍌', label: 'Banana' },
  ],
  medium: [
    { id: '1', emoji: '🍚', label: 'Rice' },
    { id: '2', emoji: '🍵', label: 'Tea' },
    { id: '3', emoji: '🥘', label: 'Curry' },
    { id: '4', emoji: '🍌', label: 'Banana' },
    { id: '5', emoji: '🌸', label: 'Flower' },
    { id: '6', emoji: '🏔️', label: 'Mountain' },
  ],
  hard: [
    { id: '1', emoji: '🍚', label: 'Rice' },
    { id: '2', emoji: '🍵', label: 'Tea' },
    { id: '3', emoji: '🥘', label: 'Curry' },
    { id: '4', emoji: '🍌', label: 'Banana' },
    { id: '5', emoji: '🌸', label: 'Flower' },
    { id: '6', emoji: '🏔️', label: 'Mountain' },
    { id: '7', emoji: '🐘', label: 'Elephant' },
    { id: '8', emoji: '🎋', label: 'Bamboo' },
  ],
};

export const patternSequences = {
  easy: [
    { sequence: ['🔴', '🔵', '🔴', '🔵'], answer: '🔴', choices: ['🔴', '🔵', '🟢', '🟡'] },
    { sequence: ['🟢', '🟢', '🟡', '🟡'], answer: '🟢', choices: ['🟢', '🟡', '🔴', '🔵'] },
    { sequence: ['🔵', '🔴', '🔵', '🔴'], answer: '🔵', choices: ['🔵', '🔴', '🟢', '🟡'] },
  ],
  medium: [
    { sequence: ['🔴', '🔵', '🟢', '🔴', '🔵'], answer: '🟢', choices: ['🟢', '🔴', '🔵', '🟡'] },
    { sequence: ['⭐', '🌙', '⭐', '🌙', '⭐'], answer: '🌙', choices: ['🌙', '⭐', '☀️', '🌈'] },
    { sequence: ['🟥', '🟦', '🟩', '🟥', '🟦'], answer: '🟩', choices: ['🟩', '🟥', '🟦', '🟨'] },
  ],
  hard: [
    { sequence: ['🔴', '🔵', '🟢', '🔴', '🔵', '🟢', '🔴'], answer: '🔵', choices: ['🔵', '🟢', '🔴', '🟡'] },
    { sequence: ['1️⃣', '2️⃣', '4️⃣', '7️⃣', '11️⃣'], answer: '16️⃣', choices: ['16️⃣', '13️⃣', '14️⃣', '15️⃣'] },
    { sequence: ['🌙', '⭐', '🌙', '⭐', '🌙', '⭐', '🌙'], answer: '⭐', choices: ['⭐', '🌙', '☀️', '🌈'] },
  ],
};

export const objectRecognitionItems = {
  easy: [
    { emoji: '🪷', label: 'Lotus', options: ['Lotus', 'Rose', 'Sunflower', 'Lily'], hint: 'This is the national flower of India' },
    { emoji: '🐘', label: 'Elephant', options: ['Elephant', 'Horse', 'Cow', 'Tiger'], hint: 'A large grey animal with a trunk' },
    { emoji: '🍚', label: 'Rice', options: ['Rice', 'Wheat', 'Corn', 'Barley'], hint: 'A staple food grain in North East India' },
    { emoji: '🫖', label: 'Tea Kettle', options: ['Tea Kettle', 'Pot', 'Pan', 'Bowl'], hint: 'Used to boil water for tea' },
  ],
  medium: [
    { emoji: '🎵', label: 'Musical Instrument', options: ['Musical Instrument', 'Kitchen Tool', 'Toy', 'Decoration'], hint: 'Makes sounds when played' },
    { emoji: '🚲', label: 'Bicycle', options: ['Bicycle', 'Motorcycle', 'Cart', 'Wheelchair'], hint: 'Two wheels, pedal powered' },
    { emoji: '🪴', label: 'Potted Plant', options: ['Potted Plant', 'Tree', 'Flower Pot', 'Garden'], hint: 'A plant growing in a container' },
    { emoji: '🧘', label: 'Meditation', options: ['Meditation', 'Exercise', 'Sleep', 'Reading'], hint: 'A practice for peace of mind' },
  ],
  hard: [
    { emoji: '🪘', label: 'Traditional Drum', options: ['Traditional Drum', 'Bucket', 'Bowl', 'Box'], hint: 'Used in traditional music and festivals' },
    { emoji: '🪢', label: 'Rope Knot', options: ['Rope Knot', 'Thread', 'Chain', 'Net'], hint: 'Used to tie things together' },
    { emoji: '🧺', label: 'Bamboo Basket', options: ['Bamboo Basket', 'Pot', 'Bag', 'Bowl'], hint: 'Made from bamboo, used for carrying items' },
    { emoji: '🏮', label: 'Paper Lantern', options: ['Paper Lantern', 'Lamp', 'Candle', 'Light Bulb'], hint: 'A decorative light made of paper' },
  ],
};

export const dailyRoutineQuestions = {
  easy: [
    { question: 'What do you do first in the morning?', correctAnswer: 'Wake up and freshen up', options: ['Wake up and freshen up', 'Have dinner', 'Go to sleep', 'Watch TV'] },
    { question: 'When do you take your morning medicines?', correctAnswer: 'After breakfast', options: ['After breakfast', 'Before sleeping', 'During lunch', 'In the evening'] },
    { question: 'What comes before bedtime?', correctAnswer: 'Brush teeth and change clothes', options: ['Brush teeth and change clothes', 'Morning walk', 'Breakfast', 'Wake up'] },
  ],
  medium: [
    { question: 'What do you usually do after breakfast?', correctAnswer: 'Take morning medicines', options: ['Take morning medicines', 'Go to sleep', 'Have dinner', 'Watch late night show'] },
    { question: 'What comes before taking evening medicine?', correctAnswer: 'Evening tea and snacks', options: ['Evening tea and snacks', 'Morning walk', 'Breakfast', 'Waking up'] },
    { question: 'What is a good activity to do after lunch?', correctAnswer: 'Rest or light activity', options: ['Rest or light activity', 'Morning exercise', 'Sleep all day', 'Skip the meal'] },
  ],
  hard: [
    { question: 'What should you do if you feel thirsty between meals?', correctAnswer: 'Drink water', options: ['Drink water', 'Wait until dinner', 'Drink cold drinks', 'Skip it'] },
    { question: 'If you miss a medicine, what is the best action?', correctAnswer: 'Take it as soon as you remember', options: ['Take it as soon as you remember', 'Double the next dose', 'Skip it entirely', 'Stop the medicine'] },
    { question: 'How many glasses of water should you aim for daily?', correctAnswer: '6-8 glasses', options: ['6-8 glasses', '1-2 glasses', 'Only when thirsty', '10+ liters'] },
  ],
};

export function getAdaptiveDifficulty(
  recentScores: number[],
  currentDifficulty: CognitiveDifficulty
): CognitiveDifficulty {
  if (recentScores.length < 2) return currentDifficulty;

  const avg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const lastThree = recentScores.slice(-3);
  const recentAvg = lastThree.reduce((a, b) => a + b, 0) / lastThree.length;

  if (recentAvg >= 85 && currentDifficulty !== 'hard') {
    return currentDifficulty === 'easy' ? 'medium' : 'hard';
  }
  if (recentAvg <= 50 && currentDifficulty !== 'easy') {
    return currentDifficulty === 'hard' ? 'medium' : 'easy';
  }
  return currentDifficulty;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
