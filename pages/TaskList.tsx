import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Task } from '../types';
import Badge from '../components/Badge';

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks'); // Get open tasks
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (taskId: string) => {
    try {
      await api.post(`/tasks/${taskId}/request`);
      alert('Task assigned successfully!');
      fetchTasks();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to request task');
    }
  };

  if (loading) return <div className="p-8">Loading tasks...</div>;

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center">
             <h1 className="text-2xl font-bold text-slate-900">Available Tasks</h1>
             <button onClick={fetchTasks} className="text-sm text-brand-600 hover:underline">Refresh</button>
        </div>
     
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <Badge status={task.status} />
              <span className="text-xs text-slate-400">Due: {new Date(task.deadline).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{task.title}</h3>
            <p className="text-slate-500 text-sm mb-6 flex-1">{task.description}</p>
            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">Posted by {task.provider_name || 'Unknown'}</span>
                <button
                onClick={() => handleRequest(task.id)}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
                >
                Request Task
                </button>
            </div>
          </div>
        ))}
        {tasks.length === 0 && (
            <p className="text-slate-500 col-span-3 text-center py-10">No open tasks available at the moment.</p>
        )}
      </div>
    </div>
  );
};

export default TaskList;