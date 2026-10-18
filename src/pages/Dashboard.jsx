import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';
import Employee3DCanvas from '../components/Employee3DCanvas';
import { Shield, Briefcase, UserCheck, Eye, Sparkles } from 'lucide-react';

export default function Dashboard() {
  const { role } = useAuth();
  const activeView = role || 'employee';

  return (
    <div className="space-y-6">
      {/* Render Dynamic Role Dashboard */}
      {activeView === 'employee' && <EmployeeDashboard />}
      {activeView === 'hr' && <HRDashboard />}
      {activeView === 'admin' && <AdminDashboard />}
    </div>
  );
}
