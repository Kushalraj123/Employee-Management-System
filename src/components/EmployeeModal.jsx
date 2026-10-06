import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Users,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmployeeModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isSubmitting = false,
}) {
  const isEditing = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: 'Engineering',
    designation: '',
    gender: 'Male',
    phone: '',
    status: 'Active',
    joinDate: new Date().toISOString().split('T')[0],
    salary: 95000,
    bio: '',
    avatar: '',
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        department: initialData.department || 'Engineering',
        designation: initialData.designation || '',
        gender: initialData.gender || 'Male',
        phone: initialData.phone || '',
        status: initialData.status || 'Active',
        joinDate: initialData.joinDate
          ? new Date(initialData.joinDate).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        salary: initialData.salary || 95000,
        bio: initialData.bio || '',
        avatar: initialData.avatar || '',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        department: 'Engineering',
        designation: '',
        gender: 'Male',
        phone: '',
        status: 'Active',
        joinDate: new Date().toISOString().split('T')[0],
        salary: 95000,
        bio: '',
        avatar: '',
      });
    }
    setErrors({});
    setTouched({});
  }, [initialData, isOpen]);

  const validateField = (name, value) => {
    let error = '';
    if (name === 'name') {
      if (!value.trim()) {
        error = 'Full name is required.';
      } else if (value.trim().length < 2) {
        error = 'Name must contain at least 2 characters.';
      } else if (value.trim().length > 100) {
        error = 'Name cannot exceed 100 characters.';
      }
    } else if (name === 'email') {
      if (!value.trim()) {
        error = 'Email address is required.';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = 'Please enter a valid email address.';
      }
    } else if (name === 'designation') {
      if (!value.trim()) {
        error = 'Job title / Designation is required.';
      }
    } else if (name === 'department') {
      if (!value) {
        error = 'Please select a department.';
      }
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all fields
    const newErrors = {};
    ['name', 'email', 'department', 'designation'].forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      department: true,
      designation: true,
    });

    if (Object.keys(newErrors).length === 0) {
      onSubmit(formData);
    }
  };

  const departments = [
    'Engineering',
    'HR',
    'Sales',
    'Finance',
    'Marketing',
  ];

  const genders = ['Male', 'Female', 'Other', 'Prefer not to say'];

  const statuses = ['Active', 'On Leave', 'Inactive'];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-slate-900/95 backdrop-blur-2xl shadow-2xl z-10 my-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 bg-slate-950/40">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                {isEditing ? 'Edit Employee' : 'Add Employee'}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isEditing
                  ? 'Update existing workforce records and profile details.'
                  : 'Create a new employee profile in your organization.'}
              </p>
            </div>

            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
              aria-label="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-indigo-400" />
                  Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Enter employee name"
                  className={`w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.name && touched.name
                      ? 'border-rose-500/60 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.name && touched.name && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1">
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-indigo-400" />
                  Work Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="employee@example.com"
                  className={`w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.email && touched.email
                      ? 'border-rose-500/60 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.email && touched.email && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Department */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                  Department <span className="text-rose-400">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                >
                  {departments.map((dept) => (
                    <option key={dept} value={dept} className="bg-slate-900 text-white">
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Designation */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-indigo-400" />
                  Designation / Role <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  name="designation"
                  value={formData.designation}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. Software Engineer"
                  className={`w-full rounded-xl border bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
                    errors.designation && touched.designation
                      ? 'border-rose-500/60 focus:ring-rose-500/20'
                      : 'border-white/10 focus:border-indigo-500 focus:ring-indigo-500/20'
                  }`}
                />
                {errors.designation && touched.designation && (
                  <p className="text-[11px] font-medium text-rose-400 mt-1">
                    {errors.designation}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-indigo-400" />
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-indigo-400" />
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                >
                  {genders.map((g) => (
                    <option key={g} value={g} className="bg-slate-900 text-white">
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all cursor-pointer"
                >
                  {statuses.map((st) => (
                    <option key={st} value={st} className="bg-slate-900 text-white">
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Join Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400" />
                  Date Joined
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>

              {/* Annual Salary */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <span className="font-bold text-indigo-400 font-mono text-sm leading-none">₹</span>
                  Annual Compensation (INR ₹)
                </label>
                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  placeholder="1400000"
                  className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2.5 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                />
              </div>
            </div>

            {/* Bio & Skills */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-indigo-400" />
                Bio & Technical Notes
              </label>
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief summary of responsibilities, focus areas, and skill sets..."
                className="w-full rounded-xl border border-white/10 bg-slate-950/60 px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:text-white hover:bg-white/5 transition-all disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{isEditing ? 'Saving Changes...' : 'Creating Employee...'}</span>
                  </>
                ) : (
                  <span>{isEditing ? 'Save Changes' : 'Create Employee'}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
