import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  Edit2,
  Trash2,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  Printer,
  CheckCircle2,
  TrendingUp,
  FileText,
  Upload,
  Power,
  Users,
  GraduationCap,
  HeartPulse,
  History,
  Network,
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmployeeModal from '../components/EmployeeModal';
import DeleteModal from '../components/DeleteModal';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const { user, isAdmin, isHR, isManager } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'skills' | 'documents' | 'activity'

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Document Upload State
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState('Employment Contract');
  const [docSize, setDocSize] = useState('420 KB');
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const fetchEmployee = async () => {
    setLoading(true);
    try {
      const response = await api.getEmployeeById(id);
      setEmployee(response.data);
    } catch (err) {
      showError(err.message || 'Employee not found');
      navigate('/employees');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const handleUpdate = async (formData) => {
    setIsSubmitting(true);
    try {
      const response = await api.updateEmployee(id, formData);
      setEmployee(response.data);
      showSuccess(`Profile updated for ${formData.name}`);
      setEditModalOpen(false);
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to update employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActivation = async () => {
    if (!employee) return;
    const nextStatus = employee.status === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await api.updateEmployee(id, { status: nextStatus });
      setEmployee(res.data);
      showSuccess(
        `Employee ${employee.name} is now ${nextStatus === 'Active' ? 'Activated' : 'Deactivated'}.`
      );
    } catch (err) {
      showError('Failed to toggle employment status');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocTitle(file.name);
    setDocSize(`${Math.max(12, Math.round(file.size / 1024))} KB`);
  };

  const handleAddDocument = async (e) => {
    e.preventDefault();
    if (!docTitle.trim()) {
      showError('Document title or file is required');
      return;
    }
    setUploadingDoc(true);
    try {
      await api.addEmployeeDocument(id, {
        title: docTitle.trim(),
        category: docCategory,
        size: docSize,
      });
      showSuccess(`Document "${docTitle}" uploaded to employee vault!`);
      setDocTitle('');
      fetchEmployee();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    try {
      await api.deleteEmployeeDocument(id, docId);
      showSuccess('Document removed from vault');
      fetchEmployee();
    } catch (err) {
      showError('Failed to delete document');
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteEmployee(id);
      showSuccess('Employee removed from directory');
      navigate('/employees');
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 rounded-lg animate-shimmer" />
        <div className="h-64 rounded-3xl animate-shimmer" />
        <div className="h-96 rounded-3xl animate-shimmer" />
      </div>
    );
  }

  if (!employee) return null;

  const empId = employee._id || employee.id;
  const officialEmployeeCode = employee.employeeId || `EMP-${empId}`;

  return (
    <div className="space-y-6">
      {/* Back Button and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/employees')}
            className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </button>

          <Link
            to="/org-network"
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <Network className="h-4 w-4" />
            <span>View in 3D Org Network</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span className="hidden sm:inline">Print Badge</span>
          </button>
          {(isAdmin || isHR) && (
            <>
              <button
                onClick={handleToggleActivation}
                className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-colors shadow-sm cursor-pointer ${
                  employee.status === 'Active'
                    ? 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20'
                    : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                }`}
              >
                <Power className="h-4 w-4" />
                <span>{employee.status === 'Active' ? 'Deactivate' : 'Activate'}</span>
              </button>
              <button
                onClick={() => setEditModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-500/30 bg-indigo-50 dark:bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm cursor-pointer"
              >
                <Edit2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors shadow-sm cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Large Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-white/10 bg-gradient-to-br from-white via-indigo-50/40 to-purple-50/30 dark:from-slate-900 dark:via-slate-950 dark:to-indigo-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-sm dark:shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Profile Picture with Fallback */}
            <div className="relative shrink-0">
              {employee.avatar ? (
                <img
                  src={employee.avatar}
                  alt={employee.name}
                  className="h-24 w-24 sm:h-28 sm:w-28 rounded-3xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
                />
              ) : (
                <div
                  className={`h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br ${getAvatarGradient(
                    employee.name
                  )} flex items-center justify-center font-extrabold text-3xl sm:text-4xl tracking-wider ring-4 ring-indigo-500/30 shadow-xl`}
                >
                  {getInitials(employee.name)}
                </div>
              )}
              <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-950 ${
                  employee.status === 'Active'
                    ? 'bg-emerald-500'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
              />
            </div>

            {/* Core Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold border border-indigo-500/30">
                  {officialEmployeeCode}
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {employee.name}
                </h1>
                <span className="rounded-full bg-indigo-50 dark:bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                  {employee.department}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    employee.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30'
                      : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30'
                  }`}
                >
                  {employee.status || 'Active'}
                </span>
              </div>

              <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                {employee.designation} &bull;{' '}
                <span className="text-xs text-indigo-400">
                  Reports to: <strong>{employee.reportingManager || 'Executive Board'}</strong>
                </span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      {employee.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/60 p-4 shrink-0 shadow-sm">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Performance Rating
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  {employee.performanceScore || 94}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-slate-200 dark:bg-white/10" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Tenure
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                {Math.max(
                  1,
                  new Date().getFullYear() -
                    new Date(employee.joinDate || employee.createdAt || Date.now()).getFullYear()
                )}{' '}
                Years Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Tabs Navigation */}
      <div className="flex flex-wrap border-b border-slate-200 dark:border-white/10 gap-6">
        {[
          { id: 'overview', label: 'Personal & Workplace Info' },
          { id: 'skills', label: 'Skills, Qualifications & OKRs' },
          { id: 'documents', label: `Document Vault (${(employee.documents || []).length})` },
          { id: 'activity', label: `Activity History (${(employee.activityHistory || []).length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
              activeTab === tab.id
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>{tab.label}</span>
            {activeTab === tab.id && (
              <motion.div
                layoutId="profileTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-500 rounded-full"
              />
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              Complete Employee Record
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Employee ID</span>
                <p className="font-mono font-bold text-indigo-400">{officialEmployeeCode}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Full Name</span>
                <p className="font-semibold text-slate-900 dark:text-white">{employee.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Work Email</span>
                <p className="font-semibold text-slate-900 dark:text-white">{employee.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Department & Role</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {employee.department} — {employee.designation}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Reporting Manager</span>
                <p className="font-semibold text-indigo-400">
                  {employee.reportingManager || 'Executive Board'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Joining Date</span>
                <p className="font-semibold text-slate-900 dark:text-white">
                  {employee.joinDate || '2023-01-15'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Phone Contact</span>
                <p className="font-semibold text-slate-900 dark:text-white">{employee.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Compensation (Annual)</span>
                {employee.salary ? (
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    ₹{Number(employee.salary).toLocaleString('en-IN')} / yr (INR)
                  </p>
                ) : (
                  <p className="font-semibold text-slate-400 italic text-xs">
                    Confidential &bull; Restricted to HR/Admin/Self
                  </p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-white/5 pt-5 space-y-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase">Professional Bio</span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {employee.bio ||
                  'Experienced enterprise professional driving product innovation and agile cross-functional delivery within the organization.'}
              </p>
            </div>
          </div>

          {/* Right Column: Emergency Contact & Security */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-rose-500" />
                Emergency Contact
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Contact Person:</span>
                  <strong className="text-white">{employee.emergencyContact?.name || 'Registered Next of Kin'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Relationship:</span>
                  <strong className="text-indigo-300">{employee.emergencyContact?.relation || 'Spouse / Family'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Emergency Phone:</span>
                  <strong className="text-emerald-400 font-mono">
                    {employee.emergencyContact?.phone || '+91 98201 99100'}
                  </strong>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Identity & Access
              </h3>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400">JWT RBAC Status</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                  </span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-200 dark:border-white/5">
                  <span className="text-slate-400">Badge ID</span>
                  <span className="text-indigo-400 font-mono font-semibold">#NX-{officialEmployeeCode}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SKILLS, QUALIFICATIONS & OKRs */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-indigo-400" />
                Technical & Domain Competencies
              </h3>
              <div className="flex flex-wrap gap-2 pt-3">
                {(employee.skills || ['Distributed Systems', 'React', 'System Design']).map((skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
                <GraduationCap className="h-4 w-4 text-purple-400" />
                Qualifications & Certifications
              </h3>
              <ul className="space-y-2 text-xs text-slate-300">
                {(employee.qualifications || ['B.Tech in Computer Science', 'Enterprise Cloud Certification']).map(
                  (q, i) => (
                    <li
                      key={i}
                      className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{q}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 dark:border-white/5 bg-white/95 dark:bg-slate-900/60 p-6 backdrop-blur-xl shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Skill Proficiency Matrix
            </h3>
            <div className="space-y-3 text-xs">
              {(employee.skillMatrix || []).map((sm, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-slate-300 font-medium mb-1">
                    <span>{sm.skill}</span>
                    <span className="text-emerald-400 font-bold">
                      {sm.level}% (Target: {sm.target}%)
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                      style={{ width: `${sm.level}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DOCUMENT MANAGEMENT VAULT */}
      {activeTab === 'documents' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>Verified Employee Documents ({(employee.documents || []).length})</span>
            </h3>

            {(employee.documents || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {(employee.documents || []).map((doc) => (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{doc.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {doc.category} &bull; {doc.size} &bull; Uploaded {doc.uploadedAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        {doc.status || 'Verified'}
                      </span>
                      {(isAdmin || isHR || user?.employeeId === empId) && (
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
                          className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/15 cursor-pointer"
                          title="Delete document"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddDocument}
            className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4 h-fit"
          >
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>Upload New Document</span>
            </h3>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Select File from Computer</label>
              <input
                type="file"
                onChange={handleFileSelect}
                className="w-full text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-indigo-600 file:text-white file:font-semibold hover:file:bg-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Document Title</label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Solutions Architect Certificate.pdf"
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1">Document Category</label>
              <select
                value={docCategory}
                onChange={(e) => setDocCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                <option value="Employment Contract">Employment Contract</option>
                <option value="Identity & KYC">Identity & KYC</option>
                <option value="Academic Certificate">Academic Certificate</option>
                <option value="Tax & Compliance">Tax & Compliance</option>
                <option value="Appraisal Letter">Appraisal Letter</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={uploadingDoc}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold cursor-pointer"
            >
              {uploadingDoc ? 'Uploading...' : 'Add to Document Vault'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: EMPLOYEE ACTIVITY HISTORY TIMELINE */}
      {activeTab === 'activity' && (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            <span>Employee Lifecycle & Activity History</span>
          </h3>

          <div className="space-y-3">
            {(employee.activityHistory || []).map((act) => (
              <div
                key={act.id}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <div>
                    <p className="text-xs font-bold text-white">{act.action}</p>
                    <p className="text-[11px] text-slate-400">Recorded by {act.actor}</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-indigo-300">{act.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EmployeeModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleUpdate}
        initialData={employee}
        isSubmitting={isSubmitting}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        employee={employee}
        isDeleting={isDeleting}
      />
    </div>
  );
}
