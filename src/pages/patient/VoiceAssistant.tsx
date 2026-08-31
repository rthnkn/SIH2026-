import { useState, useEffect, useRef } from 'react';
import { useI18n } from '../../i18n';
import { useAuthStore } from '../../store/auth';
import { db } from '../../data/db';
import type { Medication, Appointment, DailyRoutine } from '../../types';
import { Mic, MicOff, Send, Volume2, Brain } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export default function VoiceAssistantPage() {
  const { t } = useI18n();
  const { currentUser } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initial greeting
    addMessage('assistant', t('assistantGreeting'));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role: 'user' | 'assistant', text: string) => {
    setMessages(prev => [...prev, {
      id: `msg-${Date.now()}-${Math.random()}`,
      role, text,
      timestamp: new Date().toISOString(),
    }]);
  };

  const processQuery = async (query: string) => {
    if (!currentUser) return;
    const q = query.toLowerCase();
    const today = new Date().toISOString().split('T')[0];

    // Load data
    const [meds, logs, apts, routines] = await Promise.all([
      db.medications.where('patientId').equals(currentUser.id).and(m => m.active).toArray(),
      db.medicationLogs.where('patientId').equals(currentUser.id).and(l => l.scheduledTime.startsWith(today)).toArray(),
      db.appointments.where('patientId').equals(currentUser.id).toArray(),
      db.dailyRoutines.where('patientId').equals(currentUser.id).toArray(),
    ]);

    let response = '';

    if (q.includes('medicine') || q.includes('medication') || q.includes('pill') || q.includes('drug')) {
      if (q.includes('next') || q.includes('upcoming')) {
        const pending = logs.filter(l => l.status === 'pending').sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
        if (pending.length > 0) {
          const nextMed = meds.find(m => m.id === pending[0].medicationId);
          const time = pending[0].scheduledTime.split('T')[1]?.substring(0, 5);
          response = `Your next medicine is ${nextMed?.name || 'unknown'} at ${time}.`;
        } else {
          response = 'You have no pending medicines for today. Great job!';
        }
      } else if (q.includes('today') || q.includes('have')) {
        const taken = logs.filter(l => l.status === 'taken').length;
        const total = logs.length;
        const medList = meds.map(m => `${m.name} (${m.dosage})`).join(', ');
        response = `Today you have ${total} medicines scheduled. You've taken ${taken} so far. Your medicines are: ${medList}.`;
      } else {
        const medList = meds.map(m => `${m.name} ${m.dosage} at ${m.times.join(' and ')}`).join('. ');
        response = `Your medications: ${medList}.`;
      }
    } else if (q.includes('appointment') || q.includes('doctor')) {
      const upcoming = apts.filter(a => a.date >= today).sort((a, b) => a.date.localeCompare(b.date));
      if (upcoming.length > 0) {
        const next = upcoming[0];
        response = `Your next appointment is ${next.title} with ${next.doctor || 'a doctor'} at ${next.location || 'the clinic'} on ${next.date} at ${next.time}.`;
      } else {
        response = 'You have no upcoming appointments.';
      }
    } else if (q.includes('routine') || q.includes('schedule') || q.includes('do') || q.includes('now')) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const nextRoutine = routines
        .filter(r => !r.completed && r.scheduledTime >= currentTime)
        .sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime))[0];
      if (nextRoutine) {
        response = `Your next scheduled activity is "${nextRoutine.name}" at ${nextRoutine.scheduledTime}. ${nextRoutine.icon}`;
      } else {
        const completed = routines.filter(r => r.completed).length;
        response = `You've completed ${completed} of ${routines.length} activities today.`;
      }
    } else if (q.includes('water') || q.includes('hydrate')) {
      const hydLogs = await db.hydrationLogs.where('patientId').equals(currentUser.id).and(h => h.timestamp.startsWith(today)).toArray();
      response = `You've had ${hydLogs.length} glasses of water today. Your goal is 6 glasses.`;
    } else if (q.includes('how') && (q.includes('doing') || q.includes('progress') || q.includes('well'))) {
      const sessions = await db.cognitiveSessions.where('patientId').equals(currentUser.id).toArray();
      const recent = sessions.slice(-5);
      const avgScore = recent.length > 0 ? Math.round(recent.reduce((a, b) => a + b.score, 0) / recent.length) : 0;
      response = `Based on your recent activities, your average cognitive activity score is ${avgScore} out of 100. ${avgScore >= 70 ? 'You are doing well! Keep it up!' : 'Keep practicing, you are improving!'}`;
    } else if (q.includes('hello') || q.includes('hi') || q.includes('hey') || q.includes('namaste')) {
      response = `Hello ${currentUser.name?.split(' ')[0] || ''}! How can I help you today? You can ask about your medicines, appointments, daily routine, or water intake.`;
    } else {
      response = `I can help you with:\n\n💊 Your medicines — ask "What medicines do I have today?"\n📅 Your appointments — ask "When is my next appointment?"\n📋 Your routine — ask "What do I need to do now?"\n💧 Your hydration — ask "How much water have I had?"\n🧠 Your progress — ask "How am I doing?"\n\nPlease try asking one of these questions!`;
    }

    addMessage('assistant', response);
    speakText(response);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    addMessage('user', inputText);
    processQuery(inputText);
    setInputText('');
  };

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('assistant', 'Speech recognition is not supported in your browser. Please type your question.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      addMessage('user', transcript);
      processQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
      addMessage('assistant', 'Could not understand. Please try again or type your question.');
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="p-4 text-center border-b border-gray-100 bg-white/80 backdrop-blur-sm">
        <h1 className="text-lg font-bold text-gray-800 flex items-center justify-center gap-2">
          <Brain size={20} className="text-primary-600" />
          {t('askAssistant')}
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-elderly-base leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary-600 text-white rounded-br-md'
                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
            }`}>
              <p className="whitespace-pre-line">{msg.text}</p>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => speakText(msg.text)}
                  className="mt-2 text-xs text-primary-600 hover:text-primary-700 flex items-center gap-1"
                >
                  <Volume2 size={14} /> {t('speakResponse')}
                </button>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-3">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 transition-all ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-300'
                : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
            }`}
          >
            {isListening ? <MicOff size={24} /> : <Mic size={24} />}
          </button>
          <input
            type="text"
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={t('typeQuestion')}
            className="input-elderly flex-1"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center shrink-0 hover:bg-primary-700 disabled:bg-gray-200 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        {isListening && (
          <p className="text-center text-sm text-red-500 mt-2 animate-pulse">{t('listening')}</p>
        )}
      </div>
    </div>
  );
}
