export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!roles.includes(req.session.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};

export const requireDepartmentAccess = async (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Admin and supervisor can access all departments
  if (['admin', 'supervisor'].includes(req.session.user.role)) {
    return next();
  }

  // Managers can only access their own department
  if (req.session.user.role === 'manager') {
    const { employeeId } = req.params;
    if (employeeId) {
      try {
        const { pool } = await import('../config/database.js');
        const [employees] = await pool.execute(
          'SELECT department_id FROM employees WHERE id = ?',
          [employeeId]
        );
        
        if (employees.length === 0) {
          return res.status(404).json({ error: 'Employee not found' });
        }

        if (employees[0].department_id !== req.session.user.department_id) {
          return res.status(403).json({ error: 'Cannot access employees from other departments' });
        }
      } catch (error) {
        return res.status(500).json({ error: 'Database error' });
      }
    }
  }

  next();
};