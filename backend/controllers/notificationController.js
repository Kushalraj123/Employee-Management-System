import { memoryStore } from '../store.js';

const isForUser = (n, user) => {
  const userId = user.id || user._id;
  return (
    n.userId === userId ||
    (user.employeeId && n.userId === user.employeeId) ||
    n.userId === 'all' ||
    (n.userId === 'usr_hr' && user.role === 'hr') ||
    (n.userId === 'usr_admin' && user.role === 'admin')
  );
};

export const getNotifications = async (req, res) => {
  try {
    const user = req.user;

    // Filter notifications addressed to this user, their employee record, their role, or 'all'
    const list = memoryStore.notifications.filter(n => isForUser(n, user));

    const unreadCount = list.filter(n => !n.read).length;

    return res.status(200).json({
      success: true,
      unreadCount,
      count: list.length,
      data: list,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = memoryStore.notifications.find(n => n._id === id || n.id === id);
    if (notif) {
      notif.read = true;
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: notif,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    const user = req.user;

    memoryStore.notifications.forEach(n => {
      if (isForUser(n, user)) {
        n.read = true;
      }
    });

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
