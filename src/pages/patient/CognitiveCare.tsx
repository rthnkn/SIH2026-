import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { Brain, Layers, Eye, ListChecks, ArrowRight, Clock, Star } from 'lucide-react';

const games = [
  {
    key: 'memoryMatch',
    icon: '🃏',
    path: '/app/brain/memory-match',
    description: 'Remember and match pairs of cards',
    time: '5 min',
    color: 'from-blue-500 to-indigo-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
  },
  {
    key: 'patternRecognition',
    icon: '🔮',
    path: '/app/brain/pattern',
    description: 'Find the pattern and predict what comes next',
    time: '3 min',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
  },
  {
    key: 'objectRecognition',
    icon: '🖼️',
    path: '/app/brain/object',
    description: 'Identify familiar everyday objects',
    time: '3 min',
    color: 'from-orange-500 to-red-600',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
  },
  {
    key: 'routineRecall',
    icon: '📋',
    path: '/app/brain/routine-recall',
    description: 'Recall your daily routine activities',
    time: '4 min',
    color: 'from-emerald-500 to-blue-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
  },
];

export default function CognitiveCarePage() {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <div className="page-container slide-up">
      <div className="mb-6">
        <h1 className="text-elderly-2xl font-extrabold text-gray-900">{t('brainCare')}</h1>
        <p className="text-gray-500 text-elderly-base mt-1">{t('brainCareSubtitle')}</p>
      </div>

      {/* Today's Brain Care Plan */}
      <div className="card-elderly mb-6 bg-gradient-to-r from-purple-50 to-cream-100 border-purple-200">
        <h2 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-3">{t('todaysBrainCare')}</h2>
        <div className="space-y-2">
          {games.map(({ icon, key, path, time }) => (
            <button
              key={key}
              onClick={() => navigate(path)}
              className="w-full flex items-center gap-3 p-3 bg-white/70 rounded-xl hover:bg-white transition-colors text-left"
            >
              <span className="text-xl">{icon}</span>
              <span className="flex-1 font-medium text-gray-700">{t(key)}</span>
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Clock size={14} /> {time}
              </span>
              <ArrowRight size={16} className="text-gray-300" />
            </button>
          ))}
        </div>
      </div>

      {/* Game Cards */}
      <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Choose an Activity</h2>
      <div className="space-y-4">
        {games.map(({ key, icon, path, description, time, color, bgColor, textColor }) => (
          <button
            key={key}
            onClick={() => navigate(path)}
            className={`card-interactive w-full text-left p-6 flex items-center gap-5`}
          >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl bg-gradient-to-br ${color} text-white shadow-lg shrink-0`}>
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-800 text-elderly-lg">{t(key)}</h3>
              <p className="text-gray-500 text-sm mt-0.5">{description}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className={`text-xs font-semibold ${textColor} ${bgColor} px-2 py-0.5 rounded-full flex items-center gap-1`}>
                  <Clock size={12} /> {time}
                </span>
              </div>
            </div>
            <ArrowRight size={20} className="text-gray-300 shrink-0" />
          </button>
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-2xl text-xs text-gray-400 text-center">
        {t('disclaimer')}
      </div>
    </div>
  );
}
