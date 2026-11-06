import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  UserPlus,
  Sparkles,
  Calendar,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Search,
  Plus,
  FileText,
  Upload,
  ChevronRight,
  ChevronLeft,
  BarChart3,
  Clock,
  Award,
  X,
  Bot,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const KANBAN_STAGES = [
  'Applied',
  'Screening',
  'Interview',
  'Selected',
  'Offer',
  'Hired',
  'Rejected',
];

const STAGE_STYLES = {
  Applied: 'border-slate-600/50 bg-slate-800/40 text-slate-300',
  Screening: 'border-blue-500/40 bg-blue-500/15 text-blue-300',
  Interview: 'border-indigo-500/40 bg-indigo-500/15 text-indigo-300',
  Selected: 'border-purple-500/40 bg-purple-500/15 text-purple-300',
  Offer: 'border-amber-500/40 bg-amber-500/15 text-amber-300',
  Hired: 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300',
  Rejected: 'border-rose-500/40 bg-rose-500/15 text-rose-300',
};

export default function Recruitment() {
  const { isAdmin, isHR, isManager } = useAuth();
  const { showSuccess, showError } = useToast();
  const canManage = isAdmin || isHR || isManager;

  const [activeTab, setActiveTab] = useState('kanban'); // 'kanban' | 'jobs' | 'ai-screener' | 'analytics'
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJobFilter, setSelectedJobFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showJobModal, setShowJobModal] = useState(false);
  const [showCandidateModal, setShowCandidateModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // New Job Form
  const [jobForm, setJobForm] = useState({
    title: '',
    department: 'Engineering',
    location: 'Bengaluru (Hybrid)',
    employmentType: 'Full-Time',
    experienceRequired: '4+ Years',
    salaryRange: '₹22L - ₹32L',
    openingsCount: 2,
    requiredSkills: 'React, TypeScript, Node.js, System Design, AWS',
    description: '',
  });

  // New Candidate Form
  const [candForm, setCandForm] = useState({
    name: '',
    email: '',
    phone: '+91 98201 55412',
    jobId: '',
    experienceYears: 4,
    currentRole: 'Senior Software Engineer',
    skills: 'React, TypeScript, Node.js, Docker',
    resumeFileName: 'Candidate_Resume_2026.pdf',
    resumeText: '',
  });

  // Standalone AI Resume Screener State
  const [screenerJobId, setScreenerJobId] = useState('');
  const [screenerResumeText, setScreenerResumeText] = useState(
    'Experienced Full-Stack & Distributed Systems Engineer with 6 years building scalable microservices using Go, Kubernetes, Node.js, React, TypeScript, Kafka, and AWS. Led migration to multi-region Kubernetes clusters and improved API latency by 42%.'
  );
  const [screenerSkills, setScreenerSkills] = useState('Go, Kubernetes, Node.js, React, TypeScript, Kafka, AWS');
  const [screenerExp, setScreenerExp] = useState(6);
  const [screenerResult, setScreenerResult] = useState(null);
  const [screeningBusy, setScreeningBusy] = useState(false);

  // Interview & Feedback inputs inside Candidate Inspector Modal
  const [interviewForm, setInterviewForm] = useState({
    round: 'Technical Architecture Round',
    scheduledAt: '2026-11-15 11:00 AM',
    interviewer: 'Elena Rostova',
    meetingLink: 'https://meet.nexus.io/ats-interview',
  });
  const [feedbackForm, setFeedbackForm] = useState({
    round: 'Technical Round',
    rating: 4.5,
    recommendation: 'Strong Hire',
    comments: '',
  });

  const loadRecruitmentData = async () => {
    setLoading(true);
    try {
      const [jobsRes, candRes, anaRes] = await Promise.all([
        api.getJobOpenings(),
        api.getCandidates(),
        api.getRecruitmentAnalytics(),
      ]);
      const jList = jobsRes.data || [];
      setJobs(jList);
      setCandidates(candRes.data || []);
      setAnalytics(anaRes.data || null);
      if (jList.length > 0 && !candForm.jobId) {
        setCandForm((prev) => ({ ...prev, jobId: jList[0]._id }));
        setScreenerJobId(jList[0]._id);
      }
    } catch (err) {
      console.error('Recruitment load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruitmentData();
  }, []);

  const handleStageChange = async (candidateId, newStage) => {
    try {
      const res = await api.updateCandidateStage(candidateId, newStage);
      showSuccess(res.message || `Moved candidate to ${newStage}`);
      setCandidates((prev) =>
        prev.map((c) => (c._id === candidateId ? { ...c, stage: newStage } : c))
      );
      if (selectedCandidate && selectedCandidate._id === candidateId) {
        setSelectedCandidate((prev) => ({ ...prev, stage: newStage }));
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update stage');
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...jobForm,
        requiredSkills: jobForm.requiredSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await api.createJobOpening(payload);
      showSuccess(res.message || 'Job opening published!');
      setShowJobModal(false);
      loadRecruitmentData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to create job');
    }
  };

  const handleResumeFileUpload = (e, target = 'candidate') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || '');
      if (target === 'candidate') {
        setCandForm((prev) => ({
          ...prev,
          resumeFileName: file.name,
          resumeText: text.slice(0, 3500) || `Uploaded resume: ${file.name}`,
        }));
      } else {
        setScreenerResumeText(text.slice(0, 3500));
      }
      showSuccess(`Parsed resume file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleCreateCandidate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...candForm,
        skills: candForm.skills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const res = await api.createCandidate(payload);
      showSuccess(res.message || 'Applicant added & AI-screened!');
      setShowCandidateModal(false);
      loadRecruitmentData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to add candidate');
    }
  };

  const handleRunAIScreener = async (e) => {
    e.preventDefault();
    setScreeningBusy(true);
    try {
      const res = await api.screenResumeWithAI({
        jobId: screenerJobId,
        resumeText: screenerResumeText,
        candidateSkills: screenerSkills
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        experienceYears: Number(screenerExp),
      });
      setScreenerResult(res.data);
      showSuccess('AI Resume Screening completed with explainable score!');
    } catch (err) {
      showError('Failed to run AI resume screening');
    } finally {
      setScreeningBusy(false);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;
    try {
      const res = await api.scheduleInterview(selectedCandidate._id, interviewForm);
      showSuccess('Interview scheduled!');
      setSelectedCandidate(res.data);
      loadRecruitmentData();
    } catch (err) {
      showError('Failed to schedule interview');
    }
  };

  const handleAddFeedback = async (e) => {
    e.preventDefault();
    if (!selectedCandidate || !feedbackForm.comments) return;
    try {
      const res = await api.addInterviewFeedback(selectedCandidate._id, feedbackForm);
      showSuccess('Interviewer feedback recorded!');
      setSelectedCandidate(res.data);
      setFeedbackForm((prev) => ({ ...prev, comments: '' }));
      loadRecruitmentData();
    } catch (err) {
      showError('Failed to submit feedback');
    }
  };

  const filteredCandidates = candidates.filter((c) => {
    if (selectedJobFilter !== 'All' && c.jobId !== selectedJobFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name?.toLowerCase().includes(q) ||
        c.jobTitle?.toLowerCase().includes(q) ||
        (c.skills || []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-indigo-500/30 bg-gradient-to-r from-slate-950 via-indigo-950/30 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider mb-2">
              <Briefcase className="w-3.5 h-3.5" />
              <span>Enterprise Applicant Tracking System & AI Resume Screening</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Recruitment & Talent Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Manage job requisitions, evaluate candidates across the 7-stage Kanban funnel, and run explainable AI resume matching.
            </p>
          </div>

          {canManage && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setShowJobModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 text-indigo-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Job Opening</span>
              </button>
              <button
                onClick={() => setShowCandidateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Applicant + AI Screen</span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'kanban', label: '7-Stage Kanban Pipeline', icon: Briefcase },
              { id: 'jobs', label: `Job Openings (${jobs.length})`, icon: FileText },
              { id: 'ai-screener', label: 'AI Resume Screener Lab', icon: Bot },
              { id: 'analytics', label: 'Recruitment Analytics', icon: BarChart3 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {activeTab === 'kanban' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search candidates or skills..."
                  className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <select
                value={selectedJobFilter}
                onChange={(e) => setSelectedJobFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <option value="All">All Job Requisitions</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.jobCode})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* TAB 1: 7-STAGE KANBAN PIPELINE */}
      {activeTab === 'kanban' && (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-7 gap-3.5 min-w-[1150px]">
            {KANBAN_STAGES.map((stage, sIdx) => {
              const stageCandidates = filteredCandidates.filter((c) => c.stage === stage);
              return (
                <div
                  key={stage}
                  className="glass-panel rounded-2xl p-3 border border-slate-800/90 flex flex-col min-h-[520px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-1.5 mb-3 border-b border-slate-800">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      {stage}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${STAGE_STYLES[stage]}`}
                    >
                      {stageCandidates.length}
                    </span>
                  </div>

                  {/* Candidate Cards */}
                  <div className="space-y-3 flex-1">
                    {stageCandidates.map((cand) => {
                      const score = cand.aiScreening?.matchScore || 75;
                      return (
                        <motion.div
                          layout
                          key={cand._id}
                          onClick={() => setSelectedCandidate(cand)}
                          className="p-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer space-y-2.5 group"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={cand.avatar}
                              alt={cand.name}
                              className="w-9 h-9 rounded-lg object-cover ring-1 ring-indigo-500/30"
                            />
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 truncate">
                                {cand.name}
                              </h4>
                              <p className="text-[10px] text-slate-400 truncate">{cand.jobTitle}</p>
                            </div>
                          </div>

                          {/* AI Match Score Pill */}
                          <div className="flex items-center justify-between text-[10px] p-1.5 rounded-lg bg-slate-950/70 border border-slate-800">
                            <span className="text-slate-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-indigo-400" />
                              <span>AI Match:</span>
                            </span>
                            <span
                              className={`font-mono font-bold ${
                                score >= 85
                                  ? 'text-emerald-400'
                                  : score >= 70
                                  ? 'text-amber-400'
                                  : 'text-rose-400'
                              }`}
                            >
                              {score}%
                            </span>
                          </div>

                          {/* Skills */}
                          <div className="flex flex-wrap gap-1">
                            {(cand.skills || []).slice(0, 3).map((sk, idx) => (
                              <span
                                key={idx}
                                className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-300"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>

                          {/* Quick Stage Move Controls (Human-in-the-loop) */}
                          {canManage && (
                            <div
                              className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                disabled={sIdx === 0}
                                onClick={() => handleStageChange(cand._id, KANBAN_STAGES[sIdx - 1])}
                                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 cursor-pointer"
                                title="Move Back"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-[9px] text-slate-400 font-semibold">Move Stage</span>
                              <button
                                disabled={sIdx >= KANBAN_STAGES.length - 1}
                                onClick={() => handleStageChange(cand._id, KANBAN_STAGES[sIdx + 1])}
                                className="p-1 rounded bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white disabled:opacity-30 cursor-pointer"
                                title="Advance Stage"
                              >
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: JOB OPENINGS & DESCRIPTIONS */}
      {activeTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold">
                    {job.jobCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                    {job.status} &bull; {job.openingsCount} Openings
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-white">{job.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {job.department} &bull; {job.location} &bull; {job.experienceRequired} &bull;{' '}
                  <strong className="text-emerald-400">{job.salaryRange}</strong>
                </p>
                <p className="text-xs text-slate-300 mt-3 leading-relaxed">{job.description}</p>

                <div className="mt-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                    Required Skills (Used by AI Resume Screener)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {(job.requiredSkills || []).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-indigo-500/30 text-xs text-indigo-200"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Hiring Manager: <strong className="text-white">{job.hiringManager}</strong>
                </span>
                <button
                  onClick={() => {
                    setSelectedJobFilter(job._id);
                    setActiveTab('kanban');
                  }}
                  className="text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                >
                  View Pipeline ({candidates.filter((c) => c.jobId === job._id).length}) &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: AI RESUME SCREENER LAB (SPEC #9A) */}
      {activeTab === 'ai-screener' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form
            onSubmit={handleRunAIScreener}
            className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>AI Resume Screening & Qualification Matcher</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Upload or paste a candidate resume to extract skills and compute an explainable match score.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Job Opening
              </label>
              <select
                value={screenerJobId}
                onChange={(e) => setScreenerJobId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              >
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.department}) — Skills: {(j.requiredSkills || []).join(', ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Extracted / Declared Skills
                </label>
                <input
                  type="text"
                  value={screenerSkills}
                  onChange={(e) => setScreenerSkills(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Years of Experience
                </label>
                <input
                  type="number"
                  value={screenerExp}
                  onChange={(e) => setScreenerExp(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300">Resume Content / CV Text</label>
                <label className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Resume (.txt/.md/.json)</span>
                  <input
                    type="file"
                    accept=".txt,.md,.json,.csv"
                    onChange={(e) => handleResumeFileUpload(e, 'screener')}
                    className="hidden"
                  />
                </label>
              </div>
              <textarea
                rows={5}
                value={screenerResumeText}
                onChange={(e) => setScreenerResumeText(e.target.value)}
                className="w-full p-3.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={screeningBusy}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              {screeningBusy ? 'Analyzing Resume...' : 'Run Explainable AI Resume Screening'}
            </button>
          </form>

          {/* Right Panel: Explainable Output */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 flex flex-col justify-between">
            {screenerResult ? (
              <div className="space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                      Explainable AI Evaluation
                    </span>
                    <h4 className="text-xl font-extrabold text-white mt-0.5">
                      Recommendation: {screenerResult.recommendation}
                    </h4>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-emerald-400 font-mono">
                      {screenerResult.matchScore}%
                    </div>
                    <span className="text-[10px] text-slate-400">Composite Match Score</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 leading-relaxed">
                  <strong className="text-white block mb-1">AI Explainability Narrative:</strong>
                  {screenerResult.explanation}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Matched Qualifications ({screenerResult.matchedSkills?.length || 0})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(screenerResult.matchedSkills || []).map((s, i) => (
                        <span
                          key={i}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-200 text-xs font-semibold"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span>Missing Qualifications ({screenerResult.missingSkills?.length || 0})</span>
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(screenerResult.missingSkills || []).length === 0 ? (
                        <span className="text-xs text-emerald-300">All required skills matched!</span>
                      ) : (
                        screenerResult.missingSkills.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-200 text-xs font-semibold"
                          >
                            {s}
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center gap-2.5 text-xs text-indigo-200">
                  <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
                  <span>
                    <strong>Human-in-the-Loop Governance:</strong> {screenerResult.humanControlNotice}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-20 text-center space-y-2 text-slate-400">
                <Sparkles className="w-10 h-10 text-indigo-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-white">Ready to Screen Candidate Resumes</p>
                <p className="text-xs max-w-sm mx-auto">
                  Select a job opening on the left and click "Run Explainable AI Resume Screening" to compare skills and qualifications.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: RECRUITMENT ANALYTICS */}
      {activeTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Open Job Requisitions</span>
              <div className="text-3xl font-extrabold text-white mt-2">{analytics.openJobsCount}</div>
              <p className="text-xs text-emerald-400 mt-1">Across {jobs.length} total roles</p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Total Applicants</span>
              <div className="text-3xl font-extrabold text-white mt-2">{analytics.totalCandidates}</div>
              <p className="text-xs text-indigo-400 mt-1">Active in ATS funnel</p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Avg AI Resume Match</span>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">{analytics.averageAiMatchScore}%</div>
              <p className="text-xs text-slate-400 mt-1">Explainable skill alignment</p>
            </div>
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <span className="text-xs font-bold uppercase text-slate-400">Avg Time-to-Hire</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2">{analytics.timeToHireDays} Days</div>
              <p className="text-xs text-slate-400 mt-1">Offer acceptance: {analytics.offerAcceptanceRate}%</p>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800">
            <h3 className="text-base font-bold text-white mb-4">Funnel Stage Conversion Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(analytics.stageBreakdown || {}).map(([stage, count]) => (
                <div
                  key={stage}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center"
                >
                  <div className="text-2xl font-extrabold text-white">{count}</div>
                  <div className="text-xs text-slate-400 mt-1 font-semibold">{stage}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CANDIDATE INSPECTOR, INTERVIEW SCHEDULER & FEEDBACK MODAL */}
      <AnimatePresence>
        {selectedCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-700 p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            >
              <button
                onClick={() => setSelectedCandidate(null)}
                className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Candidate Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedCandidate.avatar}
                    alt={selectedCandidate.name}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/40"
                  />
                  <div>
                    <h3 className="text-xl font-extrabold text-white">{selectedCandidate.name}</h3>
                    <p className="text-xs text-slate-400">
                      Applying for <strong className="text-indigo-300">{selectedCandidate.jobTitle}</strong> &bull;{' '}
                      {selectedCandidate.experienceYears} yrs exp
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {selectedCandidate.email} &bull; {selectedCandidate.phone}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                      Pipeline Stage (Human Control)
                    </label>
                    <select
                      value={selectedCandidate.stage}
                      onChange={(e) => handleStageChange(selectedCandidate._id, e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-950 border border-indigo-500/50 text-xs font-bold text-white"
                    >
                      {KANBAN_STAGES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* AI Screening Summary Box */}
              {selectedCandidate.aiScreening && (
                <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>AI Resume Screening Assessment</span>
                    </span>
                    <span className="text-sm font-mono font-extrabold text-emerald-400">
                      {selectedCandidate.aiScreening.matchScore}% Match ({selectedCandidate.aiScreening.recommendation})
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{selectedCandidate.aiScreening.explanation}</p>
                  <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                    <span className="text-emerald-300 font-semibold">
                      Matched: {(selectedCandidate.aiScreening.matchedSkills || []).join(', ') || 'None'}
                    </span>
                    {(selectedCandidate.aiScreening.missingSkills || []).length > 0 && (
                      <span className="text-amber-300 font-semibold">
                        &bull; Missing: {selectedCandidate.aiScreening.missingSkills.join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Two Columns: Schedule Interview + Add Interviewer Feedback */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Interviews */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Scheduled Interviews ({(selectedCandidate.interviews || []).length})</span>
                  </h4>
                  {(selectedCandidate.interviews || []).map((iv) => (
                    <div key={iv.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <div className="font-bold text-white">{iv.round}</div>
                      <div className="text-slate-400 mt-0.5">
                        Time: {iv.scheduledAt} &bull; Panel: {iv.interviewer}
                      </div>
                    </div>
                  ))}

                  {canManage && (
                    <form onSubmit={handleScheduleInterview} className="space-y-2 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Round Name (e.g. System Design)"
                        value={interviewForm.round}
                        onChange={(e) => setInterviewForm({ ...interviewForm, round: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Date & Time"
                          value={interviewForm.scheduledAt}
                          onChange={(e) => setInterviewForm({ ...interviewForm, scheduledAt: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                        <input
                          type="text"
                          placeholder="Interviewer"
                          value={interviewForm.interviewer}
                          onChange={(e) => setInterviewForm({ ...interviewForm, interviewer: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Schedule Interview
                      </button>
                    </form>
                  )}
                </div>

                {/* Interviewer Feedback */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    <span>Interviewer Feedback ({(selectedCandidate.feedback || []).length})</span>
                  </h4>
                  {(selectedCandidate.feedback || []).map((fb) => (
                    <div key={fb.id} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between font-bold text-white">
                        <span>{fb.interviewer}</span>
                        <span className="text-emerald-400">
                          {fb.rating}/5 ({fb.recommendation})
                        </span>
                      </div>
                      <p className="text-slate-300 mt-1 italic">"{fb.comments}"</p>
                    </div>
                  ))}

                  {canManage && (
                    <form onSubmit={handleAddFeedback} className="space-y-2 pt-2 border-t border-slate-800">
                      <div className="grid grid-cols-2 gap-2">
                        <select
                          value={feedbackForm.recommendation}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, recommendation: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        >
                          <option value="Strong Hire">Strong Hire</option>
                          <option value="Hire">Hire</option>
                          <option value="Hold">Hold</option>
                          <option value="No Hire">No Hire</option>
                        </select>
                        <input
                          type="number"
                          step="0.5"
                          min="1"
                          max="5"
                          value={feedbackForm.rating}
                          onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                          className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                        />
                      </div>
                      <textarea
                        rows={2}
                        placeholder="Enter structured interviewer feedback..."
                        value={feedbackForm.comments}
                        onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="submit"
                        className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Add Interviewer Feedback
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CREATE JOB OPENING MODAL */}
      <AnimatePresence>
        {showJobModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateJob}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Create New Job Opening</h3>
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="Job Title (e.g. Principal Cloud Architect)"
                value={jobForm.title}
                onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={jobForm.department}
                  onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="Sales">Sales</option>
                  <option value="HR">HR</option>
                  <option value="Finance">Finance</option>
                  <option value="Marketing">Marketing</option>
                </select>
                <input
                  type="text"
                  placeholder="Salary Range (e.g. ₹25L - ₹35L)"
                  value={jobForm.salaryRange}
                  onChange={(e) => setJobForm({ ...jobForm, salaryRange: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <input
                type="text"
                placeholder="Required Skills (comma-separated)"
                value={jobForm.requiredSkills}
                onChange={(e) => setJobForm({ ...jobForm, requiredSkills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <textarea
                rows={3}
                required
                placeholder="Job Description & Responsibilities..."
                value={jobForm.description}
                onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowJobModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white cursor-pointer"
                >
                  Publish Job Opening
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>

      {/* ADD CANDIDATE + AI RESUME SCREENING MODAL */}
      <AnimatePresence>
        {showCandidateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.form
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onSubmit={handleCreateCandidate}
              className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700 p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-extrabold text-white">Add Applicant & Run AI Resume Screen</h3>
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="Candidate Full Name"
                  value={candForm.name}
                  onChange={(e) => setCandForm({ ...candForm, name: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
                <input
                  type="email"
                  required
                  placeholder="Email Address"
                  value={candForm.email}
                  onChange={(e) => setCandForm({ ...candForm, email: e.target.value })}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <select
                value={candForm.jobId}
                onChange={(e) => setCandForm({ ...candForm, jobId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Candidate Skills (comma-separated)"
                value={candForm.skills}
                onChange={(e) => setCandForm({ ...candForm, skills: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-300 font-semibold">
                    Resume Text / File ({candForm.resumeFileName})
                  </span>
                  <label className="text-xs text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer flex items-center gap-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Resume File</span>
                    <input
                      type="file"
                      onChange={(e) => handleResumeFileUpload(e, 'candidate')}
                      className="hidden"
                    />
                  </label>
                </div>
                <textarea
                  rows={3}
                  placeholder="Paste resume summary or upload a file above for automatic AI qualification extraction..."
                  value={candForm.resumeText}
                  onChange={(e) => setCandForm({ ...candForm, resumeText: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCandidateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-bold text-white cursor-pointer"
                >
                  Add Applicant & Score with AI
                </button>
              </div>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

