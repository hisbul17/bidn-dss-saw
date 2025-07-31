import express from 'express';
import { pool } from '../config/database.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all departments
router.get('/', requireAuth, async (req, res) => {
  try {
    const [departments] = await pool.execute(
      'SELECT * FROM departments ORDER BY name'
    );
    
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

export default router;