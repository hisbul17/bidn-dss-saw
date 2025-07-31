import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get evaluation report data
router.get('/evaluation/:periodId', requireAuth, async (req, res) => {
  try {
    const { periodId } = req.params;
    const user = req.session.user;
    
    // Get period information
    const [periods] = await pool.execute(
      'SELECT * FROM evaluation_periods WHERE id = ?',
      [periodId]
    );
    
    if (periods.length === 0) {
      return res.status(404).json({ error: 'Evaluation period not found' });
    }
    
    // Get employees with scores (filtered by department for managers)
    let query = `
      SELECT 
        e.id, e.employee_code, e.full_name, e.position,
        d.name as department_name,
        es.total_score, es.weighted_score, 
        es.rank_overall, es.rank_in_department,
        es.is_best_overall, es.is_best_in_department
      FROM employees e
      JOIN departments d ON e.department_id = d.id
      LEFT JOIN employee_scores es ON e.id = es.employee_id AND es.period_id = ?
      WHERE e.is_active = TRUE
    `;
    
    let params = [periodId];
    
    if (user.role === 'manager' && user.department_id) {
      query += ' AND e.department_id = ?';
      params.push(user.department_id);
    }
    
    query += ' ORDER BY es.weighted_score DESC, e.full_name';
    
    const [employees] = await pool.execute(query, params);
    
    // Get criteria information
    const [criteria] = await pool.execute(
      'SELECT * FROM criteria WHERE is_active = TRUE ORDER BY name'
    );
    
    // Get detailed evaluations for each employee
    const employeeEvaluations = {};
    for (const employee of employees) {
      if (employee.weighted_score !== null) {
        const [evaluations] = await pool.execute(`
          SELECT 
            c.name as criteria_name, c.weight,
            e.score, e.comments,
            u.full_name as evaluator_name
          FROM evaluations e
          JOIN criteria c ON e.criteria_id = c.id
          JOIN users u ON e.evaluator_id = u.id
          WHERE e.employee_id = ? AND e.period_id = ?
          ORDER BY c.name
        `, [employee.id, periodId]);
        
        employeeEvaluations[employee.id] = evaluations;
      }
    }
    
    res.json({
      period: periods[0],
      employees,
      criteria,
      evaluations: employeeEvaluations
    });
  } catch (error) {
    console.error('Get evaluation report error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation report' });
  }
});

// Get department comparison report
router.get('/departments/:periodId', requireAuth, async (req, res) => {
  try {
    const { periodId } = req.params;
    
    const [departments] = await pool.execute(`
      SELECT 
        d.id, d.name as department_name,
        COUNT(e.id) as employee_count,
        AVG(es.weighted_score) as avg_score,
        MAX(es.weighted_score) as best_score,
        MIN(es.weighted_score) as lowest_score,
        (SELECT e2.full_name 
         FROM employees e2 
         JOIN employee_scores es2 ON e2.id = es2.employee_id 
         WHERE e2.department_id = d.id AND es2.period_id = ? AND es2.is_best_in_department = TRUE
         LIMIT 1) as best_employee
      FROM departments d
      LEFT JOIN employees e ON d.id = e.department_id AND e.is_active = TRUE
      LEFT JOIN employee_scores es ON e.id = es.employee_id AND es.period_id = ?
      GROUP BY d.id, d.name
      HAVING employee_count > 0
      ORDER BY avg_score DESC
    `, [periodId, periodId]);
    
    res.json(departments);
  } catch (error) {
    console.error('Get department report error:', error);
    res.status(500).json({ error: 'Failed to fetch department report' });
  }
});

export default router;