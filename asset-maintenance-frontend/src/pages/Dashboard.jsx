import React from 'react';
import { useAuth } from '../context/AuthContext';
import OperatorDashboard from '../components/dashboard/OperatorDashboard';
import TechnicianDashboard from '../components/dashboard/TechnicianDashboard';
import ManagerDashboard from '../components/dashboard/ManagerDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between md:items-center gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            Logged in as:{' '}
            <span className="text-blue-600 font-semibold">{user?.fullName}</span>{' '}
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/60 uppercase ml-2">
              {user?.role}
            </span>
          </p>
        </div>
      </header>

      {user?.role === 'USER' && <OperatorDashboard />}
      {user?.role === 'TECHNICIAN' && <TechnicianDashboard />}
      {user?.role === 'MANAGER' && <ManagerDashboard />}
      {!['USER', 'TECHNICIAN', 'MANAGER'].includes(user?.role) && (
        <div className="p-8 text-center text-slate-500 font-medium bg-white border border-slate-200 rounded-2xl">
          Logged in as Administrator. Please navigate to the Admin Panel.
        </div>
      )}
    </div>
  );
};

export default Dashboard;
