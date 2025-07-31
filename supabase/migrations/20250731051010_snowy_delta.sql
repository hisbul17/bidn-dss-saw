-- Employee Decision Support System Database Schema

CREATE DATABASE IF NOT EXISTS employee_dss;
USE employee_dss;

-- Departments table
CREATE TABLE departments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table (for authentication)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'supervisor', 'employee') NOT NULL,
    department_id INT,
    full_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Employees table (evaluation subjects)
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    position VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id)
);

-- Evaluation criteria
CREATE TABLE criteria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    weight DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Evaluation periods
CREATE TABLE evaluation_periods (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    type ENUM('quarterly', 'annual') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employee evaluations
CREATE TABLE evaluations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    evaluator_id INT NOT NULL,
    period_id INT NOT NULL,
    criteria_id INT NOT NULL,
    score DECIMAL(3,2) NOT NULL CHECK (score >= 1 AND score <= 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id),
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id),
    FOREIGN KEY (criteria_id) REFERENCES criteria(id),
    UNIQUE KEY unique_evaluation (employee_id, period_id, criteria_id, evaluator_id)
);

-- Final employee scores (computed results)
CREATE TABLE employee_scores (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    period_id INT NOT NULL,
    total_score DECIMAL(6,3) NOT NULL,
    weighted_score DECIMAL(6,3) NOT NULL,
    rank_in_department INT,
    rank_overall INT,
    is_best_in_department BOOLEAN DEFAULT FALSE,
    is_best_overall BOOLEAN DEFAULT FALSE,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (period_id) REFERENCES evaluation_periods(id),
    UNIQUE KEY unique_score (employee_id, period_id)
);