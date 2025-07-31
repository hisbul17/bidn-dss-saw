import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth, requireDepartmentAccess, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Get all employees (filtered by department for managers)
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    
    let query = `
      SELECT 
        e.id, e.employee_code, e.full_name, e.position, e.hire_date,
        d.name as department_name, e.department_id,
        es.weighted_score, es.rank_in_department, es.rank_overall
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_scores es ON e.id = es.employee_id
      LEFT JOIN evaluation_periods ep ON es.period_id = ep.id AND ep.is_active = TRUE
      WHERE e.is_active = TRUE
    `;
    
    let params = [];
    
    if (user.role === 'manager' && user.department_id) {
      query += ' AND e.department_id = ?';
      params.push(user.department_id);
    }
    
    query += ' ORDER BY e.full_name';
    
    const [employees] = await pool.execute(query, params);
    
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Create new employee
router.post('/', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { employee_code, full_name, department_id, position, hire_date, email, phone, is_active } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO employees (employee_code, full_name, department_id, position, hire_date, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [employee_code, full_name, department_id, position, hire_date, is_active !== false]
    );
    
    res.json({ message: 'Employee created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Employee code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create employee' });
    }
  }
});

// Update employee
router.put('/:id', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { employee_code, full_name, department_id, position, hire_date, email, phone, is_active } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE employees SET employee_code = ?, full_name = ?, department_id = ?, position = ?, hire_date = ?, is_active = ? WHERE id = ?',
      [employee_code, full_name, department_id, position, hire_date, is_active !== false, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee updated successfully' });
  } catch (error) {
    console.error('Update employee error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Employee code already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update employee' });
    }
  }
});

// Delete employee (soft delete)
router.delete('/:id', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE employees SET is_active = FALSE WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({ error: 'Failed to delete employee' });
  }
});

// Get employee details
router.get('/:id', requireAuth, requireDepartmentAccess, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [employees] = await pool.execute(`
      SELECT 
        e.*, d.name as department_name,
        es.weighted_score, es.rank_in_department, es.rank_overall,
        es.is_best_in_department, es.is_best_overall
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_scores es ON e.id = es.employee_id
      LEFT JOIN evaluation_periods ep ON es.period_id = ep.id AND ep.is_active = TRUE
      WHERE e.id = ? AND e.is_active = TRUE
    `, [id]);
    
    if (employees.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    
    // Get evaluation details
    const [evaluations] = await pool.execute(`
      SELECT 
        c.name as criteria_name, c.weight,
        ev.score, ev.comments,
        u.full_name as evaluator_name
      FROM evaluations ev
      JOIN criteria c ON ev.criteria_id = c.id
      JOIN users u ON ev.evaluator_id = u.id
      JOIN evaluation_periods ep ON ev.period_id = ep.id
      WHERE ev.employee_id = ? AND ep.is_active = TRUE
      ORDER BY c.name
    `, [id]);
    
    res.json({
      employee: employees[0],
      evaluations
    });
  } catch (error) {
    console.error('Get employee details error:', error);
    res.status(500).json({ error: 'Failed to fetch employee details' });
  }
});

export default router;