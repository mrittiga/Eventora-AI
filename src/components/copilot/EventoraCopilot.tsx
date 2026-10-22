import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  Mic,
  MicOff,
  Lightbulb,
  Calendar,
  Wallet,
} from 'lucide-react';
import { useEventContext } from '../../context/EventContext';
import { ChatMessage } from '../../types';
import { sendCopilotMessage } from '../../services/api';
import { useToast } from '../common/Toast';

export const EventoraCopilot: React.FC = () => {
  const {
    activeEvent,
    activeBudgetItems,
    activeTasks,
    activeVendors,
    activeGuests,
    getEventReadiness,
    formatCurrency,
  } = useEventContext();
  const { showToast } = useToast();

  const readiness = getEventReadiness();

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        role: 'assistant',
        content: `Hello! I am **Eventora Copilot**, your dedicated AI planning director.
I am tuned into **${activeEvent?.name || 'your event'}** (${activeEvent?.guestCount || 50} guests, budget of ${formatCurrency(activeEvent?.budget || 100000)}).

Your current Readiness Score is **${readiness.score}%**. How can I help you today? You can ask me to optimize costs, structure timelines, draft vendor emails, or design customized menus.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'How can I save 15% on catering?',
          'What tasks should I complete this week?',
          'What happens if it rains on my event?',
        ],
      },
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    setInput('');

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsLoading(true);

    try {
      const eventContext = {
        name: activeEvent?.name,
        eventType: activeEvent?.eventType,
        date: activeEvent?.date,
        location: activeEvent?.location,
        guestCount: activeEvent?.guestCount,
        budget: activeEvent?.budget,
        currency: activeEvent?.currency,
        readinessScore: readiness.score,
        urgentActions: readiness.urgentActions,
      };

      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const { reply, suggestions } = await sendCopilotMessage(userText, historyPayload, eventContext);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: suggestions,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I've analyzed your question for **${activeEvent?.name}**. Consider focusing on vendor confirmations and locking in the guest headcount to keep your schedule running smoothly.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: ['Suggest budget reallocations', 'Draft vendor inquiry'],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard', 'info');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I am ready to assist with **${activeEvent?.name}**!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          'How can I save 15% on catering?',
          'Create a 3-month preparation timeline',
          'Suggest sustainable decor ideas',
        ],
      },
    ]);
    showToast('Chat history cleared', 'info');
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      showToast('Speech recognition not supported in this browser.', 'info');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        showToast('Listening... Speak your planning question.', 'info');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto glass-panel overflow-hidden border border-violet-500/30">
      {/* Copilot Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-[#080B1A] rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Eventora Copilot</h2>
              <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-semibold border border-violet-500/30">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Context: <span className="text-cyan-300 font-medium">{activeEvent?.name}</span> ·{' '}
              {formatCurrency(activeEvent?.budget || 0)} · {readiness.score}% Ready
            </p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          title="Reset Chat"
          className="p-2 rounded-xl glass-button text-slate-400 hover:text-white transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-violet-600 text-white'
                    : 'bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Content */}
              <div
                className={`relative max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 space-y-2 ${
                  isUser
                    ? 'bg-violet-600/30 border border-violet-500/40 text-slate-100 rounded-tr-none'
                    : 'bg-white/[0.06] border border-white/12 text-slate-200 rounded-tl-none backdrop-blur-xl'
                }`}
              >
                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 pb-1 border-b border-white/5">
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'You' : 'Eventora Copilot'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                <div className="whitespace-pre-line leading-relaxed text-slate-200">
                  {msg.content}
                </div>

                {/* Suggested Action Chips */}
                {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                  <div className="pt-2 border-t border-white/5 space-y-1.5">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Suggested Inquiries:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedActions.map((sug, i) => (
                        <button
                          key={i}
                          onClick={() => handleSend(sug)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-violet-600/30 border border-white/10 text-slate-300 hover:text-white text-[11px] transition-colors text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Copy button */}
                {!isUser && (
                  <button
                    onClick={() => handleCopyMessage(msg.id, msg.content)}
                    aria-label="Copy message"
                    className="absolute top-2 right-2 p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 rounded-tl-none flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-slate-400 ml-2">Copilot is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-3 sm:p-4 border-t border-white/10 bg-white/[0.02] shrink-0 space-y-2">
        {/* Quick prompt hints */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-slate-400">
          <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="shrink-0 font-medium">Try asking:</span>
          {[
            'Suggest low-cost decor for outdoor garden',
            'Draft inquiry letter for catering',
            'Compare 2 theme color palettes',
          ].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white whitespace-nowrap shrink-0 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Ask Copilot anything about budget, vendors, menus, or timing..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full glass-input pr-10 text-xs py-2.5 rounded-xl"
            />
            <button
              type="button"
              onClick={toggleVoiceInput}
              aria-label="Voice input"
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                isRecording ? 'text-rose-400 animate-pulse bg-rose-500/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl glass-button-primary disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
