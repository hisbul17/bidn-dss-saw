-- Seed data for Employee DSS

USE employee_dss;

-- Insert departments
INSERT INTO departments (name, description) VALUES
('Human Resources', 'Manages employee relations and policies'),
('Information Technology', 'Handles technology infrastructure and development'),
('Marketing', 'Manages marketing campaigns and brand strategy'),
('Finance', 'Handles financial operations and accounting'),
('Operations', 'Manages day-to-day business operations');

-- Insert evaluation criteria
INSERT INTO criteria (name, description, weight) VALUES
('Work Quality', 'Quality and accuracy of work delivered', 25.00),
('Productivity', 'Efficiency and output in completing tasks', 20.00),
('Communication', 'Effectiveness in verbal and written communication', 15.00),
('Teamwork', 'Collaboration and cooperation with colleagues', 15.00),
('Initiative', 'Proactive approach and problem-solving skills', 10.00),
('Punctuality', 'Timeliness and attendance record', 10.00),
('Leadership', 'Leadership qualities and mentoring abilities', 5.00);

-- Insert users (managers and employees)
INSERT INTO users (username, email, password_hash, role, department_id, full_name) VALUES
('admin', 'admin@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NULL, 'System Administrator'),
('hr_manager', 'hr.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 1, 'Sarah Johnson'),
('it_manager', 'it.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 2, 'Michael Chen'),
('marketing_manager', 'marketing.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 3, 'Emily Rodriguez'),
('finance_manager', 'finance.manager@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager', 4, 'David Kim'),
('supervisor', 'supervisor@company.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'supervisor', NULL, 'Jennifer Wilson');

-- Insert employees
INSERT INTO employees (employee_code, full_name, department_id, position, hire_date) VALUES
('EMP001', 'Alice Thompson', 1, 'HR Specialist', '2023-01-15'),
('EMP002', 'Bob Williams', 1, 'Recruiter', '2023-03-20'),
('EMP003', 'Charlie Davis', 2, 'Software Developer', '2022-11-10'),
('EMP004', 'Diana Miller', 2, 'System Administrator', '2023-02-28'),
('EMP005', 'Eva Brown', 2, 'UI/UX Designer', '2023-04-12'),
('EMP006', 'Frank Wilson', 3, 'Marketing Specialist', '2023-01-08'),
('EMP007', 'Grace Lee', 3, 'Content Creator', '2023-05-15'),
('EMP008', 'Henry Taylor', 4, 'Financial Analyst', '2022-12-05'),
('EMP009', 'Iris Martinez', 4, 'Accountant', '2023-03-01'),
('EMP010', 'Jack Anderson', 5, 'Operations Coordinator', '2023-02-14');

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
(3, 3, 1, 7, 4.1, 'Natural technical leader');