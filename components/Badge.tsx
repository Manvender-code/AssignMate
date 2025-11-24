import React from 'react';
import { TaskStatus } from '../types';

const Badge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  const styles = {
    [TaskStatus.OPEN]: 'bg-green-100 text-green-800',
    [TaskStatus.ASSIGNED]: 'bg-blue-100 text-blue-800',
    [TaskStatus.COMPLETED]: 'bg-purple-100 text-purple-800',
    [TaskStatus.EXPIRED]: 'bg-red-100 text-red-800',
  };

  const labels = {
    [TaskStatus.OPEN]: 'Open',
    [TaskStatus.ASSIGNED]: 'Assigned',
    [TaskStatus.COMPLETED]: 'Completed',
    [TaskStatus.EXPIRED]: 'Expired',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default Badge;