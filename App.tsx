import React, { useState, useEffect, createContext, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { User, UserRole } from './types';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TaskList from './pages/TaskList';
import CreateTask from './pages/CreateTask';
import Layout from './components/Layout';

// Auth Context
interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => useContext(AuthContext);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('planit_user');
    const token = localStorage.getItem('planit_token');

    try {
      if (storedUser && token) {
        // Safely parse user JSON (prevents crash)
        const parsed = JSON.parse(storedUser);
        if (parsed && parsed.id) {
          setUser(parsed);
        }
      }
    } catch (err) {
      console.error('Corrupted user JSON detected. Clearing localStorage...');
      localStorage.removeItem('planit_user');
      localStorage.removeItem('planit_token');
    }

    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    localStorage.setItem('planit_user', JSON.stringify(userData));
    localStorage.setItem('planit_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('planit_user');
    localStorage.removeItem('planit_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, loading }}>
      {!loading ? children : (
        <div className="flex h-screen w-screen items-center justify-center bg-slate-50 text-slate-400">
          Loading...
        </div>
      )}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: UserRole[] }): React.ReactElement | null => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/tasks"
              element={
                <ProtectedRoute allowedRoles={[UserRole.FREELANCER]}>
                  <TaskList />
                </ProtectedRoute>
              }
            />

            <Route
              path="/create-task"
              element={
                <ProtectedRoute allowedRoles={[UserRole.PROVIDER]}>
                  <CreateTask />
                </ProtectedRoute>
              }
            />

            {/* Redirect root */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
