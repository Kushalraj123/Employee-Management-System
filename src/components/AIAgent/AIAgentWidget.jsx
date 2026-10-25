import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Maximize2,
  Minimize2,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowRight,
  ShieldAlert,
  Users,
  DollarSign,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

const PERSONAS = [
  { id: 'omni', name: 'NEXUS Prime', title: 'HR Operating Intelligence', color: 'from-indigo-500 to-purple-600', icon: Bot },
  { id: 'talent', name: 'Aria Talent', title: 'Talent & Goals Coach', color: 'from-emerald-500 to-teal-600', icon: Users },
  { id: 'policy', name: 'Lexis Compliance', title: 'HR Policy & Legal', color: 'from-amber-500 to-orange-600', icon: ShieldAlert },
  { id: 'payroll', name: 'Cipher Comp', title: 'Compensation Analyst', color: 'from-cyan-500 to-blue-600', icon: DollarSign },
];

export default function AIAgentWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activePersona, setActivePersona] = useState('omni');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'agent',
      text: `### 🤖 NEXUS AI Copilot Online\n\nI am connected to your enterprise HRMS database. I can check attendance, process leave approvals, look up employee profiles, draft announcements, and analyze compensation.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tools: ['databaseConnect'],
      suggestedPrompts: ['Show pending leave requests', 'Today\'s attendance rate', 'Who are our top performers?', 'What is our leave policy?']
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [showToolsIndex, setShowToolsIndex] = useState(null);

  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Web Speech API: Text-to-Speech
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_\[\]()]/g, '').slice(0, 240);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API: Speech-to-Text
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  // Send message
  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || isLoading) return;

    setInputMessage('');

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await api.chatWithAI({
        prompt,
        persona: activePersona,
        history: messages.slice(-4).map(m => ({ sender: m.sender, text: m.text })),
      });

      const agentMsg = {
        id: `agt_${Date.now()}`,
        sender: 'agent',
        text: res.markdown || 'Action processed.',
        actionCard: res.actionCard,
        tools: res.toolsExecuted || [],
        suggestedPrompts: res.suggestedPrompts || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, agentMsg]);
      speakText(agentMsg.text);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'agent',
          text: `⚠️ **Error communicating with AI Engine:** ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute interactive card action (Approve/Reject Leave, etc.)
  const handleCardAction = async (actionType, payload) => {
    try {
      const res = await api.executeAIAction({ actionType, payload });
      showSuccess(res.result?.message || 'Action executed successfully!');
      // Append confirmation to chat
      const confirmMsg = {
        id: `act_${Date.now()}`,
        sender: 'agent',
        text: `✅ **Action Confirmed:** ${res.result?.message || 'Operation completed successfully.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Action execution failed');
    }
  };

  const currentPersona = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-3.5 rounded-2xl shadow-2xl flex items-center justify-center transition-all duration-300 ${
            isOpen
              ? 'bg-slate-800 text-slate-300 border border-slate-700'
              : 'bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-indigo-500/30'
          }`}
          title="Toggle NEXUS AI Agent"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-purple-500 border-2 border-slate-950 items-center justify-center text-[9px] font-bold text-white">
                  ✦
                </span>
              </span>
            </>
          )}
        </motion.button>
      </div>

      {/* Main Floating Copilot Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed z-50 rounded-2xl border border-white/10 dark:bg-slate-950/95 bg-white/95 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
              isExpanded
                ? 'inset-4 sm:inset-10'
                : 'bottom-20 right-4 sm:right-6 w-[94vw] sm:w-[440px] h-[580px] max-h-[85vh]'
            }`}
          >
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 bg-slate-900/60 dark:bg-slate-900/90 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${currentPersona.color} text-white shadow-md`}>
                  <currentPersona.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                      {currentPersona.name}
                      <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono">
                        AI Agent
                      </span>
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400">{currentPersona.title}</p>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    speechEnabled ? 'text-indigo-400 bg-indigo-500/10' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={speechEnabled ? 'Speech Output Enabled' : 'Enable Speech Output'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                  title={isExpanded ? 'Restore Size' : 'Expand Window'}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                <Link
                  to="/ai-copilot"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 transition-colors"
                  title="Open Dedicated AI Studio"
                >
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Persona Switcher Bar */}
            <div className="px-3 py-2 border-b border-white/5 bg-slate-950/40 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {PERSONAS.map(p => {
                const isSelected = activePersona === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] whitespace-nowrap transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 font-medium'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{p.name.split(' ')[0]}</span>
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              {messages.map((m, index) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m.id || index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] text-slate-500 font-medium">
                        {isUser ? (user?.name || 'You') : currentPersona.name}
                      </span>
                      <span className="text-[10px] text-slate-600">&bull; {m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[90%] rounded-2xl p-3.5 shadow-sm text-slate-200 ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                          : 'bg-slate-900/80 border border-white/10 rounded-tl-sm'
                      }`}
                    >
                      {/* Markdown rendered simplified */}
                      <div className="prose prose-invert prose-xs max-w-none space-y-2 leading-relaxed">
                        {m.text.split('\n\n').map((para, pIdx) => {
                          if (para.startsWith('### ')) {
                            return <h4 key={pIdx} className="font-bold text-sm text-indigo-300 mt-1 mb-1">{para.replace('### ', '')}</h4>;
                          }
                          if (para.startsWith('#### ')) {
                            return <h5 key={pIdx} className="font-semibold text-xs text-slate-300 mt-1">{para.replace('#### ', '')}</h5>;
                          }
                          if (para.startsWith('- ') || para.startsWith('* ')) {
                            return (
                              <ul key={pIdx} className="list-disc list-inside space-y-0.5 pl-1">
                                {para.split('\n').map((item, iIdx) => (
                                  <li key={iIdx} className="text-[11px] text-slate-300">{item.replace(/^[-*]\s+/, '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={pIdx} className="text-slate-300">{para}</p>;
                        })}
                      </div>

                      {/* Tool Calls Disclosure */}
                      {m.tools && m.tools.length > 0 && (
                        <div className="mt-2.5 pt-2 border-t border-white/10 text-[10px]">
                          <button
                            onClick={() => setShowToolsIndex(showToolsIndex === index ? null : index)}
                            className="flex items-center gap-1 text-slate-400 hover:text-indigo-300 transition-colors"
                          >
                            <Cpu className="w-3 h-3 text-indigo-400" />
                            <span>Executed {m.tools.length} tool(s)</span>
                            {showToolsIndex === index ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>

                          {showToolsIndex === index && (
                            <div className="mt-1.5 p-2 rounded-lg bg-black/40 border border-white/5 font-mono text-[9px] text-slate-400 space-y-1">
                              {m.tools.map((t, tIdx) => (
                                <div key={tIdx} className="flex items-center justify-between">
                                  <span className="text-emerald-400">✓ {t.tool || (typeof t === 'string' ? t : 'queryDatabase')}</span>
                                  <span className="text-slate-500">200 OK</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Action Card: Leave Approval */}
                      {m.actionCard && m.actionCard.type === 'leave_approval' && (
                        <div className="mt-3 p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-indigo-200">
                              {m.actionCard.leave.employeeName}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                              {m.actionCard.leave.leaveType} &bull; {m.actionCard.leave.daysCount}d
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 italic">
                            "{m.actionCard.leave.reason}"
                          </p>
                          <div className="text-[10px] text-slate-400">
                            Dates: <code className="text-slate-300">{m.actionCard.leave.startDate}</code> to <code className="text-slate-300">{m.actionCard.leave.endDate}</code>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => handleCardAction('approve_leave', { leaveId: m.actionCard.leave.id })}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleCardAction('reject_leave', { leaveId: m.actionCard.leave.id })}
                              className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Action Card: Attendance Overview */}
                      {m.actionCard && m.actionCard.type === 'attendance_card' && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <div className="text-xs font-bold text-emerald-400">{m.actionCard.data.present} Present</div>
                            <div className="text-[10px] text-slate-400">{m.actionCard.data.attendanceRate} Attendance</div>
                          </div>
                          <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                            <div className="text-xs font-bold text-amber-400">{m.actionCard.data.late} Late</div>
                            <div className="text-[10px] text-slate-400">Grace past 09:15 AM</div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Action Card: Top Performers */}
                      {m.actionCard && m.actionCard.type === 'employee_spotlight' && (
                        <div className="mt-3 space-y-1.5">
                          {m.actionCard.employees.map(emp => (
                            <Link
                              key={emp.id}
                              to={`/employees/${emp.id}`}
                              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                            >
                              <div className="flex items-center gap-2">
                                <img src={emp.avatar} alt={emp.name} className="w-6 h-6 rounded-full object-cover" />
                                <div>
                                  <div className="text-xs font-medium text-slate-200">{emp.name}</div>
                                  <div className="text-[10px] text-slate-400">{emp.department}</div>
                                </div>
                              </div>
                              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                                {emp.performanceScore}/100
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggested Follow-up Prompts */}
                    {m.suggestedPrompts && m.suggestedPrompts.length > 0 && index === messages.length - 1 && (
                      <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                        {m.suggestedPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-2.5 py-1 rounded-full bg-indigo-950/40 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/60 hover:border-indigo-400 text-[10px] transition-all"
                          >
                            ✦ {prompt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex items-center gap-2 text-slate-400 p-2">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-[11px] text-slate-400">NEXUS AI reasoning & checking DB...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 border-t border-white/10 bg-slate-900/70">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Direct ${currentPersona.name}... (e.g. "Show pending leaves")`}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-3.5 pr-9 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md transition-colors ${
                      isListening ? 'text-rose-400 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={isListening ? 'Listening...' : 'Voice input'}
                  >
                    {isListening ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-40 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-md shadow-indigo-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>Autonomous Enterprise Copilot</span>
                <Link to="/ai-copilot" onClick={() => setIsOpen(false)} className="text-indigo-400 hover:underline">
                  Open Studio &rarr;
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
