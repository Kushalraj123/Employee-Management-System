import Employee from '../models/Employee.js';

// Get all employees with search, department filter, status filter, and sorting
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status, sort } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All Departments') {
      query.department = department;
    }

    if (status && status !== 'All Statuses') {
      query.status = status;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'Oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'Name A–Z' || sort === 'Name A-Z') {
      sortOptions = { name: 1 };
    } else if (sort === 'Name Z–A' || sort === 'Name Z-A') {
      sortOptions = { name: -1 };
    } else if (sort === 'Department') {
      sortOptions = { department: 1 };
    }

    const employees = await Employee.find(query).sort(sortOptions);

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving employees',
      error: error.message,
    });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }
    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Invalid Employee ID format or server error',
      error: error.message,
    });
  }
};

const MALE_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
];

const FEMALE_AVATARS = [
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
];

const resolveAvatar = (name, gender, avatar) => {
  if (avatar && !avatar.includes('dicebear.com')) return avatar;
  let hash = 0;
  const str = (name || 'Employee').trim().toLowerCase();
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) % 10000;
  const g = (gender || 'Male').toLowerCase();
  if (g === 'female') return FEMALE_AVATARS[Math.abs(hash) % FEMALE_AVATARS.length];
  if (g === 'male') return MALE_AVATARS[Math.abs(hash) % MALE_AVATARS.length];
  return (Math.abs(hash) % 2 === 0 ? MALE_AVATARS : FEMALE_AVATARS)[Math.abs(hash) % 6];
};

// Create new employee
export const createEmployee = async (req, res) => {
  try {
    const { name, email, department, designation, gender, phone, status, joinDate, salary, bio, skills, avatar } = req.body;

    // Check duplicate email
    const existing = await Employee.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email address already exists in the system.',
      });
    }

    const employee = await Employee.create({
      name,
      email,
      department,
      designation,
      gender: gender || 'Male',
      phone,
      status,
      joinDate: joinDate || Date.now(),
      salary: Number(salary) || 95000,
      avatar: resolveAvatar(name, gender, avatar),
      bio,
      skills: skills || ['Communication', 'Teamwork'],
    });

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', '),
      });
    }
    res.status(500).json({
      success: false,
      message: 'Server error creating employee',
      error: error.message,
    });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if email is being updated to an existing one
    if (req.body.email) {
      const existing = await Employee.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'This email is already in use by another employee.',
        });
      }
    }

    const employee = await Employee.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error updating employee',
      error: error.message,
    });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Employee removed successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error deleting employee',
      error: error.message,
    });
  }
};

// Bulk delete employees
export const bulkDeleteEmployees = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of IDs to delete',
      });
    }

    await Employee.deleteMany({ _id: { $in: ids } });

    res.status(200).json({
      success: true,
      message: `${ids.length} employees deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error performing bulk deletion',
      error: error.message,
    });
  }
};

// Stats aggregation
export const getStats = async (req, res) => {
  try {
    const total = await Employee.countDocuments();
    const engineering = await Employee.countDocuments({ department: 'Engineering' });
    const hr = await Employee.countDocuments({ department: 'HR' });
    const sales = await Employee.countDocuments({ department: 'Sales' });
    const finance = await Employee.countDocuments({ department: 'Finance' });
    const marketing = await Employee.countDocuments({ department: 'Marketing' });
    const activeCount = await Employee.countDocuments({ status: 'Active' });
    const onLeaveCount = await Employee.countDocuments({ status: 'On Leave' });

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const growthData = months.map((m, idx) => {
      const factor = (idx + 1) / months.length;
      const empCount = Math.max(1, Math.round(total * factor));
      const engCount = Math.max(0, Math.round(engineering * factor));
      return {
        month: m,
        employees: empCount,
        engineering: engCount,
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        totalEmployees: total,
        totalDisplay: total.toLocaleString(),
        totalChange: `+${total} members`,
        engineeringCount: engineering,
        engineeringShare: total > 0 ? `${((engineering / total) * 100).toFixed(1)}% of workforce` : '0%',
        hrCount: hr,
        hrShare: total > 0 ? `${((hr / total) * 100).toFixed(1)}% of workforce` : '0%',
        salesCount: sales,
        financeCount: finance,
        marketingCount: marketing,
        newEmployees: Math.min(total, 3),
        newShare: 'Recent joiners',
        activeCount,
        onLeaveCount,
        activeRate: total > 0 ? `${((activeCount / total) * 100).toFixed(1)}%` : '100%',
        departmentDistribution: [
          { name: 'Engineering', count: engineering, percentage: total > 0 ? Number(((engineering / total) * 100).toFixed(1)) : 0, color: '#3B82F6' },
          { name: 'HR', count: hr, percentage: total > 0 ? Number(((hr / total) * 100).toFixed(1)) : 0, color: '#8B5CF6' },
          { name: 'Sales', count: sales, percentage: total > 0 ? Number(((sales / total) * 100).toFixed(1)) : 0, color: '#06B6D4' },
          { name: 'Finance', count: finance, percentage: total > 0 ? Number(((finance / total) * 100).toFixed(1)) : 0, color: '#10B981' },
          { name: 'Marketing', count: marketing, percentage: total > 0 ? Number(((marketing / total) * 100).toFixed(1)) : 0, color: '#F59E0B' },
        ],
        growthData,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error computing statistics',
      error: error.message,
    });
  }
};
