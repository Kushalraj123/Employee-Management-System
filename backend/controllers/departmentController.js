import { memoryStore } from '../store.js';

export const getDepartments = async (req, res) => {
  try {
    // Dynamic calculate count based on employees
    const list = memoryStore.departments.map(dept => {
      const count = memoryStore.employees.filter(e => e.department.toLowerCase() === dept.name.toLowerCase()).length;
      return {
        ...dept,
        employeeCount: count || dept.employeeCount,
      };
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

export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, head = 'Unassigned', budget = 10000000, color = '#3B82F6' } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const newDept = {
      _id: 'dept_' + Date.now(),
      id: 'dept_' + Date.now(),
      name: name.trim(),
      code: code.trim().toUpperCase(),
      description: description ? description.trim() : '',
      head,
      budget: Number(budget),
      employeeCount: 0,
      color,
    };

    memoryStore.departments.push(newDept);

    return res.status(201).json({
      success: true,
      message: 'Department added successfully.',
      data: newDept,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const index = memoryStore.departments.findIndex(d => d._id === id || d.id === id);

    if (index === -1) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    memoryStore.departments[index] = {
      ...memoryStore.departments[index],
      ...req.body,
    };

    return res.status(200).json({
      success: true,
      message: 'Department updated.',
      data: memoryStore.departments[index],
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    memoryStore.departments = memoryStore.departments.filter(d => d._id !== id && d.id !== id);

    return res.status(200).json({
      success: true,
      message: 'Department deleted successfully.',
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
