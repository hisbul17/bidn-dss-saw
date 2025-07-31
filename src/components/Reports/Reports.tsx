import React, { useState, useEffect } from 'react';
import { FileText, Download, Calendar, Building2, Users, Award } from 'lucide-react';
import { EvaluationPeriod } from '../../types';
import { apiService } from '../../services/api';

const Reports: React.FC = () => {
  const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [departmentData, setDepartmentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPeriods();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadReportData();
    }
  }, [selectedPeriod]);

  const loadPeriods = async () => {
    try {
      const data = await apiService.getEvaluationPeriods();
      setPeriods(data);
      
      // Auto-select active period
      const activePeriod = data.find((p: EvaluationPeriod) => p.is_active);
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    } catch (error) {
      console.error('Failed to load periods:', error);
    }
  };

  const loadReportData = async () => {
    if (!selectedPeriod) return;

    try {
      setLoading(true);
      const [evalData, deptData] = await Promise.all([
        apiService.getEvaluationReport(selectedPeriod),
        apiService.getDepartmentReport(selectedPeriod)
      ]);
      
      setReportData(evalData);
      setDepartmentData(deptData);
    } catch (error) {
      console.error('Failed to load report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getRankBadge = (rank: number) => {
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

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluation Reports</h1>
        <p className="text-gray-600">Generate and view comprehensive evaluation reports</p>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                Select Evaluation Period:
              </label>
              <select
                id="period"
                value={selectedPeriod || ''}
                onChange={(e) => setSelectedPeriod(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Period</option>
                {periods.map((period) => (
                  <option key={period.id} value={period.id}>
                    {period.name} ({period.type})
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {reportData && (
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <Download className="h-4 w-4" />
              <span>Print Report</span>
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {reportData && !loading && (
        <div className="space-y-6 print:space-y-4">
          {/* Report Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Employee Evaluation Report</h2>
              <p className="text-gray-600">{reportData.period.name}</p>
              <p className="text-sm text-gray-500">
                {new Date(reportData.period.start_date).toLocaleDateString()} - {new Date(reportData.period.end_date).toLocaleDateString()}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{reportData.employees.length}</div>
                <div className="text-sm text-gray-600">Total Employees</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Award className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {reportData.employees.filter((e: any) => e.weighted_score).length}
                </div>
                <div className="text-sm text-gray-600">Evaluated</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <FileText className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">
                  {reportData.criteria.length}
                </div>
                <div className="text-sm text-gray-600">Criteria</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Building2 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {departmentData?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Departments</div>
              </div>
            </div>
          </div>

          {/* Department Rankings */}
          {departmentData && departmentData.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
              <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Building2 className="h-5 w-5 mr-2 text-blue-600" />
                Department Rankings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {departmentData.map((dept: any, index: number) => (
                  <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
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
                      <span className="text-lg font-bold text-gray-900">
                        {dept.avg_score?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>{dept.employee_count} employees</p>
                      <p>Best: {dept.best_employee || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Employee Rankings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Award className="h-5 w-5 mr-2 text-yellow-600" />
              Employee Rankings
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Rank</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Employee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Department</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Position</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Score</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {reportData.employees
                    .filter((emp: any) => emp.weighted_score)
                    .sort((a: any, b: any) => (b.weighted_score || 0) - (a.weighted_score || 0))
                    .map((employee: any) => (
                    <tr key={employee.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {getRankBadge(employee.rank_overall)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-gray-900">{employee.full_name}</div>
                          <div className="text-sm text-gray-500">{employee.employee_code}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{employee.department_name}</td>
                      <td className="py-3 px-4 text-gray-600">{employee.position}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-lg font-semibold text-gray-900">
                          {employee.weighted_score?.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {employee.is_best_overall && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            🏆 Best Overall
                          </span>
                        )}
                        {employee.is_best_in_department && !employee.is_best_overall && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🥇 Best in Dept
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Evaluation Criteria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 print:shadow-none print:border-0">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Evaluation Criteria</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.criteria.map((criterion: any) => (
                <div key={criterion.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-1">{criterion.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{criterion.description}</p>
                  <div className="text-sm font-medium text-blue-600">Weight: {criterion.weight}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!selectedPeriod && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Select an evaluation period to generate reports</p>
        </div>
      )}
    </div>
  );
};

export default Reports;