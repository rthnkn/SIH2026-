import { useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import { Pill, Brain, Droplets, Calendar, Users, Mic, Wifi, Globe, Shield, Heart, ArrowRight } from 'lucide-react';
import { useAuthStore } from '../store/auth';

export default function LandingPage() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { loadDemo } = useAuthStore();

  const handleDemo = async () => {
    await loadDemo();
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Hero - Sundose inspired: large serif heading, cream bg, elegant feel */}
      <div className="relative overflow-hidden bg-cream-100">
        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-2">
              <Brain className="w-7 h-7 text-primary-500" />
              <span className="text-xl font-semibold text-gray-900">MindCare AI</span>
            </div>
            <div className="flex items-center gap-6">
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Sign in
              </button>
              <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-900 flex items-center gap-1 hover:gap-2 transition-all">
                Get started <ArrowRight size={16} />
              </button>
            </div>
          </nav>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-gray-500 mb-6">
                {t('whyItMatters') || 'MEDICATION CARE, SIMPLIFIED'}
              </p>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1] mb-8">
                Every dose,<br />
                on time.<br />
                <span className="italic text-[#2d6a4f]">Every mind,</span><br />
                <span className="italic text-[#2d6a4f]">engaged.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-md mb-10 leading-relaxed">
                MindCare AI is a gentle daily companion for older adults — medication reminders, cognitive activities, and caregiver support, all behind a simple interface.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={handleDemo} className="btn-elderly bg-gray-900 text-white hover:bg-gray-800 text-lg px-8 py-4">
                  Create my profile <ArrowRight size={20} />
                </button>
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors underline underline-offset-4 decoration-cream-400 hover:decoration-gray-900">
                  Sign in to existing account
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white rounded-3xl shadow-2xl overflow-hidden p-6">
                <div className="bg-cream-100 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-[#2d6a4f] rounded-full flex items-center justify-center">
                      <Pill className="text-white" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">8:00 AM — Metformin 500mg</p>
                      <p className="text-sm text-[#2d6a4f] font-medium">Marked as taken ✓</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                      <Droplets className="text-amber-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Hydration: 3 / 6 glasses</p>
                      <p className="text-sm text-gray-500">Keep going!</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Brain className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Brain Activity: Completed</p>
                      <p className="text-sm text-gray-500">Score: 85%</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-lg p-4 flex items-center gap-3 border border-cream-200">
                <div className="w-10 h-10 bg-[#dcfce7] rounded-full flex items-center justify-center">
                  <Shield className="text-[#2d6a4f]" size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-900">Medication adherence</p>
                  <p className="text-lg font-bold text-[#2d6a4f]">94%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Why It Matters */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{t('whyItMatters')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              As populations age, elderly individuals face increasing challenges with memory, medication management, and daily routines — especially in remote regions with limited healthcare access.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🧠', title: 'Cognitive Decline', desc: 'Memory loss and reduced cognitive function affect daily life for millions of elderly individuals' },
              { icon: '💊', title: 'Medication Management', desc: 'Complex medication schedules lead to missed doses and health complications' },
              { icon: '👨‍👩‍👦', title: 'Caregiver Burden', desc: 'Family caregivers struggle to provide 24/7 monitoring and support remotely' },
            ].map((item, i) => (
              <div key={i} className="text-center p-8">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-serif font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{t('completeCare')}</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Pill, title: t('featureMedication'), desc: 'Smart medication scheduling, reminders, and adherence tracking', color: 'bg-[#f0fdf4] text-[#2d6a4f]' },
              { icon: Brain, title: t('featureCognitive'), desc: 'AI-adaptive brain games for memory, pattern recognition, and daily recall', color: 'bg-purple-50 text-purple-600' },
              { icon: Droplets, title: t('featureHydration'), desc: 'Simple daily hydration tracking with configurable goals', color: 'bg-blue-50 text-blue-600' },
              { icon: Calendar, title: t('featureAppointments'), desc: 'Appointment management with automatic reminders', color: 'bg-amber-50 text-amber-600' },
              { icon: Users, title: t('featureCaregiver'), desc: 'Real-time monitoring dashboard for family and caregivers', color: 'bg-green-50 text-green-600' },
              { icon: Mic, title: t('featureVoice'), desc: 'Voice-powered assistant for hands-free interaction', color: 'bg-rose-50 text-rose-600' },
            ].map(({ icon: Icon, title, desc, color }, i) => (
              <div key={i} className="card-interactive p-6 bg-white">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accessibility */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">{t('builtForAccessibility')}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('builtForAccessibilityText')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Heart, title: t('elderlyFriendlyUI'), desc: 'Large buttons, clear text, simple navigation' },
              { icon: Globe, title: t('featureMultilingual'), desc: 'English, Hindi, Assamese, Bengali' },
              { icon: Mic, title: t('voiceAssistanceFeature'), desc: 'Voice queries and spoken responses' },
              { icon: Wifi, title: t('lowConnectivity'), desc: 'Works offline, syncs when connected' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="text-center p-6">
                <div className="w-16 h-16 bg-cream-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="text-[#2d6a4f]" size={32} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* NER Focus */}
      <section className="py-16 md:py-24 bg-cream-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-cream-200">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">{t('builtForNER')}</h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {t('builtForNERText')}
                </p>
                <div className="flex flex-wrap gap-3">
                  {['Assamese', 'Bengali', 'Hindi', 'English'].map((lang) => (
                    <span key={lang} className="badge bg-cream-100 text-gray-700 border border-cream-300">{lang}</span>
                  ))}
                </div>
              </div>
              <div className="text-6xl md:text-8xl">🏔️</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-gray-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Ready to Experience MindCare AI?</h2>
          <p className="text-gray-400 text-lg mb-8">Try the demo with pre-loaded sample data, or sign in to explore the full platform.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button onClick={handleDemo} className="btn-elderly bg-white text-gray-900 hover:bg-cream-100 text-lg px-8 py-4 shadow-xl">
              {t('loadDemo')} 🚀
            </button>
            <button onClick={() => navigate('/login')} className="btn-elderly bg-transparent text-white border-2 border-white/30 text-lg px-8 py-4">
              {t('login')} →
            </button>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <footer className="bg-cream-200 text-gray-600 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p className="mb-3 text-gray-900 font-medium">© 2026 MindCare AI — SIH26003 Prototype</p>
          <p className="text-gray-500 max-w-2xl mx-auto">{t('disclaimer')}</p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-400">
            <Shield size={14} className="inline" />
            <span>North Eastern Region, India</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
