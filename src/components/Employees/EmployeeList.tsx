import React, { useState, useEffect } from 'react';
import { Users, Search, Award, TrendingUp, Eye, Plus, Edit, Trash2, Filter } from 'lucide-react';
import { Employee } from '../../types';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EmployeeListProps {
  onSelectEmployee: (employee: Employee) => void;
  onAddEmployee?: () => void;
  onEditEmployee?: (employee: Employee) => void;
  onDeleteEmployee?: (employee: Employee) => void;
}

const EmployeeList: React.FC<EmployeeListProps> = ({ 
  onSelectEmployee, 
  onAddEmployee, 
  onEditEmployee, 
  onDeleteEmployee 
}) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'rank'>('name');
  const { user } = useAuth();

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployees();
      setEmployees(data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(employee => 
    !filterDepartment || employee.department_name === filterDepartment
  ).sort((a, b) => {
    switch (sortBy) {
      case 'score':
        return (b.weighted_score || 0) - (a.weighted_score || 0);
      case 'rank':
        return (a.rank_overall || 999) - (b.rank_overall || 999);
      default:
        return a.full_name.localeCompare(b.full_name);
    }
  });

  const departments = [...new Set(employees.map(emp => emp.department_name))];

  const canManageEmployees = ['admin', 'supervisor'].includes(user?.role || '');

  const getRankBadge = (rank?: number) => {
    if (!rank) return null;
    
    if (rank === 1) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">🥇 #1</span>;
    } else if (rank === 2) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">🥈 #2</span>;
    } else if (rank === 3) {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">🥉 #3</span>;
    } else {
      return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">#{rank}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-blue-600" />
            Employees ({filteredEmployees.length})
          </h2>
          {canManageEmployees && onAddEmployee && (
            <button
              onClick={onAddEmployee}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Plus className="h-4 w-4" />
              <span>Add Employee</span>
            </button>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex gap-2">
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'score' | 'rank')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="score">Sort by Score</option>
              <option value="rank">Sort by Rank</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {filteredEmployees.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No employees found</p>
          </div>
        ) : (
          filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
              onClick={() => onSelectEmployee(employee)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {employee.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{employee.full_name}</h3>
                    <p className="text-sm text-gray-600">{employee.employee_code}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-sm text-gray-500">{employee.position}</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-sm text-gray-500">{employee.department_name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {employee.weighted_score && (
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold text-gray-900">
                          {employee.weighted_score.toFixed(2)}
                        </span>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRankBadge(employee.rank_overall)}
                        {employee.is_best_overall && (
                          <Award className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmployee(employee);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      title="View Details"
                    >
                    <Eye className="h-4 w-4" />
                    </button>
                    
                    {canManageEmployees && onEditEmployee && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditEmployee(employee);
                        }}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        title="Edit Employee"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}
                    
                    {canManageEmployees && onDeleteEmployee && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteEmployee(employee);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Employee"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeList;