import { memoryStore } from '../store.js';

export const getSettings = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        organization: {
          name: 'NEXUS Systems International',
          legalEntity: 'NEXUS Enterprise HRMS Corp.',
          timezone: 'Asia/Kolkata',
          currency: 'INR (₹)',
          fiscalYearStart: 'April',
        },
        attendancePolicy: memoryStore.attendancePolicy,
        security: {
          sessionTimeoutMinutes: 60,
          mfaEnforced: false,
          passwordMinLength: 8,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { attendancePolicy, organization } = req.body;

    if (attendancePolicy) {
      memoryStore.attendancePolicy = {
        ...memoryStore.attendancePolicy,
        ...attendancePolicy,
      };
    }

    return res.status(200).json({
      success: true,
      message: 'System settings updated successfully.',
      data: {
        attendancePolicy: memoryStore.attendancePolicy,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
