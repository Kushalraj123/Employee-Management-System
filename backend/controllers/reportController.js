import { memoryStore } from '../store.js';

export const getReportSummary = async (req, res) => {
  try {
    const employees = memoryStore.employees;
    const total = employees.length;

    const deptCounts = {};
    employees.forEach(e => {
      deptCounts[e.department] = (deptCounts[e.department] || 0) + 1;
    });

    const departmentDistribution = Object.keys(deptCounts).map(dept => ({
      name: dept,
      count: deptCounts[dept],
      percentage: Number(((deptCounts[dept] / total) * 100).toFixed(1)),
    }));

    const attendanceRecords = memoryStore.attendance;
    const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
    const lateCount = attendanceRecords.filter(a => a.status === 'Late').length;
    const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length;
    const onLeaveCount = attendanceRecords.filter(a => a.status === 'On Leave').length;

    const totalPayroll = memoryStore.payrolls
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.netSalary, 0);

    const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
    const attendanceTrends = months.map((m, i) => ({
      month: m,
      onTimeRate: 88 + (i % 5),
      lateRate: 8 - (i % 3),
      absentRate: 4 - (i % 2),
    }));

    const salaryByDept = Object.keys(deptCounts).map(dept => {
      const deptEmployees = employees.filter(e => e.department === dept);
      const totalDeptSalary = deptEmployees.reduce((sum, e) => sum + (e.salary || 1500000), 0);
      return {
        department: dept,
        totalSalary: totalDeptSalary,
        averageSalary: Math.round(totalDeptSalary / deptEmployees.length),
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        workforce: {
          totalEmployees: total,
          activeCount: employees.filter(e => e.status === 'Active').length,
          onLeaveCount: employees.filter(e => e.status === 'On Leave').length,
          departmentDistribution,
        },
        attendance: {
          presentCount,
          lateCount,
          absentCount,
          onLeaveCount,
          attendanceTrends,
        },
        financials: {
          totalPayrollPaid: totalPayroll,
          salaryByDept,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
