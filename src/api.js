import axios from 'axios';

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

// Configure auth token on startup (session-scoped)
const initialToken = typeof window !== 'undefined' ? sessionStorage.getItem('nexus_auth_token') : null;
if (initialToken) {
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${initialToken}`;
}

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Drop empty / "All" style filters and build a query string
const toQuery = (params = {}, ignore = []) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (ignore.includes(value)) return;
    q.append(key, value);
  });
  const str = q.toString();
  return str ? `?${str}` : '';
};

const get = async (url, config) => (await apiClient.get(url, config)).data;
const post = async (url, body) => (await apiClient.post(url, body)).data;
const put = async (url, body) => (await apiClient.put(url, body)).data;
const del = async (url) => (await apiClient.delete(url)).data;

// All data comes from the backend API.
export const api = {
  setAuthToken,

  // Health & Docs
  async checkBackendHealth() {
    try {
      const data = await get('/health', { timeout: 4000 });
      return { isLive: true, data };
    } catch (err) {
      return { isLive: false, error: err.message };
    }
  },
  getApiDocs: () => get('/docs'),

  // Auth
  login: (credentials) => post('/auth/login', credentials),
  demoLogin: (role, email) => post('/auth/demo-login', { role, email }),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (payload) => post('/auth/reset-password', payload),

  // Employees & 3D Org Network
  getEmployees: (params = {}) =>
    get(`/employees${toQuery(params, ['All Departments', 'All Statuses', 'All Managers'])}`),
  getEmployeeById: (id) => get(`/employees/${id}`),
  createEmployee: (data) => post('/employees', data),
  updateEmployee: (id, data) => put(`/employees/${id}`, data),
  deleteEmployee: (id) => del(`/employees/${id}`),
  bulkDeleteEmployees: (ids = []) => post('/employees/bulk-delete', { ids }),
  addEmployeeDocument: (id, docData) => post(`/employees/${id}/documents`, docData),
  deleteEmployeeDocument: (id, docId) => del(`/employees/${id}/documents/${docId}`),
  getOrgNetwork: () => get('/org-network'),

  // Dashboard stats
  getDashboardStats: () => get('/stats'),

  // Attendance & Holidays
  checkIn: () => post('/attendance/check-in'),
  checkOut: () => post('/attendance/check-out'),
  resetTodayAttendance: () => post('/attendance/reset-today'),
  regularizeAttendance: (payload) => post('/attendance/regularize', payload),
  approveAttendance: (id, payload) => put(`/attendance/approve/${id}`, payload),
  getTodayAttendance: () => get('/attendance/today'),
  getMyAttendanceHistory: () => get('/attendance/my-history'),
  getAllAttendance: (params = {}) => get(`/attendance/all${toQuery(params)}`),
  getHolidays: () => get('/attendance/holidays'),
  addHoliday: (data) => post('/attendance/holidays', data),
  getAttendancePolicy: () => get('/attendance/policy'),
  updateAttendancePolicy: (policy) => put('/attendance/policy', policy),

  // Leaves & Team Calendar
  applyLeave: (leaveData) => post('/leave/apply', leaveData),
  getMyLeaves: () => get('/leave/my-leaves'),
  getMyLeaveBalance: () => get('/leave/my-balance'),
  getTeamLeaveCalendar: (params = {}) => get(`/leave/calendar${toQuery(params)}`),
  getAllLeaves: (params = {}) => get(`/leave/all${toQuery(params)}`),
  reviewLeave: (id, { status, hrComments }) =>
    put(`/leave/review/${id}`, { status, hrComments }),

  // Payroll & Configurable Rules
  getAllPayrolls: (params = {}) => get(`/payroll/list${toQuery(params)}`),
  getMySalarySlips: (params = {}) => get(`/payroll/my-slips${toQuery(params)}`),
  getSalarySlipById: (id) => get(`/payroll/slips/${id}`),
  generatePayroll: (payPeriod, useDynamicRules = true) =>
    post('/payroll/generate', { payPeriod, useDynamicRules }),
  updatePayrollStatus: (id, status) => put(`/payroll/status/${id}`, { status }),
  getPayrollStats: () => get('/payroll/stats'),
  getPayrollRules: () => get('/payroll/rules'),
  updatePayrollRules: (rules) => put('/payroll/rules', rules),

  // Recruitment & ATS
  getJobOpenings: (params = {}) => get(`/recruitment/jobs${toQuery(params)}`),
  createJobOpening: (data) => post('/recruitment/jobs', data),
  updateJobOpening: (id, data) => put(`/recruitment/jobs/${id}`, data),
  getCandidates: (params = {}) => get(`/recruitment/candidates${toQuery(params)}`),
  createCandidate: (data) => post('/recruitment/candidates', data),
  updateCandidateStage: (id, stage) => put(`/recruitment/candidates/${id}/stage`, { stage }),
  scheduleInterview: (id, data) => post(`/recruitment/candidates/${id}/interview`, data),
  addInterviewFeedback: (id, data) => post(`/recruitment/candidates/${id}/feedback`, data),
  screenResumeWithAI: (payload) => post('/recruitment/ai-screen', payload),
  getRecruitmentAnalytics: () => get('/recruitment/analytics'),

  // Announcements & Employee Recognition (Kudos)
  getAnnouncements: (params = {}) => get(`/announcements${toQuery(params)}`),
  createAnnouncement: (data) => post('/announcements', data),
  markAnnouncementRead: (id) => put(`/announcements/${id}/read`),
  deleteAnnouncement: (id) => del(`/announcements/${id}`),
  getKudos: () => get('/announcements/kudos'),
  sendKudos: (data) => post('/announcements/kudos', data),
  likeKudos: (id) => put(`/announcements/kudos/${id}/like`),

  // Performance, Self-Assessment & Skill Matrix
  getReviews: (params = {}) => get(`/performance/reviews${toQuery(params)}`),
  createReview: (data) => post('/performance/reviews', data),
  submitSelfAssessment: (data) => post('/performance/self-assessment', data),
  updateSkillMatrix: (employeeId, skillMatrix) =>
    put(`/performance/skills/${employeeId}`, { skillMatrix }),
  getPerformanceAnalytics: () => get('/performance/analytics'),
  getGoals: (params = {}) => get(`/performance/goals${toQuery(params)}`),
  createGoal: (data) => post('/performance/goals', data),
  updateGoal: (id, updates) => put(`/performance/goals/${id}`, updates),

  // Users, Permissions & Security Audit Logs
  getUsers: () => get('/users'),
  createUser: (userData) => post('/users', userData),
  updateUserRole: (id, role) => put(`/users/${id}/role`, { role }),
  updateRolePermissions: (role, permissions) =>
    put(`/users/permissions/${role}`, { permissions }),
  toggleUserStatus: (id) => put(`/users/${id}/status`),
  getAuditLogs: (limit = 50) => get(`/users/audit-logs?limit=${limit}`),

  // Departments
  getDepartments: () => get('/departments'),
  createDepartment: (data) => post('/departments', data),

  // Reports & settings
  getReportsSummary: (params = {}) => get(`/reports/summary${toQuery(params)}`),
  getSettings: () => get('/settings'),
  updateSettings: (settings) => put('/settings', settings),

  // Notifications
  getNotifications: () => get('/notifications'),
  markNotificationRead: (id) => put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => put('/notifications/read-all'),

  // AI Agent Copilot, Workforce Analytics & AI Report Generator
  chatWithAI: (payload) => post('/ai/chat', payload),
  executeAIAction: (payload) => post('/ai/action', payload),
  getAICapabilities: () => get('/ai/capabilities'),
  getAIInsights: () => get('/ai/insights'),
  getAIWorkforceAnalytics: () => get('/ai/workforce-analytics'),
  generateAIReport: (payload) => post('/ai/generate-report', payload),
};

export default api;
