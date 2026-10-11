import Employee from '../models/Employee.js';
import { memoryStore } from '../store.js';
import mongoose from 'mongoose';

// Gender-specific default avatar pools
const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
];

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
];

const assignAvatar = (gender, name) => {
  const seed = (name || 'Nexus').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  if (gender === 'Female') {
    return FEMALE_AVATARS[seed % FEMALE_AVATARS.length];
  }
  return MALE_AVATARS[seed % MALE_AVATARS.length];
};

// Mask sensitive salary information if accessed by another regular employee
const sanitizeForRole = (employee, user) => {
  if (!employee) return employee;
  const isDoc = employee.toObject ? employee.toObject() : { ...employee };

  // If user is not HR or Admin and not the owner of this record, mask salary
  if (user && user.role === 'employee') {
    const isOwner = (user.employeeId && (user.employeeId === isDoc._id || user.employeeId === isDoc.id)) ||
                    (user.email && user.email.toLowerCase() === isDoc.email?.toLowerCase());
    if (!isOwner) {
      delete isDoc.salary;
      delete isDoc.salaryStructure;
      isDoc.isSalaryConfidential = true;
    }
  }
  return isDoc;
};

// Get all employees with filtering and sorting
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status, sort } = req.query;
    let list = [];

    if (mongoose.connection.readyState === 1) {
      try {
        let query = {};
        if (search) {
          query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { designation: { $regex: search, $options: 'i' } },
          ];
        }
        if (department && department !== 'All Departments') query.department = department;
        if (status && status !== 'All Statuses') query.status = status;

        let sortOptions = { createdAt: -1 };
        if (sort === 'Oldest') sortOptions = { createdAt: 1 };
        else if (sort === 'Name A–Z' || sort === 'Name A-Z') sortOptions = { name: 1 };
        else if (sort === 'Name Z–A' || sort === 'Name Z-A') sortOptions = { name: -1 };
        else if (sort === 'Department') sortOptions = { department: 1 };

        list = await Employee.find(query).sort(sortOptions);
      } catch (dbErr) {
        list = [...memoryStore.employees];
      }
    } else {
      list = [...memoryStore.employees];
    }

    // In-memory filters if needed
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.designation.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q)
      );
    }
    if (department && department !== 'All Departments') {
      list = list.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'All Statuses') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }

    // Sanitize salary for role
    const sanitized = list.map(emp => sanitizeForRole(emp, req.user));

    return res.status(200).json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve employee directory.',
      error: error.message,
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = null;

    if (mongoose.connection.readyState === 1) {
      try {
        employee = await Employee.findById(id);
      } catch (e) {}
    }

    if (!employee) {
      employee = memoryStore.employees.find(e => e._id === id || e.id === id || e.employeeId === id);
    }

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const sanitized = sanitizeForRole(employee, req.user);

    return res.status(200).json({
      success: true,
      data: sanitized,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create employee
export const createEmployee = async (req, res) => {
  try {
    const data = req.body;

    if (!data.name || !data.email || !data.designation) {
      return res.status(400).json({
        success: false,
        message: 'Name, email address, and designation are mandatory.',
      });
    }

    // Duplicate email check
    const emailExists = memoryStore.employees.some(
      e => e.email.toLowerCase() === data.email.trim().toLowerCase()
    );
    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email address already exists.',
      });
    }

    const newId = 'emp_' + Date.now();
    const avatar = data.avatar || assignAvatar(data.gender, data.name);
    const salary = Number(data.salary) || 1200000;

    const salaryStructure = {
      basicSalary: Math.round(salary * 0.5 / 12),
      hra: Math.round(salary * 0.2 / 12),
      allowances: Math.round(salary * 0.15 / 12),
      bonus: 5000,
      deductions: Math.round(salary * 0.08 / 12),
      netSalary: Math.round(salary * 0.77 / 12),
    };

    const newEmployee = {
      _id: newId,
      id: newId,
      employeeId: `NEX-${Math.floor(1000 + Math.random() * 9000)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      department: data.department || 'Engineering',
      designation: data.designation.trim(),
      gender: data.gender || 'Male',
      phone: data.phone || '+91 98765 43210',
      status: data.status || 'Active',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      salary,
      salaryStructure,
      performanceScore: Number(data.performanceScore) || 90,
      avatar,
      bio: data.bio || 'Enterprise contributor at NEXUS HR.',
      skills: Array.isArray(data.skills) && data.skills.length ? data.skills : ['System Design', 'Collaboration'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const saved = await Employee.create(newEmployee);
        newEmployee._id = saved._id;
      } catch (e) {}
    }

    memoryStore.employees.unshift(newEmployee);

    // Initial leave balance
    memoryStore.leaveBalances[newEmployee._id] = {
      casualTotal: 12,
      casualUsed: 0,
      sickTotal: 10,
      sickUsed: 0,
      earnedTotal: 15,
      earnedUsed: 0,
      unpaidUsed: 0,
    };

    return res.status(201).json({
      success: true,
      message: `Employee ${newEmployee.name} created successfully.`,
      data: newEmployee,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const index = memoryStore.employees.findIndex(e => e._id === id || e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (updates.salary) {
      const salary = Number(updates.salary);
      updates.salaryStructure = {
        basicSalary: Math.round(salary * 0.5 / 12),
        hra: Math.round(salary * 0.2 / 12),
        allowances: Math.round(salary * 0.15 / 12),
        bonus: 5000,
        deductions: Math.round(salary * 0.08 / 12),
        netSalary: Math.round(salary * 0.77 / 12),
      };
    }

    const updated = {
      ...memoryStore.employees[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    memoryStore.employees[index] = updated;

    if (mongoose.connection.readyState === 1) {
      try {
        await Employee.findByIdAndUpdate(id, updates);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const initialLen = memoryStore.employees.length;
    memoryStore.employees = memoryStore.employees.filter(e => e._id !== id && e.id !== id);

    if (memoryStore.employees.length === initialLen) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (mongoose.connection.readyState === 1) {
      try {
        await Employee.findByIdAndDelete(id);
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Bulk delete employees
export const bulkDeleteEmployees = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ success: false, message: 'Array of employee IDs is required.' });
    }

    memoryStore.employees = memoryStore.employees.filter(e => !ids.includes(e._id) && !ids.includes(e.id));

    if (mongoose.connection.readyState === 1) {
      try {
        await Employee.deleteMany({ _id: { $in: ids } });
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `${ids.length} employees deleted successfully.`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Dashboard stats
export const getStats = async (req, res) => {
  try {
    const list = memoryStore.employees;
    const total = list.length;
    const engineering = list.filter(e => e.department === 'Engineering').length;
    const hr = list.filter(e => e.department === 'HR').length;
    const sales = list.filter(e => e.department === 'Sales').length;
    const finance = list.filter(e => e.department === 'Finance').length;
    const marketing = list.filter(e => e.department === 'Marketing').length;
    const activeCount = list.filter(e => e.status === 'Active').length;
    const onLeaveCount = list.filter(e => e.status === 'On Leave').length;

    const departmentDistribution = [
      { name: 'Engineering', count: engineering, percentage: total > 0 ? Number(((engineering / total) * 100).toFixed(1)) : 0, color: '#3B82F6' },
      { name: 'HR', count: hr, percentage: total > 0 ? Number(((hr / total) * 100).toFixed(1)) : 0, color: '#8B5CF6' },
      { name: 'Sales', count: sales, percentage: total > 0 ? Number(((sales / total) * 100).toFixed(1)) : 0, color: '#06B6D4' },
      { name: 'Finance', count: finance, percentage: total > 0 ? Number(((finance / total) * 100).toFixed(1)) : 0, color: '#10B981' },
      { name: 'Marketing', count: marketing, percentage: total > 0 ? Number(((marketing / total) * 100).toFixed(1)) : 0, color: '#F59E0B' },
    ];

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const growthData = months.map((m, idx) => ({
      month: m,
      employees: Math.max(1, Math.round(total * ((idx + 1) / months.length))),
      engineering: Math.max(0, Math.round(engineering * ((idx + 1) / months.length))),
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: total,
        totalDisplay: total.toLocaleString(),
        totalChange: `+${total} members`,
        engineeringCount: engineering,
        engineeringShare: total > 0 ? `${((engineering / total) * 100).toFixed(1)}%` : '0%',
        hrCount: hr,
        hrShare: total > 0 ? `${((hr / total) * 100).toFixed(1)}%` : '0%',
        salesCount: sales,
        financeCount: finance,
        marketingCount: marketing,
        newEmployees: Math.min(total, 3),
        newShare: 'Recent joiners',
        activeCount,
        onLeaveCount,
        activeRate: total > 0 ? `${((activeCount / total) * 100).toFixed(1)}%` : '100%',
        departmentDistribution,
        growthData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
