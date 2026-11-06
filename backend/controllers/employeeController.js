import Employee from '../models/Employee.js';
import { memoryStore, recordAuditLog } from '../store.js';
import mongoose from 'mongoose';

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

// Mask sensitive salary and private documents if accessed by another regular employee
const sanitizeForRole = (employee, user) => {
  if (!employee) return employee;
  const isDoc = employee.toObject ? employee.toObject() : { ...employee };

  if (user && user.role === 'employee') {
    const isOwner =
      (user.employeeId && (user.employeeId === isDoc._id || user.employeeId === isDoc.id)) ||
      (user.email && user.email.toLowerCase() === isDoc.email?.toLowerCase());
    if (!isOwner) {
      delete isDoc.salary;
      delete isDoc.salaryStructure;
      delete isDoc.documents;
      isDoc.isSalaryConfidential = true;
    }
  }
  return isDoc;
};

// Get all employees with filtering and sorting
export const getEmployees = async (req, res) => {
  try {
    const { search, department, status, sort, manager } = req.query;
    let list = [...memoryStore.employees];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          (e.designation && e.designation.toLowerCase().includes(q)) ||
          (e.department && e.department.toLowerCase().includes(q)) ||
          (e.employeeId && e.employeeId.toLowerCase().includes(q)) ||
          (e.skills && e.skills.some(s => s.toLowerCase().includes(q)))
      );
    }
    if (department && department !== 'All Departments' && department !== 'All') {
      list = list.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }
    if (status && status !== 'All Statuses' && status !== 'All') {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (manager && manager !== 'All') {
      list = list.filter(
        e =>
          (e.reportingManager && e.reportingManager.toLowerCase().includes(manager.toLowerCase())) ||
          e.reportingManagerId === manager
      );
    }

    if (sort === 'Name A–Z' || sort === 'Name A-Z') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'Name Z–A' || sort === 'Name Z-A') {
      list.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'Department') {
      list.sort((a, b) => a.department.localeCompare(b.department));
    } else if (sort === 'Performance') {
      list.sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0));
    }

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

// Get 3D Organizational Network Hierarchy Data
export const getOrgNetworkData = async (req, res) => {
  try {
    const employees = memoryStore.employees;
    const departments = memoryStore.departments;

    const nodes = employees.map(e => ({
      id: e._id || e.id,
      employeeId: e.employeeId || 'NEX-1000',
      name: e.name,
      email: e.email,
      department: e.department,
      designation: e.designation,
      roleLevel: e.roleLevel || 'Senior',
      reportingManager: e.reportingManager || 'Vikramaditya Rao',
      reportingManagerId: e.reportingManagerId || 'emp_000',
      status: e.status || 'Active',
      performanceScore: e.performanceScore || 92,
      joinDate: e.joinDate,
      location: e.location || 'Bengaluru HQ',
      skills: e.skills || [],
      avatar: e.avatar,
      phone: e.phone,
    }));

    const edges = [];
    nodes.forEach(node => {
      if (node.reportingManagerId && nodes.some(n => n.id === node.reportingManagerId)) {
        edges.push({
          id: `edge_${node.reportingManagerId}_${node.id}`,
          source: node.reportingManagerId,
          target: node.id,
          relationship: 'reports_to',
        });
      }
    });

    const managers = [
      ...new Set(nodes.map(n => n.reportingManager).filter(m => m && m !== 'Board of Directors')),
    ];
    const designations = [...new Set(nodes.map(n => n.designation).filter(Boolean))];

    return res.status(200).json({
      success: true,
      data: {
        nodes,
        edges,
        departments,
        managers,
        designations,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single employee by ID
export const getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    let employee = memoryStore.employees.find(
      e => e._id === id || e.id === id || e.employeeId === id
    );

    if (!employee && mongoose.connection.readyState === 1) {
      try {
        employee = await Employee.findById(id);
      } catch (e) {}
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
    const salary = Number(data.salary) || 1500000;

    // Resolve reporting manager ID
    const managerObj = memoryStore.employees.find(
      e => e.name.toLowerCase() === (data.reportingManager || 'Elena Rostova').toLowerCase() || e._id === data.reportingManagerId
    );

    const salaryStructure = {
      basicSalary: Math.round((salary * 0.5) / 12),
      hra: Math.round((salary * 0.2) / 12),
      allowances: Math.round((salary * 0.15) / 12),
      bonus: 6000,
      pfDeduction: Math.round((salary * 0.06) / 12),
      taxDeduction: Math.round((salary * 0.05) / 12),
      deductions: Math.round((salary * 0.11) / 12),
      netSalary: Math.round((salary * 0.78) / 12),
    };

    const parsedSkills = Array.isArray(data.skills)
      ? data.skills
      : data.skills
      ? String(data.skills).split(',').map(s => s.trim()).filter(Boolean)
      : ['System Design', 'Collaboration', 'Agile Execution'];

    const parsedQuals = Array.isArray(data.qualifications)
      ? data.qualifications
      : data.qualifications
      ? String(data.qualifications).split(',').map(s => s.trim()).filter(Boolean)
      : ['B.Tech in Computer Science & Engineering'];

    const newEmployee = {
      _id: newId,
      id: newId,
      employeeId: data.employeeId || `NEX-${Math.floor(1011 + Math.random() * 8900)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      department: data.department || 'Engineering',
      designation: data.designation.trim(),
      reportingManager: managerObj ? managerObj.name : (data.reportingManager || 'Elena Rostova'),
      reportingManagerId: managerObj ? managerObj._id : (data.reportingManagerId || 'emp_001'),
      roleLevel: data.roleLevel || 'Senior',
      gender: data.gender || 'Male',
      phone: data.phone || '+91 98765 43210',
      location: data.location || 'Bengaluru HQ (Hybrid)',
      employmentType: data.employmentType || 'Full-Time',
      status: data.status || 'Active',
      joinDate: data.joinDate || new Date().toISOString().split('T')[0],
      salary,
      salaryStructure,
      emergencyContact: data.emergencyContact || {
        name: data.emergencyContactName || 'Emergency Contact',
        relationship: data.emergencyContactRelation || 'Family',
        phone: data.emergencyContactPhone || '+91 98000 11223',
      },
      qualifications: parsedQuals,
      documents: [
        {
          id: 'doc_' + Date.now(),
          title: `Offer_Letter_${data.name.trim().replace(/\s+/g, '_')}.pdf`,
          category: 'Onboarding',
          fileSize: '860 KB',
          uploadedAt: new Date().toISOString().split('T')[0],
          status: 'Verified',
        },
      ],
      activityHistory: [
        {
          id: 'act_' + Date.now(),
          action: 'Employee Profile Created',
          description: `Onboarded to ${data.department || 'Engineering'} as ${data.designation.trim()}`,
          timestamp: new Date().toISOString(),
          category: 'Onboarding',
        },
      ],
      skillMatrix: parsedSkills.map(sk => ({
        name: sk,
        level: 85,
        targetLevel: 95,
        category: 'Core Competency',
      })),
      performanceScore: Number(data.performanceScore) || 90,
      avatar,
      bio: data.bio || 'Enterprise contributor at NEXUS HR.',
      skills: parsedSkills,
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

    memoryStore.leaveBalances[newEmployee._id] = {
      casualTotal: 12,
      casualUsed: 0,
      sickTotal: 10,
      sickUsed: 0,
      earnedTotal: 15,
      earnedUsed: 0,
      unpaidUsed: 0,
    };

    recordAuditLog({
      action: 'EMPLOYEE_CREATED',
      user: req.user,
      targetType: 'Employee',
      targetId: newEmployee._id,
      details: `Added employee ${newEmployee.name} (${newEmployee.employeeId}) in ${newEmployee.department}`,
    });

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
    const updates = { ...req.body };

    const index = memoryStore.employees.findIndex(e => e._id === id || e.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (updates.salary) {
      const salary = Number(updates.salary);
      updates.salaryStructure = {
        basicSalary: Math.round((salary * 0.5) / 12),
        hra: Math.round((salary * 0.2) / 12),
        allowances: Math.round((salary * 0.15) / 12),
        bonus: 5000,
        pfDeduction: Math.round((salary * 0.06) / 12),
        taxDeduction: Math.round((salary * 0.05) / 12),
        deductions: Math.round((salary * 0.11) / 12),
        netSalary: Math.round((salary * 0.78) / 12),
      };
    }

    if (updates.skills && typeof updates.skills === 'string') {
      updates.skills = updates.skills.split(',').map(s => s.trim()).filter(Boolean);
    }
    if (updates.qualifications && typeof updates.qualifications === 'string') {
      updates.qualifications = updates.qualifications.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (updates.reportingManager) {
      const managerObj = memoryStore.employees.find(
        e => e.name.toLowerCase() === updates.reportingManager.toLowerCase()
      );
      if (managerObj) {
        updates.reportingManagerId = managerObj._id;
      }
    }

    const currentEmp = memoryStore.employees[index];
    const activityEntry = {
      id: 'act_' + Date.now(),
      action: 'Profile Record Updated',
      description: `Updated by ${req.user?.name || 'HR Administrator'}`,
      timestamp: new Date().toISOString(),
      category: 'Update',
    };

    const updated = {
      ...currentEmp,
      ...updates,
      activityHistory: [activityEntry, ...(currentEmp.activityHistory || [])],
      updatedAt: new Date().toISOString(),
    };

    memoryStore.employees[index] = updated;

    if (mongoose.connection.readyState === 1) {
      try {
        await Employee.findByIdAndUpdate(id, updates);
      } catch (e) {}
    }

    recordAuditLog({
      action: 'EMPLOYEE_UPDATED',
      user: req.user,
      targetType: 'Employee',
      targetId: id,
      details: `Updated employee record for ${updated.name}`,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully.',
      data: updated,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add document to employee profile
export const addEmployeeDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, category = 'Certification', fileSize = '1.1 MB' } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Document title is required.' });
    }

    const emp = memoryStore.employees.find(e => e._id === id || e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    const newDoc = {
      id: 'doc_' + Date.now(),
      title: title.trim(),
      category,
      fileSize,
      uploadedAt: new Date().toISOString().split('T')[0],
      status: 'Verified',
    };

    if (!Array.isArray(emp.documents)) emp.documents = [];
    emp.documents.unshift(newDoc);

    if (!Array.isArray(emp.activityHistory)) emp.activityHistory = [];
    emp.activityHistory.unshift({
      id: 'act_' + Date.now(),
      action: 'Document Uploaded',
      description: `Added "${newDoc.title}" (${category})`,
      timestamp: new Date().toISOString(),
      category: 'Document',
    });

    return res.status(201).json({
      success: true,
      message: `Document "${newDoc.title}" added to employee vault.`,
      data: emp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete document from employee profile
export const deleteEmployeeDocument = async (req, res) => {
  try {
    const { id, docId } = req.params;
    const emp = memoryStore.employees.find(e => e._id === id || e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    emp.documents = (emp.documents || []).filter(d => d.id !== docId);

    return res.status(200).json({
      success: true,
      message: 'Document removed from employee vault.',
      data: emp,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete employee
export const deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const emp = memoryStore.employees.find(e => e._id === id || e.id === id);
    if (!emp) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    memoryStore.employees = memoryStore.employees.filter(e => e._id !== id && e.id !== id);

    if (mongoose.connection.readyState === 1) {
      try {
        await Employee.findByIdAndDelete(id);
      } catch (e) {}
    }

    recordAuditLog({
      action: 'EMPLOYEE_DELETED',
      user: req.user,
      targetType: 'Employee',
      targetId: id,
      details: `Removed employee ${emp.name} from directory`,
    });

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
    const executive = list.filter(e => e.department === 'Executive').length;
    const activeCount = list.filter(e => e.status === 'Active').length;
    const onLeaveCount = list.filter(e => e.status === 'On Leave').length;

    const departmentDistribution = [
      { name: 'Engineering', count: engineering, percentage: total > 0 ? Number(((engineering / total) * 100).toFixed(1)) : 0, color: '#3B82F6' },
      { name: 'HR', count: hr, percentage: total > 0 ? Number(((hr / total) * 100).toFixed(1)) : 0, color: '#8B5CF6' },
      { name: 'Sales', count: sales, percentage: total > 0 ? Number(((sales / total) * 100).toFixed(1)) : 0, color: '#06B6D4' },
      { name: 'Finance', count: finance, percentage: total > 0 ? Number(((finance / total) * 100).toFixed(1)) : 0, color: '#10B981' },
      { name: 'Marketing', count: marketing, percentage: total > 0 ? Number(((marketing / total) * 100).toFixed(1)) : 0, color: '#F59E0B' },
      ...(executive > 0 ? [{ name: 'Executive', count: executive, percentage: Number(((executive / total) * 100).toFixed(1)), color: '#EC4899' }] : []),
    ];

    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    const growthData = months.map((m, idx) => ({
      month: m,
      employees: Math.max(4, Math.round(total * ((idx + 3) / (months.length + 2)))),
      engineering: Math.max(2, Math.round(engineering * ((idx + 3) / (months.length + 2)))),
    }));

    return res.status(200).json({
      success: true,
      stats: {
        totalEmployees: total,
        totalDisplay: total.toLocaleString(),
        totalChange: `+3 this quarter`,
        engineeringCount: engineering,
        engineeringShare: total > 0 ? `${((engineering / total) * 100).toFixed(1)}%` : '0%',
        hrCount: hr,
        hrShare: total > 0 ? `${((hr / total) * 100).toFixed(1)}%` : '0%',
        salesCount: sales,
        financeCount: finance,
        marketingCount: marketing,
        newEmployees: 3,
        newShare: 'Recent joiners',
        activeCount,
        onLeaveCount,
        activeRate: total > 0 ? `${((activeCount / total) * 100).toFixed(1)}%` : '100%',
        openJobsCount: memoryStore.jobOpenings.filter(j => j.status === 'Open').length,
        candidatesCount: memoryStore.candidates.length,
        departmentDistribution,
        growthData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
