import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Employee from './models/Employee.js';
import Department from './models/Department.js';
import AttendancePolicy from './models/AttendancePolicy.js';
import Attendance from './models/Attendance.js';
import LeaveRequest from './models/LeaveRequest.js';
import LeaveBalance from './models/LeaveBalance.js';
import Payroll from './models/Payroll.js';
import Announcement from './models/Announcement.js';
import PerformanceReview from './models/PerformanceReview.js';
import Goal from './models/Goal.js';
import { memoryStore } from './store.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nexus_hr';

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB Atlas for seeding...');
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 8000 });
    console.log('✅ Connected to MongoDB Atlas.');

    // Clear existing collections
    await Promise.all([
      User.deleteMany(),
      Employee.deleteMany(),
      Department.deleteMany(),
      AttendancePolicy.deleteMany(),
      Attendance.deleteMany(),
      LeaveRequest.deleteMany(),
      LeaveBalance.deleteMany(),
      Payroll.deleteMany(),
      Announcement.deleteMany(),
      PerformanceReview.deleteMany(),
      Goal.deleteMany(),
    ]);
    console.log('🧹 Cleaned existing database collections.');

    // Seed Departments
    await Department.insertMany(memoryStore.departments);
    console.log('🏢 Departments seeded.');

    // Seed Attendance Policy
    await AttendancePolicy.create(memoryStore.attendancePolicy);
    console.log('⏰ Attendance Policy seeded.');

    // Seed Employees
    await Employee.insertMany(memoryStore.employees);
    console.log('👥 Employees seeded.');

    // Seed Users with hashed passwords
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('Admin@123', salt);
    const hashedHrPassword = await bcrypt.hash('Hr@123', salt);
    const hashedEmpPassword = await bcrypt.hash('Emp@123', salt);

    const usersToInsert = [
      {
        name: 'NEXUS Administrator',
        email: 'admin@nexus.io',
        password: hashedAdminPassword,
        role: 'admin',
        employeeId: 'emp_003',
        status: 'Active',
      },
      {
        name: 'Sarah Chen',
        email: 'sarah.chen@nexus.io',
        password: hashedHrPassword,
        role: 'hr',
        employeeId: 'emp_003',
        status: 'Active',
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@nexus.io',
        password: hashedHrPassword,
        role: 'hr',
        employeeId: 'emp_007',
        status: 'Active',
      },
      {
        name: 'Marcus Vance',
        email: 'marcus.vance@nexus.io',
        password: hashedEmpPassword,
        role: 'employee',
        employeeId: 'emp_002',
        status: 'Active',
      },
      {
        name: 'Elena Rostova',
        email: 'elena.rostova@nexus.io',
        password: hashedEmpPassword,
        role: 'employee',
        employeeId: 'emp_001',
        status: 'Active',
      },
    ];

    await User.insertMany(usersToInsert);
    console.log('🔐 Users & Credentials seeded (Admin, HR, Employee).');

    // Seed Attendance
    await Attendance.insertMany(memoryStore.attendance);
    console.log('📅 Attendance records seeded.');

    // Seed Leave Requests & Balances
    await LeaveRequest.insertMany(memoryStore.leaveRequests);
    const balances = Object.keys(memoryStore.leaveBalances).map(empId => ({
      employeeId: empId,
      ...memoryStore.leaveBalances[empId],
    }));
    await LeaveBalance.insertMany(balances);
    console.log('🏖️ Leaves & Balances seeded.');

    // Seed Payroll
    await Payroll.insertMany(memoryStore.payrolls);
    console.log('💰 Payroll records seeded.');

    // Seed Announcements
    await Announcement.insertMany(memoryStore.announcements);
    console.log('📢 Announcements seeded.');

    // Seed Performance Reviews & Goals
    await PerformanceReview.insertMany(memoryStore.performanceReviews);
    await Goal.insertMany(memoryStore.goals);
    console.log('🎯 Reviews & Goals seeded.');

    console.log('\n========================================');
    console.log('🎉 SEEDING COMPLETE! NEXUS HR IS READY.');
    console.log('Default credentials:');
    console.log('  Admin:    admin@nexus.io     / Admin@123');
    console.log('  HR:       sarah.chen@nexus.io / Hr@123');
    console.log('  Employee: marcus.vance@nexus.io / Emp@123');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding encountered error:', error.message);
    process.exit(1);
  }
};

seedDB();
