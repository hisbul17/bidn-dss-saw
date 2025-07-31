import React, { useState, useEffect } from 'react';
import { ArrowLeft, User, Building2, Calendar, Award, TrendingUp, MessageSquare } from 'lucide-react';
import { Employee, Evaluation } from '../../types';
import { apiService } from '../../services/api';

interface EmployeeDetailProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = ({ employee, onBack }) => {
  const [employeeData, setEmployeeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEmployeeDetails();
  }, [employee.id]);

  const loadEmployeeDetails = async () => {
    try {
      setLoading(true);
      const data = await apiService.getEmployee(employee.id);
      setEmployeeData(data);
    } catch (error) {
      console.error('Failed to load employee details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-8 h-8 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
          </div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const { employee: emp, evaluations } = employeeData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-6">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Employee Info */}
          <div className="lg:col-span-2">
            <div className="flex items-start space-x-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xl">
                  {emp.full_name.split(' ').map((n: string) => n[0]).join('')}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{emp.full_name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">ID:</span>
                    <span className="font-medium">{emp.employee_code}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Department:</span>
                    <span className="font-medium">{emp.department_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Position:</span>
                    <span className="font-medium">{emp.position}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">Hire Date:</span>
                    <span className="font-medium">{new Date(emp.hire_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Performance
            </h4>
            {emp.weighted_score ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">
                    {emp.weighted_score.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Weighted Score</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-semibold text-gray-900">
                      #{emp.rank_overall}
                    </div>
                    <div className="text-xs text-gray-600">Overall Rank</div>
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-gray-900">
                      #{emp.rank_in_department}
                    </div>
                    <div className="text-xs text-gray-600">Dept. Rank</div>
                  </div>
                </div>

                {(emp.is_best_overall || emp.is_best_in_department) && (
                  <div className="flex items-center justify-center space-x-2 pt-2 border-t border-blue-200">
                    <Award className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {emp.is_best_overall ? 'Best Overall' : 'Best in Department'}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <Award className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No evaluations yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Evaluations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-green-600" />
          Current Evaluations
        </h4>

        {evaluations.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No evaluations available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {evaluations.map((evaluation: Evaluation) => (
              <div key={evaluation.criteria_name} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{evaluation.criteria_name}</h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-blue-600">{evaluation.score}</span>
                    <span className="text-sm text-gray-500">/5</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(evaluation.score / 5) * 100}%` }}
                  ></div>
                </div>

                <div className="text-xs text-gray-500 mb-2">
                  Weight: {evaluation.weight}% • Evaluator: {evaluation.evaluator_name}
                </div>

                {evaluation.comments && (
                  <div className="bg-gray-50 rounded p-2 text-sm text-gray-700">
                    "{evaluation.comments}"
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;