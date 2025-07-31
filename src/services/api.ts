const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  // Dashboard endpoints
  async getDashboardStats() {
    return this.request('/dashboard/stats');
  }

  async getTopPerformers() {
    return this.request('/dashboard/top-performers');
  }

  async getDepartmentRankings() {
    return this.request('/dashboard/department-rankings');
  }

  // Employee endpoints
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployee(id: number) {
    return this.request(`/employees/${id}`);
  }

  // Evaluation endpoints
  async getCriteria() {
    return this.request('/evaluations/criteria');
  }

  async getEvaluationPeriods() {
    return this.request('/evaluations/periods');
  }

  async getEmployeeEvaluations(employeeId: number, periodId: number) {
    return this.request(`/evaluations/employee/${employeeId}/period/${periodId}`);
  }

  async submitEvaluation(data: {
    employeeId: number;
    periodId: number;
    evaluations: Array<{
      criteria_id: number;
      score: number;
      comments?: string;
    }>;
  }) {
    return this.request('/evaluations/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async recalculateScores(periodId: number) {
    return this.request(`/evaluations/recalculate/${periodId}`, {
      method: 'POST',
    });
  }

  // Report endpoints
  async getEvaluationReport(periodId: number) {
    return this.request(`/reports/evaluation/${periodId}`);
  }

  async getDepartmentReport(periodId: number) {
    return this.request(`/reports/departments/${periodId}`);
  }
}

export const apiService = new ApiService();