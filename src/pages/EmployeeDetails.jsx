import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  ShieldCheck,
  Award,
  Sparkles,
  Clock,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { motion } from 'framer-motion';
import EmployeeModal from '../components/EmployeeModal';
import DeleteModal from '../components/DeleteModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../context/ToastContext';
import api from '../api';
import { getInitials, getAvatarGradient } from '../utils/avatar';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'skills', 'activity'

  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  return (
    <div className="space-y-6">
      {/* Back Button and Quick Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/employees')}
          className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900/60 px-3.5 py-2 text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          >
            <Printer className="h-4 w-4 text-slate-400" />
            <span className="hidden sm:inline">Print Badge</span>
          </button>
          <button
            onClick={() => setEditModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition-colors"
          >
            <Edit2 className="h-4 w-4 text-indigo-400" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => setDeleteModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Large Profile Header with 3D ID Badge Vibe */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950/60 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
        {/* Ambient Glows */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute left-1/3 -bottom-16 h-48 w-48 rounded-full bg-purple-500/15 blur-3xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div
                className={`h-24 w-24 sm:h-28 sm:w-28 rounded-3xl bg-gradient-to-br ${getAvatarGradient(
                  employee.name
                )} flex items-center justify-center font-extrabold text-3xl sm:text-4xl tracking-wider ring-4 ring-indigo-500/30 shadow-2xl`}
              >
                {getInitials(employee.name)}
              </div>
              <span
                className={`absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-slate-950 ${
                  employee.status === 'Active'
                    ? 'bg-emerald-400'
                    : employee.status === 'On Leave'
                    ? 'bg-amber-400'
                    : 'bg-rose-400'
                }`}
              />
            </div>

            {/* Core Info */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  {employee.name}
                </h1>
                <span className="rounded-full bg-indigo-500/20 px-3 py-0.5 text-xs font-semibold text-indigo-300 border border-indigo-500/30">
                  {employee.department}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                    employee.status === 'Active'
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  }`}
                >
                  {employee.status || 'Active'}
                </span>
              </div>

              <p className="text-base font-medium text-slate-300">
                {employee.designation}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
                <span className="font-mono text-slate-500">
                  ID: {empId}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  {employee.email}
                </span>
                {employee.phone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-indigo-400" />
                      {employee.phone}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-slate-950/60 p-4 shrink-0">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Performance Rating
              </p>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-2xl font-bold text-white">
                  {employee.performanceScore || 94}
                </span>
                <span className="text-xs text-slate-400">/ 100</span>
              </div>
            </div>
            <div className="h-10 w-[1px] bg-white/10" />
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Tenure
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-300">
                {new Date().getFullYear() -
                  new Date(employee.joinDate || employee.createdAt || Date.now()).getFullYear() || 1}{' '}
                Years Active
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-white/10 gap-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'overview'
              ? 'text-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Personal Information & Overview</span>
          {activeTab === 'overview' && (
            <motion.div
              layoutId="profileTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
            />
          )}
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`pb-3 text-sm font-semibold transition-all relative ${
            activeTab === 'skills'
              ? 'text-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <span>Skills & Performance</span>
          {activeTab === 'skills' && (
            <motion.div
              layoutId="profileTab"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-full"
            />
          )}
        </button>
      </div>

      {/* Tab Content: Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-indigo-400" />
              Workplace Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Full Name</span>
                <p className="font-semibold text-white">{employee.name}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Work Email</span>
                <p className="font-semibold text-white">{employee.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Department</span>
                <p className="font-semibold text-white">{employee.department}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Role Designation</span>
                <p className="font-semibold text-white">{employee.designation}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Gender</span>
                <p className="font-semibold text-white">{employee.gender || 'Not specified'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Phone Contact</span>
                <p className="font-semibold text-white">{employee.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Compensation (Annual)</span>
                <p className="font-semibold text-emerald-400">
                  ₹{Number(employee.salary || 1400000).toLocaleString('en-IN')} / yr (INR)
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Date Joined</span>
                <p className="font-semibold text-white">
                  {new Date(employee.joinDate || employee.createdAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-mono uppercase">Last Record Updated</span>
                <p className="font-semibold text-slate-300">
                  {new Date(employee.updatedAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Bio section */}
            <div className="border-t border-white/5 pt-5 space-y-2">
              <span className="text-xs text-slate-400 font-mono uppercase">Professional Summary</span>
              <p className="text-sm text-slate-300 leading-relaxed">
                {employee.bio ||
                  'Experienced enterprise professional driving product innovation and agile cross-functional delivery within the organization.'}
              </p>
            </div>
          </div>

          {/* Right Side Card: Security & Verification */}
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Identity & Access
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-slate-400">SSO & MFA Enabled</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-slate-400">Workplace Access Level</span>
                <span className="text-indigo-400 font-semibold">Tier-2 Enterprise</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/40 border border-white/5">
                <span className="text-slate-400">Payroll Direct Deposit</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
            </div>

            <div className="border-t border-white/5 pt-4">
              <p className="text-xs font-semibold text-slate-300 mb-2">Assigned Equipment</p>
              <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
                <li>MacBook Pro 16" (M3 Max / 64GB)</li>
                <li>NEXUS Smart Badge #NX-{empId.substring(0, 5).toUpperCase()}</li>
                <li>YubiKey 5C NFC Security Key</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Skills & Performance */}
      {activeTab === 'skills' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Award className="h-4 w-4 text-indigo-400" />
              Technical & Domain Competencies
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {(employee.skills || ['Distributed Systems', 'System Design', 'React', 'Cloud Architecture', 'Agile Delivery']).map(
                (skill, idx) => (
                  <span
                    key={idx}
                    className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3.5 py-1.5 text-xs font-semibold text-indigo-300"
                  >
                    {skill}
                  </span>
                )
              )}
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-slate-900/60 p-6 backdrop-blur-xl shadow-xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Quarterly Objectives (OKRs)
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Architecture Modernization</span>
                  <span className="text-emerald-400 font-bold">95%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-slate-300 font-medium mb-1">
                  <span>Cross-Team Mentorship</span>
                  <span className="text-indigo-400 font-bold">88%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '88%' }} />
                </div>
              </div>
            </div>
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
