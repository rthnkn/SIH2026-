import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { useAuthStore } from '../../../store/auth';
import { db } from '../../../data/db';
import { memoryMatchItems, shuffleArray, getAdaptiveDifficulty } from '../../../data/seed';
import type { CognitiveDifficulty } from '../../../types';
import { ArrowLeft, RotateCcw, Trophy, Timer, Target, Zap } from 'lucide-react';

interface Card {
  id: string;
  uniqueId: string;
  emoji: string;
  label: string;
  flipped: boolean;
  matched: boolean;
}

export default function MemoryMatchGame() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [difficulty, setDifficulty] = useState<CognitiveDifficulty>('easy');
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lockBoard, setLockBoard] = useState(false);

  // Load adaptive difficulty
  useEffect(() => {
    loadDifficulty();
  }, [currentUser?.id]);

  const loadDifficulty = async () => {
    if (!currentUser) return;
    const sessions = await db.cognitiveSessions
      .where('patientId').equals(currentUser.id)
      .and(s => s.activityType === 'memory_match')
      .toArray();
    const recentScores = sessions.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ).slice(0, 5).map(s => s.score);
    const newDiff = getAdaptiveDifficulty(recentScores, 'easy');
    setDifficulty(newDiff);
  };

  const initGame = useCallback(() => {
    const items = memoryMatchItems[difficulty];
    const pairs = items.flatMap(item => [
      { ...item, uniqueId: `${item.id}-a`, flipped: false, matched: false },
      { ...item, uniqueId: `${item.id}-b`, flipped: false, matched: false },
    ]);
    setCards(shuffleArray(pairs));
    setFlippedCards([]);
    setMatchedPairs(0);
    setAttempts(0);
    setElapsed(0);
    setGameComplete(false);
    setGameStarted(false);
    setScore(0);
    setLockBoard(false);
  }, [difficulty]);

  useEffect(() => { initGame(); }, [initGame]);

  // Timer
  useEffect(() => {
    if (!gameStarted || gameComplete) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStarted, gameComplete, startTime]);

  const handleCardClick = (uniqueId: string) => {
    if (lockBoard || gameComplete) return;
    if (flippedCards.length >= 2) return;

    const card = cards.find(c => c.uniqueId === uniqueId);
    if (!card || card.flipped || card.matched) return;

    if (!gameStarted) {
      setStartTime(Date.now());
      setGameStarted(true);
    }

    const newCards = cards.map(c => c.uniqueId === uniqueId ? { ...c, flipped: true } : c);
    setCards(newCards);

    const newFlipped = [...flippedCards, uniqueId];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setAttempts(a => a + 1);
      const [first, second] = newFlipped;
      const card1 = newCards.find(c => c.uniqueId === first);
      const card2 = newCards.find(c => c.uniqueId === second);

      if (card1?.id === card2?.id) {
        // Match!
        setCards(prev => prev.map(c =>
          c.id === card1?.id ? { ...c, matched: true } : c
        ));
        setMatchedPairs(p => p + 1);
        setFlippedCards([]);

        if (matchedPairs + 1 === memoryMatchItems[difficulty].length) {
          setGameComplete(true);
          saveResult();
        }
      } else {
        setLockBoard(true);
        setTimeout(() => {
          setCards(prev => prev.map(c =>
            c.uniqueId === first || c.uniqueId === second
              ? { ...c, flipped: false } : c
          ));
          setFlippedCards([]);
          setLockBoard(false);
        }, 1000);
      }
    }
  };

  const saveResult = async () => {
    if (!currentUser) return;
    const totalPairs = memoryMatchItems[difficulty].length;
    const accuracy = Math.round((matchedPairs / Math.max(attempts, 1)) * 100);
    const calculatedScore = Math.round(
      (matchedPairs / totalPairs) * 50 +
      (accuracy / 100) * 30 +
      Math.max(0, (30 - elapsed) / 30) * 20
    );
    const finalScore = Math.min(Math.max(calculatedScore, 10), 100);
    setScore(finalScore);

    await db.cognitiveSessions.add({
      id: `cog-${Date.now()}`,
      patientId: currentUser.id,
      activityType: 'memory_match',
      difficulty,
      score: finalScore,
      accuracy,
      responseTime: elapsed / Math.max(attempts, 1),
      attempts,
      completedAt: new Date().toISOString(),
    });
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => navigate('/app/brain')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{t('memoryMatch')}</h1>
        <button onClick={initGame} className="p-2 hover:bg-white/50 rounded-xl">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Stats Bar */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-1.5 text-sm font-medium">
          <Timer size={16} className="text-blue-500" /> {formatTime(elapsed)}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-1.5 text-sm font-medium">
          <Target size={16} className="text-purple-500" /> {matchedPairs}/{memoryMatchItems[difficulty].length}
        </div>
        <div className="flex items-center gap-1 bg-white rounded-xl px-3 py-1.5 text-sm font-medium">
          <Zap size={16} className="text-orange-500" /> {attempts} {t('attempts')}
        </div>
      </div>

      {/* Difficulty Badge */}
      <div className="text-center mb-4">
        <span className={`badge ${difficulty === 'easy' ? 'badge-success' : difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
          {t(difficulty)} {t('difficulty')}
        </span>
      </div>

      {/* Game Complete */}
      {gameComplete ? (
        <div className="text-center py-12 slide-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-elderly-2xl font-bold text-gray-900 mb-2">{t('gameComplete')}</h2>
          <p className="text-gray-500 mb-6">
            {score >= 80 ? t('wellDone') : score >= 50 ? t('goodJob') : t('keepTrying')}
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
            <div className="card-elderly text-center p-4">
              <Trophy className="mx-auto text-yellow-500 mb-1" size={24} />
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-xs text-gray-500">{t('score')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <Target className="mx-auto text-purple-500 mb-1" size={24} />
              <div className="text-2xl font-bold text-gray-800">
                {Math.round((matchedPairs / Math.max(attempts, 1)) * 100)}%
              </div>
              <div className="text-xs text-gray-500">{t('accuracy')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <Timer className="mx-auto text-blue-500 mb-1" size={24} />
              <div className="text-2xl font-bold text-gray-800">{formatTime(elapsed)}</div>
              <div className="text-xs text-gray-500">{t('responseTime')}</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={initGame} className="btn-primary">{t('tryAgain')}</button>
            <button onClick={() => navigate('/app/brain')} className="btn-secondary">{t('back')}</button>
          </div>
        </div>
      ) : (
        /* Card Grid */
        <div className={`grid gap-3 mx-auto max-w-md ${
          cards.length <= 8 ? 'grid-cols-4' : 'grid-cols-4'
        }`}>
          {cards.map((card) => (
            <button
              key={card.uniqueId}
              onClick={() => handleCardClick(card.uniqueId)}
              disabled={card.matched || flippedCards.length >= 2}
              className={`aspect-square rounded-2xl text-3xl md:text-4xl font-bold transition-all duration-200 active:scale-95 ${
                card.flipped || card.matched
                  ? card.matched
                    ? 'bg-emerald-100 border-2 border-emerald-300 scale-95'
                    : 'bg-white border-2 border-blue-300 shadow-md'
                  : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl'
              }`}
            >
              {card.flipped || card.matched ? card.emoji : '?'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
