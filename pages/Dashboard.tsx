import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { api } from '../services/api';
import { DashboardStats, Task, UserRole, TaskStatus } from '../types';
import { CheckCircle2, Clock, AlertCircle, Briefcase } from 'lucide-react';
import Badge from '../components/Badge';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, tasksRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/tasks')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data. Ensure backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleComplete = async (taskId: string) => {
    try {
        await api.put(`/tasks/${taskId}/complete`);
        // Refresh
        const [statsRes, tasksRes] = await Promise.all([
            api.get('/dashboard/stats'),
            api.get('/dashboard/tasks')
        ]);
        setStats(statsRes.data);
        setRecentTasks(tasksRes.data);
    } catch (err) {
        alert('Failed to complete task');
    }
  }

  const handleRate = async (taskId: string) => {
      const rating = prompt("Rate the freelancer (1-5):");
      if(rating && !isNaN(Number(rating))) {
        try {
            await api.post(`/tasks/${taskId}/rate`, { rating: Number(rating) });
            alert("Rating submitted!");
             // Refresh
             const tasksRes = await api.get('/dashboard/tasks');
             setRecentTasks(tasksRes.data);
        } catch (err) {
            alert("Failed to rate");
        }
      }
  }

  if (loading) return <div className="text-center mt-20">Loading dashboard...</div>;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user?.name}</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your tasks.</p>
        {error && (
             <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md border border-red-200">
                {error} <br/>
                <span className="text-sm opacity-75">Is the backend server running on port 5000?</span>
            </div>
        )}
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={<CheckCircle2 className="text-purple-600" />} label="Completed" value={stats?.completed || 0} />
        <StatCard icon={<Briefcase className="text-blue-600" />} label="Assigned" value={stats?.assigned || 0} />
        <StatCard icon={<Clock className="text-green-600" />} label="Open/Pending" value={stats?.pending || 0} />
        <StatCard icon={<AlertCircle className="text-red-600" />} label="Expired" value={stats?.expired || 0} />
      </div>

      {/* Recent Tasks */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-slate-900">
                {user?.role === UserRole.PROVIDER ? 'Your Created Tasks' : 'Your Assigned Tasks'}
            </h2>
        </div>
        
        {recentTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
                No active tasks found.
            </div>
        ) : (
            <ul className="divide-y divide-slate-200">
            {recentTasks.map((task) => (
                <li key={task.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-slate-900">{task.title}</h3>
                            <Badge status={task.status} />
                        </div>
                        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{task.description}</p>
                        <div className="mt-2 text-xs text-slate-400 flex gap-4">
                            <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                            {user?.role === UserRole.PROVIDER && task.freelancer_id && (
                                <span>Freelancer: {task.freelancer_name || 'Assigned'}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {user?.role === UserRole.FREELANCER && task.status === TaskStatus.ASSIGNED && (
                             <button 
                             onClick={() => handleComplete(task.id)}
                             className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700">
                                Mark Complete
                             </button>
                        )}
                         {user?.role === UserRole.PROVIDER && task.status === TaskStatus.COMPLETED && (
                             <button 
                             onClick={() => handleRate(task.id)}
                             className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600">
                                Rate Freelancer
                             </button>
                        )}
                    </div>
                </div>
                </li>
            ))}
            </ul>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: number }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
    <div className="p-3 bg-slate-50 rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </div>
  </div>
);

export default Dashboard;