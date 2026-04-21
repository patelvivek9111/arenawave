import { useState, useEffect, useCallback } from 'react';

/**
 * Same destination logic as the navbar “Employee” link (login, scanner, or admin).
 */
export function useEmployeeNavLink() {
  const [employeeLink, setEmployeeLink] = useState('/employee/login');

  const updateEmployeeLink = useCallback(() => {
    const token = localStorage.getItem('employeeToken');
    const user = JSON.parse(localStorage.getItem('employeeUser') || '{}');

    if (token && user) {
      if (user.role === 'admin') {
        setEmployeeLink('/admin/dashboard');
      } else {
        setEmployeeLink('/employee/scanner');
      }
    } else {
      setEmployeeLink('/employee/login');
    }
  }, []);

  useEffect(() => {
    updateEmployeeLink();

    const handleStorageChange = (e) => {
      if (e.key === 'employeeToken' || e.key === 'employeeUser') {
        updateEmployeeLink();
      }
    };

    const handleCustomStorageChange = () => {
      updateEmployeeLink();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleCustomStorageChange);
    };
  }, [updateEmployeeLink]);

  return employeeLink;
}
