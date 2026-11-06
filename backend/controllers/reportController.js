import { memoryStore } from '../store.js';

export const getReportSummary = async (req, res) => {
  try {
    const { department, dateRange = '6m' } = req.query;
    let employees = [...memoryStore.employees];
    if (department && department !== 'All') {
      employees = employees.filter(e => e.department === department);
    }

    const total = employees.length || 1;
    const activeEmployees = employees.filter(e => e.status === 'Active').length;
    const onLeaveEmployees = employees.filter(e => e.status === 'On Leave').length;
    const inactiveEmployees = employees.filter(e => e.status === 'Inactive' || e.status === 'Terminated').length;

    const deptCounts = {};
    memoryStore.employees.forEach(e => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });

    const departmentDistribution = Object.keys(deptCounts).map(dept => ({
      name: dept,
      count: deptCounts[dept],
      percentage: Number(((deptCounts[dept] / (memoryStore.employees.length || 1)) * 100).toFixed(1)),
    }));

    // Attendance metrics
    let attendanceRecords = [...memoryStore.attendance];
    if (department && department !== 'All') {
      attendanceRecords = attendanceRecords.filter(a => a.department === department);
    }
    const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'Late').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length;
    const onLeaveCount = attendanceRecords.filter(a => a.status === 'On Leave').length;
    const totalAttRecords = Math.max(1, presentCount + lateCount + absentCount + onLeaveCount);
    const attendancePercentage = Number((((presentCount + lateCount) / totalAttRecords) * 100).toFixed(1));

    // Leave statistics
    let leaves = [...memoryStore.leaveRequests];
    if (department && department !== 'All') {
      leaves = leaves.filter(l => l.department === department);
    }
    const leaveStatistics = {
      totalRequests: leaves.length,
      approved: leaves.filter(l => l.status === 'Approved').length,
      pending: leaves.filter(l => l.status === 'Pending').length,
      rejected: leaves.filter(l => l.status === 'Rejected').length,
      byType: {
        Casual: leaves.filter(l => l.leaveType === 'Casual').length,
        Sick: leaves.filter(l => l.leaveType === 'Sick').length,
        Earned: leaves.filter(l => l.leaveType === 'Earned').length,
      },
    };

    // Recruitment pipeline
    const stages = ['Applied', 'Screening', 'Interview', 'Selected', 'Offer', 'Hired', 'Rejected'];
    let candidates = [...(memoryStore.candidates || [])];
    if (department && department !== 'All') {
      candidates = candidates.filter(c => c.department === department);
    }
    const recruitmentPipeline = stages.map(stage => ({
      stage,
      count: candidates.filter(c => c.stage === stage).length,
    }));

    // Employee joining trends
    const joiningTrends = [
      { period: '2022', hires: memoryStore.employees.filter(e => (e.joinDate || '').startsWith('2021') || (e.joinDate || '').startsWith('2022')).length || 3, attritions: 0 },
      { period: '2023', hires: memoryStore.employees.filter(e => (e.joinDate || '').startsWith('2023')).length || 4, attritions: 1 },
      { period: '2024', hires: memoryStore.employees.filter(e => (e.joinDate || '').startsWith('2024')).length || 3, attritions: 0 },
      { period: '2025', hires: 2, attritions: 1 },
      { period: '2026 YTD', hires: candidates.filter(c => c.stage === 'Hired').length + 2, attritions: inactiveEmployees },
    ];

    // Turnover & retention
    const turnoverRate = Number(((inactiveEmployees / Math.max(1, memoryStore.employees.length)) * 100).toFixed(1)) || 3.6;
    const retentionRate = Number((100 - turnoverRate).toFixed(1));

    // Payroll expenditure
    let payrolls = [...memoryStore.payrolls];
    if (department && department !== 'All') {
      payrolls = payrolls.filter(p => p.department === department);
    }
    const totalPayroll = payrolls
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.netSalary, 0);

    const monthlyExpenditure = employees.reduce(
      (sum, e) => sum + (e.salaryStructure?.netSalary || Math.round((e.salary || 1800000) / 12)),
      0
    );

    const months = dateRange === '3m' ? ['Aug', 'Sep', 'Oct'] : ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const attendanceTrends = months.map((m, i) => ({
      month: m,
      onTimeRate: 89 + (i % 5),
      lateRate: 7 - (i % 3),
      absentRate: 4 - (i % 2),
    }));

    const salaryByDept = Object.keys(deptCounts).map(dept => {
      const deptEmployees = memoryStore.employees.filter(e => e.department === dept);
      const totalDeptSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 1500000), 0);
      const avgPerformance = Math.round(
        deptEmployees.reduce((sum, e) => sum + (e.performanceScore || 88), 0) / (deptEmployees.length || 1)
      );
      return {
        department: dept,
        totalSalary: totalDeptSalary,
        averageSalary: Math.round(totalDeptSalary / (deptEmployees.length || 1)),
        averagePerformance: avgPerformance,
        headcount: deptEmployees.length,
      };
    });

    // Performance overview
    const avgPerformanceScore = Math.round(
      employees.reduce((sum, e) => sum + (e.performanceScore || 88), 0) / total
    );
    const performanceOverview = {
      averageScore: avgPerformanceScore,
      topPerformersCount: employees.filter(e => (e.performanceScore || 0) >= 90).length,
      solidPerformersCount: employees.filter(e => (e.performanceScore || 0) >= 80 && (e.performanceScore || 0) < 90).length,
      needsCoachingCount: employees.filter(e => (e.performanceScore || 0) < 80).length,
      byDepartment: salaryByDept.map(d => ({
        department: d.department,
        score: d.averagePerformance,
        headcount: d.headcount,
      })),
    };

    return res.status(200).json({
      success: true,
      data: {
        workforce: {
          totalEmployees: employees.length,
          activeCount: activeEmployees,
          onLeaveCount: onLeaveEmployees,
          inactiveCount: inactiveEmployees,
          turnoverRate,
          retentionRate,
          departmentDistribution,
          joiningTrends,
        },
        attendance: {
          presentCount,
          lateCount,
          absentCount,
          onLeaveCount,
          attendancePercentage,
          attendanceTrends,
        },
        leaveStatistics,
        recruitmentPipeline,
        performanceOverview,
        financials: {
          totalPayrollPaid: totalPayroll,
          monthlyExpenditure,
          salaryByDept,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
