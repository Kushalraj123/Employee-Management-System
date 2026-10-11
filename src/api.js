import axios from 'axios';
import { getGenderAvatar } from './utils/avatar';

const API_BASE_URL =
  (typeof window !== 'undefined' && localStorage.getItem('nexus_custom_api_url')) ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Configure auth token interceptor
let currentToken = typeof window !== 'undefined' ? localStorage.getItem('nexus_auth_token') : null;
if (currentToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
}

export const setAuthToken = (token) => {
  currentToken = token;
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Keys for local hybrid store
const KEYS = {
  EMPLOYEES: 'nexus_employees_db',
  ATTENDANCE: 'nexus_attendance_db',
  LEAVES: 'nexus_leaves_db',
  LEAVE_BALANCES: 'nexus_leave_balances_db',
  PAYROLLS: 'nexus_payrolls_db',
  ANNOUNCEMENTS: 'nexus_announcements_db',
  REVIEWS: 'nexus_reviews_db',
  GOALS: 'nexus_goals_db',
  NOTIFICATIONS: 'nexus_notifications_db',
  DEPARTMENTS: 'nexus_departments_db',
  USERS: 'nexus_users_db',
  POLICY: 'nexus_attendance_policy_db',
};

// Initial Seed Data for offline / mock fallback
const INITIAL_EMPLOYEES = [
  {
    _id: 'emp_001',
    id: 'emp_001',
    employeeId: 'NEX-1001',
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus.io',
    department: 'Engineering',
    designation: 'Principal Architect & VP Tech',
    gender: 'Female',
    phone: '+91 98201 23456',
    status: 'Active',
    joinDate: '2022-03-15',
    salary: 2850000,
    salaryStructure: {
      basicSalary: 140000,
      hra: 56000,
      allowances: 35000,
      bonus: 15000,
      deductions: 18500,
      netSalary: 227500,
    },
    performanceScore: 98,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Leads distributed systems engineering and AI integration for core enterprise platforms.',
    skills: ['Kubernetes', 'Go', 'React', 'Cloud Architecture', 'System Design'],
    createdAt: '2022-03-15T09:00:00.000Z',
  },
  {
    _id: 'emp_002',
    id: 'emp_002',
    employeeId: 'NEX-1002',
    name: 'Marcus Vance',
    email: 'marcus.vance@nexus.io',
    department: 'Engineering',
    designation: 'Senior Full-Stack Engineer',
    gender: 'Male',
    phone: '+91 98450 34567',
    status: 'Active',
    joinDate: '2023-01-10',
    salary: 2100000,
    salaryStructure: {
      basicSalary: 105000,
      hra: 42000,
      allowances: 25000,
      bonus: 8000,
      deductions: 14000,
      netSalary: 166000,
    },
    performanceScore: 94,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Specialist in high-throughput React frontends and Node.js microservices.',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'Next.js'],
    createdAt: '2023-01-10T10:15:00.000Z',
  },
  {
    _id: 'emp_003',
    id: 'emp_003',
    employeeId: 'NEX-1003',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexus.io',
    department: 'HR',
    designation: 'Chief People Officer',
    gender: 'Female',
    phone: '+91 98100 45678',
    status: 'Active',
    joinDate: '2021-08-01',
    salary: 2400000,
    salaryStructure: {
      basicSalary: 120000,
      hra: 48000,
      allowances: 28000,
      bonus: 10000,
      deductions: 16000,
      netSalary: 190000,
    },
    performanceScore: 96,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Directs global talent acquisition, workplace culture, and leadership development programs.',
    skills: ['Talent Strategy', 'People Analytics', 'Compensation', 'Culture Building'],
    createdAt: '2021-08-01T08:30:00.000Z',
  },
  {
    _id: 'emp_004',
    id: 'emp_004',
    employeeId: 'NEX-1004',
    name: 'Devon Wright',
    email: 'devon.wright@nexus.io',
    department: 'Sales',
    designation: 'VP Enterprise Sales',
    gender: 'Male',
    phone: '+91 99887 56789',
    status: 'Active',
    joinDate: '2022-11-20',
    salary: 2500000,
    salaryStructure: {
      basicSalary: 125000,
      hra: 50000,
      allowances: 30000,
      bonus: 15000,
      deductions: 17000,
      netSalary: 203000,
    },
    performanceScore: 91,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Drives global enterprise revenue growth and strategic customer partnerships.',
    skills: ['Enterprise SaaS', 'Key Account Strategy', 'Pipeline Mgmt', 'Negotiation'],
    createdAt: '2022-11-20T11:00:00.000Z',
  },
  {
    _id: 'emp_005',
    id: 'emp_005',
    employeeId: 'NEX-1005',
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@nexus.io',
    department: 'Finance',
    designation: 'Director of Strategic Finance',
    gender: 'Female',
    phone: '+91 97654 67890',
    status: 'Active',
    joinDate: '2022-05-14',
    salary: 2250000,
    salaryStructure: {
      basicSalary: 112500,
      hra: 45000,
      allowances: 26000,
      bonus: 9000,
      deductions: 15500,
      netSalary: 177000,
    },
    performanceScore: 95,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Oversees financial planning, operational budgeting, and corporate fiscal governance.',
    skills: ['Financial Modeling', 'Forecasting', 'Cap Table Management', 'Tax Strategy'],
    createdAt: '2022-05-14T09:45:00.000Z',
  },
  {
    _id: 'emp_006',
    id: 'emp_006',
    employeeId: 'NEX-1006',
    name: 'Lucas Dupont',
    email: 'lucas.dupont@nexus.io',
    department: 'Engineering',
    designation: 'Frontend 3D/WebGL Developer',
    gender: 'Male',
    phone: '+91 98312 90123',
    status: 'Active',
    joinDate: '2024-02-15',
    salary: 1750000,
    salaryStructure: {
      basicSalary: 87500,
      hra: 35000,
      allowances: 20000,
      bonus: 7000,
      deductions: 11500,
      netSalary: 138000,
    },
    performanceScore: 97,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Creates interactive 3D web applications, animations, and high-performance visual tools.',
    skills: ['Three.js', 'WebGL', 'GLSL Shaders', 'React Three Fiber', 'TailwindCSS'],
    createdAt: '2024-02-15T11:30:00.000Z',
  },
];

const INITIAL_DEPARTMENTS = [
  { _id: 'dept_1', id: 'dept_1', name: 'Engineering', code: 'ENG', description: 'Core product architecture, cloud services, and UI systems.', head: 'Elena Rostova', budget: 85000000, employeeCount: 3, color: '#3B82F6' },
  { _id: 'dept_2', id: 'dept_2', name: 'HR', code: 'HR', description: 'People operations, talent recruitment, culture, and compliance.', head: 'Sarah Chen', budget: 18000000, employeeCount: 1, color: '#8B5CF6' },
  { _id: 'dept_3', id: 'dept_3', name: 'Sales', code: 'SLS', description: 'Global enterprise sales, customer relationships, and business development.', head: 'Devon Wright', budget: 35000000, employeeCount: 1, color: '#06B6D4' },
  { _id: 'dept_4', id: 'dept_4', name: 'Finance', code: 'FIN', description: 'Financial forecasting, corporate accounting, and audit compliance.', head: 'Amina Al-Mansoor', budget: 22000000, employeeCount: 1, color: '#10B981' },
  { _id: 'dept_5', id: 'dept_5', name: 'Marketing', code: 'MKT', description: 'Brand equity, product marketing, events, and lead acquisition.', head: 'Liam Gallagher', budget: 28000000, employeeCount: 0, color: '#F59E0B' },
];

const INITIAL_POLICY = {
  policyName: 'NEXUS Global Enterprise Policy',
  workStartTime: '09:00',
  gracePeriodMinutes: 15,
  cutoffTime: '10:30',
  workEndTime: '18:00',
  minWorkingHours: 8,
  halfDayThresholdHours: 4,
  weekendDays: ['Saturday', 'Sunday'],
  timezone: 'Asia/Kolkata',
  isActive: true,
};

// Storage helpers
const getStored = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const raw = localStorage.getItem(key);
  if (!raw) {
    localStorage.setItem(key, JSON.stringify(fallback));
    return fallback;
  }
  try {
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
};

const saveStored = (key, data) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  setAuthToken,

  // Health
  async checkBackendHealth() {
    try {
      const response = await apiClient.get('/health', { timeout: 4000 });
      return { isLive: true, data: response.data };
    } catch (err) {
      return { isLive: false, error: err.message };
    }
  },

  // Auth
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    } catch (err) {
      // Mock fallback authentication
      const email = credentials.email?.toLowerCase();
      let role = 'employee';
      let name = 'Team Member';
      let empId = 'emp_002';

      if (email.includes('admin')) {
        role = 'admin';
        name = 'NEXUS Administrator';
        empId = 'emp_003';
      } else if (email.includes('hr') || email.includes('sarah')) {
        role = 'hr';
        name = 'Sarah Chen (HR Lead)';
        empId = 'emp_003';
      } else if (email.includes('marcus')) {
        name = 'Marcus Vance';
      }

      return {
        success: true,
        token: 'local_jwt_token_' + Date.now(),
        user: {
          id: 'usr_' + role,
          name,
          email: credentials.email,
          role,
          employeeId: empId,
          avatar: '',
        },
      };
    }
  },

  async demoLogin(role) {
    try {
      const response = await apiClient.post('/auth/demo-login', { role });
      return response.data;
    } catch (err) {
      const email = role === 'admin' ? 'admin@nexus.io' : role === 'hr' ? 'sarah.chen@nexus.io' : 'marcus.vance@nexus.io';
      const name = role === 'admin' ? 'NEXUS Administrator' : role === 'hr' ? 'Sarah Chen (HR Lead)' : 'Marcus Vance (Senior Engineer)';
      return {
        success: true,
        token: `demo_jwt_${role}_` + Date.now(),
        user: {
          id: `usr_${role}`,
          name,
          email,
          role,
          employeeId: role === 'employee' ? 'emp_002' : 'emp_003',
          avatar: '',
        },
      };
    }
  },

  // Employees
  async getEmployees(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search);
      if (params.department && params.department !== 'All Departments') queryParams.append('department', params.department);
      if (params.status && params.status !== 'All Statuses') queryParams.append('status', params.status);
      if (params.sort) queryParams.append('sort', params.sort);

      const response = await apiClient.get(`/employees?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      let list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      if (params.search?.trim()) {
        const q = params.search.toLowerCase();
        list = list.filter(e => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.designation.toLowerCase().includes(q));
      }
      if (params.department && params.department !== 'All Departments') {
        list = list.filter(e => e.department.toLowerCase() === params.department.toLowerCase());
      }
      if (params.status && params.status !== 'All Statuses') {
        list = list.filter(e => e.status.toLowerCase() === params.status.toLowerCase());
      }
      if (params.sort === 'Name A–Z' || params.sort === 'Name A-Z') list.sort((a, b) => a.name.localeCompare(b.name));
      if (params.sort === 'Oldest') list.sort((a, b) => new Date(a.joinDate) - new Date(b.joinDate));
      return { success: true, count: list.length, data: list, isMock: true };
    }
  },

  async getEmployeeById(id) {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      const emp = list.find(e => e._id === id || e.id === id);
      if (!emp) throw new Error('Employee not found');
      return { success: true, data: emp, isMock: true };
    }
  },

  async createEmployee(data) {
    try {
      const response = await apiClient.post('/employees', data);
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      const newId = 'emp_' + Date.now();
      const newEmp = {
        _id: newId,
        id: newId,
        employeeId: `NEX-${Math.floor(1000 + Math.random() * 9000)}`,
        name: data.name,
        email: data.email,
        department: data.department || 'Engineering',
        designation: data.designation,
        gender: data.gender || 'Male',
        phone: data.phone || '+91 98765 43210',
        status: data.status || 'Active',
        joinDate: data.joinDate || new Date().toISOString().split('T')[0],
        salary: Number(data.salary) || 1200000,
        salaryStructure: {
          basicSalary: Math.round((Number(data.salary) || 1200000) * 0.5 / 12),
          hra: Math.round((Number(data.salary) || 1200000) * 0.2 / 12),
          allowances: Math.round((Number(data.salary) || 1200000) * 0.15 / 12),
          bonus: 5000,
          deductions: Math.round((Number(data.salary) || 1200000) * 0.08 / 12),
          netSalary: Math.round((Number(data.salary) || 1200000) * 0.77 / 12),
        },
        performanceScore: Number(data.performanceScore) || 90,
        avatar: getGenderAvatar(data.name, data.gender, data.avatar),
        bio: data.bio || 'Recently added team member.',
        skills: data.skills || ['Communication', 'Teamwork'],
        createdAt: new Date().toISOString(),
      };
      list.unshift(newEmp);
      saveStored(KEYS.EMPLOYEES, list);
      return { success: true, data: newEmp, isMock: true };
    }
  },

  async updateEmployee(id, data) {
    try {
      const response = await apiClient.put(`/employees/${id}`, data);
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      const idx = list.findIndex(e => e._id === id || e.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...data };
        saveStored(KEYS.EMPLOYEES, list);
        return { success: true, data: list[idx], isMock: true };
      }
      throw new Error('Employee not found');
    }
  },

  async deleteEmployee(id) {
    try {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      let list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      list = list.filter(e => e._id !== id && e.id !== id);
      saveStored(KEYS.EMPLOYEES, list);
      return { success: true, message: 'Deleted', isMock: true };
    }
  },

  async getDashboardStats() {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.EMPLOYEES, INITIAL_EMPLOYEES);
      const total = list.length;
      return {
        success: true,
        stats: {
          totalEmployees: total,
          totalDisplay: total.toString(),
          totalChange: `+${total} team members`,
          engineeringCount: list.filter(e => e.department === 'Engineering').length,
          hrCount: list.filter(e => e.department === 'HR').length,
          salesCount: list.filter(e => e.department === 'Sales').length,
          financeCount: list.filter(e => e.department === 'Finance').length,
          marketingCount: list.filter(e => e.department === 'Marketing').length,
          activeCount: list.filter(e => e.status === 'Active').length,
          onLeaveCount: list.filter(e => e.status === 'On Leave').length,
          activeRate: '96.2%',
          departmentDistribution: [
            { name: 'Engineering', count: list.filter(e => e.department === 'Engineering').length, percentage: 50, color: '#3B82F6' },
            { name: 'HR', count: list.filter(e => e.department === 'HR').length, percentage: 16.7, color: '#8B5CF6' },
            { name: 'Sales', count: list.filter(e => e.department === 'Sales').length, percentage: 16.7, color: '#06B6D4' },
            { name: 'Finance', count: list.filter(e => e.department === 'Finance').length, percentage: 16.6, color: '#10B981' },
          ],
          growthData: [
            { month: 'Jun', employees: 3, engineering: 2 },
            { month: 'Jul', employees: 4, engineering: 2 },
            { month: 'Aug', employees: 5, engineering: 3 },
            { month: 'Sep', employees: 6, engineering: 3 },
            { month: 'Oct', employees: total, engineering: 3 },
          ],
        },
        isMock: true,
      };
    }
  },

  // Attendance
  async checkIn() {
    try {
      const response = await apiClient.post('/attendance/check-in');
      return response.data;
    } catch (error) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const record = {
        _id: 'att_' + Date.now(),
        date: now.toISOString().split('T')[0],
        checkInTime: timeStr,
        checkOutTime: null,
        status: (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) ? 'Late' : 'Present',
        workingHours: 0,
        lateMinutes: (now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 15)) ? (now.getHours() - 9) * 60 + now.getMinutes() : 0,
        notes: 'Recorded in Local Station Engine',
      };
      saveStored(KEYS.ATTENDANCE, [record]);
      return { success: true, message: `Checked in at ${timeStr}`, data: record };
    }
  },

  async checkOut() {
    try {
      const response = await apiClient.post('/attendance/check-out');
      return response.data;
    } catch (error) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const record = {
        _id: 'att_' + Date.now(),
        date: now.toISOString().split('T')[0],
        checkInTime: '09:00 AM',
        checkOutTime: timeStr,
        status: 'Present',
        workingHours: 8.5,
        lateMinutes: 0,
        notes: 'Checked out via Local Station Engine',
      };
      return { success: true, message: `Checked out at ${timeStr}`, data: record };
    }
  },

  async getTodayAttendance() {
    try {
      const response = await apiClient.get('/attendance/today');
      return response.data;
    } catch (error) {
      const stored = getStored(KEYS.ATTENDANCE, []);
      const today = new Date().toISOString().split('T')[0];
      const match = stored.find(a => a.date === today);
      return {
        success: true,
        data: match || null,
        policy: INITIAL_POLICY,
      };
    }
  },

  async getMyAttendanceHistory() {
    try {
      const response = await apiClient.get('/attendance/my-history');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: '1', date: '2026-10-10', checkInTime: '08:58 AM', checkOutTime: '05:45 PM', status: 'Present', workingHours: 8.78 },
          { _id: '2', date: '2026-10-09', checkInTime: '09:05 AM', checkOutTime: '06:10 PM', status: 'Present', workingHours: 9.08 },
          { _id: '3', date: '2026-10-08', checkInTime: '09:22 AM', checkOutTime: '06:00 PM', status: 'Late', workingHours: 8.63 },
          { _id: '4', date: '2026-10-07', checkInTime: '08:55 AM', checkOutTime: '05:30 PM', status: 'Present', workingHours: 8.58 },
          { _id: '5', date: '2026-10-06', checkInTime: '09:00 AM', checkOutTime: '05:40 PM', status: 'Present', workingHours: 8.66 },
        ],
      };
    }
  },

  async getAllAttendance(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/attendance/all?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'att_01', employeeName: 'Marcus Vance', department: 'Engineering', date: '2026-10-11', checkInTime: '08:55 AM', checkOutTime: null, status: 'Present', workingHours: 0 },
          { _id: 'att_02', employeeName: 'Elena Rostova', department: 'Engineering', date: '2026-10-11', checkInTime: '09:08 AM', checkOutTime: null, status: 'Present', workingHours: 0 },
          { _id: 'att_03', employeeName: 'Lucas Dupont', department: 'Engineering', date: '2026-10-11', checkInTime: '09:35 AM', checkOutTime: null, status: 'Late', workingHours: 0 },
          { _id: 'att_04', employeeName: 'Devon Wright', department: 'Sales', date: '2026-10-11', checkInTime: null, checkOutTime: null, status: 'On Leave', workingHours: 0 },
        ],
      };
    }
  },

  async getAttendancePolicy() {
    try {
      const response = await apiClient.get('/attendance/policy');
      return response.data;
    } catch (error) {
      return { success: true, data: getStored(KEYS.POLICY, INITIAL_POLICY) };
    }
  },

  async updateAttendancePolicy(policy) {
    try {
      const response = await apiClient.put('/attendance/policy', policy);
      return response.data;
    } catch (error) {
      saveStored(KEYS.POLICY, policy);
      return { success: true, message: 'Policy updated in local store', data: policy };
    }
  },

  // Leaves
  async applyLeave(leaveData) {
    try {
      const response = await apiClient.post('/leave/apply', leaveData);
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.LEAVES, []);
      const newLeave = {
        _id: 'lv_' + Date.now(),
        employeeId: 'emp_002',
        employeeName: 'Marcus Vance',
        department: 'Engineering',
        leaveType: leaveData.leaveType,
        startDate: leaveData.startDate,
        endDate: leaveData.endDate,
        daysCount: 2,
        reason: leaveData.reason,
        status: 'Pending',
        hrComments: '',
        createdAt: new Date().toISOString(),
      };
      list.unshift(newLeave);
      saveStored(KEYS.LEAVES, list);
      return { success: true, message: 'Leave submitted successfully', data: newLeave };
    }
  },

  async getMyLeaves() {
    try {
      const response = await apiClient.get('/leave/my-leaves');
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.LEAVES, [
        { _id: 'lv_01', employeeName: 'Marcus Vance', department: 'Engineering', leaveType: 'Casual', startDate: '2026-10-20', endDate: '2026-10-22', daysCount: 3, reason: 'Technical Conference', status: 'Approved', hrComments: 'Approved by Sarah Chen' },
      ]);
      return {
        success: true,
        data: list,
        balance: { casualTotal: 12, casualUsed: 3, sickTotal: 10, sickUsed: 0, earnedTotal: 15, earnedUsed: 2, unpaidUsed: 0 },
      };
    }
  },

  async getAllLeaves(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/leave/all?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'lv_01', employeeName: 'Marcus Vance', department: 'Engineering', leaveType: 'Casual', startDate: '2026-10-20', endDate: '2026-10-22', daysCount: 3, reason: 'Conference in Bengaluru', status: 'Approved', hrComments: 'Approved' },
          { _id: 'lv_02', employeeName: 'Lucas Dupont', department: 'Engineering', leaveType: 'Sick', startDate: '2026-10-15', endDate: '2026-10-16', daysCount: 2, reason: 'Medical appointment', status: 'Pending', hrComments: '' },
          { _id: 'lv_03', employeeName: 'Devon Wright', department: 'Sales', leaveType: 'Casual', startDate: '2026-10-11', endDate: '2026-10-11', daysCount: 1, reason: 'Family commitment', status: 'Approved', hrComments: 'Coverage arranged' },
        ],
      };
    }
  },

  async reviewLeave(id, { status, hrComments }) {
    try {
      const response = await apiClient.put(`/leave/review/${id}`, { status, hrComments });
      return response.data;
    } catch (error) {
      return { success: true, message: `Leave request ${status.toLowerCase()}`, data: { id, status, hrComments } };
    }
  },

  // Payroll
  async getAllPayrolls(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/payroll/list?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'pay_1001', slipNumber: 'SLIP-2026-09-002', employeeId: 'emp_002', employeeName: 'Marcus Vance', department: 'Engineering', designation: 'Senior Full-Stack Engineer', payPeriod: '2026-09', basicSalary: 105000, hra: 42000, allowances: 25000, bonus: 8000, deductions: 14000, grossSalary: 180000, netSalary: 166000, status: 'Paid', paymentDate: '2026-09-30' },
          { _id: 'pay_1002', slipNumber: 'SLIP-2026-09-001', employeeId: 'emp_001', employeeName: 'Elena Rostova', department: 'Engineering', designation: 'Principal Architect', payPeriod: '2026-09', basicSalary: 140000, hra: 56000, allowances: 35000, bonus: 15000, deductions: 18500, grossSalary: 246000, netSalary: 227500, status: 'Paid', paymentDate: '2026-09-30' },
          { _id: 'pay_1003', slipNumber: 'SLIP-2026-09-006', employeeId: 'emp_006', employeeName: 'Lucas Dupont', department: 'Engineering', designation: 'Frontend 3D Developer', payPeriod: '2026-09', basicSalary: 87500, hra: 35000, allowances: 20000, bonus: 7000, deductions: 11500, grossSalary: 149500, netSalary: 138000, status: 'Paid', paymentDate: '2026-09-30' },
          { _id: 'pay_1004', slipNumber: 'SLIP-2026-10-002', employeeId: 'emp_002', employeeName: 'Marcus Vance', department: 'Engineering', designation: 'Senior Full-Stack Engineer', payPeriod: '2026-10', basicSalary: 105000, hra: 42000, allowances: 25000, bonus: 8000, deductions: 14000, grossSalary: 180000, netSalary: 166000, status: 'Approved', paymentDate: null },
        ],
      };
    }
  },

  async getMySalarySlips() {
    try {
      const response = await apiClient.get('/payroll/my-slips');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'pay_1001', slipNumber: 'SLIP-2026-09-002', employeeId: 'emp_002', employeeName: 'Marcus Vance', department: 'Engineering', designation: 'Senior Full-Stack Engineer', payPeriod: '2026-09', basicSalary: 105000, hra: 42000, allowances: 25000, bonus: 8000, deductions: 14000, grossSalary: 180000, netSalary: 166000, status: 'Paid', paymentDate: '2026-09-30' },
          { _id: 'pay_1004', slipNumber: 'SLIP-2026-10-002', employeeId: 'emp_002', employeeName: 'Marcus Vance', department: 'Engineering', designation: 'Senior Full-Stack Engineer', payPeriod: '2026-10', basicSalary: 105000, hra: 42000, allowances: 25000, bonus: 8000, deductions: 14000, grossSalary: 180000, netSalary: 166000, status: 'Approved', paymentDate: null },
        ],
      };
    }
  },

  async getSalarySlipById(id) {
    try {
      const response = await apiClient.get(`/payroll/slips/${id}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          _id: id,
          slipNumber: id.includes('SLIP') ? id : 'SLIP-2026-09-002',
          employeeId: 'NEX-1002',
          employeeName: 'Marcus Vance',
          employeeEmail: 'marcus.vance@nexus.io',
          department: 'Engineering',
          designation: 'Senior Full-Stack Engineer',
          payPeriod: '2026-09',
          basicSalary: 105000,
          hra: 42000,
          allowances: 25000,
          bonus: 8000,
          deductions: 14000,
          grossSalary: 180000,
          netSalary: 166000,
          status: 'Paid',
          paymentDate: '2026-09-30',
          paymentMethod: 'Direct Deposit / HDFC Corp Bank',
          remarks: 'Automated disbursement via NEXUS HR Payroll Engine',
        },
      };
    }
  },

  async generatePayroll(payPeriod) {
    try {
      const response = await apiClient.post('/payroll/generate', { payPeriod });
      return response.data;
    } catch (error) {
      return { success: true, message: `Payroll generated for ${payPeriod}`, count: 6 };
    }
  },

  async updatePayrollStatus(id, status) {
    try {
      const response = await apiClient.put(`/payroll/status/${id}`, { status });
      return response.data;
    } catch (error) {
      return { success: true, message: `Payroll status updated to ${status}` };
    }
  },

  // Announcements
  async getAnnouncements(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/announcements?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          {
            _id: 'ann_01',
            title: 'Q4 2026 Enterprise Innovation Summit & Hackathon',
            description: 'Join our annual 48-hour global hackathon exploring Generative AI and real-time visualization tooling. Teams can register up to 4 members with prize pool equivalent to $25,000.',
            category: 'Meeting',
            targetDepartment: 'All',
            isPinned: true,
            publishDate: '2026-10-05T09:00:00.000Z',
            authorName: 'Sarah Chen (Chief People Officer)',
            authorRole: 'HR',
            readBy: [],
          },
          {
            _id: 'ann_02',
            title: 'Diwali & Autumn Festival Office Holidays Schedule',
            description: 'NEXUS HR announces public holidays on Thursday and Friday next week. Core cloud reliability on-call schedules have been published to PagerDuty.',
            category: 'Holiday',
            targetDepartment: 'All',
            isPinned: true,
            publishDate: '2026-10-08T11:00:00.000Z',
            authorName: 'HR Operations',
            authorRole: 'HR',
            readBy: [],
          },
          {
            _id: 'ann_03',
            title: 'Updated Fixed-Time Attendance Grace Period Policy',
            description: 'Effective immediately, the office work start time is 9:00 AM with a 15-minute grace period until 9:15 AM. Check-ins past 10:30 AM will automatically require manager approval or be marked Absent.',
            category: 'Policy Update',
            targetDepartment: 'All',
            isPinned: false,
            publishDate: '2026-10-09T14:30:00.000Z',
            authorName: 'Admin Operations',
            authorRole: 'admin',
            readBy: [],
          },
        ],
      };
    }
  },

  async createAnnouncement(data) {
    try {
      const response = await apiClient.post('/announcements', data);
      return response.data;
    } catch (error) {
      const newAnn = {
        _id: 'ann_' + Date.now(),
        ...data,
        publishDate: new Date().toISOString(),
        authorName: 'HR Lead',
        authorRole: 'HR',
        readBy: [],
      };
      return { success: true, message: 'Announcement published', data: newAnn };
    }
  },

  async markAnnouncementRead(id) {
    try {
      const response = await apiClient.put(`/announcements/${id}/read`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  // Performance & Goals
  async getReviews(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/performance/reviews?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          {
            _id: 'rev_01',
            employeeId: 'emp_002',
            employeeName: 'Marcus Vance',
            reviewerName: 'Elena Rostova (Principal Architect)',
            reviewCycle: 'Q3 2026',
            rating: 4.8,
            criteria: { technicalExecution: 5, leadershipAndInitiative: 4, teamworkAndCulture: 5, communication: 5, velocityAndDelivery: 5 },
            feedback: 'Marcus demonstrated world-class mastery in architecting our high-speed frontend interfaces and GraphQL gateway. Delivered all key sprint epics 2 weeks ahead of schedule.',
            strengths: ['Deep TypeScript & React Expertise', 'High Throughput Under Pressure', 'Clear Technical Documentation'],
            improvementAreas: ['Expanding public talks & engineering blog contributions'],
            status: 'Completed',
          },
        ],
      };
    }
  },

  async createReview(data) {
    try {
      const response = await apiClient.post('/performance/reviews', data);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Review recorded', data };
    }
  },

  async getGoals(params = {}) {
    try {
      const q = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/performance/goals?${q}`);
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'goal_01', employeeName: 'Marcus Vance', title: 'Upgrade Enterprise Micro-Frontend Pipeline to Vite 6', description: 'Streamline build latency from 45s down to sub-10s with optimized chunking.', category: 'Technical Mastery', targetMetric: '100% Migration', progress: 85, deadline: '2026-10-31', status: 'In Progress' },
          { _id: 'goal_02', employeeName: 'Marcus Vance', title: 'Implement Multi-Region Redis Cache Synchronization', description: 'Achieve sub-5ms caching for user sessions and permission verification.', category: 'Productivity', targetMetric: '< 5ms latency', progress: 60, deadline: '2026-11-15', status: 'In Progress' },
        ],
      };
    }
  },

  async createGoal(data) {
    try {
      const response = await apiClient.post('/performance/goals', data);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Goal created', data };
    }
  },

  async updateGoal(id, updates) {
    try {
      const response = await apiClient.put(`/performance/goals/${id}`, updates);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Goal updated', data: updates };
    }
  },

  // Users (Admin only)
  async getUsers() {
    try {
      const response = await apiClient.get('/users');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: [
          { _id: 'usr_admin', name: 'NEXUS Administrator', email: 'admin@nexus.io', role: 'admin', employeeId: 'emp_003', status: 'Active', lastLogin: '2026-10-11T20:00:00Z' },
          { _id: 'usr_hr', name: 'Sarah Chen', email: 'sarah.chen@nexus.io', role: 'hr', employeeId: 'emp_003', status: 'Active', lastLogin: '2026-10-11T19:30:00Z' },
          { _id: 'usr_emp', name: 'Marcus Vance', email: 'marcus.vance@nexus.io', role: 'employee', employeeId: 'emp_002', status: 'Active', lastLogin: '2026-10-11T18:15:00Z' },
          { _id: 'usr_elena', name: 'Elena Rostova', email: 'elena.rostova@nexus.io', role: 'employee', employeeId: 'emp_001', status: 'Active', lastLogin: '2026-10-11T16:00:00Z' },
        ],
      };
    }
  },

  async createUser(userData) {
    try {
      const response = await apiClient.post('/users', userData);
      return response.data;
    } catch (error) {
      return { success: true, message: 'User created in local store', data: userData };
    }
  },

  async updateUserRole(id, role) {
    try {
      const response = await apiClient.put(`/users/${id}/role`, { role });
      return response.data;
    } catch (error) {
      return { success: true, message: `Role updated to ${role}` };
    }
  },

  async toggleUserStatus(id) {
    try {
      const response = await apiClient.put(`/users/${id}/status`);
      return response.data;
    } catch (error) {
      return { success: true, message: 'User status updated' };
    }
  },

  // Departments
  async getDepartments() {
    try {
      const response = await apiClient.get('/departments');
      return response.data;
    } catch (error) {
      return { success: true, data: getStored(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS) };
    }
  },

  async createDepartment(data) {
    try {
      const response = await apiClient.post('/departments', data);
      return response.data;
    } catch (error) {
      const list = getStored(KEYS.DEPARTMENTS, INITIAL_DEPARTMENTS);
      const newD = { _id: 'dept_' + Date.now(), ...data, employeeCount: 0 };
      list.push(newD);
      saveStored(KEYS.DEPARTMENTS, list);
      return { success: true, message: 'Department created', data: newD };
    }
  },

  // Reports
  async getReportsSummary() {
    try {
      const response = await apiClient.get('/reports/summary');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          workforce: {
            totalEmployees: 6,
            activeCount: 5,
            onLeaveCount: 1,
            departmentDistribution: [
              { name: 'Engineering', count: 3, percentage: 50 },
              { name: 'HR', count: 1, percentage: 16.7 },
              { name: 'Sales', count: 1, percentage: 16.7 },
              { name: 'Finance', count: 1, percentage: 16.6 },
            ],
          },
          attendance: {
            presentCount: 2,
            lateCount: 1,
            absentCount: 0,
            onLeaveCount: 1,
            attendanceTrends: [
              { month: 'May', onTimeRate: 91, lateRate: 6, absentRate: 3 },
              { month: 'Jun', onTimeRate: 89, lateRate: 8, absentRate: 3 },
              { month: 'Jul', onTimeRate: 92, lateRate: 5, absentRate: 3 },
              { month: 'Aug', onTimeRate: 94, lateRate: 4, absentRate: 2 },
              { month: 'Sep', onTimeRate: 90, lateRate: 7, absentRate: 3 },
              { month: 'Oct', onTimeRate: 93, lateRate: 5, absentRate: 2 },
            ],
          },
          financials: {
            totalPayrollPaid: 531500,
            salaryByDept: [
              { department: 'Engineering', totalSalary: 6700000, averageSalary: 2233333 },
              { department: 'HR', totalSalary: 2400000, averageSalary: 2400000 },
              { department: 'Sales', totalSalary: 2500000, averageSalary: 2500000 },
              { department: 'Finance', totalSalary: 2250000, averageSalary: 2250000 },
            ],
          },
        },
      };
    }
  },

  // Settings
  async getSettings() {
    try {
      const response = await apiClient.get('/settings');
      return response.data;
    } catch (error) {
      return {
        success: true,
        data: {
          organization: { name: 'NEXUS Systems International', legalEntity: 'NEXUS Enterprise Corp.', timezone: 'Asia/Kolkata', currency: 'INR (₹)', fiscalYearStart: 'April' },
          attendancePolicy: getStored(KEYS.POLICY, INITIAL_POLICY),
        },
      };
    }
  },

  async updateSettings(settings) {
    try {
      const response = await apiClient.put('/settings', settings);
      return response.data;
    } catch (error) {
      return { success: true, message: 'Settings saved' };
    }
  },

  // Notifications
  async getNotifications() {
    try {
      const response = await apiClient.get('/notifications');
      return response.data;
    } catch (error) {
      return {
        success: true,
        unreadCount: 2,
        data: [
          { _id: 'notif_01', title: 'Leave Approved', message: 'Your leave application for Oct 20–22 was approved.', type: 'success', link: '/leave/apply', read: false, createdAt: '2h ago' },
          { _id: 'notif_02', title: 'September Salary Slip Available', message: 'Your slip for pay period 2026-09 is ready.', type: 'info', link: '/payroll', read: false, createdAt: '12h ago' },
          { _id: 'notif_03', title: 'Security Audit Completed', message: 'Monthly access control audit passed with 0 leaks.', type: 'success', link: '/settings', read: true, createdAt: '1d ago' },
        ],
      };
    }
  },

  async markNotificationRead(id) {
    try {
      const response = await apiClient.put(`/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },

  async markAllNotificationsRead() {
    try {
      const response = await apiClient.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      return { success: true };
    }
  },
};

export default api;
