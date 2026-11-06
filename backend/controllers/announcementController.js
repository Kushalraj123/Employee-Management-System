import Announcement from '../models/Announcement.js';
import { memoryStore } from '../store.js';
import mongoose from 'mongoose';

// Get announcements
export const getAnnouncements = async (req, res) => {
  try {
    const user = req.user;
    const { category, department } = req.query;

    let list = [...memoryStore.announcements];

    // Filter by department target if employee
    if (user.role === 'employee' && user.department) {
      list = list.filter(a => a.targetDepartment === 'All' || a.targetDepartment === user.department);
    }

    if (category && category !== 'All') {
      list = list.filter(a => a.category === category);
    }
    if (department && department !== 'All') {
      list = list.filter(a => a.targetDepartment === 'All' || a.targetDepartment === department);
    }

    // Sort pinned first, then newest
    list.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.publishDate) - new Date(a.publishDate);
    });

    return res.status(200).json({
      success: true,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Create announcement (HR / Admin)
export const createAnnouncement = async (req, res) => {
  try {
    const user = req.user;
    const { title, description, category = 'General', targetDepartment = 'All', isPinned = false, expiryDate } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required.',
      });
    }

    const newAnnouncement = {
      _id: 'ann_' + Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      targetDepartment,
      isPinned: Boolean(isPinned),
      publishDate: new Date().toISOString(),
      expiryDate: expiryDate || null,
      authorName: user.name,
      authorRole: user.role,
      readBy: [],
      createdAt: new Date().toISOString(),
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const doc = await Announcement.create(newAnnouncement);
        newAnnouncement._id = doc._id;
      } catch (e) {}
    }

    memoryStore.announcements.unshift(newAnnouncement);

    // Global in-app notification
    memoryStore.notifications.unshift({
      _id: 'notif_' + Date.now(),
      userId: 'all',
      title: `Company Announcement: ${title}`,
      message: `${description.substring(0, 100)}...`,
      type: category === 'Urgent Notice' ? 'urgent' : 'info',
      link: '/announcements',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: newAnnouncement,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Mark announcement as read
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    const ann = memoryStore.announcements.find(a => a._id === id || a.id === id);
    if (!ann) {
      return res.status(404).json({ success: false, message: 'Announcement not found.' });
    }

    if (!ann.readBy.includes(userId)) {
      ann.readBy.push(userId);
    }

    return res.status(200).json({
      success: true,
      message: 'Announcement marked as read.',
      data: ann,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete announcement (HR / Admin)
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;
    memoryStore.announcements = memoryStore.announcements.filter(a => a._id !== id && a.id !== id);

    return res.status(200).json({
      success: true,
      message: 'Announcement deleted.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Employee Recognition & Kudos Wall
export const getKudos = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      count: (memoryStore.kudos || []).length,
      data: memoryStore.kudos || [],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Send Kudos / Peer Recognition
export const sendKudos = async (req, res) => {
  try {
    const user = req.user;
    const { toEmployeeId, badge = 'Team Player', message, points = 50 } = req.body;

    if (!toEmployeeId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Recipient employee and recognition message are required.',
      });
    }

    const recipient = memoryStore.employees.find(e => e._id === toEmployeeId || e.id === toEmployeeId);
    const sender = memoryStore.employees.find(e => e._id === user.employeeId || e.email === user.email);

    const newKudos = {
      _id: 'kud_' + Date.now(),
      fromEmployeeId: user.employeeId || user.id,
      fromName: user.name,
      fromAvatar: sender?.avatar || user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      toEmployeeId,
      toName: recipient ? recipient.name : 'Colleague',
      toDepartment: recipient ? recipient.department : 'Engineering',
      toAvatar: recipient?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      badge,
      message: message.trim(),
      points: Number(points) || 50,
      likes: [],
      createdAt: new Date().toISOString(),
    };

    if (!memoryStore.kudos) memoryStore.kudos = [];
    memoryStore.kudos.unshift(newKudos);

    memoryStore.notifications.unshift({
      _id: 'notif_kud_' + Date.now(),
      userId: toEmployeeId,
      title: `🏆 You Received Kudos (${badge})!`,
      message: `${user.name} recognized you: "${message.substring(0, 80)}" (+${newKudos.points} pts)`,
      type: 'success',
      link: '/announcements',
      read: false,
      createdAt: new Date().toISOString(),
    });

    return res.status(201).json({
      success: true,
      message: `Kudos sent to ${newKudos.toName}!`,
      data: newKudos,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Like / Celebrate Kudos
export const likeKudos = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.employeeId || req.user.id || 'usr_current';

    const item = (memoryStore.kudos || []).find(k => k._id === id || k.id === id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Kudos entry not found.' });
    }

    if (!item.likes) item.likes = [];
    if (item.likes.includes(userId)) {
      item.likes = item.likes.filter(u => u !== userId);
    } else {
      item.likes.push(userId);
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
