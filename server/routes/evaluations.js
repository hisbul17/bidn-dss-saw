import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth, requireRole, requireDepartmentAccess } from '../middleware/auth.js';

const router = express.Router();

// Get evaluation criteria
router.get('/criteria', requireAuth, async (req, res) => {
  try {
    const [criteria] = await pool.execute(
      'SELECT * FROM criteria ORDER BY category, name'
    );
    res.json(criteria);
  } catch (error) {
    console.error('Get criteria error:', error);
    res.status(500).json({ error: 'Failed to fetch criteria' });
  }
});

// Create new criteria
router.post('/criteria', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { name, description, weight, category, is_active } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO criteria (name, description, weight, category, is_active) VALUES (?, ?, ?, ?, ?)',
      [name, description, weight, category || 'Other', is_active !== false]
    );
    
    res.json({ message: 'Criteria created successfully', id: result.insertId });
  } catch (error) {
    console.error('Create criteria error:', error);
    res.status(500).json({ error: 'Failed to create criteria' });
  }
});

// Update criteria
router.put('/criteria/:id', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, weight, category, is_active } = req.body;
    
    const [result] = await pool.execute(
      'UPDATE criteria SET name = ?, description = ?, weight = ?, category = ?, is_active = ? WHERE id = ?',
      [name, description, weight, category || 'Other', is_active !== false, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Criteria not found' });
    }
    
    res.json({ message: 'Criteria updated successfully' });
  } catch (error) {
    console.error('Update criteria error:', error);
    res.status(500).json({ error: 'Failed to update criteria' });
  }
});

// Delete criteria
router.delete('/criteria/:id', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if criteria is used in evaluations
    const [evaluations] = await pool.execute(
      'SELECT COUNT(*) as count FROM evaluations WHERE criteria_id = ?',
      [id]
    );
    
    if (evaluations[0].count > 0) {
      return res.status(400).json({ error: 'Cannot delete criteria that is used in evaluations' });
    }
    
    const [result] = await pool.execute(
      'DELETE FROM criteria WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Criteria not found' });
    }
    
    res.json({ message: 'Criteria deleted successfully' });
  } catch (error) {
    console.error('Delete criteria error:', error);
    res.status(500).json({ error: 'Failed to delete criteria' });
  }
});

// Get evaluation periods
router.get('/periods', requireAuth, async (req, res) => {
  try {
    const [periods] = await pool.execute(
      'SELECT * FROM evaluation_periods ORDER BY start_date DESC'
    );
    res.json(periods);
  } catch (error) {
    console.error('Get periods error:', error);
    res.status(500).json({ error: 'Failed to fetch evaluation periods' });
  }
});

// Get employee evaluations for a specific period
router.get('/employee/:employeeId/period/:periodId', requireAuth, requireDepartmentAccess, async (req, res) => {
  try {
    const { employeeId, periodId } = req.params;
    
    const [evaluations] = await pool.execute(`
      SELECT 
        e.id, e.criteria_id, e.score, e.comments,
        c.name as criteria_name, c.weight,
        u.full_name as evaluator_name
      FROM evaluations e
      JOIN criteria c ON e.criteria_id = c.id
      JOIN users u ON e.evaluator_id = u.id
      WHERE e.employee_id = ? AND e.period_id = ?
      ORDER BY c.name
    `, [employeeId, periodId]);
    
    res.json(evaluations);
  } catch (error) {
    console.error('Get employee evaluations error:', error);
    res.status(500).json({ error: 'Failed to fetch employee evaluations' });
  }
});

// Submit or update evaluation
router.post('/submit', requireAuth, requireRole(['manager', 'supervisor', 'admin']), async (req, res) => {
  try {
    const { employeeId, periodId, evaluations } = req.body;
    const evaluatorId = req.session.user.id;
    
    // Verify department access for managers
    if (req.session.user.role === 'manager') {
      const [employee] = await pool.execute(
        'SELECT department_id FROM employees WHERE id = ?',
        [employeeId]
      );
      
      if (employee.length === 0) {
        return res.status(404).json({ error: 'Employee not found' });
      }
      
      if (employee[0].department_id !== req.session.user.department_id) {
        return res.status(403).json({ error: 'Cannot evaluate employees from other departments' });
      }
    }
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Delete existing evaluations for this employee/period/evaluator
      await connection.execute(
        'DELETE FROM evaluations WHERE employee_id = ? AND period_id = ? AND evaluator_id = ?',
        [employeeId, periodId, evaluatorId]
      );
      
      // Insert new evaluations
      for (const evaluation of evaluations) {
        await connection.execute(
          'INSERT INTO evaluations (employee_id, evaluator_id, period_id, criteria_id, score, comments) VALUES (?, ?, ?, ?, ?, ?)',
          [employeeId, evaluatorId, periodId, evaluation.criteria_id, evaluation.score, evaluation.comments || '']
        );
      }
      
      // Recalculate employee score
      await recalculateEmployeeScore(connection, employeeId, periodId);
      
      await connection.commit();
      res.json({ message: 'Evaluation submitted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Submit evaluation error:', error);
    res.status(500).json({ error: 'Failed to submit evaluation' });
  }
});

// Recalculate all scores for a period
router.post('/recalculate/:periodId', requireAuth, requireRole(['admin', 'supervisor']), async (req, res) => {
  try {
    const { periodId } = req.params;
    
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Get all employees with evaluations in this period
      const [employees] = await connection.execute(`
        SELECT DISTINCT employee_id 
        FROM evaluations 
        WHERE period_id = ?
      `, [periodId]);
      
      // Recalculate scores for each employee
      for (const employee of employees) {
        await recalculateEmployeeScore(connection, employee.employee_id, periodId);
      }
      
      // Update rankings
      await updateRankings(connection, periodId);
      
      await connection.commit();
      res.json({ message: 'Scores recalculated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Recalculate scores error:', error);
    res.status(500).json({ error: 'Failed to recalculate scores' });
  }
});

// Helper function to recalculate employee score
async function recalculateEmployeeScore(connection, employeeId, periodId) {
  // Get all evaluations for this employee in this period
  const [evaluations] = await connection.execute(`
    SELECT e.score, c.weight
    FROM evaluations e
    JOIN criteria c ON e.criteria_id = c.id
    WHERE e.employee_id = ? AND e.period_id = ?
  `, [employeeId, periodId]);
  
  if (evaluations.length === 0) {
    return;
  }
  
  // Calculate weighted score using SAW method
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  for (const evaluation of evaluations) {
    totalWeightedScore += evaluation.score * evaluation.weight;
    totalWeight += evaluation.weight;
  }
  
  const weightedScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const totalScore = evaluations.reduce((sum, e) => sum + e.score, 0);
  
  // Insert or update employee score
  await connection.execute(`
    INSERT INTO employee_scores (employee_id, period_id, total_score, weighted_score)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
    total_score = VALUES(total_score),
    weighted_score = VALUES(weighted_score),
    calculated_at = CURRENT_TIMESTAMP
  `, [employeeId, periodId, totalScore, weightedScore]);
}

// Helper function to update rankings
async function updateRankings(connection, periodId) {
  // Update overall rankings
  await connection.execute(`
    UPDATE employee_scores es1
    SET rank_overall = (
      SELECT COUNT(*) + 1
      FROM employee_scores es2
      WHERE es2.period_id = es1.period_id
      AND es2.weighted_score > es1.weighted_score
    )
    WHERE es1.period_id = ?
  `, [periodId]);
  
  // Update department rankings
  await connection.execute(`
    UPDATE employee_scores es1
    JOIN employees e1 ON es1.employee_id = e1.id
    SET es1.rank_in_department = (
      SELECT COUNT(*) + 1
      FROM employee_scores es2
      JOIN employees e2 ON es2.employee_id = e2.id
      WHERE es2.period_id = es1.period_id
      AND e2.department_id = e1.department_id
      AND es2.weighted_score > es1.weighted_score
    )
    WHERE es1.period_id = ?
  `, [periodId]);
  
  // Mark best performers
  await connection.execute(`
    UPDATE employee_scores
    SET is_best_overall = FALSE, is_best_in_department = FALSE
    WHERE period_id = ?
  `, [periodId]);
  
  // Mark best overall
  await connection.execute(`
    UPDATE employee_scores
    SET is_best_overall = TRUE
    WHERE period_id = ? AND rank_overall = 1
  `, [periodId]);
  
  // Mark best in each department
  await connection.execute(`
    UPDATE employee_scores es
    JOIN employees e ON es.employee_id = e.id
    SET es.is_best_in_department = TRUE
    WHERE es.period_id = ? AND es.rank_in_department = 1
  `, [periodId]);
}

export default router;