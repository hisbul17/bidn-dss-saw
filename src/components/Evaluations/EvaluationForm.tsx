import React, { useState, useEffect } from 'react';
import { Save, ArrowLeft, Star } from 'lucide-react';
import { Employee, Criteria, EvaluationPeriod, Evaluation } from '../../types';
import { apiService } from '../../services/api';

interface EvaluationFormProps {
  employee: Employee;
  onBack: () => void;
  onSave: () => void;
}

const EvaluationForm: React.FC<EvaluationFormProps> = ({ employee, onBack, onSave }) => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [periods, setPeriods] = useState<EvaluationPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [evaluations, setEvaluations] = useState<{ [key: number]: { score: number; comments: string } }>({});
  const [existingEvaluations, setExistingEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadFormData();
  }, []);

  useEffect(() => {
    if (selectedPeriod) {
      loadExistingEvaluations();
    }
  }, [selectedPeriod]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      const [criteriaData, periodsData] = await Promise.all([
        apiService.getCriteria(),
        apiService.getEvaluationPeriods()
      ]);

      setCriteria(criteriaData);
      setPeriods(periodsData);
      
      // Auto-select active period
      const activePeriod = periodsData.find((p: EvaluationPeriod) => p.is_active);
      if (activePeriod) {
        setSelectedPeriod(activePeriod.id);
      }
    } catch (error) {
      console.error('Failed to load form data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadExistingEvaluations = async () => {
    if (!selectedPeriod) return;

    try {
      const data = await apiService.getEmployeeEvaluations(employee.id, selectedPeriod);
      setExistingEvaluations(data);
      
      // Pre-fill form with existing evaluations
      const evalMap: { [key: number]: { score: number; comments: string } } = {};
      data.forEach((evaluation: Evaluation) => {
        evalMap[evaluation.criteria_id] = {
          score: evaluation.score,
          comments: evaluation.comments || ''
        };
      });
      setEvaluations(evalMap);
    } catch (error) {
      console.error('Failed to load existing evaluations:', error);
    }
  };

  const handleScoreChange = (criteriaId: number, score: number) => {
    setEvaluations(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        score
      }
    }));
  };

  const handleCommentsChange = (criteriaId: number, comments: string) => {
    setEvaluations(prev => ({
      ...prev,
      [criteriaId]: {
        ...prev[criteriaId],
        comments
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPeriod) return;

    try {
      setSaving(true);
      
      const evaluationData = criteria.map(criterion => ({
        criteria_id: criterion.id,
        score: evaluations[criterion.id]?.score || 1,
        comments: evaluations[criterion.id]?.comments || ''
      }));

      console.log('Submitting evaluation data:', {
        employeeId: employee.id,
        periodId: selectedPeriod,
        evaluations: evaluationData
      });
      await apiService.submitEvaluation({
        employeeId: employee.id,
        periodId: selectedPeriod,
        evaluations: evaluationData
      });

      onSave();
    } catch (error) {
      console.error('Failed to submit evaluation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(`Failed to submit evaluation: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return 'text-green-600';
    if (score >= 3.5) return 'text-blue-600';
    if (score >= 2.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 4.5) return 'Excellent';
    if (score >= 3.5) return 'Good';
    if (score >= 2.5) return 'Average';
    if (score >= 1.5) return 'Below Average';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
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
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Evaluate Employee</h2>
            <p className="text-gray-600">{employee.full_name} • {employee.department_name}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <label htmlFor="period" className="text-sm font-medium text-gray-700">
            Evaluation Period:
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

      {selectedPeriod && (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {criteria.map((criterion) => {
              const currentScore = evaluations[criterion.id]?.score || 1;
              const currentComments = evaluations[criterion.id]?.comments || '';
              
              return (
                <div key={criterion.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{criterion.name}</h3>
                      <p className="text-sm text-gray-600">{criterion.description}</p>
                      <p className="text-xs text-gray-500 mt-1">Weight: {criterion.weight}%</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${getScoreColor(currentScore)}`}>
                        {currentScore.toFixed(1)}
                      </div>
                      <div className={`text-sm ${getScoreColor(currentScore)}`}>
                        {getScoreLabel(currentScore)}
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Score (1-5):
                    </label>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((score) => (
                        <button
                          key={score}
                          type="button"
                          onClick={() => handleScoreChange(criterion.id, score)}
                          className={`w-12 h-12 rounded-full border-2 flex items-center justify-center font-semibold transition-all duration-200 ${
                            currentScore === score
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-gray-300 text-gray-600 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Star className="h-3 w-3 mr-1" />
                      <span>1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor={`comments-${criterion.id}`} className="block text-sm font-medium text-gray-700 mb-2">
                      Comments (Optional):
                    </label>
                    <textarea
                      id={`comments-${criterion.id}`}
                      value={currentComments}
                      onChange={(e) => handleCommentsChange(criterion.id, e.target.value)}
                      rows={3}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Add specific feedback or comments..."
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Saving...' : 'Save Evaluation'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EvaluationForm;