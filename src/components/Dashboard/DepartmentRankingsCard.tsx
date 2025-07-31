import React from 'react';
import { Building2, TrendingUp, Users } from 'lucide-react';
import { DepartmentRanking } from '../../types';

interface DepartmentRankingsCardProps {
  rankings: DepartmentRanking[];
  loading: boolean;
}

const DepartmentRankingsCard: React.FC<DepartmentRankingsCardProps> = ({ rankings, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Department Rankings</h3>
          <Building2 className="h-5 w-5 text-blue-500" />
        </div>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Department Rankings</h3>
        <Building2 className="h-5 w-5 text-blue-500" />
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-8">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No department data available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rankings.map((dept, index) => (
            <div key={dept.department_name} className="p-4 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                    index === 1 ? 'bg-gray-100 text-gray-800' :
                    index === 2 ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {index + 1}
                  </span>
                  <h4 className="font-medium text-gray-900">{dept.department_name}</h4>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-lg font-bold text-gray-900">
                    {dept.avg_score?.toFixed(2) || '0.00'}
                  </span>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{dept.employee_count} employees</span>
                </div>
                <div>
                  Best: <span className="font-medium">{dept.best_employee || 'N/A'}</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((dept.avg_score / 5) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentRankingsCard;