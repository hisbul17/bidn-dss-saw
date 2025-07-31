-- =====================================================
-- Employee Decision Support System (DSS)
-- Complete MySQL Database Schema
-- =====================================================
-- Version: 2.0
-- Compatible with: MySQL 8.0+
-- Character Set: UTF-8
-- Storage Engine: InnoDB
-- =====================================================

-- Drop database if exists (use with caution in production)
-- DROP DATABASE IF EXISTS employee_dss;

-- Create database with proper character set and collation
CREATE DATABASE IF NOT EXISTS employee_dss
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Use the database
USE employee_dss;

-- Set SQL mode for strict data validation
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- =====================================================
-- TABLE CREATION
-- =====================================================

-- -----------------------------------------------------
-- Table: departments
-- Purpose: Store organizational departments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes
    INDEX idx_departments_name (name),
    INDEX idx_departments_created (created_at)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Organizational departments';

-- -----------------------------------------------------
-- Table: users
-- Purpose: Authentication and user management
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'supervisor', 'employee') NOT NULL,
    department_id INT NULL,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_users_department 
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE SET NULL ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_department (department_id),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='System users and authentication';

-- -----------------------------------------------------
-- Table: employees
-- Purpose: Employee information and profiles
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    email VARCHAR(100),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_employees_department 
        FOREIGN KEY (department_id) REFERENCES departments(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Indexes
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_name (full_name),
    INDEX idx_employees_department (department_id),
    INDEX idx_employees_active (is_active),
    INDEX idx_employees_hire_date (hire_date),
    INDEX idx_employees_email (email)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Employee profiles and information';

-- -----------------------------------------------------
-- Table: criteria
-- Purpose: Evaluation criteria with weights and categories
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS criteria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    category VARCHAR(50) DEFAULT 'Other',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_criteria_weight 
        CHECK (weight >= 0 AND weight <= 100),
    
    -- Indexes
    INDEX idx_criteria_name (name),
    INDEX idx_criteria_category (category),
    INDEX idx_criteria_active (is_active),
    INDEX idx_criteria_weight (weight)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Evaluation criteria with weights and categories';

-- -----------------------------------------------------
-- Table: evaluation_periods
-- Purpose: Define evaluation time periods
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluation_periods (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('quarterly', 'annual') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_period_dates 
        CHECK (end_date > start_date),
    
    -- Indexes
    INDEX idx_periods_name (name),
    INDEX idx_periods_type (type),
    INDEX idx_periods_active (is_active),
    INDEX idx_periods_dates (start_date, end_date)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Evaluation periods (quarterly/annual)';

-- -----------------------------------------------------
-- Table: evaluations
-- Purpose: Individual evaluation scores and comments
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS evaluations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    period_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(3,2) NOT NULL,
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_evaluations_employee 
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evaluations_evaluator 
        FOREIGN KEY (evaluator_id) REFERENCES users(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT fk_evaluations_period 
        FOREIGN KEY (period_id) REFERENCES evaluation_periods(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_evaluations_criteria 
        FOREIGN KEY (criteria_id) REFERENCES criteria(id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    -- Constraints
    CONSTRAINT chk_evaluation_score 
        CHECK (score >= 1 AND score <= 5),
    
    -- Unique constraint to prevent duplicate evaluations
    CONSTRAINT uk_evaluation_unique 
        UNIQUE KEY (employee_id, period_id, criteria_id, evaluator_id),
    
    -- Indexes
    INDEX idx_evaluations_employee (employee_id),
    INDEX idx_evaluations_evaluator (evaluator_id),
    INDEX idx_evaluations_period (period_id),
    INDEX idx_evaluations_criteria (criteria_id),
    INDEX idx_evaluations_score (score),
    INDEX idx_evaluations_employee_period (employee_id, period_id)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Individual evaluation scores and feedback';

-- -----------------------------------------------------
-- Table: employee_scores
-- Purpose: Calculated final scores and rankings
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS employee_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    period_id INT NOT NULL,
    total_score DECIMAL(6,3) NOT NULL,
    weighted_score DECIMAL(6,3) NOT NULL,
    rank_in_department INT,
    rank_overall INT,
    is_best_in_department BOOLEAN DEFAULT FALSE,
    is_best_overall BOOLEAN DEFAULT FALSE,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Keys
    CONSTRAINT fk_employee_scores_employee 
        FOREIGN KEY (employee_id) REFERENCES employees(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT fk_employee_scores_period 
        FOREIGN KEY (period_id) REFERENCES evaluation_periods(id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    -- Unique constraint for one score per employee per period
    CONSTRAINT uk_employee_period_score 
        UNIQUE KEY (employee_id, period_id),
    
    -- Indexes
    INDEX idx_employee_scores_employee (employee_id),
    INDEX idx_employee_scores_period (period_id),
    INDEX idx_employee_scores_weighted (weighted_score),
    INDEX idx_employee_scores_rank_overall (rank_overall),
    INDEX idx_employee_scores_rank_dept (rank_in_department),
    INDEX idx_employee_scores_best_overall (is_best_overall),
    INDEX idx_employee_scores_best_dept (is_best_in_department)
) ENGINE=InnoDB 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci
  COMMENT='Calculated employee scores and rankings';

-- =====================================================
-- INITIAL DATA INSERTION
-- =====================================================

-- Insert departments
INSERT INTO departments (name, description) VALUES
('Human Resources', 'Manages employee relations and policies'),
('Information Technology', 'Handles technology infrastructure and development'),
('Marketing', 'Manages marketing campaigns and brand strategy'),
('Finance', 'Handles financial operations and accounting'),
('Operations', 'Manages day-to-day business operations');

-- Insert evaluation criteria with categories
INSERT INTO criteria (name, description, weight, category) VALUES
('Work Quality', 'Quality and accuracy of work delivered', 25.00, 'Performance'),
('Productivity', 'Efficiency and output in completing tasks', 20.00, 'Performance'),
('Communication', 'Effectiveness in verbal and written communication', 15.00, 'Soft Skills'),
('Teamwork', 'Collaboration and cooperation with colleagues', 15.00, 'Soft Skills'),
('Initiative', 'Proactive approach and problem-solving skills', 10.00, 'Performance'),
('Punctuality', 'Timeliness and attendance record', 10.00, 'Performance'),
('Leadership', 'Leadership qualities and mentoring abilities', 5.00, 'Leadership');

-- Insert users (managers and employees)
-- Note: Password is 'password' hashed with bcrypt
INSERT INTO users (username, email, password_hash, role, department_id, full_name) VALUES
('admin', 'admin@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 'System Administrator'),
('hr_manager', 'hr.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 1, 'Sarah Johnson'),
('it_manager', 'it.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 2, 'Michael Chen'),
('marketing_manager', 'marketing.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 3, 'Emily Rodriguez'),
('finance_manager', 'finance.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 4, 'David Kim'),
('supervisor', 'supervisor@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supervisor', NULL, 'Jennifer Wilson');

-- Insert employees with contact information
INSERT INTO employees (employee_code, full_name, department_id, position, hire_date, email, phone) VALUES
('EMP001', 'Alice Thompson', 1, 'HR Specialist', '2023-01-15', 'alice.thompson@company.com', '+1 (555) 123-4567'),
('EMP002', 'Bob Williams', 1, 'Recruiter', '2023-03-20', 'bob.williams@company.com', '+1 (555) 234-5678'),
('EMP003', 'Charlie Davis', 2, 'Software Developer', '2022-11-10', 'charlie.davis@company.com', '+1 (555) 345-6789'),
('EMP004', 'Diana Miller', 2, 'System Administrator', '2023-02-28', 'diana.miller@company.com', '+1 (555) 456-7890'),
('EMP005', 'Eva Brown', 2, 'UI/UX Designer', '2023-04-12', 'eva.brown@company.com', '+1 (555) 567-8901'),
('EMP006', 'Frank Wilson', 3, 'Marketing Specialist', '2023-01-08', 'frank.wilson@company.com', '+1 (555) 678-9012'),
('EMP007', 'Grace Lee', 3, 'Content Creator', '2023-05-15', 'grace.lee@company.com', '+1 (555) 789-0123'),
('EMP008', 'Henry Taylor', 4, 'Financial Analyst', '2022-12-05', 'henry.taylor@company.com', '+1 (555) 890-1234'),
('EMP009', 'Iris Martinez', 4, 'Accountant', '2023-03-01', 'iris.martinez@company.com', '+1 (555) 901-2345'),
('EMP010', 'Jack Anderson', 5, 'Operations Coordinator', '2023-02-14', 'jack.anderson@company.com', '+1 (555) 012-3456');

-- Insert evaluation period
INSERT INTO evaluation_periods (name, type, start_date, end_date, is_active) VALUES
('Q1 2024 Evaluation', 'quarterly', '2024-01-01', '2024-03-31', TRUE);

-- Insert sample evaluations
INSERT INTO evaluations (employee_id, evaluator_id, period_id, criteria_id, score, comments) VALUES
-- Alice Thompson evaluations by HR Manager
(1, 2, 1, 1, 4.5, 'Excellent work quality and attention to detail'),
(1, 2, 1, 2, 4.2, 'Very productive and efficient'),
(1, 2, 1, 3, 4.8, 'Outstanding communication skills'),
(1, 2, 1, 4, 4.3, 'Great team player'),
(1, 2, 1, 5, 4.0, 'Shows good initiative'),
(1, 2, 1, 6, 4.9, 'Always punctual and reliable'),
(1, 2, 1, 7, 3.8, 'Developing leadership skills'),

-- Bob Williams evaluations by HR Manager
(2, 2, 1, 1, 4.0, 'Good work quality'),
(2, 2, 1, 2, 3.8, 'Solid productivity'),
(2, 2, 1, 3, 4.2, 'Good communication skills'),
(2, 2, 1, 4, 4.5, 'Excellent team collaboration'),
(2, 2, 1, 5, 3.5, 'Shows initiative when needed'),
(2, 2, 1, 6, 4.1, 'Good attendance record'),
(2, 2, 1, 7, 3.2, 'Basic leadership potential'),

-- Charlie Davis evaluations by IT Manager
(3, 3, 1, 1, 4.7, 'Exceptional coding quality'),
(3, 3, 1, 2, 4.5, 'High productivity'),
(3, 3, 1, 3, 4.0, 'Clear technical communication'),
(3, 3, 1, 4, 4.2, 'Works well in team'),
(3, 3, 1, 5, 4.8, 'Proactive problem solver'),
(3, 3, 1, 6, 4.6, 'Reliable and punctual'),
(3, 3, 1, 7, 4.1, 'Natural technical leader'),

-- Diana Miller evaluations by IT Manager
(4, 3, 1, 1, 4.3, 'Solid technical work'),
(4, 3, 1, 2, 4.1, 'Good productivity levels'),
(4, 3, 1, 3, 3.9, 'Clear communication'),
(4, 3, 1, 4, 4.0, 'Team oriented'),
(4, 3, 1, 5, 3.7, 'Shows initiative'),
(4, 3, 1, 6, 4.4, 'Very reliable'),
(4, 3, 1, 7, 3.5, 'Growing leadership skills'),

-- Eva Brown evaluations by IT Manager
(5, 3, 1, 1, 4.6, 'Outstanding design quality'),
(5, 3, 1, 2, 4.3, 'Very productive designer'),
(5, 3, 1, 3, 4.7, 'Excellent presentation skills'),
(5, 3, 1, 4, 4.4, 'Great collaborator'),
(5, 3, 1, 5, 4.2, 'Creative problem solver'),
(5, 3, 1, 6, 4.5, 'Always on time'),
(5, 3, 1, 7, 3.9, 'Natural design leader');

-- Calculate and insert employee scores
INSERT INTO employee_scores (employee_id, period_id, total_score, weighted_score, rank_in_department, rank_overall, is_best_in_department, is_best_overall) VALUES
(1, 1, 30.5, 4.39, 1, 2, TRUE, FALSE),
(2, 1, 27.3, 3.93, 2, 5, FALSE, FALSE),
(3, 1, 30.9, 4.46, 1, 1, TRUE, TRUE),
(4, 1, 27.9, 4.02, 2, 4, FALSE, FALSE),
(5, 1, 30.6, 4.41, 1, 3, TRUE, FALSE);

-- =====================================================
-- STORED PROCEDURES AND FUNCTIONS
-- =====================================================

-- Delimiter change for stored procedures
DELIMITER //

-- Procedure to recalculate employee scores
CREATE PROCEDURE RecalculateEmployeeScores(IN period_id INT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE emp_id INT;
    DECLARE total_score DECIMAL(6,3);
    DECLARE weighted_score DECIMAL(6,3);
    
    -- Cursor for employees with evaluations in the period
    DECLARE emp_cursor CURSOR FOR
        SELECT DISTINCT employee_id 
        FROM evaluations 
        WHERE period_id = period_id;
    
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    -- Start transaction
    START TRANSACTION;
    
    -- Clear existing scores for the period
    DELETE FROM employee_scores WHERE period_id = period_id;
    
    -- Open cursor
    OPEN emp_cursor;
    
    -- Loop through employees
    emp_loop: LOOP
        FETCH emp_cursor INTO emp_id;
        IF done THEN
            LEAVE emp_loop;
        END IF;
        
        -- Calculate scores for this employee
        SELECT 
            SUM(e.score) as total,
            SUM(e.score * c.weight) / SUM(c.weight) as weighted
        INTO total_score, weighted_score
        FROM evaluations e
        JOIN criteria c ON e.criteria_id = c.id
        WHERE e.employee_id = emp_id AND e.period_id = period_id;
        
        -- Insert calculated score
        INSERT INTO employee_scores (employee_id, period_id, total_score, weighted_score)
        VALUES (emp_id, period_id, total_score, weighted_score);
        
    END LOOP;
    
    -- Close cursor
    CLOSE emp_cursor;
    
    -- Update rankings
    CALL UpdateRankings(period_id);
    
    -- Commit transaction
    COMMIT;
END//

-- Procedure to update rankings
CREATE PROCEDURE UpdateRankings(IN period_id INT)
BEGIN
    -- Update overall rankings
    UPDATE employee_scores es1
    SET rank_overall = (
        SELECT COUNT(*) + 1
        FROM employee_scores es2
        WHERE es2.period_id = es1.period_id
        AND es2.weighted_score > es1.weighted_score
    )
    WHERE es1.period_id = period_id;
    
    -- Update department rankings
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
    WHERE es1.period_id = period_id;
    
    -- Reset best performer flags
    UPDATE employee_scores
    SET is_best_overall = FALSE, is_best_in_department = FALSE
    WHERE period_id = period_id;
    
    -- Mark best overall performer
    UPDATE employee_scores
    SET is_best_overall = TRUE
    WHERE period_id = period_id AND rank_overall = 1;
    
    -- Mark best performers in each department
    UPDATE employee_scores es
    JOIN employees e ON es.employee_id = e.id
    SET es.is_best_in_department = TRUE
    WHERE es.period_id = period_id AND es.rank_in_department = 1;
END//

-- Reset delimiter
DELIMITER ;

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View for employee details with department and scores
CREATE OR REPLACE VIEW v_employee_details AS
SELECT 
    e.id,
    e.employee_code,
    e.full_name,
    e.position,
    e.hire_date,
    e.email,
    e.phone,
    e.is_active,
    d.name as department_name,
    d.id as department_id,
    es.weighted_score,
    es.rank_overall,
    es.rank_in_department,
    es.is_best_overall,
    es.is_best_in_department,
    ep.name as current_period_name
FROM employees e
JOIN departments d ON e.department_id = d.id
LEFT JOIN employee_scores es ON e.id = es.employee_id
LEFT JOIN evaluation_periods ep ON es.period_id = ep.id AND ep.is_active = TRUE;

-- View for evaluation summary
CREATE OR REPLACE VIEW v_evaluation_summary AS
SELECT 
    e.id as evaluation_id,
    emp.employee_code,
    emp.full_name as employee_name,
    d.name as department_name,
    c.name as criteria_name,
    c.category as criteria_category,
    c.weight as criteria_weight,
    e.score,
    e.comments,
    u.full_name as evaluator_name,
    ep.name as period_name,
    e.created_at as evaluation_date
FROM evaluations e
JOIN employees emp ON e.employee_id = emp.id
JOIN departments d ON emp.department_id = d.id
JOIN criteria c ON e.criteria_id = c.id
JOIN users u ON e.evaluator_id = u.id
JOIN evaluation_periods ep ON e.period_id = ep.id;

-- =====================================================
-- TRIGGERS FOR DATA INTEGRITY
-- =====================================================

-- Trigger to update employee scores when evaluations change
DELIMITER //

CREATE TRIGGER tr_evaluation_after_insert
AFTER INSERT ON evaluations
FOR EACH ROW
BEGIN
    -- Recalculate scores for the affected employee and period
    CALL RecalculateEmployeeScores(NEW.period_id);
END//

CREATE TRIGGER tr_evaluation_after_update
AFTER UPDATE ON evaluations
FOR EACH ROW
BEGIN
    -- Recalculate scores for the affected employee and period
    CALL RecalculateEmployeeScores(NEW.period_id);
END//

CREATE TRIGGER tr_evaluation_after_delete
AFTER DELETE ON evaluations
FOR EACH ROW
BEGIN
    -- Recalculate scores for the affected employee and period
    CALL RecalculateEmployeeScores(OLD.period_id);
END//

DELIMITER ;

-- =====================================================
-- PERFORMANCE OPTIMIZATION
-- =====================================================

-- Additional composite indexes for complex queries
CREATE INDEX idx_evaluations_employee_period_criteria ON evaluations(employee_id, period_id, criteria_id);
CREATE INDEX idx_employee_scores_period_weighted ON employee_scores(period_id, weighted_score DESC);
CREATE INDEX idx_employees_dept_active ON employees(department_id, is_active);

-- =====================================================
-- SECURITY AND PERMISSIONS
-- =====================================================

-- Create application user (run separately if needed)
-- CREATE USER IF NOT EXISTS 'dss_app'@'localhost' IDENTIFIED BY 'secure_app_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON employee_dss.* TO 'dss_app'@'localhost';
-- GRANT EXECUTE ON PROCEDURE employee_dss.RecalculateEmployeeScores TO 'dss_app'@'localhost';
-- GRANT EXECUTE ON PROCEDURE employee_dss.UpdateRankings TO 'dss_app'@'localhost';
-- FLUSH PRIVILEGES;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Verify table creation
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'employee_dss'
ORDER BY TABLE_NAME;

-- Verify foreign key constraints
SELECT 
    CONSTRAINT_NAME,
    TABLE_NAME,
    COLUMN_NAME,
    REFERENCED_TABLE_NAME,
    REFERENCED_COLUMN_NAME
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_SCHEMA = 'employee_dss' 
AND REFERENCED_TABLE_NAME IS NOT NULL;

-- Verify indexes
SELECT 
    TABLE_NAME,
    INDEX_NAME,
    COLUMN_NAME,
    SEQ_IN_INDEX
FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'employee_dss'
ORDER BY TABLE_NAME, INDEX_NAME, SEQ_IN_INDEX;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

SELECT 'Employee DSS Database Schema Created Successfully!' as Status,
       NOW() as Timestamp,
       DATABASE() as Database_Name;

-- Show summary of created objects
SELECT 
    'Tables' as Object_Type,
    COUNT(*) as Count
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'employee_dss'
UNION ALL
SELECT 
    'Views' as Object_Type,
    COUNT(*) as Count
FROM information_schema.VIEWS 
WHERE TABLE_SCHEMA = 'employee_dss'
UNION ALL
SELECT 
    'Procedures' as Object_Type,
    COUNT(*) as Count
FROM information_schema.ROUTINES 
WHERE ROUTINE_SCHEMA = 'employee_dss' 
AND ROUTINE_TYPE = 'PROCEDURE'
UNION ALL
SELECT 
    'Triggers' as Object_Type,
    COUNT(*) as Count
FROM information_schema.TRIGGERS 
WHERE TRIGGER_SCHEMA = 'employee_dss';