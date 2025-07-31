import React from 'react';
import { Award, TrendingUp, Users } from 'lucide-react';
import { TopPerformer } from '../../types';

interface TopPerformersCardProps {
  performers: TopPerformer[];
  loading: boolean;
}

const TopPerformersCard: React.FC<TopPerformersCardProps> = ({ performers, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
          <Award className="h-5 w-5 text-yellow-500" />
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded w-12"></div>
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
        <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
        <Award className="h-5 w-5 text-yellow-500" />
      </div>

      {performers.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No evaluations completed yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {performers.slice(0, 5).map((performer, index) => (
            <div key={performer.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                index === 0 ? 'bg-yellow-100 text-yellow-800' :
                index === 1 ? 'bg-gray-100 text-gray-800' :
                index === 2 ? 'bg-orange-100 text-orange-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {performer.full_name}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {performer.department_name} • {performer.position}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-semibold text-gray-900">
                    {performer.weighted_score?.toFixed(2)}
                  </span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
                <p className="text-xs text-gray-500">
                  Rank #{performer.rank_overall}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TopPerformersCard;