import LeaveRequest from '../models/LeaveRequest.js';
import LeaveBalance from '../models/LeaveBalance.js';
import { memoryStore } from '../store.js';
import mongoose from 'mongoose';

// Apply for leave
export const applyLeave = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'All fields (Leave Type, Start Date, End Date, Reason) are required.',
      });
    }

    if (reason.trim().length < 5) {
      return res.status(400).json({
        success: false,
        message: 'Leave reason must be at least 5 characters.',
      });
    }

    // Check date range logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date.',
      });
    }

    // Calculate days count
    const diffTime = Math.abs(end - start);
    const daysCount = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Check overlapping requests for this employee
    const hasOverlap = memoryStore.leaveRequests.some(l => {
      if (l.employeeId !== employeeId) return false;
      if (l.status === 'Rejected') return false;
      return (startDate <= l.endDate && endDate >= l.startDate);
    });

    if (hasOverlap) {
      return res.status(409).json({
        success: false,
        message: 'You already have an active or pending leave application overlapping these dates.',
      });
    }

    // Check leave balance
    const balance = memoryStore.leaveBalances[employeeId] || { casualTotal: 12, casualUsed: 0, sickTotal: 10, sickUsed: 0, earnedTotal: 15, earnedUsed: 0 };
    if (leaveType === 'Casual' && (balance.casualUsed + daysCount > balance.casualTotal)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Casual leave balance. Available: ${balance.casualTotal - balance.casualUsed} days, requested: ${daysCount} days.`,
      });
    }
    if (leaveType === 'Sick' && (balance.sickUsed + daysCount > balance.sickTotal)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient Sick leave balance. Available: ${balance.sickTotal - balance.sickUsed} days, requested: ${daysCount} days.`,
      });
    }

    const employee = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);

    const newRequest = {
      _id: 'lv_' + Date.now(),
      employeeId,
      employeeName: employee ? employee.name : user.name,
      department: employee ? employee.department : 'Engineering',
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason: reason.trim(),
      status: 'Pending',
      hrComments: '',
      reviewedBy: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await LeaveRequest.create(newRequest);
        newRequest._id = doc._id;
      } catch (e) {}
    }

    memoryStore.leaveRequests.unshift(newRequest);

    // Notify HR and Admin about the new request
    ['usr_hr', 'usr_admin'].forEach((target, i) => {
      memoryStore.notifications.unshift({
        _id: `notif_${Date.now()}_${i}`,
        userId: target,
        title: 'New Leave Application',
        message: `${newRequest.employeeName} submitted a ${leaveType} leave request for ${startDate} to ${endDate}.`,
        type: 'warning',
        link: '/leave/approvals',
        read: false,
        createdAt: new Date().toISOString(),
      });
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully for HR review.',
      data: newRequest,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user's leaves
export const getMyLeaves = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';

    const leaves = memoryStore.leaveRequests.filter(l => l.employeeId === employeeId);
    const balance = memoryStore.leaveBalances[employeeId] || { casualTotal: 12, casualUsed: 2, sickTotal: 10, sickUsed: 1, earnedTotal: 15, earnedUsed: 2, unpaidUsed: 0 };

    return res.status(200).json({
      success: true,
      data: leaves,
      balance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get current user's leave balance
export const getMyBalance = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const balance = memoryStore.leaveBalances[employeeId] || { casualTotal: 12, casualUsed: 2, sickTotal: 10, sickUsed: 1, earnedTotal: 15, earnedUsed: 2, unpaidUsed: 0 };

    return res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all leave requests (HR / Admin)
export const getAllLeaves = async (req, res) => {
  try {
    const { department, status, leaveType } = req.query;
    let list = [...memoryStore.leaveRequests];

    if (department && department !== 'All') {
      list = list.filter(l => l.department === department);
    }
    if (status && status !== 'All') {
      list = list.filter(l => l.status === status);
    }
    if (leaveType && leaveType !== 'All') {
      list = list.filter(l => l.leaveType === leaveType);
    }

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// HR Review (Approve / Reject)
export const reviewLeave = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hrComments = '' } = req.body;
    const reviewerName = req.user.name || 'HR Reviewer';

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'Approved' or 'Rejected'.",
      });
    }

    const index = memoryStore.leaveRequests.findIndex(l => l._id === id || l.id === id);
    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    const leave = memoryStore.leaveRequests[index];
    if (leave.status !== 'Pending') {
      return res.status(409).json({
        success: false,
        message: `This request was already ${leave.status.toLowerCase()}.`,
      });
    }
    leave.status = status;
    leave.hrComments = hrComments;
    leave.reviewedBy = reviewerName;
    leave.reviewedAt = new Date().toISOString();

    // If approved, deduct balance
    if (status === 'Approved') {
      if (!memoryStore.leaveBalances[leave.employeeId]) {
        memoryStore.leaveBalances[leave.employeeId] = { casualTotal: 12, casualUsed: 0, sickTotal: 10, sickUsed: 0, earnedTotal: 15, earnedUsed: 0, unpaidUsed: 0 };
      }
      const bal = memoryStore.leaveBalances[leave.employeeId];
      if (bal) {
        if (leave.leaveType === 'Casual') bal.casualUsed += leave.daysCount;
        if (leave.leaveType === 'Sick') bal.sickUsed += leave.daysCount;
        if (leave.leaveType === 'Earned') bal.earnedUsed += leave.daysCount;
        if (leave.leaveType === 'Unpaid') bal.unpaidUsed = (bal.unpaidUsed || 0) + leave.daysCount;
      }
    }

    // Notify employee
    memoryStore.notifications.unshift({
      _id: 'notif_' + Date.now(),
      userId: leave.employeeId,
      title: `Leave Application ${status}`,
      message: `Your ${leave.leaveType} leave request for ${leave.startDate} to ${leave.endDate} has been ${status.toLowerCase()} by ${reviewerName}.`,
      type: status === 'Approved' ? 'success' : 'urgent',
      link: '/leave/apply',
      read: false,
      createdAt: new Date().toISOString(),
    });

    if (mongoose.connection.readyState === 1) {
      try {
        await LeaveRequest.findByIdAndUpdate(id, {
          status,
          hrComments,
          reviewedBy: reviewerName,
          reviewedAt: new Date(),
        });
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully.`,
      data: leave,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
