import React, { useState } from 'react';
import EmployeeList from '../Employees/EmployeeList';
import EvaluationForm from './EvaluationForm';
import { Employee } from '../../types';

const Evaluations: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
  };

  const handleSave = () => {
    setSelectedEmployee(null);
    // Could add a success message here
  };

  return (
    <div className="p-6">
      {selectedEmployee ? (
        <EvaluationForm 
          employee={selectedEmployee} 
          onBack={handleBack}
          onSave={handleSave}
        />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Evaluations</h1>
            <p className="text-gray-600">Select an employee to evaluate their performance</p>
          </div>
          <EmployeeList onSelectEmployee={handleSelectEmployee} />
        </>
      )}
    </div>
  );
};

export default Evaluations;