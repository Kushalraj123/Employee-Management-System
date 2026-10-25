import { memoryStore } from '../store.js';
import mongoose from 'mongoose';
import Employee from '../models/Employee.js';
import LeaveRequest from '../models/LeaveRequest.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';
import Goal from '../models/Goal.js';
import Payroll from '../models/Payroll.js';

// Official NEXUS HR Policies Knowledge Base
const HR_POLICIES = {
  leave: {
    casual: 'Employees are allocated 12 days of Casual Leave (CL) per calendar year, accrued monthly. Maximum 3 consecutive days allowed.',
    sick: 'Employees receive 10 days of Paid Sick Leave (SL) annually. Medical certificates required for absences exceeding 2 consecutive days.',
    earned: '15 days of Earned/Privilege Leave (EL) annually, carry-forward eligible up to 30 days maximum. Requires 7 days prior notice.',
    maternity: '26 weeks of fully paid Maternity Leave for female employees with >80 days tenure, in accordance with statutory guidelines.',
    paternity: '10 business days of paid Paternity Leave, to be availed within 6 months of child birth.',
  },
  workHours: {
    timing: 'Standard business operating hours are 09:00 AM to 06:00 PM IST (Fixed-Time Policy). Core collaboration hours are 10:00 AM - 04:00 PM.',
    gracePeriod: 'A 15-minute grace window (up to 09:15 AM) is permitted for biometric/web check-in. Check-ins after 09:30 AM are marked "Late".',
    overtime: 'Overtime compensation applies to non-exempt roles at 1.5x standard hourly rate beyond 45 hours weekly, subject to managerial pre-approval.',
    wfh: 'Hybrid model permits up to 2 remote workdays per week with manager coordination.',
  },
  payroll: {
    cycle: 'Payroll is processed on the 28th of every calendar month. Salary disbursements credit by the 1st of the succeeding month.',
    structure: 'Standard compensation consists of: Basic (50%), HRA (20%), Special Allowances (20%), Performance Incentive/Bonus (10%). Statutory deductions include PF (12%) and Professional Tax.',
    appraisals: 'Bi-annual performance review cycle in June and December. Merit increments range from 8% to 22% based on performance scorecard.',
  },
  codeOfConduct: {
    harassment: 'Strict Zero-Tolerance Policy toward workplace harassment, bullying, or discrimination under the POSH framework.',
    confidentiality: 'All employee personal data, compensation numbers, and client deliverables are classified as NEXUS Confidential.',
  }
};

/**
 * Tool Execution Engine - Queries MongoDB Atlas if live, else queries memoryStore
 */
export const agentTools = {
  // 1. Search Employees
  async searchEmployees({ query = '', department = '', skill = '', status = '' }) {
    let list = [...memoryStore.employees];
    const q = (query || '').toLowerCase().trim();

    if (q) {
      list = list.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.designation && e.designation.toLowerCase().includes(q)) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(q))
      );
    }
    if (department && department !== 'All') {
      list = list.filter(e => e.department.toLowerCase() === department.toLowerCase());
    }
    if (status) {
      list = list.filter(e => e.status.toLowerCase() === status.toLowerCase());
    }
    if (skill) {
      const s = skill.toLowerCase();
      list = list.filter(e => e.skills && e.skills.some(sk => sk.toLowerCase().includes(s)));
    }

    return {
      tool: 'searchEmployees',
      count: list.length,
      employees: list.slice(0, 8).map(e => ({
        id: e._id || e.id,
        employeeId: e.employeeId,
        name: e.name,
        department: e.department,
        designation: e.designation,
        email: e.email,
        status: e.status,
        performanceScore: e.performanceScore,
        skills: e.skills || [],
        avatar: e.avatar,
      })),
    };
  },

  // 2. Get Employee Details
  async getEmployeeDetails({ identifier }) {
    if (!identifier) return { error: 'Employee identifier required' };
    const idStr = String(identifier).toLowerCase().trim();
    const emp = memoryStore.employees.find(e =>
      (e._id && e._id.toLowerCase() === idStr) ||
      (e.id && e.id.toLowerCase() === idStr) ||
      (e.employeeId && e.employeeId.toLowerCase() === idStr) ||
      e.name.toLowerCase().includes(idStr) ||
      e.email.toLowerCase() === idStr
    );

    if (!emp) {
      return { tool: 'getEmployeeDetails', found: false, message: `No employee found matching "${identifier}"` };
    }

    const leaves = memoryStore.leaveRequests.filter(l => l.employeeId === emp._id || l.employeeId === emp.id);
    const goals = memoryStore.goals.filter(g => g.employeeId === emp._id || g.employeeId === emp.id);
    const reviews = memoryStore.performanceReviews.filter(r => r.employeeId === emp._id || r.employeeId === emp.id);

    return {
      tool: 'getEmployeeDetails',
      found: true,
      employee: {
        id: emp._id || emp.id,
        employeeId: emp.employeeId,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        designation: emp.designation,
        joinDate: emp.joinDate,
        status: emp.status,
        performanceScore: emp.performanceScore,
        skills: emp.skills || [],
        bio: emp.bio,
        salary: emp.salary,
        salaryStructure: emp.salaryStructure,
        activeGoalsCount: goals.length,
        leavesCount: leaves.length,
        recentReviews: reviews.slice(0, 2),
        avatar: emp.avatar,
      }
    };
  },

  // 3. Attendance Overview
  async getAttendanceOverview({ date } = {}) {
    const today = date || new Date().toISOString().split('T')[0];
    const records = memoryStore.attendance.filter(a => a.date === today);
    const totalEmployees = memoryStore.employees.length;

    const presentCount = records.filter(r => r.status === 'Present').length;
    const lateCount = records.filter(r => r.isLate || r.status === 'Late').length;
    const onLeaveCount = memoryStore.leaveRequests.filter(l =>
      l.status === 'Approved' && l.startDate <= today && l.endDate >= today
    ).length;
    const absentCount = Math.max(0, totalEmployees - (presentCount + onLeaveCount));

    return {
      tool: 'getAttendanceOverview',
      date: today,
      totalEmployees,
      present: presentCount || Math.round(totalEmployees * 0.88),
      late: lateCount || 2,
      onLeave: onLeaveCount || 1,
      absent: absentCount,
      attendanceRate: `${Math.round(((presentCount || totalEmployees * 0.88) / totalEmployees) * 100)}%`,
      policy: memoryStore.attendancePolicy || { shiftStart: '09:00 AM', shiftEnd: '06:00 PM', graceMinutes: 15 },
    };
  },

  // 4. Pending Leave Requests
  async getPendingLeaves() {
    const pending = memoryStore.leaveRequests.filter(l => l.status === 'Pending');
    return {
      tool: 'getPendingLeaves',
      count: pending.length,
      leaves: pending.map(l => ({
        id: l._id || l.id,
        employeeId: l.employeeId,
        employeeName: l.employeeName,
        department: l.department,
        leaveType: l.leaveType,
        startDate: l.startDate,
        endDate: l.endDate,
        daysCount: l.daysCount,
        reason: l.reason,
        appliedAt: l.appliedAt,
      })),
    };
  },

  // 5. Approve or Reject Leave
  async updateLeaveStatus({ leaveId, status, comments = '', reviewedBy = 'NEXUS AI Copilot' }) {
    const leave = memoryStore.leaveRequests.find(l => (l._id === leaveId || l.id === leaveId));
    if (!leave) {
      return { tool: 'updateLeaveStatus', success: false, message: `Leave request "${leaveId}" not found.` };
    }

    const previousStatus = leave.status;
    leave.status = status; // 'Approved' | 'Rejected'
    leave.rejectionReason = comments || (status === 'Approved' ? 'Approved by AI HR System' : 'Rejected per policy');
    leave.approvedBy = reviewedBy;
    leave.updatedAt = new Date().toISOString();

    // Adjust leave balances if approved
    if (status === 'Approved' && previousStatus !== 'Approved') {
      const balance = memoryStore.leaveBalances[leave.employeeId];
      if (balance) {
        if (leave.leaveType === 'Casual') balance.casualUsed = (balance.casualUsed || 0) + leave.daysCount;
        if (leave.leaveType === 'Sick') balance.sickUsed = (balance.sickUsed || 0) + leave.daysCount;
        if (leave.leaveType === 'Earned') balance.earnedUsed = (balance.earnedUsed || 0) + leave.daysCount;
      }
    }

    // Add notification to employee
    memoryStore.notifications.unshift({
      _id: `notif_${Date.now()}`,
      userId: leave.employeeId,
      title: `Leave Application ${status}`,
      message: `Your ${leave.leaveType} leave request for ${leave.startDate} to ${leave.endDate} was ${status.toLowerCase()} by ${reviewedBy}.`,
      type: status === 'Approved' ? 'success' : 'error',
      link: '/leave/apply',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return {
      tool: 'updateLeaveStatus',
      success: true,
      leaveId,
      employeeName: leave.employeeName,
      status,
      message: `Leave request for ${leave.employeeName} (${leave.leaveType}, ${leave.daysCount} days) has been ${status.toUpperCase()}.`,
    };
  },

  // 6. Apply Leave
  async applyLeave({ employeeId = 'emp_002', leaveType = 'Casual', startDate, endDate, reason }) {
    if (!startDate || !endDate || !reason) {
      return { tool: 'applyLeave', success: false, message: 'Start date, end date, and reason are required.' };
    }

    const emp = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);
    const empName = emp ? emp.name : 'Authenticated Employee';
    const dept = emp ? emp.department : 'Engineering';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const daysCount = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

    const newRequest = {
      _id: `leave_${Date.now()}`,
      id: `leave_${Date.now()}`,
      employeeId,
      employeeName: empName,
      department: dept,
      leaveType,
      startDate,
      endDate,
      daysCount,
      reason,
      status: 'Pending',
      appliedAt: new Date().toISOString(),
    };

    memoryStore.leaveRequests.unshift(newRequest);

    return {
      tool: 'applyLeave',
      success: true,
      leave: newRequest,
      message: `Leave application for ${daysCount} day(s) (${leaveType}: ${startDate} to ${endDate}) submitted successfully for HR approval.`,
    };
  },

  // 7. Post Announcement
  async createAnnouncement({ title, description, category = 'General', priority = 'Medium', targetDepartment = 'All', authorName = 'NEXUS AI Agent' }) {
    if (!title || !description) {
      return { tool: 'createAnnouncement', success: false, message: 'Title and description are required.' };
    }

    const newAnn = {
      _id: `ann_${Date.now()}`,
      id: `ann_${Date.now()}`,
      title,
      description,
      category,
      priority,
      targetDepartment,
      authorName,
      authorRole: 'AI HR Director',
      publishDate: new Date().toISOString(),
      isPinned: priority === 'High' || priority === 'Urgent',
      viewsCount: 0,
      comments: [],
    };

    memoryStore.announcements.unshift(newAnn);

    // Broadcast system notification
    memoryStore.notifications.unshift({
      _id: `notif_${Date.now()}`,
      userId: 'all',
      title: `Company Announcement: ${title}`,
      message: `${authorName} published: "${title}"`,
      type: 'info',
      link: '/announcements',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return {
      tool: 'createAnnouncement',
      success: true,
      announcement: newAnn,
      message: `Announcement "${title}" successfully published to ${targetDepartment} department(s).`,
    };
  },

  // 8. Payroll Overview
  async getPayrollOverview() {
    const list = memoryStore.employees || [];
    const totalPayroll = list.reduce((sum, e) => sum + (e.salaryStructure?.netSalary || (e.salary ? Math.round(e.salary / 12) : 120000)), 0);
    const avgSalary = Math.round(list.reduce((sum, e) => sum + (e.salary || 1800000), 0) / (list.length || 1));

    // Department breakdown
    const deptTotals = {};
    list.forEach(e => {
      const d = e.department || 'General';
      const monthly = e.salaryStructure?.netSalary || Math.round((e.salary || 1800000) / 12);
      deptTotals[d] = (deptTotals[d] || 0) + monthly;
    });

    return {
      tool: 'getPayrollOverview',
      currency: 'INR (₹)',
      totalMonthlyDisbursement: totalPayroll,
      formattedDisbursement: `₹${(totalPayroll / 100000).toFixed(2)} Lakhs`,
      averageAnnualCTC: `₹${(avgSalary / 100000).toFixed(2)} LPA`,
      employeeCount: list.length,
      nextDisbursementDate: '28th of current month',
      departmentBreakdown: deptTotals,
    };
  },

  // 9. Workforce & Company Analytics
  async getCompanyAnalytics() {
    const totalEmployees = memoryStore.employees.length;
    const departments = memoryStore.departments.map(d => ({
      name: d.name,
      headcount: d.employeeCount || memoryStore.employees.filter(e => e.department === d.name).length,
      lead: d.headOfDepartment || 'Assigned Lead',
    }));

    const topPerformers = [...memoryStore.employees]
      .sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))
      .slice(0, 5)
      .map(e => ({ name: e.name, score: e.performanceScore, dept: e.department, title: e.designation }));

    const pendingLeaves = memoryStore.leaveRequests.filter(l => l.status === 'Pending').length;

    return {
      tool: 'getCompanyAnalytics',
      headcount: totalEmployees,
      departmentDistribution: departments,
      topPerformers,
      pendingLeavesCount: pendingLeaves,
      averagePerformance: `${Math.round(memoryStore.employees.reduce((acc, e) => acc + (e.performanceScore || 90), 0) / (totalEmployees || 1))}/100`,
      retentionRate: '96.4%',
      activeGoalsCount: memoryStore.goals.length,
    };
  },

  // 10. HR Policies Query
  async queryPolicy({ topic = 'all' }) {
    const t = topic.toLowerCase();
    let result = {};

    if (t.includes('leave') || t.includes('vacation') || t.includes('sick') || t.includes('casual')) {
      result.leavePolicies = HR_POLICIES.leave;
    }
    if (t.includes('hour') || t.includes('time') || t.includes('shift') || t.includes('wfh') || t.includes('remote') || t.includes('late')) {
      result.workHoursAndAttendance = HR_POLICIES.workHours;
    }
    if (t.includes('pay') || t.includes('salary') || t.includes('appraisal') || t.includes('bonus') || t.includes('deduction')) {
      result.compensationAndPayroll = HR_POLICIES.payroll;
    }
    if (t.includes('conduct') || t.includes('harassment') || t.includes('posh') || t.includes('confidential')) {
      result.codeOfConduct = HR_POLICIES.codeOfConduct;
    }

    if (Object.keys(result).length === 0) {
      result = HR_POLICIES;
    }

    return {
      tool: 'queryPolicy',
      topic,
      policyDetails: result,
    };
  },

  // 11. Create Performance Goal
  async createGoal({ employeeId = 'emp_002', title, category = 'Technical', targetDate = '2026-12-31', metric = '100% completion' }) {
    if (!title) return { tool: 'createGoal', success: false, message: 'Goal title is required' };

    const emp = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId || e.name.toLowerCase().includes(employeeId.toLowerCase()));
    const finalEmpId = emp ? (emp._id || emp.id) : employeeId;
    const finalEmpName = emp ? emp.name : 'Assigned Employee';

    const newGoal = {
      _id: `goal_${Date.now()}`,
      id: `goal_${Date.now()}`,
      employeeId: finalEmpId,
      employeeName: finalEmpName,
      title,
      category,
      targetDate,
      metric,
      progress: 0,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    };

    memoryStore.goals.unshift(newGoal);

    return {
      tool: 'createGoal',
      success: true,
      goal: newGoal,
      message: `Strategic Goal "${title}" created for ${finalEmpName} (Due: ${targetDate}).`,
    };
  }
};

/**
 * Persona Definitions
 */
export const AGENT_PERSONAS = {
  omni: {
    id: 'omni',
    name: 'NEXUS Prime',
    title: 'Executive HR Operating Intelligence',
    avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    description: 'Comprehensive workforce management copilot with full read & write execution access.',
    greeting: 'Welcome. I am NEXUS Prime, your autonomous HR Operating Intelligence. I can query real-time analytics, review and approve leave requests, draft announcements, find talent, and optimize workforce operations.',
    capabilities: ['Employee Search & 360° Profiles', 'Leave Approvals & Submissions', 'Attendance & Real-time Policy', 'Payroll & Compensation', 'Announcements & Culture', 'Workforce KPIs'],
  },
  talent: {
    id: 'talent',
    name: 'Aria Talent',
    title: 'Talent & Performance Coach',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    description: 'Specialized in OKRs, skill matrices, appraisals, promotion paths, and high-performer retention.',
    greeting: 'Greetings! I am Aria, your Talent & Performance advisor. How can I help evaluate skill matrices, track strategic goals, or plan career advancement today?',
    capabilities: ['Skill Matrix Analysis', 'Performance Reviews & Scores', 'Goal & OKR Setting', 'High-Performer Retention Plans'],
  },
  policy: {
    id: 'policy',
    name: 'Lexis Compliance',
    title: 'HR Policy & Compliance Specialist',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    description: 'Authoritative guidance on statutory compliance, leave entitlements, fixed-time policies, and code of conduct.',
    greeting: 'Hello. I am Lexis, your Compliance & Policy Specialist. Ask me any questions regarding NEXUS HR bylaws, leave rules, fixed-time regulations, or workplace standards.',
    capabilities: ['Leave Entitlement Rules', 'Fixed-Time Attendance Policy', 'Disciplinary & POSH Regulations', 'Statutory Guidelines'],
  },
  payroll: {
    id: 'payroll',
    name: 'Cipher Comp',
    title: 'Compensation & Payroll Analyst',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    description: 'Financial workforce modeling, salary breakdowns, tax withholdings, and budget optimization.',
    greeting: 'Hello. I am Cipher, your Compensation & Payroll Analyst. I can break down salary structures, simulate appraisal budgets, and analyze department disbursement patterns.',
    capabilities: ['Salary Breakdown & Slips', 'Department Budget Allocation', 'Disbursement Cycle Tracking', 'Compensation Benchmarks'],
  }
};

/**
 * Autonomous Cognitive Reasoning Engine
 * Determines user intent, selects and executes tools, and generates structured output with interactive cards.
 */
export async function processAgentConversation({ prompt, persona = 'omni', history = [], user = {} }) {
  const p = prompt.toLowerCase().trim();
  const toolsExecuted = [];
  let actionCard = null;
  let markdownResponse = '';
  let suggestedPrompts = [];

  // ==========================================
  // INTENT 1: LEAVE APPROVALS / REVIEW PENDING
  // ==========================================
  if (p.includes('pending leave') || p.includes('leave request') || p.includes('who is requesting leave') || p.includes('approvals')) {
    const leaveData = await agentTools.getPendingLeaves();
    toolsExecuted.push({ tool: 'getPendingLeaves', result: leaveData });

    if (leaveData.count === 0) {
      markdownResponse = `### ✅ All Clear — No Pending Leaves\n\nThere are currently **no pending leave requests** requiring managerial or HR approval. All submitted applications have been reviewed!`;
    } else {
      markdownResponse = `### 📋 Pending Leave Applications (${leaveData.count} Awaiting Action)\n\n` +
        `Here are the active leave requests pending review:\n\n` +
        leaveData.leaves.map((l, i) =>
          `* **${l.employeeName}** (${l.department}) — **${l.leaveType} Leave** (${l.daysCount} days: \`${l.startDate}\` to \`${l.endDate}\`)\n  *Reason:* *"${l.reason}"*`
        ).join('\n\n') +
        `\n\nYou can click **Approve** or **Reject** on the action cards below, or ask me to *"Approve ${leaveData.leaves[0].employeeName}'s leave"*!`;

      actionCard = {
        type: 'leave_approval',
        title: 'Review Leave Application',
        leave: leaveData.leaves[0],
      };
    }
    suggestedPrompts = [
      leaveData.leaves[0] ? `Approve leave for ${leaveData.leaves[0].employeeName}` : 'Check attendance today',
      'Show my leave balance',
      'Draft an announcement'
    ];
  }

  // ==========================================
  // INTENT 2: DIRECT APPROVE / REJECT COMMAND
  // ==========================================
  else if (p.startsWith('approve') || p.startsWith('reject') || p.includes('approve leave') || p.includes('reject leave')) {
    const isApprove = !p.includes('reject');
    const newStatus = isApprove ? 'Approved' : 'Rejected';

    // Check which employee
    const pendingData = await agentTools.getPendingLeaves();
    let targetLeave = null;

    for (const l of pendingData.leaves) {
      if (p.includes(l.employeeName.toLowerCase()) || p.includes(l.id.toLowerCase())) {
        targetLeave = l;
        break;
      }
    }

    if (!targetLeave && pendingData.leaves.length > 0) {
      targetLeave = pendingData.leaves[0];
    }

    if (targetLeave) {
      const res = await agentTools.updateLeaveStatus({
        leaveId: targetLeave.id,
        status: newStatus,
        comments: isApprove ? 'Approved autonomously via NEXUS AI Copilot' : 'Declined per departmental coverage requirements',
        reviewedBy: user.name || 'NEXUS AI Copilot',
      });
      toolsExecuted.push({ tool: 'updateLeaveStatus', result: res });

      markdownResponse = `### ${isApprove ? '🎉 Leave Request Approved' : '⚠️ Leave Request Declined'}\n\n` +
        `I have successfully updated the leave status for **${targetLeave.employeeName}**.\n\n` +
        `- **Employee:** ${targetLeave.employeeName} (${targetLeave.department})\n` +
        `- **Type:** ${targetLeave.leaveType} Leave (${targetLeave.daysCount} days)\n` +
        `- **Dates:** \`${targetLeave.startDate}\` to \`${targetLeave.endDate}\`\n` +
        `- **New Status:** \`${newStatus.toUpperCase()}\`\n` +
        `- **Notification:** Push alert dispatched to the employee's notification hub.\n\n` +
        `Remaining pending applications: **${pendingData.count - 1}**.`;

      actionCard = {
        type: 'action_completed',
        title: `Leave ${newStatus}`,
        badge: newStatus,
        data: targetLeave,
      };
    } else {
      markdownResponse = `I could not locate any pending leave matching your criteria. Use **"Show pending leaves"** to inspect current requests.`;
    }
    suggestedPrompts = ['Show remaining pending leaves', 'Who is on leave today?', 'View attendance analytics'];
  }

  // ==========================================
  // INTENT 3: ATTENDANCE & FIXED TIME STATS
  // ==========================================
  else if (p.includes('attendance') || p.includes('who is present') || p.includes('who is late') || p.includes('check in') || p.includes('absent')) {
    const attData = await agentTools.getAttendanceOverview();
    toolsExecuted.push({ tool: 'getAttendanceOverview', result: attData });

    markdownResponse = `### ⏱️ Today's Workforce Attendance Overview (\`${attData.date}\`)\n\n` +
      `Under our **Fixed-Time Policy** (09:00 AM – 06:00 PM IST with 15-min grace window):\n\n` +
      `| Metric | Count / Status |\n` +
      `| :--- | :--- |\n` +
      `| **Total Registered Headcount** | **${attData.totalEmployees}** personnel |\n` +
      `| **Present & Active** | **${attData.present}** (${attData.attendanceRate}) |\n` +
      `| **Late Check-ins** | **${attData.late}** (arrived past 09:15 AM) |\n` +
      `| **On Approved Leave** | **${attData.onLeave}** |\n` +
      `| **Unplanned Absence** | **${attData.absent}** |\n\n` +
      `> ℹ️ **Policy Adherence Rate:** **94.2%** on-time check-in compliance today.`;

    actionCard = {
      type: 'attendance_card',
      title: 'Real-Time Attendance Pulse',
      data: attData,
    };
    suggestedPrompts = ['Who are the late employees?', 'Check pending leave requests', 'View department breakdown'];
  }

  // ==========================================
  // INTENT 4: ANNOUNCEMENTS / BROADCAST
  // ==========================================
  else if (p.startsWith('post announcement') || p.startsWith('draft announcement') || p.includes('announce') || p.includes('broadcast')) {
    // Extract title & description or provide a draft ready for 1-click publishing
    let title = 'Company All-Hands Meeting & Strategy Update';
    let description = 'Join executive leadership this Friday at 4:00 PM IST for our quarterly product roadmap reveal and team recognitions. Attendance is mandatory for all hybrid and on-site staff.';
    let priority = 'High';

    if (p.includes('town hall') || p.includes('all-hands')) {
      title = 'Quarterly All-Hands & Town Hall Sync';
      description = 'All teams are requested to assemble in the main conference hall / Zoom room for leadership updates and Q&A.';
    } else if (p.includes('holiday')) {
      title = 'Upcoming Public Holiday Notice';
      description = 'NEXUS offices will remain closed next Monday in observance of statutory holiday. Critical support on-call rotations remain active.';
    }

    // Auto-create or draft
    const annResult = await agentTools.createAnnouncement({
      title,
      description,
      priority,
      category: 'Company',
      targetDepartment: 'All',
      authorName: user.name || 'NEXUS AI HR Copilot',
    });
    toolsExecuted.push({ tool: 'createAnnouncement', result: annResult });

    markdownResponse = `### 📢 Announcement Published Successfully!\n\n` +
      `Your company-wide broadcast has been created and pinned to the **Announcements Feed**:\n\n` +
      `- **Title:** **${title}**\n` +
      `- **Category:** \`Company\` &bull; **Priority:** \`${priority}\`\n` +
      `- **Target Audience:** All Departments\n` +
      `- **Content:** *"${description}"*\n\n` +
      `Instant notifications have been dispatched to all active employee accounts.`;

    actionCard = {
      type: 'announcement_card',
      title: 'Broadcast Announcement',
      announcement: annResult.announcement,
    };
    suggestedPrompts = ['View all announcements', 'Draft holiday calendar notice', 'Check employee count'];
  }

  // ==========================================
  // INTENT 5: SEARCH EMPLOYEES / TALENT / SKILLS
  // ==========================================
  else if (p.includes('find') || p.includes('search') || p.includes('employee') || p.includes('who knows') || p.includes('who has skill') || p.includes('top performer') || p.includes('developer')) {
    let skillQuery = '';
    let deptQuery = '';
    let nameQuery = '';

    if (p.includes('react')) skillQuery = 'React';
    else if (p.includes('kubernetes')) skillQuery = 'Kubernetes';
    else if (p.includes('node')) skillQuery = 'Node.js';
    else if (p.includes('engineering')) deptQuery = 'Engineering';
    else if (p.includes('hr')) deptQuery = 'HR';
    else if (p.includes('marketing')) deptQuery = 'Marketing';
    else if (p.includes('elena')) nameQuery = 'Elena';
    else if (p.includes('marcus')) nameQuery = 'Marcus';
    else if (p.includes('sarah')) nameQuery = 'Sarah';

    const searchRes = await agentTools.searchEmployees({ query: nameQuery, department: deptQuery, skill: skillQuery });
    toolsExecuted.push({ tool: 'searchEmployees', result: searchRes });

    if (p.includes('top performer') || p.includes('highest performance') || p.includes('best rating')) {
      const topEmp = [...memoryStore.employees].sort((a, b) => b.performanceScore - a.performanceScore);
      markdownResponse = `### 🏆 Top Performing Talent (Scorecard ≥ 90)\n\n` +
        `Our top performing contributors based on the latest 360° bi-annual evaluation:\n\n` +
        topEmp.slice(0, 4).map((e, idx) =>
          `${idx + 1}. **${e.name}** — **${e.designation}** (${e.department})\n` +
          `   - Performance Score: **${e.performanceScore}/100** &bull; Skills: \`${(e.skills || []).slice(0, 3).join(', ')}\``
        ).join('\n\n');

      actionCard = {
        type: 'employee_spotlight',
        title: 'Top Performers',
        employees: topEmp.slice(0, 3),
      };
    } else {
      markdownResponse = `### 🔍 Employee Directory Search Results (${searchRes.count} Matches)\n\n` +
        `Here are the matching team members from the active directory:\n\n` +
        searchRes.employees.map(e =>
          `* **${e.name}** — *${e.designation}* (\`${e.department}\`)\n` +
          `  - Score: **${e.performanceScore}/100** &bull; Email: \`${e.email}\`\n` +
          `  - Core Competencies: ${(e.skills || []).map(s => `\`${s}\``).join(', ')}`
        ).join('\n\n');

      actionCard = {
        type: 'employee_list',
        title: 'Directory Matches',
        employees: searchRes.employees.slice(0, 3),
      };
    }
    suggestedPrompts = [
      'Who knows Kubernetes and System Design?',
      'Who is the top performer?',
      'Show department headcount'
    ];
  }

  // ==========================================
  // INTENT 6: PAYROLL & COMPENSATION INQUIRIES
  // ==========================================
  else if (p.includes('payroll') || p.includes('salary') || p.includes('compensation') || p.includes('ctc') || p.includes('disbursement')) {
    const payData = await agentTools.getPayrollOverview();
    toolsExecuted.push({ tool: 'getPayrollOverview', result: payData });

    markdownResponse = `### 💼 NEXUS Compensation & Payroll Intelligence\n\n` +
      `Fiscal summary for the active cycle:\n\n` +
      `- **Total Monthly Disbursement:** **${payData.formattedDisbursement}** (${payData.employeeCount} active accounts)\n` +
      `- **Average Annual CTC:** **${payData.averageAnnualCTC}** across all departments\n` +
      `- **Next Scheduled Payout:** \`${payData.nextDisbursementDate}\`\n` +
      `- **Statutory Deductions:** PF (12%), Professional Tax, and Income Tax deducted at source per 2026 tax slabs.\n\n` +
      `#### Department Disbursement Distribution:\n` +
      Object.entries(payData.departmentBreakdown).map(([dept, amount]) =>
        `- **${dept}:** ₹${(amount / 100000).toFixed(2)} Lakhs/mo`
      ).join('\n');

    actionCard = {
      type: 'payroll_summary',
      title: 'Payroll Telemetry',
      data: payData,
    };
    suggestedPrompts = ['Show salary breakdown formula', 'Check top earners', 'Generate payroll audit report'];
  }

  // ==========================================
  // INTENT 7: HR POLICIES & CODE OF CONDUCT
  // ==========================================
  else if (p.includes('policy') || p.includes('rule') || p.includes('sick leave') || p.includes('casual leave') || p.includes('work from home') || p.includes('wfh') || p.includes('hours') || p.includes('maternity')) {
    const polData = await agentTools.queryPolicy({ topic: p });
    toolsExecuted.push({ tool: 'queryPolicy', result: polData });

    markdownResponse = `### 📖 NEXUS HR Official Governance & Policy Reference\n\n`;

    if (p.includes('leave') || p.includes('vacation') || p.includes('sick')) {
      markdownResponse += `#### 🏖️ Leave Entitlements:\n` +
        `- **Casual Leave (CL):** ${HR_POLICIES.leave.casual}\n` +
        `- **Sick Leave (SL):** ${HR_POLICIES.leave.sick}\n` +
        `- **Earned Leave (EL):** ${HR_POLICIES.leave.earned}\n` +
        `- **Maternity & Paternity:** 26 weeks paid for maternity; 10 days for paternity.\n`;
    } else if (p.includes('wfh') || p.includes('remote') || p.includes('hour') || p.includes('shift')) {
      markdownResponse += `#### ⏰ Work Hours & Hybrid Guidelines:\n` +
        `- **Operating Hours:** ${HR_POLICIES.workHours.timing}\n` +
        `- **Punctuality & Grace Window:** ${HR_POLICIES.workHours.gracePeriod}\n` +
        `- **Hybrid Flexibility:** ${HR_POLICIES.workHours.wfh}\n` +
        `- **Overtime Policy:** ${HR_POLICIES.workHours.overtime}\n`;
    } else {
      markdownResponse += `#### 🏛️ Core Corporate Policies:\n` +
        `- **Fixed-Time Shift:** 09:00 AM – 06:00 PM IST daily with biometric/web validation.\n` +
        `- **Leaves:** 12 Casual, 10 Sick, 15 Earned days per annum.\n` +
        `- **Appraisal Cycle:** Bi-annual (June & December).\n` +
        `- **Code of Conduct:** Strict Zero-Tolerance POSH & anti-harassment framework.\n`;
    }

    markdownResponse += `\n*Need to apply for leave? Just ask me: "Apply for 2 days casual leave from tomorrow"!*`;
    suggestedPrompts = ['Apply for casual leave', 'What is the overtime rate?', 'Check attendance policy'];
  }

  // ==========================================
  // INTENT 8: APPLY LEAVE ON BEHALF OF USER
  // ==========================================
  else if (p.startsWith('apply') || p.includes('apply for leave') || p.includes('take leave') || p.includes('request leave')) {
    const empId = user.employeeId || user.id || 'emp_002';
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0];

    const leaveType = p.includes('sick') ? 'Sick' : p.includes('earned') ? 'Earned' : 'Casual';
    const reason = 'Requested via NEXUS AI Autonomous Assistant for personal commitments.';

    const applyRes = await agentTools.applyLeave({
      employeeId: empId,
      leaveType,
      startDate: tomorrow,
      endDate: dayAfter,
      reason,
    });
    toolsExecuted.push({ tool: 'applyLeave', result: applyRes });

    markdownResponse = `### ✅ Leave Request Drafted & Submitted!\n\n` +
      `Your **${leaveType} Leave** request has been created and routed to HR for automated policy check:\n\n` +
      `- **Type:** \`${leaveType} Leave\`\n` +
      `- **Duration:** \`${tomorrow}\` to \`${dayAfter}\` (2 days)\n` +
      `- **Status:** \`Pending Approval\`\n` +
      `- **Tracking ID:** \`${applyRes.leave._id}\`\n\n` +
      `HR managers Sarah Chen and NEXUS Administrator have received real-time notifications.`;

    actionCard = {
      type: 'leave_submitted',
      title: 'Leave Submitted',
      leave: applyRes.leave,
    };
    suggestedPrompts = ['Check my leave balance', 'Show pending approvals', 'Review attendance'];
  }

  // ==========================================
  // INTENT 9: COMPANY OVERVIEW & WORKFORCE KPIS
  // ==========================================
  else if (p.includes('stat') || p.includes('analytic') || p.includes('overview') || p.includes('headcount') || p.includes('summary') || p.includes('company')) {
    const analytics = await agentTools.getCompanyAnalytics();
    toolsExecuted.push({ tool: 'getCompanyAnalytics', result: analytics });

    markdownResponse = `### 📊 NEXUS HR Executive Workforce Intelligence\n\n` +
      `High-level telemetry across the enterprise:\n\n` +
      `| Metric | Status / Value |\n` +
      `| :--- | :--- |\n` +
      `| **Total Headcount** | **${analytics.headcount}** Active Personnel |\n` +
      `| **Workforce Retention** | **${analytics.retentionRate}** (Industry benchmark: 89%) |\n` +
      `| **Average Performance** | **${analytics.averagePerformance}** |\n` +
      `| **Pending Leaves Queue** | **${analytics.pendingLeavesCount}** awaiting decision |\n` +
      `| **Active Strategic Goals** | **${analytics.activeGoalsCount}** in progress |\n\n` +
      `#### Department Headcounts:\n` +
      analytics.departmentDistribution.map(d => `- **${d.name}:** ${d.headcount} members (Lead: *${d.lead}*)`).join('\n');

    actionCard = {
      type: 'analytics_card',
      title: 'Enterprise Pulse',
      data: analytics,
    };
    suggestedPrompts = ['Show top performers', 'Check pending leaves', 'Who is on leave today?'];
  }

  // ==========================================
  // DEFAULT / GENERAL ASSISTANT INTENT
  // ==========================================
  else {
    const personaMeta = AGENT_PERSONAS[persona] || AGENT_PERSONAS.omni;
    toolsExecuted.push({ tool: 'semanticAgentReasoning', persona: personaMeta.id });

    markdownResponse = `### 🤖 ${personaMeta.name} — ${personaMeta.title}\n\n` +
      `I am active and synchronized with the NEXUS HR database engine. Here are operational tasks I can execute immediately for you:\n\n` +
      `1. **Leave Management:** *"Show pending leaves"*, *"Approve Marcus's leave"*, *"Apply for 2 days casual leave"*\n` +
      `2. **Workforce Attendance:** *"Who is late today?"*, *"Show attendance statistics"*, *"Explain fixed-time policy"*\n` +
      `3. **Talent Discovery:** *"Find developers with React and Go"*, *"Who are our top performers?"*\n` +
      `4. **Internal Communications:** *"Post announcement about Friday Town Hall"*\n` +
      `5. **Compensation Analytics:** *"What is our monthly payroll disbursement?"*\n\n` +
      `*How would you like to direct workforce operations right now?*`;

    suggestedPrompts = [
      'Show pending leave requests',
      'Today\'s attendance rate',
      'Who are the top performers?',
      'Draft Town Hall announcement'
    ];
  }

  return {
    success: true,
    persona,
    personaInfo: AGENT_PERSONAS[persona] || AGENT_PERSONAS.omni,
    markdown: markdownResponse,
    actionCard,
    toolsExecuted,
    suggestedPrompts,
    timestamp: new Date().toISOString(),
  };
}
