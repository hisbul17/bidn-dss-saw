import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get dashboard statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    
    // Get total employees (filtered by department for managers)
    let employeeQuery = 'SELECT COUNT(*) as total FROM employees WHERE is_active = TRUE';
    let employeeParams = [];
    
    if (user.role === 'manager' && user.department_id) {
      employeeQuery += ' AND department_id = ?';
      employeeParams.push(user.department_id);
    }
    
    const [employeeCount] = await pool.execute(employeeQuery, employeeParams);
    
    // Get active evaluation periods
    const [periods] = await pool.execute(
      'SELECT COUNT(*) as total FROM evaluation_periods WHERE is_active = TRUE'
    );
    
    // Get total evaluations completed
    let evalQuery = `
      SELECT COUNT(*) as total 
      FROM evaluations e 
      JOIN evaluation_periods ep ON e.period_id = ep.id 
      WHERE ep.is_active = TRUE
    `;
    let evalParams = [];
    
    if (user.role === 'manager' && user.department_id) {
      evalQuery += ` AND e.employee_id IN (
        SELECT id FROM employees WHERE department_id = ?
      )`;
      evalParams.push(user.department_id);
    }
    
    const [evalCount] = await pool.execute(evalQuery, evalParams);
    
    // Get departments count
    const [deptCount] = await pool.execute('SELECT COUNT(*) as total FROM departments');
    
    res.json({
      totalEmployees: employeeCount[0].total,
      activePeriods: periods[0].total,
      completedEvaluations: evalCount[0].total,
      totalDepartments: deptCount[0].total
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Get top performers
router.get('/top-performers', requireAuth, async (req, res) => {
  try {
    const user = req.session.user;
    
    let query = `
      SELECT 
        e.id,
        e.full_name,
        e.employee_code,
        d.name as department_name,
        es.weighted_score,
        es.rank_overall,
        es.rank_in_department,
        es.is_best_overall,
        es.is_best_in_department
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      JOIN employee_scores es ON e.id = es.employee_id
      JOIN evaluation_periods ep ON es.period_id = ep.id
      WHERE ep.is_active = TRUE AND e.is_active = TRUE
    `;
    
    let params = [];
    
    if (user.role === 'manager' && user.department_id) {
      query += ' AND e.department_id = ?';
      params.push(user.department_id);
    }
    
    query += ' ORDER BY es.weighted_score DESC LIMIT 10';
    
    const [topPerformers] = await pool.execute(query, params);
    
    res.json(topPerformers);
  } catch (error) {
    console.error('Top performers error:', error);
    res.status(500).json({ error: 'Failed to fetch top performers' });
  }
});

// Get department rankings
router.get('/department-rankings', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT 
        d.name as department_name,
        AVG(es.weighted_score) as avg_score,
        COUNT(e.id) as employee_count,
        MAX(es.weighted_score) as best_score,
        (SELECT e2.full_name 
         FROM employees e2 
         JOIN employee_scores es2 ON e2.id = es2.employee_id 
         WHERE e2.department_id = d.id AND es2.weighted_score = MAX(es.weighted_score)
         LIMIT 1) as best_employee
      FROM departments d
      JOIN employees e ON d.id = e.department_id
      JOIN employee_scores es ON e.id = es.employee_id
      JOIN evaluation_periods ep ON es.period_id = ep.id
      WHERE ep.is_active = TRUE AND e.is_active = TRUE
      GROUP BY d.id, d.name
      ORDER BY avg_score DESC
    `;
    
    const [rankings] = await pool.execute(query);
    
    res.json(rankings);
  } catch (error) {
    console.error('Department rankings error:', error);
    res.status(500).json({ error: 'Failed to fetch department rankings' });
  }
});

export default router;