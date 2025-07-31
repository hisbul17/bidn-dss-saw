import React, { useState, useEffect } from 'react';
import { Users, ClipboardList, Award, Building2 } from 'lucide-react';
import StatsCard from './StatsCard';
import TopPerformersCard from './TopPerformersCard';
import DepartmentRankingsCard from './DepartmentRankingsCard';
import { apiService } from '../../services/api';
import { DashboardStats, TopPerformer, DepartmentRanking } from '../../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topPerformers, setTopPerformers] = useState<TopPerformer[]>([]);
  const [departmentRankings, setDepartmentRankings] = useState<DepartmentRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, performersData, rankingsData] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getTopPerformers(),
        apiService.getDepartmentRankings()
      ]);

      setStats(statsData);
      setTopPerformers(performersData);
      setDepartmentRankings(rankingsData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of employee performance and evaluation metrics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Total Employees"
          value={stats?.totalEmployees || 0}
          icon={Users}
          color="blue"
        />
        <StatsCard
          title="Active Periods"
          value={stats?.activePeriods || 0}
          icon={ClipboardList}
          color="green"
        />
        <StatsCard
          title="Completed Evaluations"
          value={stats?.completedEvaluations || 0}
          icon={Award}
          color="yellow"
        />
        <StatsCard
          title="Departments"
          value={stats?.totalDepartments || 0}
          icon={Building2}
          color="purple"
        />
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopPerformersCard performers={topPerformers} loading={loading} />
        <DepartmentRankingsCard rankings={departmentRankings} loading={loading} />
      </div>
    </div>
  );
};

export default Dashboard;