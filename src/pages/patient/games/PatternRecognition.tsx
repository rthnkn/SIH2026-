import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../../i18n';
import { useAuthStore } from '../../../store/auth';
import { db } from '../../../data/db';
import { patternSequences, getAdaptiveDifficulty } from '../../../data/seed';
import type { CognitiveDifficulty } from '../../../types';
import { ArrowLeft, RotateCcw, Trophy, Timer, Target, CheckCircle } from 'lucide-react';

export default function PatternGame() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [difficulty, setDifficulty] = useState<CognitiveDifficulty>('easy');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [startTime, setStartTime] = useState(Date.now());
  const [responseTimes, setResponseTimes] = useState<number[]>([]);
  const [gameComplete, setGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [shuffledChoices, setShuffledChoices] = useState<string[]>([]);

  const questions = patternSequences[difficulty];
  const currentQuestion = questions[currentIndex];

  useEffect(() => { loadDifficulty(); }, []);
  useEffect(() => {
    if (currentQuestion) {
      setShuffledChoices([...currentQuestion.choices].sort(() => Math.random() - 0.5));
    }
  }, [currentIndex, difficulty]);

  const loadDifficulty = async () => {
    if (!currentUser) return;
    const sessions = await db.cognitiveSessions
      .where('patientId').equals(currentUser.id)
      .and(s => s.activityType === 'pattern_recognition')
      .toArray();
    const recentScores = sessions.sort((a, b) =>
      new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    ).slice(0, 5).map(s => s.score);
    setDifficulty(getAdaptiveDifficulty(recentScores, 'easy'));
  };

  const handleAnswer = (answer: string) => {
    if (selectedAnswer || gameComplete) return;
    if (!gameStarted) setGameStarted(true);

    const correct = answer === currentQuestion.answer;
    const rt = (Date.now() - startTime) / 1000;

    setSelectedAnswer(answer);
    setIsCorrect(correct);
    setResponseTimes(prev => [...prev, rt]);
    if (correct) setScore(s => s + 1);
    setTotalQuestions(t => t + 1);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setStartTime(Date.now());
      } else {
        setGameComplete(true);
        saveResult(correct ? score + 1 : score);
      }
    }, 1200);
  };

  const saveResult = async (finalScore: number) => {
    if (!currentUser) return;
    const totalQ = questions.length;
    const avgRT = responseTimes.length > 0
      ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
      : 5;
    const accuracy = Math.round((finalScore / totalQ) * 100);
    const calculatedScore = Math.round(accuracy * 0.7 + Math.max(0, (10 - avgRT) / 10) * 30);
    const final = Math.min(Math.max(calculatedScore, 10), 100);

    await db.cognitiveSessions.add({
      id: `cog-${Date.now()}`,
      patientId: currentUser.id,
      activityType: 'pattern_recognition',
      difficulty,
      score: final,
      accuracy,
      responseTime: avgRT,
      attempts: totalQ,
      completedAt: new Date().toISOString(),
    });
  };

  const resetGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setTotalQuestions(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setResponseTimes([]);
    setGameComplete(false);
    setGameStarted(false);
    setStartTime(Date.now());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('/app/brain')} className="p-2 hover:bg-white/50 rounded-xl">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800">{t('patternRecognition')}</h1>
        <button onClick={resetGame} className="p-2 hover:bg-white/50 rounded-xl">
          <RotateCcw size={20} />
        </button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-4 mb-4">
        <div className="bg-white rounded-xl px-3 py-1.5 text-sm font-medium">
          {currentIndex + 1}/{questions.length}
        </div>
        <div className="bg-white rounded-xl px-3 py-1.5 text-sm font-medium">
          Score: {score}
        </div>
        <span className={`badge ${difficulty === 'easy' ? 'badge-success' : difficulty === 'medium' ? 'badge-warning' : 'badge-danger'}`}>
          {t(difficulty)}
        </span>
      </div>

      {gameComplete ? (
        <div className="text-center py-12 slide-up">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-elderly-2xl font-bold mb-2">{t('gameComplete')}</h2>
          <p className="text-gray-500 mb-6">{score >= questions.length * 0.7 ? t('wellDone') : t('keepTrying')}</p>
          <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
            <div className="card-elderly text-center p-4">
              <Trophy className="mx-auto text-yellow-500 mb-1" size={24} />
              <div className="text-2xl font-bold">{Math.round((score / questions.length) * 100)}</div>
              <div className="text-xs text-gray-500">{t('score')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <Target className="mx-auto text-purple-500 mb-1" size={24} />
              <div className="text-2xl font-bold">{Math.round((score / questions.length) * 100)}%</div>
              <div className="text-xs text-gray-500">{t('accuracy')}</div>
            </div>
            <div className="card-elderly text-center p-4">
              <Timer className="mx-auto text-blue-500 mb-1" size={24} />
              <div className="text-2xl font-bold">{responseTimes.length > 0 ? responseTimes[responseTimes.length - 1].toFixed(1) : '0'}s</div>
              <div className="text-xs text-gray-500">{t('responseTime')}</div>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={resetGame} className="btn-primary">{t('tryAgain')}</button>
            <button onClick={() => navigate('/app/brain')} className="btn-secondary">{t('back')}</button>
          </div>
        </div>
      ) : currentQuestion ? (
        <div className="text-center">
          {/* Sequence Display */}
          <div className="card-elderly p-8 mb-6 max-w-md mx-auto">
            <p className="text-sm text-gray-500 mb-4">{t('whatsNext')}</p>
            <div className="flex justify-center items-center gap-2 mb-4 flex-wrap">
              {currentQuestion.sequence.map((item, i) => (
                <span key={i} className="text-4xl md:text-5xl">{item}</span>
              ))}
              <span className="text-4xl md:text-5xl text-gray-300 animate-pulse ml-2">?</span>
            </div>
          </div>

          {/* Answer Choices */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            {shuffledChoices.map((choice, i) => (
              <button
                key={i}
                onClick={() => handleAnswer(choice)}
                disabled={!!selectedAnswer}
                className={`p-5 rounded-2xl text-4xl font-bold transition-all active:scale-95 ${
                  selectedAnswer === choice
                    ? isCorrect
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                      : 'bg-red-500 text-white ring-4 ring-red-300'
                    : choice === currentQuestion.answer && selectedAnswer
                    ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-300'
                    : 'bg-white hover:bg-gray-50 shadow-sm'
                }`}
              >
                {choice}
              </button>
            ))}
          </div>

          {selectedAnswer && (
            <div className={`mt-6 text-lg font-semibold ${isCorrect ? 'text-emerald-600' : 'text-red-600'}`}>
              {isCorrect ? `✓ ${t('wellDone')}` : `✗ ${t('keepTrying')}`}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
