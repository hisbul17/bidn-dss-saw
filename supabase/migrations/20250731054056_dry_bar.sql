/*
  # Enhanced Employee DSS Schema

  1. Schema Updates
    - Add category column to criteria table
    - Add email and phone columns to employees table
    - Add updated_at timestamps
    - Add indexes for better performance

  2. Security
    - Maintain existing foreign key constraints
    - Add proper indexes for query optimization
*/

-- Add category column to criteria table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'criteria' AND column_name = 'category'
  ) THEN
    ALTER TABLE criteria ADD COLUMN category VARCHAR(50) DEFAULT 'Other';
  END IF;
END $$;

-- Add email and phone columns to employees table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'email'
  ) THEN
    ALTER TABLE employees ADD COLUMN email VARCHAR(100);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'phone'
  ) THEN
    ALTER TABLE employees ADD COLUMN phone VARCHAR(20);
  END IF;
END $$;

-- Add updated_at column to criteria table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'criteria' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE criteria ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

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