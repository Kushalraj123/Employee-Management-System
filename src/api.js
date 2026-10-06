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

// Seed data for initial experience & offline/mock fallback
const INITIAL_EMPLOYEES = [
  {
    _id: 'emp_001',
    id: 'emp_001',
    name: 'Elena Rostova',
    email: 'elena.rostova@nexus.io',
    department: 'Engineering',
    designation: 'Principal Architect & VP Tech',
    gender: 'Female',
    phone: '+91 98201 23456',
    status: 'Active',
    joinDate: '2022-03-15',
    salary: 2850000,
    performanceScore: 98,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    bio: 'Leads distributed systems engineering and AI integration for core enterprise platforms.',
    skills: ['Kubernetes', 'Go', 'React', 'Cloud Architecture', 'System Design'],
    createdAt: '2022-03-15T09:00:00.000Z',
    updatedAt: '2026-09-12T14:30:00.000Z',
  },
  {
    _id: 'emp_002',
    id: 'emp_002',
    name: 'Marcus Vance',
    email: 'marcus.vance@nexus.io',
    department: 'Engineering',
    designation: 'Senior Full-Stack Engineer',
    gender: 'Male',
    phone: '+91 98450 34567',
    status: 'Active',
    joinDate: '2023-01-10',
    salary: 2100000,
    performanceScore: 94,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    bio: 'Specialist in high-throughput React frontends and Node.js microservices.',
    skills: ['TypeScript', 'Node.js', 'PostgreSQL', 'GraphQL', 'Next.js'],
    createdAt: '2023-01-10T10:15:00.000Z',
    updatedAt: '2026-08-20T11:00:00.000Z',
  },
  {
    _id: 'emp_003',
    id: 'emp_003',
    name: 'Sarah Chen',
    email: 'sarah.chen@nexus.io',
    department: 'HR',
    designation: 'Chief People Officer',
    gender: 'Female',
    phone: '+91 98100 45678',
    status: 'Active',
    joinDate: '2021-08-01',
    salary: 2400000,
    performanceScore: 96,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    bio: 'Directs global talent acquisition, workplace culture, and leadership development programs.',
    skills: ['Talent Strategy', 'People Analytics', 'Compensation', 'Culture Building'],
    createdAt: '2021-08-01T08:30:00.000Z',
    updatedAt: '2026-09-01T16:45:00.000Z',
  },
  {
    _id: 'emp_004',
    id: 'emp_004',
    name: 'Devon Wright',
    email: 'devon.wright@nexus.io',
    department: 'Sales',
    designation: 'VP Enterprise Sales',
    gender: 'Male',
    phone: '+91 99887 56789',
    status: 'Active',
    joinDate: '2022-11-20',
    salary: 2500000,
    performanceScore: 91,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    bio: 'Drives global enterprise revenue growth and strategic customer partnerships.',
    skills: ['Enterprise SaaS', 'Key Account Strategy', 'Pipeline Mgmt', 'Negotiation'],
    createdAt: '2022-11-20T11:00:00.000Z',
    updatedAt: '2026-07-19T13:20:00.000Z',
  },
  {
    _id: 'emp_005',
    id: 'emp_005',
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@nexus.io',
    department: 'Finance',
    designation: 'Director of Strategic Finance',
    gender: 'Female',
    phone: '+91 97654 67890',
    status: 'Active',
    joinDate: '2022-05-14',
    salary: 2250000,
    performanceScore: 95,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    bio: 'Oversees financial planning, operational budgeting, and corporate fiscal governance.',
    skills: ['Financial Modeling', 'Forecasting', 'Cap Table Management', 'Tax Strategy'],
    createdAt: '2022-05-14T09:45:00.000Z',
    updatedAt: '2026-08-30T10:15:00.000Z',
  },
  {
    _id: 'emp_006',
    id: 'emp_006',
    name: 'Liam Gallagher',
    email: 'liam.gallagher@nexus.io',
    department: 'Marketing',
    designation: 'Head of Brand & Growth',
    gender: 'Male',
    phone: '+91 98234 78901',
    status: 'Active',
    joinDate: '2023-04-18',
    salary: 1950000,
    performanceScore: 89,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    bio: 'Orchestrates product marketing launches, SEO strategies, and developer relations.',
    skills: ['Product Growth', 'Content Strategy', 'Paid Media', 'Brand Marketing'],
    createdAt: '2023-04-18T14:00:00.000Z',
    updatedAt: '2026-09-15T09:10:00.000Z',
  },
  {
    _id: 'emp_007',
    id: 'emp_007',
    name: 'Kavita Patel',
    email: 'kavita.patel@nexus.io',
    department: 'Engineering',
    designation: 'Staff DevOps & Cloud Specialist',
    gender: 'Female',
    phone: '+91 98401 89012',
    status: 'On Leave',
    joinDate: '2023-09-01',
    salary: 2150000,
    performanceScore: 92,
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
    bio: 'Manages multi-region AWS/GCP Kubernetes clusters and CI/CD pipelines.',
    skills: ['Terraform', 'AWS', 'Docker', 'Kubernetes', 'Prometheus'],
    createdAt: '2023-09-01T08:00:00.000Z',
    updatedAt: '2026-08-10T15:00:00.000Z',
  },
  {
    _id: 'emp_008',
    id: 'emp_008',
    name: 'Lucas Dupont',
    email: 'lucas.dupont@nexus.io',
    department: 'Engineering',
    designation: 'Frontend 3D/WebGL Developer',
    gender: 'Male',
    phone: '+91 98312 90123',
    status: 'Active',
    joinDate: '2024-02-15',
    salary: 1750000,
    performanceScore: 97,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    bio: 'Creates interactive 3D web applications, animations, and high-performance visual tools.',
    skills: ['Three.js', 'WebGL', 'GLSL Shaders', 'React Three Fiber', 'TailwindCSS'],
    createdAt: '2024-02-15T11:30:00.000Z',
    updatedAt: '2026-09-20T17:00:00.000Z',
  },
  {
    _id: 'emp_009',
    id: 'emp_009',
    name: 'Zoe Martinez',
    email: 'zoe.martinez@nexus.io',
    department: 'HR',
    designation: 'Senior Talent Partner',
    gender: 'Female',
    phone: '+91 98990 01234',
    status: 'Active',
    joinDate: '2023-06-10',
    salary: 1350000,
    performanceScore: 90,
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
    bio: 'Manages engineering and design hiring pipelines across North America and Europe.',
    skills: ['Technical Recruiting', 'Interviewing', 'Onboarding', 'Candidate Experience'],
    createdAt: '2023-06-10T10:00:00.000Z',
    updatedAt: '2026-07-25T11:40:00.000Z',
  },
  {
    _id: 'emp_010',
    id: 'emp_010',
    name: 'Alexander Novak',
    email: 'alex.novak@nexus.io',
    department: 'Finance',
    designation: 'Senior Financial Analyst',
    gender: 'Male',
    phone: '+91 98112 12345',
    status: 'Inactive',
    joinDate: '2022-01-20',
    salary: 1550000,
    performanceScore: 82,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    bio: 'Analyzed SaaS metrics, customer lifetime values, and cohort margins.',
    skills: ['SQL', 'Tableau', 'Variance Analysis', 'SaaS Metrics'],
    createdAt: '2022-01-20T09:00:00.000Z',
    updatedAt: '2026-06-15T12:00:00.000Z',
  },
  {
    _id: 'emp_011',
    id: 'emp_011',
    name: 'Priya Sharma',
    email: 'priya.sharma@nexus.io',
    department: 'Engineering',
    designation: 'Machine Learning Engineer',
    gender: 'Female',
    phone: '+91 98765 23456',
    status: 'Active',
    joinDate: '2024-05-01',
    salary: 2200000,
    performanceScore: 95,
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    bio: 'Designs predictive workplace analytics models and natural language search agents.',
    skills: ['PyTorch', 'Transformers', 'Python', 'FastAPI', 'Vector Databases'],
    createdAt: '2024-05-01T10:00:00.000Z',
    updatedAt: '2026-09-18T14:15:00.000Z',
  },
  {
    _id: 'emp_012',
    id: 'emp_012',
    name: 'Jordan Brooks',
    email: 'jordan.brooks@nexus.io',
    department: 'Sales',
    designation: 'Senior Account Executive',
    gender: 'Male',
    phone: '+91 99000 34567',
    status: 'Active',
    joinDate: '2024-08-12',
    salary: 1650000,
    performanceScore: 88,
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    bio: 'Focuses on mid-market SaaS expansion and client retention.',
    skills: ['B2B Sales', 'CRM Solutions', 'Demo Delivery', 'Contract Closing'],
    createdAt: '2024-08-12T09:30:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z',
  }
];

const LOCAL_STORAGE_KEY = 'nexus_employees_db';

// Helper for local mock storage
const getLocalData = () => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    return [...INITIAL_EMPLOYEES];
  }
  try {
    const list = JSON.parse(data);
    let changed = false;
    const sanitized = list.map((emp) => {
      const properAvatar = getGenderAvatar(emp.name, emp.gender, emp.avatar);
      if (properAvatar !== emp.avatar) {
        changed = true;
        return { ...emp, avatar: properAvatar };
      }
      return emp;
    });
    if (changed) {
      saveLocalData(sanitized);
    }
    return sanitized;
  } catch (e) {
    return [...INITIAL_EMPLOYEES];
  }
};

const saveLocalData = (data) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
};

export const api = {
  // Check whether backend is live
  async checkBackendHealth() {
    try {
      const response = await apiClient.get('/health', { timeout: 15000 });
      return { isLive: true, data: response.data };
    } catch (err) {
      return { isLive: false, error: err.message };
    }
  },

  // Reset local mock database
  resetMockData() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_EMPLOYEES));
    return [...INITIAL_EMPLOYEES];
  },

  // Get all employees with filtering, searching, and sorting
  async getEmployees(params = {}) {
    const { search = '', department = '', status = '', sort = 'Newest' } = params;

    try {
      // Attempt live backend first
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (department && department !== 'All Departments') queryParams.append('department', department);
      if (status && status !== 'All Statuses') queryParams.append('status', status);
      if (sort) queryParams.append('sort', sort);

      const response = await apiClient.get(`/employees?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.warn('Backend unavailable, using rich local data store fallback:', error.message);
      
      let list = getLocalData();

      // Search filter
      if (search.trim()) {
        const query = search.toLowerCase().trim();
        list = list.filter(emp =>
          emp.name.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query) ||
          emp.designation.toLowerCase().includes(query) ||
          emp.department.toLowerCase().includes(query)
        );
      }

      // Department filter
      if (department && department !== 'All Departments') {
        list = list.filter(emp => emp.department.toLowerCase() === department.toLowerCase());
      }

      // Status filter
      if (status && status !== 'All Statuses') {
        list = list.filter(emp => emp.status.toLowerCase() === status.toLowerCase());
      }

      // Sort
      if (sort === 'Newest') {
        list.sort((a, b) => new Date(b.joinDate || b.createdAt) - new Date(a.joinDate || a.createdAt));
      } else if (sort === 'Oldest') {
        list.sort((a, b) => new Date(a.joinDate || a.createdAt) - new Date(b.joinDate || b.createdAt));
      } else if (sort === 'Name A–Z' || sort === 'Name A-Z') {
        list.sort((a, b) => a.name.localeCompare(b.name));
      } else if (sort === 'Name Z–A' || sort === 'Name Z-A') {
        list.sort((a, b) => b.name.localeCompare(a.name));
      } else if (sort === 'Department') {
        list.sort((a, b) => a.department.localeCompare(b.department));
      }

      return {
        success: true,
        count: list.length,
        data: list,
        isMock: true,
      };
    }
  },

  // Get single employee by ID
  async getEmployeeById(id) {
    try {
      const response = await apiClient.get(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend fetch failed, searching local store:', error.message);
      const list = getLocalData();
      const employee = list.find(emp => emp._id === id || emp.id === id);
      if (!employee) {
        throw new Error('Employee not found');
      }
      return { success: true, data: employee, isMock: true };
    }
  },

  // Create new employee
  async createEmployee(employeeData) {
    try {
      const response = await apiClient.post('/employees', employeeData);
      return response.data;
    } catch (error) {
      console.warn('Backend create failed, creating in local store:', error.message);
      const list = getLocalData();

      // Check duplicate email
      const emailExists = list.some(
        emp => emp.email.toLowerCase() === employeeData.email.toLowerCase()
      );
      if (emailExists) {
        const err = new Error('An employee with this email address already exists.');
        err.response = { status: 409, data: { message: 'An employee with this email address already exists.' } };
        throw err;
      }

      const newId = 'emp_' + Math.random().toString(36).substring(2, 9);
      const newEmployee = {
        _id: newId,
        id: newId,
        name: employeeData.name.trim(),
        email: employeeData.email.trim().toLowerCase(),
        department: employeeData.department || 'Engineering',
        designation: employeeData.designation.trim(),
        gender: employeeData.gender || 'Male',
        phone: employeeData.phone || '+91 98765 43210',
        status: employeeData.status || 'Active',
        joinDate: employeeData.joinDate || new Date().toISOString().split('T')[0],
        salary: Number(employeeData.salary) || 1400000,
        performanceScore: Number(employeeData.performanceScore) || 90,
        avatar: getGenderAvatar(employeeData.name, employeeData.gender, employeeData.avatar),
        bio: employeeData.bio || 'Recently onboarded team member contributing to strategic goals.',
        skills: employeeData.skills && employeeData.skills.length ? employeeData.skills : ['Teamwork', 'Communication', 'Problem Solving'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      list.unshift(newEmployee);
      saveLocalData(list);

      return {
        success: true,
        message: 'Employee created successfully',
        data: newEmployee,
        isMock: true,
      };
    }
  },

  // Update existing employee
  async updateEmployee(id, updateData) {
    try {
      const response = await apiClient.put(`/employees/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.warn('Backend update failed, updating local store:', error.message);
      const list = getLocalData();
      const index = list.findIndex(emp => emp._id === id || emp.id === id);

      if (index === -1) {
        const err = new Error('Employee not found');
        err.response = { status: 404, data: { message: 'Employee not found' } };
        throw err;
      }

      // Check email uniqueness if email modified
      if (updateData.email && updateData.email.toLowerCase() !== list[index].email.toLowerCase()) {
        const emailTaken = list.some(
          (emp, idx) => idx !== index && emp.email.toLowerCase() === updateData.email.toLowerCase()
        );
        if (emailTaken) {
          const err = new Error('An employee with this email address already exists.');
          err.response = { status: 409, data: { message: 'Email address is already in use.' } };
          throw err;
        }
      }

      const updated = {
        ...list[index],
        ...updateData,
        avatar: getGenderAvatar(
          updateData.name || list[index].name,
          updateData.gender || list[index].gender,
          updateData.avatar || list[index].avatar
        ),
        updatedAt: new Date().toISOString(),
      };

      list[index] = updated;
      saveLocalData(list);

      return {
        success: true,
        message: 'Employee information updated',
        data: updated,
        isMock: true,
      };
    }
  },

  // Delete employee
  async deleteEmployee(id) {
    try {
      const response = await apiClient.delete(`/employees/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Backend delete failed, deleting from local store:', error.message);
      let list = getLocalData();
      const initialLength = list.length;
      list = list.filter(emp => emp._id !== id && emp.id !== id);

      if (list.length === initialLength) {
        const err = new Error('Employee not found');
        err.response = { status: 404, data: { message: 'Employee not found' } };
        throw err;
      }

      saveLocalData(list);
      return {
        success: true,
        message: 'Employee deleted successfully',
        isMock: true,
      };
    }
  },

  // Bulk delete employees
  async bulkDeleteEmployees(ids) {
    try {
      const response = await apiClient.post('/employees/bulk-delete', { ids });
      return response.data;
    } catch (error) {
      let list = getLocalData();
      list = list.filter(emp => !ids.includes(emp._id) && !ids.includes(emp.id));
      saveLocalData(list);
      return {
        success: true,
        message: `${ids.length} employees deleted successfully`,
        isMock: true,
      };
    }
  },

  // Overview statistics
  async getDashboardStats() {
    try {
      const response = await apiClient.get('/stats');
      return response.data;
    } catch (error) {
      const list = getLocalData();
      const total = list.length;
      const engineering = list.filter(e => e.department === 'Engineering').length;
      const hr = list.filter(e => e.department === 'HR').length;
      const sales = list.filter(e => e.department === 'Sales').length;
      const finance = list.filter(e => e.department === 'Finance').length;
      const marketing = list.filter(e => e.department === 'Marketing').length;
      const activeCount = list.filter(e => e.status === 'Active').length;
      const onLeaveCount = list.filter(e => e.status === 'On Leave').length;

      return {
        success: true,
        stats: {
          totalEmployees: total,
          totalDisplay: '1,248',
          totalChange: '+12 this month',
          engineeringCount: 428,
          engineeringShare: '34.3% of workforce',
          hrCount: 86,
          hrShare: '6.9% of workforce',
          newEmployees: 24,
          newShare: 'This month',
          activeRate: '94.2%',
          departmentDistribution: [
            { name: 'Engineering', count: 428, percentage: 34.3, color: '#3B82F6' },
            { name: 'HR', count: 86, percentage: 6.9, color: '#8B5CF6' },
            { name: 'Sales', count: 312, percentage: 25.0, color: '#06B6D4' },
            { name: 'Finance', count: 184, percentage: 14.7, color: '#10B981' },
            { name: 'Marketing', count: 238, percentage: 19.1, color: '#F59E0B' },
          ],
          growthData: [
            { month: 'Apr', employees: 1080, engineering: 370, newHires: 14 },
            { month: 'May', employees: 1115, engineering: 382, newHires: 18 },
            { month: 'Jun', employees: 1150, engineering: 395, newHires: 22 },
            { month: 'Jul', employees: 1182, engineering: 405, newHires: 16 },
            { month: 'Aug', employees: 1210, engineering: 415, newHires: 19 },
            { month: 'Sep', employees: 1236, engineering: 422, newHires: 21 },
            { month: 'Oct', employees: 1248, engineering: 428, newHires: 24 },
          ],
        },
        isMock: true,
      };
    }
  },
};

export default api;
