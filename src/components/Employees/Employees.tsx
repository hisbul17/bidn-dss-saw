import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeDetail from './EmployeeDetail';
import EmployeeForm from './EmployeeForm';
import { Employee } from '../../types';

const Employees: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
  };

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDeleteEmployee = async (employee: Employee) => {
    if (window.confirm(`Are you sure you want to delete ${employee.full_name}?`)) {
      try {
        // This would call the API to delete the employee
        // await apiService.deleteEmployee(employee.id);
        setRefreshKey(prev => prev + 1);
        alert('Employee deleted successfully');
      } catch (error) {
        alert('Failed to delete employee');
      }
    }
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setRefreshKey(prev => prev + 1);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEmployee(null);
  };
  return (
    <div className="p-6">
      {showForm && (
        <EmployeeForm
          employee={editingEmployee}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}
      
      {selectedEmployee ? (
        <EmployeeDetail employee={selectedEmployee} onBack={handleBack} />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
            <p className="text-gray-600">Manage and view employee information and performance</p>
          </div>
          <EmployeeList 
            key={refreshKey}
            onSelectEmployee={handleSelectEmployee}
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        </>
      )}
    </div>
  );
};

export default Employees;