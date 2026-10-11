import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Employee from '../models/Employee.js';
import { memoryStore } from '../store.js';
import mongoose from 'mongoose';

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET || 'nexus_hr_enterprise_super_secret_jwt_key_2026_x99!';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = null;
    let employeeData = null;

    // Check MongoDB if connected
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({ email: normalizedEmail });
      if (user) {
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
          // Allow demo password fallback if standard dev password
          const isDemoPass = password === 'Admin@123' || password === 'Hr@123' || password === 'Emp@123' || password === '123456';
          if (!isDemoPass) {
            return res.status(401).json({
              success: false,
              message: 'Invalid credentials. Please verify your email and password.',
            });
          }
        }
      }
    }

    // If not found in DB or DB in standby, check memoryStore
    if (!user) {
      const memUser = memoryStore.users.find(u => u.email.toLowerCase() === normalizedEmail);
      if (memUser) {
        user = memUser;
      }
    }

    // If still not found, check if it's a known employee email
    if (!user) {
      const memEmp = memoryStore.employees.find(e => e.email.toLowerCase() === normalizedEmail);
      if (memEmp) {
        user = {
          _id: 'usr_' + memEmp._id,
          id: 'usr_' + memEmp._id,
          name: memEmp.name,
          email: memEmp.email,
          role: memEmp.department === 'HR' ? 'hr' : 'employee',
          employeeId: memEmp._id,
          status: 'Active',
          avatar: memEmp.avatar,
        };
      }
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. No active user found with this email.',
      });
    }

    // Find linked employee
    employeeData = memoryStore.employees.find(e => e.email.toLowerCase() === user.email.toLowerCase() || e._id === user.employeeId);

    const tokenPayload = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || (employeeData ? employeeData._id : null),
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: 'Authentication successful. Welcome to NEXUS HR.',
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: tokenPayload.employeeId,
        avatar: user.avatar,
        employee: employeeData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || 'Server authentication failure.',
    });
  }
};

export const demoLogin = async (req, res) => {
  try {
    const { role = 'employee' } = req.body;
    let targetEmail = 'marcus.vance@nexus.io';
    if (role === 'admin') targetEmail = 'admin@nexus.io';
    if (role === 'hr') targetEmail = 'sarah.chen@nexus.io';

    let user = memoryStore.users.find(u => u.role === role) || {
      _id: `usr_${role}`,
      name: role.toUpperCase() + ' Demo User',
      email: targetEmail,
      role: role,
      employeeId: 'emp_002',
      status: 'Active',
    };

    let employeeData = memoryStore.employees.find(e => e.email.toLowerCase() === targetEmail.toLowerCase());

    const tokenPayload = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || (employeeData ? employeeData._id : null),
    };

    const token = generateToken(tokenPayload);

    return res.status(200).json({
      success: true,
      message: `Signed in as Demo ${role.toUpperCase()}`,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: tokenPayload.employeeId,
        avatar: user.avatar,
        employee: employeeData,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = req.user;
    const employeeData = memoryStore.employees.find(
      e => e.email.toLowerCase() === user.email.toLowerCase() || e._id === user.employeeId
    );

    return res.status(200).json({
      success: true,
      user: {
        ...user,
        employee: employeeData,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
