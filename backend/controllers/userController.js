import { memoryStore } from '../store.js';

// Get all users (Admin only)
export const getUsers = async (req, res) => {
  try {
    const list = memoryStore.users.map(u => ({
      id: u._id || u.id,
      _id: u._id || u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      employeeId: u.employeeId,
      status: u.status || 'Active',
      avatar: u.avatar,
      lastLogin: u.lastLogin || new Date().toISOString(),
    }));

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create user (Admin only)
export const createUser = async (req, res) => {
  try {
    const { name, email, role = 'employee', employeeId, status = 'Active' } = req.body;

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
      employeeId: employeeId || null,
      status,
      avatar: '',
      lastLogin: null,
      createdAt: new Date().toISOString(),
    };

    memoryStore.users.push(newUser);

    return res.status(201).json({
      success: true,
      message: `User created with role '${role}'.`,
      data: newUser,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update user role
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['admin', 'hr', 'employee'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const user = memoryStore.users.find(u => u._id === id || u.id === id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    user.role = role;

    return res.status(200).json({
      success: true,
      message: `User role updated to ${role}.`,
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

    return res.status(200).json({
      success: true,
      message: `User status changed to ${user.status}.`,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
