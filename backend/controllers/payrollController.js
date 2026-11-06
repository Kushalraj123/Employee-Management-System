import Payroll from '../models/Payroll.js';
import { memoryStore, recordAuditLog } from '../store.js';
import mongoose from 'mongoose';

// Helper: Calculate salary breakdown dynamically from configurable payrollRules
const calculateDynamicSalary = (annualCTC, rules = memoryStore.payrollRules) => {
  const r = rules || {
    basicPercentage: 50,
    hraPercentage: 20,
    specialAllowancePercentage: 15,
    pfPercentageOfBasic: 12,
    professionalTaxMonthly: 200,
    standardBonusMonthly: 5000,
    taxBrackets: [
      { minAnnual: 0, maxAnnual: 1200000, ratePercentage: 5 },
      { minAnnual: 1200001, maxAnnual: 2400000, ratePercentage: 10 },
      { minAnnual: 2400001, maxAnnual: 999999999, ratePercentage: 15 },
    ],
  };

  const monthlyGrossBase = Math.round((annualCTC || 1800000) / 12);
  const basicSalary = Math.round(monthlyGrossBase * (r.basicPercentage / 100));
  const hra = Math.round(monthlyGrossBase * (r.hraPercentage / 100));
  const allowances = Math.round(monthlyGrossBase * (r.specialAllowancePercentage / 100));
  const bonus = Number(r.standardBonusMonthly || 5000);
  const pfDeduction = Math.round(basicSalary * (r.pfPercentageOfBasic / 100));

  let taxRate = 10;
  if (Array.isArray(r.taxBrackets)) {
    const bracket = r.taxBrackets.find(b => annualCTC >= b.minAnnual && annualCTC <= b.maxAnnual);
    if (bracket) taxRate = bracket.ratePercentage;
  }
  const taxDeduction = Math.round(monthlyGrossBase * (taxRate / 100)) + Number(r.professionalTaxMonthly || 0);
  const deductions = pfDeduction + taxDeduction;
  const grossSalary = basicSalary + hra + allowances + bonus;
  const netSalary = Math.max(0, grossSalary - deductions);

  return {
    basicSalary,
    hra,
    allowances,
    bonus,
    pfDeduction,
    taxDeduction,
    deductions,
    grossSalary,
    netSalary,
  };
};

// Generate monthly payroll (HR / Admin)
export const generatePayroll = async (req, res) => {
  try {
    const { payPeriod, useDynamicRules = true } = req.body; // 'YYYY-MM' e.g. '2026-10'

    if (!payPeriod || !/^\d{4}-\d{2}$/.test(payPeriod)) {
      return res.status(400).json({
        success: false,
        message: "Valid pay period format 'YYYY-MM' is required.",
      });
    }

    const createdRecords = [];
    let skippedCount = 0;

    memoryStore.employees.forEach((emp, index) => {
      // Check duplicate
      const exists = memoryStore.payrolls.some(
        p => p.employeeId === emp._id && p.payPeriod === payPeriod
      );

      if (exists) {
        skippedCount++;
        return;
      }

      const computed = useDynamicRules
        ? calculateDynamicSalary(emp.salary || 1800000, memoryStore.payrollRules)
        : (emp.salaryStructure || calculateDynamicSalary(emp.salary || 1800000, memoryStore.payrollRules));

      const grossSalary = computed.basicSalary + computed.hra + computed.allowances + (computed.bonus || 0);
      const netSalary = grossSalary - computed.deductions;

      const record = {
        _id: 'pay_' + Date.now() + '_' + index,
        employeeId: emp._id,
        employeeName: emp.name,
        employeeEmail: emp.email,
        department: emp.department,
        designation: emp.designation,
        payPeriod,
        basicSalary: computed.basicSalary,
        hra: computed.hra,
        allowances: computed.allowances,
        bonus: computed.bonus || 0,
        pfDeduction: computed.pfDeduction || Math.round(computed.deductions * 0.45),
        taxDeduction: computed.taxDeduction || Math.round(computed.deductions * 0.55),
        deductions: computed.deductions,
        attendanceAdjustments: 0,
        grossSalary,
        netSalary,
        status: 'Draft',
        paymentDate: null,
        slipNumber: `SLIP-${payPeriod}-${(index + 1).toString().padStart(3, '0')}`,
        remarks: `Generated for cycle ${payPeriod} using configurable payroll rules`,
        createdAt: new Date().toISOString(),
      };

      memoryStore.payrolls.unshift(record);
      createdRecords.push(record);
    });

    recordAuditLog({
      user: req.user,
      action: 'GENERATE_PAYROLL',
      module: 'Payroll',
      details: `Generated payroll for cycle ${payPeriod} (${createdRecords.length} records)`,
    });

    return res.status(201).json({
      success: true,
      message: `Payroll cycle generated. Created ${createdRecords.length} records. (${skippedCount} already existed).`,
      count: createdRecords.length,
      data: createdRecords,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get all payrolls (HR / Admin)
export const getAllPayrolls = async (req, res) => {
  try {
    const { payPeriod, status, department } = req.query;
    let list = [...memoryStore.payrolls];

    if (payPeriod && payPeriod !== 'All') {
      list = list.filter(p => p.payPeriod === payPeriod);
    }
    if (status && status !== 'All') {
      list = list.filter(p => p.status === status);
    }
    if (department && department !== 'All') {
      list = list.filter(p => p.department === department);
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

// Get salary slips for logged in employee only
export const getMySalarySlips = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const { payPeriod } = req.query;

    // Strictly filter only current employee's records
    let slips = memoryStore.payrolls.filter(p => p.employeeId === employeeId);

    if (payPeriod && payPeriod !== 'All') {
      slips = slips.filter(p => p.payPeriod === payPeriod);
    }

    return res.status(200).json({
      success: true,
      count: slips.length,
      data: slips,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get single salary slip with role authorization check
export const getSalarySlipById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;
    const employeeId = user.employeeId || user.id;

    const slip = memoryStore.payrolls.find(p => p._id === id || p.slipNumber === id);
    if (!slip) {
      return res.status(404).json({ success: false, message: 'Salary slip not found.' });
    }

    // Role permission check: Employee can view ONLY their own slip!
    if (user.role === 'employee' && slip.employeeId !== employeeId) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are only authorized to view your own salary slips.",
      });
    }

    return res.status(200).json({
      success: true,
      data: slip,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update payroll status (Draft -> Approved -> Paid)
export const updatePayrollStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Draft', 'Approved', 'Paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Draft', 'Approved', or 'Paid'.",
      });
    }

    const slip = memoryStore.payrolls.find(p => p._id === id || p.id === id);
    if (!slip) {
      return res.status(404).json({ success: false, message: 'Payroll record not found.' });
    }

    slip.status = status;
    if (status === 'Paid') {
      slip.paymentDate = new Date().toISOString();
    }

    return res.status(200).json({
      success: true,
      message: `Payroll status updated to ${status}.`,
      data: slip,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Payroll statistics (HR / Admin)
export const getPayrollStats = async (req, res) => {
  try {
    const totalDisbursed = memoryStore.payrolls
      .filter(p => p.status === 'Paid')
      .reduce((sum, p) => sum + p.netSalary, 0);

    const pendingApproval = memoryStore.payrolls
      .filter(p => p.status === 'Draft')
      .reduce((sum, p) => sum + p.netSalary, 0);

    const readyForPayment = memoryStore.payrolls
      .filter(p => p.status === 'Approved')
      .reduce((sum, p) => sum + p.netSalary, 0);

    return res.status(200).json({
      success: true,
      stats: {
        totalRecords: memoryStore.payrolls.length,
        totalDisbursed,
        pendingApproval,
        readyForPayment,
        paidCount: memoryStore.payrolls.filter(p => p.status === 'Paid').length,
        draftCount: memoryStore.payrolls.filter(p => p.status === 'Draft').length,
        approvedCount: memoryStore.payrolls.filter(p => p.status === 'Approved').length,
      },
      rules: memoryStore.payrollRules,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Configurable Payroll Rules
export const getPayrollRules = async (req, res) => {
  return res.status(200).json({
    success: true,
    data: memoryStore.payrollRules,
  });
};

// Update Configurable Payroll Rules (HR / Admin)
export const updatePayrollRules = async (req, res) => {
  try {
    const updates = req.body;
    memoryStore.payrollRules = {
      ...memoryStore.payrollRules,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    recordAuditLog({
      user: req.user,
      action: 'UPDATE_PAYROLL_RULES',
      module: 'Payroll',
      details: `Updated configurable payroll calculation rules (Basic: ${memoryStore.payrollRules.basicPercentage}%, HRA: ${memoryStore.payrollRules.hraPercentage}%, PF: ${memoryStore.payrollRules.pfPercentageOfBasic}%)`,
    });

    return res.status(200).json({
      success: true,
      message: 'Configurable payroll rules updated successfully.',
      data: memoryStore.payrollRules,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
