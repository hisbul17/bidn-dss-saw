export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'manager' | 'supervisor' | 'employee';
  department_id?: number;
  department_name?: string;
  full_name: string;
}

export interface Employee {
  id: number;
  employee_code: string;
  full_name: string;
  position: string;
  hire_date: string;
  department_name: string;
  department_id: number;
  weighted_score?: number;
  rank_in_department?: number;
  rank_overall?: number;
  is_best_in_department?: boolean;
  is_best_overall?: boolean;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
}

export interface Criteria {
  id: number;
  name: string;
  description?: string;
  weight: number;
  is_active: boolean;
}

export interface EvaluationPeriod {
  id: number;
  name: string;
  type: 'quarterly' | 'annual';
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface Evaluation {
  id?: number;
  employee_id: number;
  evaluator_id: number;
  period_id: number;
  criteria_id: number;
  score: number;
  comments?: string;
  criteria_name?: string;
  weight?: number;
  evaluator_name?: string;
}

export interface EmployeeScore {
  id: number;
  employee_id: number;
  period_id: number;
  total_score: number;
  weighted_score: number;
  rank_in_department?: number;
  rank_overall?: number;
  is_best_in_department: boolean;
  is_best_overall: boolean;
}

export interface DashboardStats {
  totalEmployees: number;
  activePeriods: number;
  completedEvaluations: number;
  totalDepartments: number;
}

export interface TopPerformer extends Employee {
  weighted_score: number;
  rank_overall: number;
  rank_in_department: number;
}

export interface DepartmentRanking {
  department_name: string;
  avg_score: number;
  employee_count: number;
  best_score: number;
  best_employee: string;
}