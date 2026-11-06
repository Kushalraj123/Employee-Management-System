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

// Submit Self-Assessment (Employee)
export const submitSelfAssessment = async (req, res) => {
  try {
    const user = req.user;
    const employeeId = user.employeeId || user.id || 'emp_002';
    const {
      reviewCycle = 'Q4 2026 Self-Assessment',
      selfRating = 4,
      achievements = '',
      challenges = '',
      developmentGoals = '',
      criteria,
    } = req.body;

    if (!achievements) {
      return res.status(400).json({
        success: false,
        message: 'Key achievements summary is required for self-assessment.',
      });
    }

    const employee = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);

    const selfReview = {
      _id: 'rev_self_' + Date.now(),
      employeeId,
      employeeName: employee ? employee.name : user.name,
      reviewerId: employeeId,
      reviewerName: `${employee ? employee.name : user.name} (Self-Assessment)`,
      reviewCycle,
      rating: Number(selfRating),
      isSelfAssessment: true,
      criteria: criteria || {
        technicalExecution: Number(selfRating),
        leadershipAndInitiative: Number(selfRating),
        teamworkAndCulture: 5,
        communication: 4,
        velocityAndDelivery: Number(selfRating),
      },
      feedback: `Self-Assessment Summary: ${achievements}${challenges ? ` | Challenges Overcome: ${challenges}` : ''}`,
      strengths: [achievements],
      improvementAreas: developmentGoals ? [developmentGoals] : ['Continuous Skill Growth'],
      status: 'Submitted for Manager Review',
      createdAt: new Date().toISOString(),
    };

    memoryStore.performanceReviews.unshift(selfReview);

    return res.status(201).json({
      success: true,
      message: 'Self-assessment submitted successfully.',
      data: selfReview,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update Employee Skill Matrix
export const updateSkillMatrix = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { skillMatrix } = req.body;

    const employee = memoryStore.employees.find(e => e._id === employeeId || e.id === employeeId);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (Array.isArray(skillMatrix)) {
      employee.skillMatrix = skillMatrix;
      employee.skills = skillMatrix.map(s => s.skill);
    }

    return res.status(200).json({
      success: true,
      message: 'Skill development matrix updated.',
      data: employee.skillMatrix,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Department Performance Analytics
export const getPerformanceAnalytics = async (req, res) => {
  try {
    const employees = memoryStore.employees;
    const depts = [...new Set(employees.map(e => e.department))];

    const departmentScores = depts.map(dept => {
      const members = employees.filter(e => e.department === dept);
      const avgScore = Math.round(
        members.reduce((sum, e) => sum + (e.performanceScore || 88), 0) / (members.length || 1)
      );
      const deptGoals = memoryStore.goals.filter(g => members.some(m => m._id === g.employeeId));
      const avgGoalProgress = deptGoals.length > 0
        ? Math.round(deptGoals.reduce((s, g) => s + (g.progress || 0), 0) / deptGoals.length)
        : 82;

      return {
        department: dept,
        headcount: members.length,
        averagePerformanceScore: avgScore,
        averageGoalCompletion: avgGoalProgress,
        topPerformer: [...members].sort((a, b) => (b.performanceScore || 0) - (a.performanceScore || 0))[0]?.name || 'N/A',
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        departmentScores,
        totalReviews: memoryStore.performanceReviews.length,
        totalGoals: memoryStore.goals.length,
        completedGoals: memoryStore.goals.filter(g => g.status === 'Completed' || g.progress >= 100).length,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
