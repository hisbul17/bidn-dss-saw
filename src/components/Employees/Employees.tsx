import React, { useState } from 'react';
import EmployeeList from './EmployeeList';
import EmployeeDetail from './EmployeeDetail';
import { Employee } from '../../types';

const Employees: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const handleSelectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  const handleBack = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="p-6">
      {selectedEmployee ? (
        <EmployeeDetail employee={selectedEmployee} onBack={handleBack} />
      ) : (
        <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employees</h1>
            <p className="text-gray-600">Manage and view employee information and performance</p>
          </div>
          <EmployeeList onSelectEmployee={handleSelectEmployee} />
        </>
      )}
    </div>
  );
};

export default Employees;