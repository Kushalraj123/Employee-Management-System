import Attendance from '../models/Attendance.js';
import AttendancePolicy from '../models/AttendancePolicy.js';
import { memoryStore, recordAuditLog } from '../store.js';
import mongoose from 'mongoose';

// Helpers to format time and determine today respecting policy timezone
const getPolicyTimezone = () => memoryStore.attendancePolicy?.timezone || 'Asia/Kolkata';

const formatTimeAMPM = (date, timezone = getPolicyTimezone()) => {
  try {
    return date.toLocaleTimeString('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (e) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  }
};

const getTodayDateString = (timezone = getPolicyTimezone()) => {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

const getMinutesInTimezone = (date, timezone = getPolicyTimezone()) => {
  try {
    const timeStr = date.toLocaleTimeString('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  } catch (e) {
    return date.getHours() * 60 + date.getMinutes();
  }
};

// Check-in endpoint
export const checkIn = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const employeeName = user.name || 'Team Member';
    const policy = memoryStore.attendancePolicy;
    const today = getTodayDateString(policy?.timezone);

    // Check if already checked in today
    let existing = memoryStore.attendance.find(a => a.employeeId === employeeId && a.date === today);
    if (mongoose.connection.readyState === 1) {
      existing = await Attendance.findOne({ employeeId, date: today }) || existing;
    }

    if (existing && existing.checkInTime) {
      return res.status(409).json({
        success: false,
        message: `Already checked in today at ${existing.checkInTime}. Duplicate check-ins are prevented.`,
        data: existing,
      });
    }

    const now = new Date();
    const checkInTimeString = formatTimeAMPM(now, policy?.timezone);

    // Apply Fixed-Time Attendance Policy
    const [startH, startM] = policy.workStartTime.split(':').map(Number);
    const graceLimit = startH * 60 + startM + policy.gracePeriodMinutes;
    const currentMinutes = getMinutesInTimezone(now, policy?.timezone);

    let status = 'Present';
    let lateMinutes = 0;

    if (currentMinutes > graceLimit) {
      status = 'Late';
      lateMinutes = Math.max(0, currentMinutes - (startH * 60 + startM));
    }

    const newRecord = {
      _id: 'att_' + Date.now(),
      employeeId,
      employeeName,
      department: user.department || 'Engineering',
      date: today,
      checkInTime: checkInTimeString,
      checkOutTime: null,
      status,
      workingHours: 0,
      lateMinutes,
      notes: status === 'Late' ? `Checked in ${lateMinutes}m past office start time (${policy.workStartTime})` : 'On-time check in',
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const saved = await Attendance.create(newRecord);
        newRecord._id = saved._id;
      } catch (e) {
        console.warn('Atlas save warning:', e.message);
      }
    }

    memoryStore.attendance.unshift(newRecord);

    return res.status(201).json({
      success: true,
      message: `Checked in successfully! Status: ${status}`,
      data: newRecord,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Check-out endpoint
export const checkOut = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const policy = memoryStore.attendancePolicy;
    const today = getTodayDateString(policy?.timezone);

    let recordIndex = memoryStore.attendance.findIndex(a => a.employeeId === employeeId && a.date === today);
    if (recordIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'No active check-in record found for today. Please check in first.',
      });
    }

    const record = memoryStore.attendance[recordIndex];
    if (record.checkOutTime) {
      return res.status(409).json({
        success: false,
        message: `Already checked out today at ${record.checkOutTime}.`,
        data: record,
      });
    }

    const now = new Date();
    const checkOutTimeString = formatTimeAMPM(now, policy?.timezone);

    // Calculate working hours accurately using createdAt timestamp diff
    let workingHours = 8.0;
    try {
      if (record.createdAt) {
        const diffMs = Math.max(0, now.getTime() - new Date(record.createdAt).getTime());
        workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
      } else {
        const [time, modifier] = record.checkInTime.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (modifier === 'PM' && hours < 12) hours += 12;
        if (modifier === 'AM' && hours === 12) hours = 0;
        
        const checkInDate = new Date();
        checkInDate.setHours(hours, minutes, 0, 0);
        const diffMs = Math.max(0, now.getTime() - checkInDate.getTime());
        workingHours = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
      }
      if (workingHours === 0) workingHours = 0.01;
    } catch (e) {
      workingHours = 8.0;
    }

    let finalStatus = record.status;
    if (workingHours < policy.halfDayThresholdHours && record.status !== 'On Leave') {
      finalStatus = 'Half Day';
    }

    record.checkOutTime = checkOutTimeString;
    record.workingHours = workingHours;
    record.status = finalStatus;

    if (mongoose.connection.readyState === 1) {
      try {
        await Attendance.findOneAndUpdate(
          { employeeId, date: today },
          { checkOutTime: checkOutTimeString, workingHours, status: finalStatus }
        );
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: `Checked out successfully! Total working hours: ${workingHours} hrs.`,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get today's attendance for current user
export const getTodayStatus = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const policy = memoryStore.attendancePolicy;
    const today = getTodayDateString(policy?.timezone);

    const record = memoryStore.attendance.find(a => a.employeeId === employeeId && a.date === today);

    return res.status(200).json({
      success: true,
      data: record || null,
      policy: memoryStore.attendancePolicy,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get employee attendance history
export const getMyHistory = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';

    const history = memoryStore.attendance.filter(a => a.employeeId === employeeId);

    return res.status(200).json({
      success: true,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all attendance records (HR / Admin)
export const getAllAttendance = async (req, res) => {
  try {
    const { date, department, status } = req.query;
    let list = [...memoryStore.attendance];

    if (date) {
      list = list.filter(a => a.date === date);
    }
    if (department && department !== 'All') {
      list = list.filter(a => a.department === department);
    }
    if (status && status !== 'All') {
      list = list.filter(a => a.status === status);
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

// Get / update Attendance Policy
export const getPolicy = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: memoryStore.attendancePolicy,
  });
};

export const updatePolicy = async (req, res) => {
  try {
    const updates = req.body;
    memoryStore.attendancePolicy = {
      ...memoryStore.attendancePolicy,
      ...updates,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await AttendancePolicy.findOneAndUpdate({}, memoryStore.attendancePolicy, { upsert: true });
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: 'Attendance policy updated successfully',
      data: memoryStore.attendancePolicy,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Cutoff scheduler / manual run: Mark absent for employees not checked in
export const runCutoffEvaluation = async (req, res) => {
  try {
    const policy = memoryStore.attendancePolicy;
    const today = getTodayDateString(policy?.timezone);
    let markedCount = 0;

    memoryStore.employees.forEach(emp => {
      const hasAttendance = memoryStore.attendance.some(a => a.employeeId === emp._id && a.date === today);
      const onLeave = memoryStore.leaveRequests.some(
        l => l.employeeId === emp._id && l.status === 'Approved' && l.startDate <= today && l.endDate >= today
      );

      if (!hasAttendance && !onLeave) {
        memoryStore.attendance.push({
          _id: 'att_abs_' + emp._id + '_' + Date.now(),
          employeeId: emp._id,
          employeeName: emp.name,
          department: emp.department,
          date: today,
          checkInTime: null,
          checkOutTime: null,
          status: 'Absent',
          workingHours: 0,
          lateMinutes: 0,
          notes: `Auto-marked Absent past cutoff time (${memoryStore.attendancePolicy.cutoffTime})`,
        });
        markedCount++;
      }
    });

    return res.status(200).json({
      success: true,
      message: `Cutoff evaluation completed. Marked ${markedCount} employees absent for today.`,
      markedCount,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Reset today's attendance for current user (allows re-testing Punch Check In)
export const resetTodayAttendance = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const policy = memoryStore.attendancePolicy;
    const today = getTodayDateString(policy?.timezone);

    // Remove any attendance for this employee today
    memoryStore.attendance = memoryStore.attendance.filter(
      a => !(a.employeeId === employeeId && a.date === today)
    );

    if (mongoose.connection.readyState === 1) {
      try {
        await Attendance.deleteMany({ employeeId, date: today });
      } catch (e) {}
    }

    return res.status(200).json({
      success: true,
      message: "Today's check-in has been cleared. You can now punch check-in freshly.",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Holidays list
export const getHolidays = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: (memoryStore.holidays || []).length,
      data: memoryStore.holidays || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Add Holiday (HR / Admin)
export const addHoliday = async (req, res) => {
  try {
    const { name, date, type = 'Public Holiday' } = req.body;
    if (!name || !date) {
      return res.status(400).json({ success: false, message: 'Holiday name and date are required.' });
    }
    const newHoliday = {
      id: 'hol_' + Date.now(),
      name: name.trim(),
      date,
      type,
    };
    if (!memoryStore.holidays) memoryStore.holidays = [];
    memoryStore.holidays.push(newHoliday);
    memoryStore.holidays.sort((a, b) => a.date.localeCompare(b.date));

    return res.status(201).json({
      success: true,
      message: `Holiday "${name}" added for ${date}.`,
      data: newHoliday,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Request Attendance Regularization (Employee)
export const regularizeAttendance = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const { date, checkInTime = '09:00 AM', checkOutTime = '06:00 PM', reason } = req.body;

    if (!date || !reason) {
      return res.status(400).json({ success: false, message: 'Date and regularization reason are required.' });
    }

    let record = memoryStore.attendance.find(a => a.employeeId === employeeId && a.date === date);
    if (record) {
      record.regularizationRequested = true;
      record.regularizationStatus = 'Pending';
      record.regularizationReason = reason;
      record.requestedCheckIn = checkInTime;
      record.requestedCheckOut = checkOutTime;
    } else {
      record = {
        _id: 'att_reg_' + Date.now(),
        employeeId,
        employeeName: user.name || 'Employee',
        department: user.department || 'Engineering',
        date,
        checkInTime,
        checkOutTime,
        status: 'Late',
        workingHours: 9.0,
        lateMinutes: 0,
        regularizationRequested: true,
        regularizationStatus: 'Pending',
        regularizationReason: reason,
        notes: `Regularization requested: ${reason}`,
        createdAt: new Date().toISOString(),
      };
      memoryStore.attendance.unshift(record);
    }

    memoryStore.notifications.unshift({
      _id: 'notif_att_' + Date.now(),
      userId: 'usr_manager',
      title: 'Attendance Regularization Request',
      message: `${user.name} requested attendance regularization for ${date}.`,
      type: 'warning',
      link: '/attendance',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance regularization request submitted for Manager/HR approval.',
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Manager / HR Approve or Reject Attendance Record / Regularization
export const approveAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'Approved', status = 'Present', comments = '' } = req.body;
    const reviewer = req.user;

    const record = memoryStore.attendance.find(a => a._id === id || a.id === id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Attendance record not found.' });
    }

    record.regularizationStatus = action; // 'Approved' | 'Rejected'
    record.approvedBy = `${reviewer.name} (${reviewer.role.toUpperCase()})`;
    record.approvedAt = new Date().toISOString();

    if (action === 'Approved') {
      record.status = status || 'Present';
      record.lateMinutes = 0;
      if (record.requestedCheckIn) record.checkInTime = record.requestedCheckIn;
      if (record.requestedCheckOut) record.checkOutTime = record.requestedCheckOut;
      if (!record.workingHours || record.workingHours < 8) record.workingHours = 9.0;
      record.notes = `Approved by ${reviewer.name}${comments ? `: ${comments}` : ''}`;
    } else {
      record.notes = `Regularization rejected by ${reviewer.name}${comments ? `: ${comments}` : ''}`;
    }

    recordAuditLog({
      user: reviewer,
      action: 'ATTENDANCE_APPROVAL',
      module: 'Attendance',
      details: `${action} attendance record for ${record.employeeName} on ${record.date}`,
    });

    memoryStore.notifications.unshift({
      _id: 'notif_att_rev_' + Date.now(),
      userId: record.employeeId,
      title: `Attendance Regularization ${action}`,
      message: `Your attendance record for ${record.date} was ${action.toLowerCase()} by ${reviewer.name}.`,
      type: action === 'Approved' ? 'success' : 'warning',
      link: '/attendance',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(200).json({
      success: true,
      message: `Attendance record ${action.toLowerCase()} successfully.`,
      data: record,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
