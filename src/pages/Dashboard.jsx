import React from 'react';
import { useAuth } from '../context/AuthContext';
import EmployeeDashboard from './EmployeeDashboard';
import ManagerDashboard from './ManagerDashboard';
import HRDashboard from './HRDashboard';
import AdminDashboard from './AdminDashboard';

export default function Dashboard() {
  const { role } = useAuth();
  const activeView = role || 'employee';

  return (
    <div className="space-y-6">
      {/* Render Dynamic Role Dashboard */}
      {activeView === 'employee' && <EmployeeDashboard />}
      {activeView === 'manager' && <ManagerDashboard />}
      {activeView === 'hr' && <HRDashboard />}
      {activeView === 'admin' && <AdminDashboard />}
    </div>
  );
}
