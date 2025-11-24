import React from 'react';
import { Outlet, Link, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { LogOut, LayoutDashboard, ListTodo, PlusCircle, User as UserIcon } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Fix: If user is not authenticated, redirect immediately.
  // Returning 'null' previously caused the app to hang on a white screen
  // because the child ProtectedRoute would never render to trigger its own redirect.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/dashboard" className="flex items-center gap-2">
                <div className="bg-brand-600 text-white p-1.5 rounded-lg">
                  <ListTodo size={24} />
                </div>
                <span className="text-xl font-bold text-slate-900">Plan-It</span>
              </Link>
              <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-900 border-b-2 border-transparent hover:border-brand-500"
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
                {user.role === UserRole.FREELANCER && (
                  <Link
                    to="/tasks"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-700 border-b-2 border-transparent hover:border-slate-300"
                  >
                    <ListTodo className="mr-2 h-4 w-4" />
                    Browse Tasks
                  </Link>
                )}
                {user.role === UserRole.PROVIDER && (
                  <Link
                    to="/create-task"
                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-slate-500 hover:text-slate-700 border-b-2 border-transparent hover:border-slate-300"
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Task
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-3 mr-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
                <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700">
                  <UserIcon size={16} />
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;