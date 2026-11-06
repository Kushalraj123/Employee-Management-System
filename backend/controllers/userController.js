import { memoryStore, recordAuditLog } from '../store.js';

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const list = memoryStore.users.map(u => ({
      id: u._id || u.id,
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || 'Engineering',
      permissions: u.permissions || memoryStore.rolePermissions[u.role]?.modules || [],
      employeeId: u.employeeId,
      status: u.status || 'Active',
      avatar: u.avatar,
      lastLogin: u.lastLogin || new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      count: list.length,
      rolePermissions: memoryStore.rolePermissions,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, role = 'employee', department = 'Engineering', employeeId, status = 'Active' } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const emailTaken = memoryStore.users.some(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (emailTaken) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const newUser = {
      _id: 'usr_' + Date.now(),
      id: 'usr_' + Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      permissions: memoryStore.rolePermissions[role]?.modules || [],
      employeeId: employeeId || null,
      status,
      avatar: `https://ui-avatars.com/api/?background=6366f1&color=fff&name=${encodeURIComponent(name.trim())}`,
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    memoryStore.users.push(newUser);

    recordAuditLog({
      action: 'USER_PROVISIONED',
      user: req.user,
      targetType: 'User',
      targetId: newUser._id,
      details: `Provisioned user ${newUser.email} with role '${role.toUpperCase()}'`,
    });

    return res.status(201).json({
      success: true,
      message: `User created with role '${role.toUpperCase()}'.`,
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role (supports all 4 roles: admin, hr, manager, employee)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, permissions } = req.body;

    if (!['admin', 'hr', 'manager', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be admin, hr, manager, or employee.' });
    }

    const user = memoryStore.users.find(u => u._id === id || u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const oldRole = user.role;
    user.role = role;
    if (Array.isArray(permissions)) {
      user.permissions = permissions;
    }

    recordAuditLog({
      action: 'ROLE_UPDATED',
      user: req.user,
      targetType: 'User',
      targetId: user._id,
      details: `Updated ${user.name}'s role from ${oldRole.toUpperCase()} → ${role.toUpperCase()}`,
    });

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role.toUpperCase()}.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle user status (Active / Suspended)
export const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const user = memoryStore.users.find(u => u._id === id || u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.status = user.status === 'Active' ? 'Suspended' : 'Active';

    recordAuditLog({
      action: 'USER_STATUS_TOGGLED',
      user: req.user,
      targetType: 'User',
      targetId: user._id,
      details: `Changed ${user.email} account status to ${user.status}`,
    });

    return res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get audit logs (Admin / HR)
export const getAuditLogs = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: memoryStore.auditLogs.length,
      data: memoryStore.auditLogs,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
