import PerformanceReview from '../models/PerformanceReview.js';
import Goal from '../models/Goal.js';
import { memoryStore } from '../store.js';
import mongoose from 'mongoose';

// Get reviews
export const getReviews = async (req, res) => {
  try {
    const user = req.user;
    const { employeeId } = req.query;

    let list = [...memoryStore.performanceReviews];

    if (user.role === 'employee') {
      const myEmpId = user.employeeId || user.id || 'emp_002';
      list = list.filter(r => r.employeeId === myEmpId);
    } else if (employeeId) {
      list = list.filter(r => r.employeeId === employeeId);
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

// Create review (HR / Admin)
export const createReview = async (req, res) => {
  try {
    const reviewer = req.user;
    const {
      employeeId,
      reviewCycle,
      rating,
      criteria,
      feedback,
      strengths = [],
      improvementAreas = [],
      status = 'Completed',
    } = req.body;

    if (!employeeId || !reviewCycle || !rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, review cycle, rating, and qualitative feedback are required.',
      });
    }

    const employee = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);

    const newReview = {
      _id: 'rev_' + Date.now(),
      employeeId,
      employeeName: employee ? employee.name : 'Team Member',
      reviewerId: reviewer.id || reviewer._id,
      reviewerName: `${reviewer.name} (${reviewer.role.toUpperCase()})`,
      reviewCycle,
      rating: Number(rating),
      criteria: criteria || {
        technicalExecution: 4,
        leadershipAndInitiative: 4,
        teamworkAndCulture: 4,
        communication: 4,
        velocityAndDelivery: 4,
      },
      feedback,
      strengths: Array.isArray(strengths) ? strengths : [strengths],
      improvementAreas: Array.isArray(improvementAreas) ? improvementAreas : [improvementAreas],
      status,
      createdAt: new Date().toISOString(),
    };

    memoryStore.performanceReviews.unshift(newReview);

    // Update employee's overall performance score
    if (employee) {
      employee.performanceScore = Math.min(100, Math.round((Number(rating) / 5) * 100));
    }

    // Notify employee
    memoryStore.notifications.unshift({
      _id: 'notif_' + Date.now(),
      userId: employeeId,
      title: 'Performance Review Published',
      message: `${newReview.reviewerName} published your ${reviewCycle} performance review (Score: ${rating}/5).`,
      type: 'info',
      link: '/performance/reviews',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Performance review recorded successfully.',
      data: newReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Goals list
export const getGoals = async (req, res) => {
  try {
    const user = req.user;
    const { employeeId } = req.query;

    let list = [...memoryStore.goals];

    if (user.role === 'employee') {
      const myEmpId = user.employeeId || user.id || 'emp_002';
      list = list.filter(g => g.employeeId === myEmpId);
    } else if (employeeId) {
      list = list.filter(g => g.employeeId === employeeId);
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

// Create Goal
export const createGoal = async (req, res) => {
  try {
    const user = req.user;
    const {
      employeeId = user.employeeId || 'emp_002',
      title,
      description,
      category = 'Productivity',
      targetMetric = '100%',
      deadline,
    } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Goal title and target deadline are required.',
      });
    }

    const employee = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);

    const newGoal = {
      _id: 'goal_' + Date.now(),
      employeeId,
      employeeName: employee ? employee.name : user.name,
      title: title.trim(),
      description: description ? description.trim() : '',
      category,
      targetMetric,
      progress: 0,
      deadline,
      status: 'In Progress',
      createdAt: new Date().toISOString(),
    };

    memoryStore.goals.unshift(newGoal);

    return res.status(201).json({
      success: true,
      message: 'Goal created successfully.',
      data: newGoal,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Goal progress
export const updateGoal = async (req, res) => {
  try {
    const { id } = req.params;
    const { progress, status } = req.body;

    const goal = memoryStore.goals.find(g => g._id === id || g.id === id);
    if (!goal) {
      return res.status(404).json({ success: false, message: 'Goal not found.' });
    }

    if (progress !== undefined) {
      goal.progress = Number(progress);
      if (goal.progress >= 100) {
        goal.status = 'Completed';
      }
    }
    if (status) {
      goal.status = status;
    }

    return res.status(200).json({
      success: true,
      message: 'Goal progress updated.',
      data: goal,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
