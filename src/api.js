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

// All data comes from the backend API. No local/mock fallbacks.
export const api = {
  setAuthToken,

  // Health
  async checkBackendHealth() {
    try {
      const data = await get('/health', { timeout: 4000 });
      return { isLive: true, data };
    } catch (err) {
      return { isLive: false, error: err.message };
    }
  },

  // Auth
  login: (credentials) => post('/auth/login', credentials),
  demoLogin: (role, email) => post('/auth/demo-login', { role, email }),
  forgotPassword: (email) => post('/auth/forgot-password', { email }),
  resetPassword: (payload) => post('/auth/reset-password', payload),

  // Employees
  getEmployees: (params = {}) =>
    get(`/employees${toQuery(params, ['All Departments', 'All Statuses'])}`),
  getEmployeeById: (id) => get(`/employees/${id}`),
  createEmployee: (data) => post('/employees', data),
  updateEmployee: (id, data) => put(`/employees/${id}`, data),
  deleteEmployee: (id) => del(`/employees/${id}`),
  bulkDeleteEmployees: (ids = []) => post('/employees/bulk-delete', { ids }),

  // Dashboard stats
  getDashboardStats: () => get('/stats'),

  // Attendance
  checkIn: () => post('/attendance/check-in'),
  checkOut: () => post('/attendance/check-out'),
  resetTodayAttendance: () => post('/attendance/reset-today'),
  getTodayAttendance: () => get('/attendance/today'),
  getMyAttendanceHistory: () => get('/attendance/my-history'),
  getAllAttendance: (params = {}) => get(`/attendance/all${toQuery(params)}`),
  getAttendancePolicy: () => get('/attendance/policy'),
  updateAttendancePolicy: (policy) => put('/attendance/policy', policy),

  // Leaves
  applyLeave: (leaveData) => post('/leave/apply', leaveData),
  getMyLeaves: () => get('/leave/my-leaves'),
  getAllLeaves: (params = {}) => get(`/leave/all${toQuery(params)}`),
  reviewLeave: (id, { status, hrComments }) =>
    put(`/leave/review/${id}`, { status, hrComments }),

  // Payroll
  getAllPayrolls: (params = {}) => get(`/payroll/list${toQuery(params)}`),
  getMySalarySlips: (params = {}) => get(`/payroll/my-slips${toQuery(params)}`),
  getSalarySlipById: (id) => get(`/payroll/slips/${id}`),
  generatePayroll: (payPeriod) => post('/payroll/generate', { payPeriod }),
  updatePayrollStatus: (id, status) => put(`/payroll/status/${id}`, { status }),

  // Announcements
  getAnnouncements: (params = {}) => get(`/announcements${toQuery(params)}`),
  createAnnouncement: (data) => post('/announcements', data),
  markAnnouncementRead: (id) => put(`/announcements/${id}/read`),

  // Performance
  getReviews: (params = {}) => get(`/performance/reviews${toQuery(params)}`),
  createReview: (data) => post('/performance/reviews', data),
  getGoals: (params = {}) => get(`/performance/goals${toQuery(params)}`),
  createGoal: (data) => post('/performance/goals', data),
  updateGoal: (id, updates) => put(`/performance/goals/${id}`, updates),

  // Users
  getUsers: () => get('/users'),
  createUser: (userData) => post('/users', userData),
  updateUserRole: (id, role) => put(`/users/${id}/role`, { role }),
  toggleUserStatus: (id) => put(`/users/${id}/status`),

  // Departments
  getDepartments: () => get('/departments'),
  createDepartment: (data) => post('/departments', data),

  // Reports & settings
  getReportsSummary: () => get('/reports/summary'),
  getSettings: () => get('/settings'),
  updateSettings: (settings) => put('/settings', settings),

  // Notifications
  getNotifications: () => get('/notifications'),
  markNotificationRead: (id) => put(`/notifications/${id}/read`),
  markAllNotificationsRead: () => put('/notifications/read-all'),
};

export default api;
