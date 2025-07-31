-- Enhanced Employee DSS Schema for MySQL
-- Run this after the initial schema and seed data

USE employee_dss;

-- Add category column to criteria table if it doesn't exist
ALTER TABLE criteria 
ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'Other';

-- Add email and phone columns to employees table if they don't exist
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS email VARCHAR(100),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add updated_at column to criteria table if it doesn't exist
ALTER TABLE criteria 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- Update existing criteria with categories
UPDATE criteria SET category = 'Performance' WHERE name IN ('Work Quality', 'Productivity');
UPDATE criteria SET category = 'Soft Skills' WHERE name IN ('Communication', 'Teamwork');
UPDATE criteria SET category = 'Performance' WHERE name IN ('Initiative', 'Punctuality');
UPDATE criteria SET category = 'Leadership' WHERE name = 'Leadership';

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_evaluations_employee_period ON evaluations(employee_id, period_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_period ON evaluations(period_id);
CREATE INDEX IF NOT EXISTS idx_criteria_active ON criteria(is_active);
CREATE INDEX IF NOT EXISTS idx_criteria_category ON criteria(category);
CREATE INDEX IF NOT EXISTS idx_employee_scores_period ON employee_scores(period_id);
CREATE INDEX IF NOT EXISTS idx_employee_scores_employee ON employee_scores(employee_id);

-- Add some sample email and phone data for existing employees
UPDATE employees SET 
  email = CONCAT(LOWER(REPLACE(full_name, ' ', '.')), '@company.com'),
  phone = CONCAT('+1 (555) ', LPAD(FLOOR(RAND() * 1000), 3, '0'), '-', LPAD(FLOOR(RAND() * 10000), 4, '0'))
WHERE email IS NULL;

-- Verify the schema changes
SELECT 'Schema enhancement completed successfully' as status;