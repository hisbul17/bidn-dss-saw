import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Settings, Save, X, AlertCircle, CheckCircle } from 'lucide-react';
import { Criteria, CriteriaFormData } from '../../types';
import { apiService } from '../../services/api';

const CriteriaManagement: React.FC = () => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCriteria, setEditingCriteria] = useState<Criteria | null>(null);
  const [formData, setFormData] = useState<CriteriaFormData>({
    name: '',
    description: '',
    weight: 10,
    category: '',
    is_active: true
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const categories = [
    'Technical Skills',
    'Soft Skills',
    'Performance',
    'Leadership',
    'Communication',
    'Teamwork',
    'Other'
  ];

  useEffect(() => {
    loadCriteria();
  }, []);

  const loadCriteria = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCriteria();
      setCriteria(data);
    } catch (error) {
      console.error('Failed to load criteria:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Criteria name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.weight <= 0 || formData.weight > 100) {
      newErrors.weight = 'Weight must be between 1 and 100';
    }
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }

    // Check if total weight would exceed 100%
    const currentTotal = criteria
      .filter(c => c.id !== editingCriteria?.id && c.is_active)
      .reduce((sum, c) => sum + c.weight, 0);
    
    if (currentTotal + formData.weight > 100) {
      newErrors.weight = `Total weight would exceed 100%. Available: ${100 - currentTotal}%`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      if (editingCriteria) {
        await apiService.updateCriteria(editingCriteria.id, formData);
      } else {
        await apiService.createCriteria(formData);
      }
      await loadCriteria();
      handleCancel();
    } catch (error) {
      console.error('Failed to save criteria:', error);
      setErrors({ submit: 'Failed to save criteria. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (criteria: Criteria) => {
    setEditingCriteria(criteria);
    setFormData({
      name: criteria.name,
      description: criteria.description || '',
      weight: criteria.weight,
      category: criteria.category || '',
      is_active: criteria.is_active
    });
    setShowForm(true);
  };

  const handleDelete = async (criteria: Criteria) => {
    if (window.confirm(`Are you sure you want to delete "${criteria.name}"?`)) {
      try {
        await apiService.deleteCriteria(criteria.id);
        await loadCriteria();
      } catch (error) {
        console.error('Failed to delete criteria:', error);
        alert('Failed to delete criteria. It may be in use by existing evaluations.');
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCriteria(null);
    setFormData({
      name: '',
      description: '',
      weight: 10,
      category: '',
      is_active: true
    });
    setErrors({});
  };

  const handleChange = (field: keyof CriteriaFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const totalWeight = criteria.filter(c => c.is_active).reduce((sum, c) => sum + c.weight, 0);
  const groupedCriteria = criteria.reduce((groups, criterion) => {
    const category = criterion.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(criterion);
    return groups;
  }, {} as { [key: string]: Criteria[] });

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Evaluation Criteria</h1>
            <p className="text-gray-600">Manage evaluation criteria and their weights</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Add Criteria</span>
          </button>
        </div>

        {/* Weight Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">Total Weight</span>
            <span className={`text-lg font-bold ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-blue-600'}`}>
              {totalWeight}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                totalWeight === 100 ? 'bg-green-500' : totalWeight > 100 ? 'bg-red-500' : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(totalWeight, 100)}%` }}
            ></div>
          </div>
          {totalWeight !== 100 && (
            <p className="text-xs text-blue-700 mt-1">
              {totalWeight > 100 ? 'Total weight exceeds 100%' : `${100 - totalWeight}% remaining`}
            </p>
          )}
        </div>
      </div>

      {/* Criteria Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCriteria ? 'Edit Criteria' : 'Add New Criteria'}
                </h2>
                <button
                  onClick={handleCancel}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 text-sm">{errors.submit}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Criteria Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Work Quality"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.category ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-2">
                    Weight (%) *
                  </label>
                  <input
                    id="weight"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.weight}
                    onChange={(e) => handleChange('weight', Number(e.target.value))}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      errors.weight ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="25"
                  />
                  {errors.weight && (
                    <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    id="is_active"
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleChange('is_active', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active Criteria
                  </label>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Describe what this criteria evaluates..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
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
                  <span>{saving ? 'Saving...' : 'Save Criteria'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Criteria List */}
      <div className="space-y-6">
        {Object.entries(groupedCriteria).map(([category, categoryCriteria]) => (
          <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                {category}
              </h3>
            </div>
            
            <div className="divide-y divide-gray-200">
              {categoryCriteria.map((criterion) => (
                <div key={criterion.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">{criterion.name}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          criterion.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {criterion.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {criterion.weight}%
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{criterion.description}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => handleEdit(criterion)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        title="Edit Criteria"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(criterion)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        title="Delete Criteria"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {criteria.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <Settings className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No evaluation criteria found. Add your first criteria to get started.</p>
        </div>
      )}
    </div>
  );
};

export default CriteriaManagement;