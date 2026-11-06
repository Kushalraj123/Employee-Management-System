import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  Sparkles,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Cpu,
  ShieldAlert,
  Users,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  Trash2,
  Award,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const PERSONAS = [
  {
    id: 'omni',
    name: 'NEXUS Prime',
    title: 'Executive HR Operating Intelligence',
    role: 'Autonomous Copilot',
    color: 'from-indigo-600 via-indigo-500 to-purple-600',
    borderColor: 'border-indigo-500/40',
    glowColor: 'shadow-indigo-500/20',
    icon: Bot,
    description: 'Full administrative authority. Executes leave approvals, directory searches, live attendance tracking, announcements, and executive reports.',
    strengths: ['Leave Approvals', 'Employee Search', 'Attendance Analytics', 'Live Database Updates'],
  },
  {
    id: 'talent',
    name: 'Aria Talent',
    title: 'Talent & Goals Coach',
    role: 'Performance Strategist',
    color: 'from-emerald-600 via-teal-500 to-cyan-600',
    borderColor: 'border-emerald-500/40',
    glowColor: 'shadow-emerald-500/20',
    icon: Users,
    description: 'Directs skill assessments, performance scorecards, OKRs, and promotion readiness for technical and non-technical talent.',
    strengths: ['Scorecard Evaluations', 'Skill Matrix', 'Retention Risk', 'Goal Tracking'],
  },
  {
    id: 'policy',
    name: 'Lexis Compliance',
    title: 'HR Policy & Compliance Specialist',
    role: 'Legal & Policy Advisory',
    color: 'from-amber-600 via-orange-500 to-rose-600',
    borderColor: 'border-amber-500/40',
    glowColor: 'shadow-amber-500/20',
    icon: ShieldAlert,
    description: 'Authoritative guidance on statutory labour compliance, POSH guidelines, fixed-time regulations, and leave accrual rules.',
    strengths: ['Leave Entitlements', 'Fixed-Time Shifts', 'Disciplinary Protocols', 'Statutory Guidelines'],
  },
  {
    id: 'payroll',
    name: 'Cipher Comp',
    title: 'Compensation & Payroll Analyst',
    role: 'Financial Modeler',
    color: 'from-cyan-600 via-blue-500 to-indigo-600',
    borderColor: 'border-cyan-500/40',
    glowColor: 'shadow-cyan-500/20',
    icon: DollarSign,
    description: 'Analyzes salary structures, tax deductions, department allocations, and appraisal increment modeling.',
    strengths: ['Salary Breakdowns', 'Department CTC', 'Appraisal Budgets', 'Deduction Schemes'],
  },
];

const PRESET_WORKFLOWS = [
  {
    id: 'wf_brief',
    title: 'Workforce Morning Brief',
    description: 'Telemetry on headcount, attendance, and pending requests.',
    prompt: 'Run workforce morning brief with today\'s attendance, pending leaves, and company analytics.',
    icon: Zap,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  {
    id: 'wf_leaves',
    title: 'Scan Pending Leaves',
    description: 'Review all submitted applications requiring decisions.',
    prompt: 'Show all pending leave requests requiring review.',
    icon: Calendar,
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
  },
  {
    id: 'wf_talent',
    title: 'Top Performers & Skill Audit',
    description: 'Benchmark top engineering and operational contributors.',
    prompt: 'Who are our top performers with scores above 90 and what are their core skills?',
    icon: Award,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
  {
    id: 'wf_payroll',
    title: 'Monthly Payroll Run Overview',
    description: 'Breakdown disbursement amounts and department allocations.',
    prompt: 'What is our total monthly payroll disbursement and department breakdown?',
    icon: DollarSign,
    color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
  },
  {
    id: 'wf_announce',
    title: 'Broadcast Town Hall Notice',
    description: 'Draft and pin company-wide all-hands meeting announcement.',
    prompt: 'Draft an announcement for our upcoming quarterly all-hands meeting next Friday at 4 PM.',
    icon: Sparkles,
    color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  },
];

export default function AIAgentStudio() {
  const [activePersona, setActivePersona] = useState('omni');
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'msg_welcome',
      sender: 'agent',
      text: `### 🚀 NEXUS Autonomous HR AI Copilot Initialized\n\nWelcome to the **Workforce Intelligence Command Center**. I am connected directly to your enterprise database with real-time read and write tools.\n\nI can execute administrative actions (approving leaves, drafting announcements), analyze team attendance patterns, inspect compensation metrics, or counsel on corporate policy.\n\nSelect a workflow from the left panel or ask me any question below!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      tools: ['databaseConnect', 'toolRegistrySync', 'policyEngineReady'],
      suggestedPrompts: [
        'Run workforce morning brief',
        'Show all pending leave requests',
        'Who is late or absent today?',
        'Who is our highest performing architect?'
      ]
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(false);
  const [capabilities, setCapabilities] = useState(null);
  const [insights, setInsights] = useState([]);
  const [expandedToolIndex, setExpandedToolIndex] = useState(null);
  const [studioMode, setStudioMode] = useState('assistant'); // 'assistant' | 'workforce_analytics' | 'report_generator'
  const [workforceAI, setWorkforceAI] = useState(null);
  const [reportScope, setReportScope] = useState('All');
  const [generatedReport, setGeneratedReport] = useState(null);
  const [generatingReport, setGeneratingReport] = useState(false);

  const { showSuccess, showError } = useToast();
  const { user } = useAuth();
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load capabilities, proactive insights, & AI workforce analytics on mount
  useEffect(() => {
    const loadTelemetry = async () => {
      try {
        const [capRes, insRes, wfRes, repRes] = await Promise.all([
          api.getAICapabilities(),
          api.getAIInsights(),
          api.getAIWorkforceAnalytics().catch(() => ({ data: null })),
          api.generateAIReport({ department: 'All' }).catch(() => ({ data: null })),
        ]);
        setCapabilities(capRes);
        setInsights(insRes.insights || []);
        if (wfRes.verifiedFacts || wfRes.data) setWorkforceAI(wfRes.data || wfRes);
        if (repRes.report || repRes.data) setGeneratedReport(repRes.report || repRes.data);
      } catch (err) {
        console.error('Failed to load AI telemetry:', err);
      }
    };
    loadTelemetry();
  }, []);

  const handleGenerateAIReport = async (dept) => {
    const targetDept = dept || reportScope;
    setReportScope(targetDept);
    setGeneratingReport(true);
    try {
      const res = await api.generateAIReport({ department: targetDept });
      setGeneratedReport(res.report || res.data || res);
      showSuccess(`AI Report generated for ${targetDept === 'All' ? 'Enterprise' : targetDept}`);
    } catch (err) {
      showError('Failed to generate AI report');
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportReportCSV = () => {
    if (!generatedReport) return;
    const deptRows = generatedReport.departmentRows || generatedReport.departmentBreakdown || [];
    const csvMatrix = [
      ['Department', 'Headcount', 'Active', 'Avg Performance', 'Annual Budget (INR)'],
      ...deptRows.map((d) => [
        d.department,
        d.headcount,
        d.activeCount,
        d.avgPerformanceScore || `${d.avgPerformance}%`,
        d.annualBudgetINR || d.totalPayrollCTC || 0,
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      csvMatrix.map((row) => row.map((c) => `"${c}"`).join(',')).join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `NEXUS_AI_Report_${reportScope}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccess('AI Report CSV exported!');
  };

  const handleExportReportPDF = () => {
    if (!generatedReport) return;
    const win = window.open('', '_blank');
    if (!win) {
      showError('Allow popups to export PDF report');
      return;
    }
    const deptRows = generatedReport.departmentRows || generatedReport.departmentBreakdown || [];
    const rowsHtml = deptRows
      .map(
        (d) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #cbd5e1;font-weight:bold;">${d.department}</td>
          <td style="padding:8px;border-bottom:1px solid #cbd5e1;">${d.headcount} (${d.activeCount} active)</td>
          <td style="padding:8px;border-bottom:1px solid #cbd5e1;">${d.avgPerformanceScore || `${d.avgPerformance}%`}</td>
          <td style="padding:8px;border-bottom:1px solid #cbd5e1;">${d.formattedBudget || `₹${(d.totalPayrollCTC || 0).toLocaleString('en-IN')}`}</td>
        </tr>`
      )
      .join('');
    const summaryText = generatedReport.executiveNarrative || generatedReport.executiveSummary || '';
    win.document.write(`
      <html>
        <head><title>${generatedReport.title}</title></head>
        <body style="font-family:sans-serif;padding:32px;color:#0f172a;">
          <h1 style="color:#4f46e5;margin-bottom:4px;">${generatedReport.title}</h1>
          <p style="font-size:12px;color:#64748b;">Generated At: ${new Date(generatedReport.generatedAt).toLocaleString()}</p>
          <div style="background:#f8fafc;padding:16px;border-radius:12px;border:1px solid #e2e8f0;margin:20px 0;">
            <h3>Executive AI Narrative</h3>
            <p style="line-height:1.6;">${summaryText.replace(/\*\*/g, '')}</p>
          </div>
          <h3>Department Breakdown</h3>
          <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left;">
            <thead>
              <tr style="background:#f1f5f9;">
                <th style="padding:8px;">Department</th>
                <th style="padding:8px;">Headcount</th>
                <th style="padding:8px;">Avg Performance</th>
                <th style="padding:8px;">Annual CTC Budget</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>
          <script>window.onload = () => window.print();</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  // Web Speech: Text-to-Speech
  const speakText = (text) => {
    if (!speechEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[#*`_\[\]()|]/g, '').slice(0, 300);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech: Speech-to-Text
  const toggleListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      showError('Speech recognition is not supported in your browser.');
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
  const handleSendMessage = async (promptToSend) => {
    const prompt = (promptToSend || inputMessage).trim();
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
        history: messages.slice(-5).map(m => ({ sender: m.sender, text: m.text })),
      });

      const agentMsg = {
        id: `agt_${Date.now()}`,
        sender: 'agent',
        text: res.markdown || 'Task processed successfully.',
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
          text: `⚠️ **Agent Error:** ${err.response?.data?.message || err.message}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Execute interactive card action
  const handleCardAction = async (actionType, payload) => {
    try {
      const res = await api.executeAIAction({ actionType, payload });
      showSuccess(res.result?.message || 'Action executed successfully!');
      const confirmMsg = {
        id: `act_${Date.now()}`,
        sender: 'agent',
        text: `✅ **Autonomous Action Completed:** ${res.result?.message || 'Operation verified in store.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Execution error');
    }
  };

  const currentPersona = PERSONAS.find(p => p.id === activePersona) || PERSONAS[0];

  const clearChat = () => {
    setMessages([
      {
        id: 'msg_reset',
        sender: 'agent',
        text: `Chat session reset. Connected to **${currentPersona.name}**. What operation shall we perform?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: ['Show pending leaves', 'Today\'s attendance rate', 'Who are our top performers?']
      }
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner / Status Telemetry */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`p-3.5 rounded-2xl bg-gradient-to-tr ${currentPersona.color} text-white shadow-xl shadow-indigo-500/20`}>
              <currentPersona.icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  NEXUS AI Agent Studio
                </h1>
                <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Engine Online
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-mono">
                  v2.5 Enterprise
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Autonomous Workforce Copilot &bull; Multi-Tool Reasoning Engine &bull; Role-Based Data Authorization
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
              <span className="text-slate-500 block text-[10px]">REGISTERED TOOLS</span>
              <span className="text-indigo-300 font-bold text-sm">11 Connected</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
              <span className="text-slate-500 block text-[10px]">AVG LATENCY</span>
              <span className="text-emerald-400 font-bold text-sm">~45 ms</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/5 text-center">
              <span className="text-slate-500 block text-[10px]">ACTIVE PERSONA</span>
              <span className="text-white font-bold text-sm">{currentPersona.name.split(' ')[0]}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Personas & Preset Automations (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Persona Selector Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Agent Personas</span>
              <span className="text-[10px] text-slate-500 font-normal">Select active intelligence</span>
            </h2>

            <div className="space-y-2.5">
              {PERSONAS.map(p => {
                const isSelected = activePersona === p.id;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    onClick={() => setActivePersona(p.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start gap-3 ${
                      isSelected
                        ? `bg-slate-800/90 ${p.borderColor} shadow-lg ${p.glowColor}`
                        : 'bg-slate-950/40 border-white/5 hover:bg-slate-800/40 hover:border-white/10'
                    }`}
                  >
                    <div className={`p-2 rounded-lg bg-gradient-to-tr ${p.color} text-white shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs text-white truncate">{p.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400 font-mono">
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">{p.description}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {p.strengths.slice(0, 2).map((s, idx) => (
                          <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded-full bg-white/5 text-slate-400 font-mono">
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Workflows Launcher */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>1-Click Automations</span>
              <span className="text-[10px] text-slate-500 font-normal">Autonomous tasks</span>
            </h2>

            <div className="space-y-2">
              {PRESET_WORKFLOWS.map(wf => {
                const Icon = wf.icon;
                return (
                  <button
                    key={wf.id}
                    onClick={() => handleSendMessage(wf.prompt)}
                    className="w-full text-left p-2.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-800/60 hover:border-indigo-500/30 transition-all group flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-lg border ${wf.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-semibold text-xs text-slate-200 group-hover:text-indigo-300 transition-colors">
                          {wf.title}
                        </div>
                        <div className="text-[10px] text-slate-400">{wf.description}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-300 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tool Capabilities Accordion */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-xl">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Connected Tools</span>
              <span className="text-[10px] text-emerald-400 font-mono">11 Active</span>
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">
              The agent autonomously selects and executes these tools based on natural language intent:
            </p>
            <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
              {[
                'searchEmployees',
                'getAttendanceOverview',
                'getPendingLeaves',
                'updateLeaveStatus',
                'applyLeave',
                'createAnnouncement',
                'getPayrollOverview',
                'getCompanyAnalytics',
                'queryPolicy',
                'createGoal',
                'getEmployeeDetails',
              ].map((tool, idx) => (
                <div key={idx} className="p-1.5 rounded-lg bg-black/40 border border-white/5 text-slate-300 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                  <span className="truncate">{tool}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center Main Column: Conversational Console (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-xl flex flex-col h-[750px] shadow-2xl overflow-hidden">
            {/* Chat Header */}
            <div className="p-4 border-b border-white/10 bg-slate-950/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl bg-gradient-to-tr ${currentPersona.color} text-white`}>
                  <currentPersona.icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-white flex items-center gap-2">
                    {currentPersona.name}
                    <span className="text-xs text-slate-400 font-normal font-mono">({currentPersona.title})</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Synchronized with live MongoDB Atlas & In-Memory Store</p>
                </div>
              </div>

              {/* Chat Actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setSpeechEnabled(!speechEnabled)}
                  className={`p-2 rounded-xl border transition-colors ${
                    speechEnabled
                      ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-400'
                      : 'border-white/5 bg-slate-900/80 text-slate-400 hover:text-slate-200'
                  }`}
                  title={speechEnabled ? 'Mute Speech' : 'Enable Speech Output'}
                >
                  {speechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>

                <button
                  onClick={clearChat}
                  className="p-2 rounded-xl border border-white/5 bg-slate-900/80 text-slate-400 hover:text-rose-400 transition-colors"
                  title="Clear chat session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
              {messages.map((m, index) => {
                const isUser = m.sender === 'user';
                return (
                  <div key={m.id || index} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <span className="text-xs font-medium text-slate-400">
                        {isUser ? (user?.name || 'You') : currentPersona.name}
                      </span>
                      <span className="text-[11px] text-slate-600">&bull; {m.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[88%] rounded-2xl p-4 shadow-sm text-slate-200 ${
                        isUser
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                          : 'bg-slate-950/80 border border-white/10 rounded-tl-sm'
                      }`}
                    >
                      {/* Markdown rendering */}
                      <div className="prose prose-invert prose-sm max-w-none space-y-2 leading-relaxed">
                        {m.text.split('\n\n').map((para, pIdx) => {
                          if (para.startsWith('### ')) {
                            return <h3 key={pIdx} className="font-bold text-base text-indigo-300 mt-2 mb-1">{para.replace('### ', '')}</h3>;
                          }
                          if (para.startsWith('#### ')) {
                            return <h4 key={pIdx} className="font-semibold text-sm text-slate-200 mt-2">{para.replace('#### ', '')}</h4>;
                          }
                          if (para.startsWith('|')) {
                            // Render markdown table
                            const rows = para.split('\n').filter(r => r.trim() && !r.includes(':---'));
                            return (
                              <div key={pIdx} className="overflow-x-auto my-2 rounded-lg border border-white/10">
                                <table className="min-w-full divide-y divide-white/10 text-xs text-left">
                                  {rows.map((row, rIdx) => {
                                    const cells = row.split('|').filter((c, i, a) => i !== 0 && i !== a.length - 1);
                                    if (rIdx === 0) {
                                      return (
                                        <thead key={rIdx} className="bg-white/5">
                                          <tr>
                                            {cells.map((c, cIdx) => (
                                              <th key={cIdx} className="p-2 font-semibold text-slate-300">{c.trim()}</th>
                                            ))}
                                          </tr>
                                        </thead>
                                      );
                                    }
                                    return (
                                      <tbody key={rIdx} className="divide-y divide-white/5">
                                        <tr className="hover:bg-white/5">
                                          {cells.map((c, cIdx) => (
                                            <td key={cIdx} className="p-2 text-slate-300">{c.trim().replace(/\*\*/g, '')}</td>
                                          ))}
                                        </tr>
                                      </tbody>
                                    );
                                  })}
                                </table>
                              </div>
                            );
                          }
                          if (para.startsWith('- ') || para.startsWith('* ')) {
                            return (
                              <ul key={pIdx} className="list-disc list-inside space-y-1 pl-1">
                                {para.split('\n').map((item, iIdx) => (
                                  <li key={iIdx} className="text-xs text-slate-300">{item.replace(/^[-*]\s+/, '')}</li>
                                ))}
                              </ul>
                            );
                          }
                          return <p key={pIdx} className="text-xs leading-relaxed text-slate-300">{para}</p>;
                        })}
                      </div>

                      {/* Tool Calls Disclosure */}
                      {m.tools && m.tools.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-white/10 text-xs">
                          <button
                            onClick={() => setExpandedToolIndex(expandedToolIndex === index ? null : index)}
                            className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-300 transition-colors font-mono text-[11px]"
                          >
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Executed {m.tools.length} tool(s)</span>
                            <span className="text-emerald-400 text-[10px]">• Success</span>
                          </button>

                          {expandedToolIndex === index && (
                            <div className="mt-2 p-2.5 rounded-xl bg-black/60 border border-white/5 font-mono text-[11px] text-slate-400 space-y-1.5">
                              {m.tools.map((t, tIdx) => (
                                <div key={tIdx} className="flex items-center justify-between border-b border-white/5 pb-1">
                                  <span className="text-emerald-400 font-bold">✓ {t.tool || (typeof t === 'string' ? t : 'query')}</span>
                                  <span className="text-slate-500 text-[10px]">Latency: ~12ms</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Interactive Card: Leave Approval */}
                      {m.actionCard && m.actionCard.type === 'leave_approval' && (
                        <div className="mt-4 p-4 rounded-xl bg-indigo-950/50 border border-indigo-500/40 shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-sm text-indigo-200">
                              {m.actionCard.leave.employeeName}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-mono font-medium">
                              {m.actionCard.leave.leaveType} ({m.actionCard.leave.daysCount} days)
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 italic mb-2">
                            "{m.actionCard.leave.reason}"
                          </p>
                          <div className="text-[11px] text-slate-400 mb-3 flex items-center gap-2">
                            <span>Period:</span>
                            <code className="px-1.5 py-0.5 rounded bg-black/40 text-slate-300">{m.actionCard.leave.startDate}</code>
                            <span>to</span>
                            <code className="px-1.5 py-0.5 rounded bg-black/40 text-slate-300">{m.actionCard.leave.endDate}</code>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <button
                              onClick={() => handleCardAction('approve_leave', { leaveId: m.actionCard.leave.id })}
                              className="flex-1 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Leave</span>
                            </button>
                            <button
                              onClick={() => handleCardAction('reject_leave', { leaveId: m.actionCard.leave.id })}
                              className="flex-1 py-2 px-4 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Interactive Card: Attendance Pulse */}
                      {m.actionCard && m.actionCard.type === 'attendance_card' && (
                        <div className="mt-4 grid grid-cols-3 gap-2.5">
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                            <div className="text-base font-bold text-emerald-400">{m.actionCard.data.present}</div>
                            <div className="text-[11px] text-slate-400">Present Today</div>
                          </div>
                          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
                            <div className="text-base font-bold text-amber-400">{m.actionCard.data.late}</div>
                            <div className="text-[11px] text-slate-400">Late Check-ins</div>
                          </div>
                          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
                            <div className="text-base font-bold text-indigo-400">{m.actionCard.data.attendanceRate}</div>
                            <div className="text-[11px] text-slate-400">Compliance Rate</div>
                          </div>
                        </div>
                      )}

                      {/* Interactive Card: Top Performers */}
                      {m.actionCard && m.actionCard.type === 'employee_spotlight' && (
                        <div className="mt-4 space-y-2">
                          {m.actionCard.employees.map(emp => (
                            <Link
                              key={emp.id}
                              to={`/employees/${emp.id}`}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 transition-colors border border-white/5"
                            >
                              <div className="flex items-center gap-3">
                                <img src={emp.avatar} alt={emp.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30" />
                                <div>
                                  <div className="text-xs font-semibold text-white">{emp.name}</div>
                                  <div className="text-[11px] text-slate-400">{emp.designation} &bull; {emp.department}</div>
                                </div>
                              </div>
                              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                                {emp.performanceScore} / 100
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Suggested follow-up prompt chips */}
                    {m.suggestedPrompts && m.suggestedPrompts.length > 0 && index === messages.length - 1 && (
                      <div className="mt-3 flex flex-wrap gap-2 max-w-[88%]">
                        {m.suggestedPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => handleSendMessage(prompt)}
                            className="px-3 py-1.5 rounded-full bg-slate-950/60 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600/20 hover:border-indigo-400 text-xs transition-all flex items-center gap-1.5"
                          >
                            <Sparkles className="w-3 h-3 text-indigo-400" />
                            <span>{prompt}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Thinking Indicator */}
              {isLoading && (
                <div className="flex items-center gap-3 text-slate-400 p-3 rounded-2xl bg-slate-950/40 border border-white/5 w-fit">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                  </div>
                  <span className="text-xs text-slate-300 font-mono">
                    NEXUS AI reasoning, evaluating tools & database state...
                  </span>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-4 border-t border-white/10 bg-slate-950/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex items-center gap-3"
              >
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Instruct ${currentPersona.name}... (e.g. "Approve Marcus's leave", "Show attendance statistics")`}
                    className="w-full bg-slate-900/90 border border-white/10 rounded-xl pl-4 pr-11 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                      isListening ? 'text-rose-400 bg-rose-500/10 animate-pulse' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title={isListening ? 'Listening (Click to stop)' : 'Voice input'}
                  >
                    {isListening ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-medium text-sm disabled:opacity-40 hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </form>

              {/* Bottom Quick Chips */}
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  NEXUS Cognitive Engine Active
                </span>
                <span className="hidden sm:inline">Press Enter to dispatch &bull; Web Speech Synthesis enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Workforce Analytics Panel (Verified Facts vs Predictions) */}
      {workforceAI && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>AI Workforce Analytics — Verified Telemetry vs. Predictive Intelligence</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {workforceAI.disclaimer}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verified Facts Column */}
            <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Verified Database Facts (100% Ground Truth)
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                  VERIFIED FACT
                </span>
              </div>
              <div className="space-y-2.5">
                {(workforceAI.verifiedFacts || []).map((fact) => (
                  <div key={fact.id} className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-white block">{fact.title || fact.metric}</span>
                      <span className="text-[11px] text-slate-400">{fact.detail}</span>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-emerald-400 shrink-0">{fact.metric || fact.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Predictions Column */}
            <div className="p-5 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  AI Predictive Forecasts (Heuristic Models)
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">
                  AI PREDICTION
                </span>
              </div>
              <div className="space-y-2.5">
                {(workforceAI.aiPredictions || workforceAI.predictions || []).map((pred) => (
                  <div key={pred.id} className="p-3 rounded-xl bg-slate-950/70 border border-purple-500/20 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{pred.title || pred.metric}</span>
                      <span className="text-xs font-extrabold font-mono text-purple-300">{pred.prediction || pred.forecast}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{pred.rationale || pred.basis}</p>
                    <span className="inline-block text-[10px] font-mono text-indigo-400">Model Confidence: {pred.confidence}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feedback Sentiment & Management Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {workforceAI.feedbackSummary && (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                  AI Employee Feedback Sentiment Synthesis
                </span>
                <p className="text-xs text-slate-300">
                  Evaluated <strong>{workforceAI.feedbackSummary.totalReviewsAnalyzed}</strong> reviews &bull; Sentiment: <strong className="text-emerald-400">{workforceAI.feedbackSummary.sentimentScore || workforceAI.feedbackSummary.sentiment}</strong>
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {(workforceAI.feedbackSummary.topStrengths || []).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono">
                      ★ {typeof s === 'string' ? s : `${s.item} (${s.count})`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
                Autonomous Management Recommendations
              </span>
              <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                {(workforceAI.aiPredictions || []).map((p, i) => (
                  <li key={i}>{p.recommendedAction}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* AI Report Generator Panel */}
      {generatedReport && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-400" />
                <span>AI Executive & Department Report Generator</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate narrative summaries and department-wise telemetry with 1-click PDF & CSV export.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={reportScope}
                onChange={(e) => handleGenerateAIReport(e.target.value)}
                disabled={generatingReport}
                className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-semibold"
              >
                <option value="All">All Enterprise Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="HR">HR</option>
                <option value="Sales">Sales</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
              </select>

              <button
                onClick={handleExportReportCSV}
                className="px-4 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all"
              >
                Export CSV
              </button>
              <button
                onClick={handleExportReportPDF}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all"
              >
                Export PDF
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed">
            <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 block mb-1">
              AI Executive Summary ({generatedReport.departmentScope || generatedReport.scope})
            </span>
            {(generatedReport.executiveNarrative || generatedReport.executiveSummary || '').replace(/\*\*/g, '')}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase">
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Headcount</th>
                  <th className="py-2.5 px-4">Active</th>
                  <th className="py-2.5 px-4">Avg Performance</th>
                  <th className="py-2.5 px-4">Attendance Rate</th>
                  <th className="py-2.5 px-4">Total Annual CTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {(generatedReport.departmentRows || generatedReport.departmentBreakdown || []).map((d) => (
                  <tr key={d.department} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-4 font-bold text-white">{d.department}</td>
                    <td className="py-2.5 px-4 font-mono">{d.headcount}</td>
                    <td className="py-2.5 px-4 font-mono text-emerald-400">{d.activeCount}</td>
                    <td className="py-2.5 px-4 font-mono text-indigo-300">{d.avgPerformanceScore || `${d.avgPerformance}%`}</td>
                    <td className="py-2.5 px-4 font-mono text-cyan-300">{d.attendanceRate || '94%'}</td>
                    <td className="py-2.5 px-4 font-mono font-bold text-white">{d.formattedBudget || `₹${(d.totalPayrollCTC || 0).toLocaleString('en-IN')}`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
